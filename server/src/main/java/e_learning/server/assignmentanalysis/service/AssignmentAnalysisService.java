package e_learning.server.assignmentanalysis.service;

import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptPartResult;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.enums.AttemptPartStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptPartResultRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignmentanalysis.dto.response.AnalysisOverviewResponse;
import e_learning.server.assignmentanalysis.dto.response.AnalysisSummary;
import e_learning.server.assignmentanalysis.dto.response.AttemptReviewPart;
import e_learning.server.assignmentanalysis.dto.response.AttemptReviewQuestion;
import e_learning.server.assignmentanalysis.dto.response.AttemptReviewResponse;
import e_learning.server.assignmentanalysis.dto.response.ClassComparisonRow;
import e_learning.server.assignmentanalysis.dto.response.ProgressCounts;
import e_learning.server.assignmentanalysis.dto.response.QuestionAnalysisListResponse;
import e_learning.server.assignmentanalysis.dto.response.QuestionAnalysisRow;
import e_learning.server.assignmentanalysis.dto.response.ScoreBucket;
import e_learning.server.assignmentanalysis.dto.response.ScoreSummary;
import e_learning.server.assignmentanalysis.dto.response.StudentResultRow;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentAnalysisService {

    private final AssignmentRepository assignmentRepository;
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptQuestionRepository questionRepository;
    private final AssessmentAttemptPartResultRepository partResultRepository;

    @Transactional(readOnly = true)
    public AnalysisOverviewResponse getOverview(Long assignmentId, Long teacherId) {
        Assignment assignment = requireAssignment(assignmentId);
        RosterContext roster = buildRoster(assignment);
        List<AssessmentAttempt> attempts = attemptRepository.findAllByAssignmentIdWithStudent(assignmentId);
        Map<Long, AssessmentAttempt> attemptByStudent = indexAttempts(attempts);

        ProgressCounts progress = buildProgress(roster, attemptByStudent, assignment.getDueAt());
        ScoreSummary score = buildScoreSummary(attempts);
        List<ClassComparisonRow> classRows = buildClassComparison(roster, attemptByStudent, assignment.getDueAt());

        BigDecimal totalPossible = attempts.stream()
                .filter(this::isTerminal)
                .map(AssessmentAttempt::getTotalPossiblePoints)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(BigDecimal.ZERO);

        AnalysisSummary summary = new AnalysisSummary(
                assignment.getId(),
                assignment.getName(),
                assignment.getStatus() != null ? assignment.getStatus().name() : "UNKNOWN",
                assignment.getDueAt() != null ? assignment.getDueAt().toString() : null,
                assignment.getTimeLimitMinutes(),
                totalPossible,
                roster.students.size(),
                roster.classIds.size()
        );

        return new AnalysisOverviewResponse(summary, progress, score, classRows);
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentResultRow> getStudents(
            Long assignmentId,
            Long teacherId,
            int page,
            int size,
            String lifecycleStatus,
            String deadlineState,
            Long classId,
            String search
    ) {
        Assignment assignment = requireAssignment(assignmentId);
        RosterContext roster = buildRoster(assignment);
        Map<Long, AssessmentAttempt> attemptByStudent =
                indexAttempts(attemptRepository.findAllByAssignmentIdWithStudent(assignmentId));

        String searchLower = search == null ? null : search.trim().toLowerCase(Locale.ROOT);
        List<StudentResultRow> rows = new ArrayList<>();
        for (RosterStudent rs : roster.students) {
            AssessmentAttempt attempt = attemptByStudent.get(rs.studentId());
            StudentResultRow row = toStudentRow(rs, attempt, assignment.getDueAt());
            if (classId != null && !classId.equals(row.classId())) continue;
            if (lifecycleStatus != null && !lifecycleStatus.isBlank()
                    && !lifecycleStatus.equalsIgnoreCase(row.lifecycleStatus())) continue;
            if (deadlineState != null && !deadlineState.isBlank()
                    && !deadlineState.equalsIgnoreCase(row.deadlineState())) continue;
            if (searchLower != null && !searchLower.isEmpty()
                    && (row.studentName() == null
                    || !row.studentName().toLowerCase(Locale.ROOT).contains(searchLower))) continue;
            rows.add(row);
        }

        rows.sort(Comparator.comparing(StudentResultRow::studentName, Comparator.nullsLast(String::compareToIgnoreCase)));

        int safeSize = Math.min(100, Math.max(1, size));
        // PageResponse is 1-indexed for clients
        int safePage = Math.max(1, page);
        int from = (safePage - 1) * safeSize;
        int total = rows.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) safeSize);
        List<StudentResultRow> slice = from >= total ? List.of() : rows.subList(from, Math.min(from + safeSize, total));

        return PageResponse.<StudentResultRow>builder()
                .items(slice)
                .page(safePage)
                .size(safeSize)
                .totalElements(total)
                .totalPages(totalPages)
                .isFirst(safePage <= 1)
                .isLast(totalPages == 0 || safePage >= totalPages)
                .build();
    }

    @Transactional(readOnly = true)
    public QuestionAnalysisListResponse getQuestions(Long assignmentId, Long teacherId) {
        requireAssignment(assignmentId);
        // Next phase: aggregate from PartResults across finalized attempts
        return new QuestionAnalysisListResponse(List.of());
    }

    @Transactional(readOnly = true)
    public AttemptReviewResponse getAttemptReview(Long assignmentId, Long studentId, Long teacherId) {
        Assignment assignment = requireAssignment(assignmentId);
        AssessmentAttempt attempt = attemptRepository
                .findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));

        if (!isTerminal(attempt)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_STATE);
        }

        List<AssessmentAttemptQuestion> questions =
                questionRepository.findAllByAttemptIdOrderByPositionAsc(attempt.getId());
        List<AssessmentAttemptPartResult> parts =
                partResultRepository.findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(
                        attempt.getId());

        Map<Long, List<AssessmentAttemptPartResult>> partsByQuestion = parts.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getAttemptQuestion().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<AttemptReviewQuestion> questionRows = new ArrayList<>();
        for (AssessmentAttemptQuestion q : questions) {
            List<AssessmentAttemptPartResult> qParts = partsByQuestion.getOrDefault(q.getId(), List.of());
            BigDecimal earned = qParts.stream()
                    .map(AssessmentAttemptPartResult::getEarnedPoints)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<AttemptReviewPart> partRows = qParts.stream()
                    .map(p -> new AttemptReviewPart(
                            p.getPartKey(),
                            toPublicStatus(p.getStatus()),
                            p.getEarnedPoints(),
                            p.getPossiblePoints(),
                            null
                    ))
                    .toList();

            questionRows.add(new AttemptReviewQuestion(
                    q.getId(),
                    q.getPosition(),
                    q.getSectionTitle(),
                    extractPrompt(q.getQuestionSnapshot()),
                    extractType(q.getQuestionSnapshot()),
                    q.isExample(),
                    q.getPossiblePoints(),
                    earned,
                    toPublicStatus(rollup(qParts, q)),
                    q.getAnswerPayload(),
                    extractAnswerKey(q.getQuestionSnapshot()),
                    partRows
            ));
        }

        LocalDateTime finishedAt = attempt.getSubmittedAt() != null
                ? attempt.getSubmittedAt()
                : attempt.getTimedOutAt();
        Long durationSeconds = null;
        if (finishedAt != null && attempt.getStartedAt() != null) {
            durationSeconds = Math.max(0, Duration.between(attempt.getStartedAt(), finishedAt).getSeconds());
        }

        User student = attempt.getStudent();
        return new AttemptReviewResponse(
                attempt.getId(),
                student != null ? student.getId() : studentId,
                student != null ? student.getFullName() : null,
                assignment.getId(),
                assignment.getName(),
                attempt.getClassIdAtStart(),
                attempt.getClassNameAtStart(),
                attempt.getStatus().name(),
                resolveDeadlineState(attempt, assignment.getDueAt()),
                attempt.getStartedAt() != null ? attempt.getStartedAt().toString() : null,
                finishedAt != null ? finishedAt.toString() : null,
                durationSeconds,
                attempt.getTotalEarnedPoints(),
                attempt.getTotalPossiblePoints(),
                toDoublePercent(attempt.getPercentageScore()),
                questionRows
        );
    }

    // --- roster ---

    private record RosterStudent(Long studentId, String studentName, Long classId, String className) {}

    private record RosterContext(List<Long> classIds, Map<Long, String> classNames, List<RosterStudent> students) {}

    private RosterContext buildRoster(Assignment assignment) {
        List<Long> classIds = assignment.getClassIds() != null
                ? assignment.getClassIds().stream().filter(Objects::nonNull).distinct().toList()
                : List.of();

        Map<Long, String> classNames = new HashMap<>();
        if (!classIds.isEmpty()) {
            for (ClassEntity c : classRepository.findAllById(classIds)) {
                classNames.put(c.getId(), c.getName());
            }
        }

        Map<Long, RosterStudent> byStudent = new LinkedHashMap<>();
        for (Long classId : classIds) {
            String className = classNames.getOrDefault(classId, "Class " + classId);
            for (ClassMember member : classMemberRepository.findStudentsByClassId(classId)) {
                User user = member.getUser();
                if (user == null) continue;
                byStudent.putIfAbsent(
                        user.getId(),
                        new RosterStudent(user.getId(), user.getFullName(), classId, className)
                );
            }
        }

        return new RosterContext(classIds, classNames, new ArrayList<>(byStudent.values()));
    }

    private Map<Long, AssessmentAttempt> indexAttempts(List<AssessmentAttempt> attempts) {
        Map<Long, AssessmentAttempt> map = new HashMap<>();
        for (AssessmentAttempt a : attempts) {
            if (a.getStudent() != null) {
                map.put(a.getStudent().getId(), a);
            }
        }
        return map;
    }

    private ProgressCounts buildProgress(
            RosterContext roster,
            Map<Long, AssessmentAttempt> attemptByStudent,
            LocalDateTime dueAt
    ) {
        int assigned = roster.students.size();
        int notStarted = 0;
        int inProgress = 0;
        int submitted = 0;
        int timedOut = 0;
        int late = 0;
        int overdue = 0;
        LocalDateTime now = LocalDateTime.now();

        for (RosterStudent rs : roster.students) {
            AssessmentAttempt a = attemptByStudent.get(rs.studentId());
            if (a == null) {
                notStarted++;
                if (dueAt != null && now.isAfter(dueAt)) overdue++;
                continue;
            }
            if (a.getStatus() == AssessmentAttemptStatus.IN_PROGRESS) {
                inProgress++;
            } else if (a.getStatus() == AssessmentAttemptStatus.SUBMITTED) {
                submitted++;
                if (a.isLate()) late++;
            } else if (a.getStatus() == AssessmentAttemptStatus.TIMED_OUT) {
                timedOut++;
                if (a.isLate()) late++;
            }
        }

        Double rate = assigned == 0 ? null : submitted / (double) assigned;
        return new ProgressCounts(assigned, notStarted, inProgress, submitted, timedOut, late, overdue, rate);
    }

    private ScoreSummary buildScoreSummary(List<AssessmentAttempt> attempts) {
        List<Double> percents = attempts.stream()
                .filter(this::isTerminal)
                .map(AssessmentAttempt::getPercentageScore)
                .filter(Objects::nonNull)
                .map(this::toDoublePercent)
                .filter(Objects::nonNull)
                .sorted()
                .toList();

        List<ScoreBucket> buckets = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            buckets.add(new ScoreBucket(i * 10, i * 10 + 10, 0));
        }
        for (Double p : percents) {
            int idx = Math.min(9, Math.max(0, (int) Math.floor(p / 10.0)));
            if (p >= 100) idx = 9;
            ScoreBucket b = buckets.get(idx);
            buckets.set(idx, new ScoreBucket(b.fromPercent(), b.toPercent(), b.count() + 1));
        }

        if (percents.isEmpty()) {
            return new ScoreSummary(0, null, null, null, null, buckets);
        }

        double sum = percents.stream().mapToDouble(Double::doubleValue).sum();
        double avg = sum / percents.size();
        double median = median(percents);
        return new ScoreSummary(
                percents.size(),
                round1(avg),
                round1(median),
                percents.get(percents.size() - 1),
                percents.get(0),
                buckets
        );
    }

    private List<ClassComparisonRow> buildClassComparison(
            RosterContext roster,
            Map<Long, AssessmentAttempt> attemptByStudent,
            LocalDateTime dueAt
    ) {
        Map<Long, List<RosterStudent>> byClass = roster.students.stream()
                .collect(Collectors.groupingBy(RosterStudent::classId, LinkedHashMap::new, Collectors.toList()));

        List<ClassComparisonRow> rows = new ArrayList<>();
        for (Long classId : roster.classIds) {
            List<RosterStudent> members = byClass.getOrDefault(classId, List.of());
            int assigned = members.size();
            int submitted = 0;
            List<Double> percents = new ArrayList<>();
            int correctEligible = 0;
            int correctCount = 0;

            for (RosterStudent rs : members) {
                AssessmentAttempt a = attemptByStudent.get(rs.studentId());
                if (a != null && a.getStatus() == AssessmentAttemptStatus.SUBMITTED) {
                    submitted++;
                }
                if (a != null && isTerminal(a) && a.getPercentageScore() != null) {
                    Double p = toDoublePercent(a.getPercentageScore());
                    if (p != null) percents.add(p);
                }
            }

            percents.sort(Double::compareTo);
            Double avg = percents.isEmpty() ? null : round1(percents.stream().mapToDouble(d -> d).average().orElse(0));
            Double med = percents.isEmpty() ? null : round1(median(percents));
            Double rate = assigned == 0 ? null : submitted / (double) assigned;
            String band = overallBand(med);

            // accuracy at class level deferred to question slice; null for now unless we have per-question data
            rows.add(new ClassComparisonRow(
                    classId,
                    roster.classNames.getOrDefault(classId, "Class " + classId),
                    assigned,
                    submitted,
                    rate,
                    avg,
                    med,
                    null,
                    band
            ));
        }
        return rows;
    }

    private StudentResultRow toStudentRow(RosterStudent rs, AssessmentAttempt a, LocalDateTime dueAt) {
        if (a == null) {
            String deadline = "NONE";
            if (dueAt != null && LocalDateTime.now().isAfter(dueAt)) {
                deadline = "OVERDUE";
            }
            return new StudentResultRow(
                    rs.studentId(), rs.studentName(), rs.classId(), rs.className(),
                    null, "NOT_STARTED", deadline,
                    null, null, null, null, null, null
            );
        }

        LocalDateTime finishedAt = a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getTimedOutAt();
        Long duration = null;
        if (finishedAt != null && a.getStartedAt() != null) {
            duration = Math.max(0, Duration.between(a.getStartedAt(), finishedAt).getSeconds());
        }

        Long classId = a.getClassIdAtStart() != null ? a.getClassIdAtStart() : rs.classId();
        String className = a.getClassNameAtStart() != null ? a.getClassNameAtStart() : rs.className();

        return new StudentResultRow(
                rs.studentId(),
                rs.studentName(),
                classId,
                className,
                a.getId(),
                a.getStatus().name(),
                resolveDeadlineState(a, dueAt),
                toDoublePercent(a.getPercentageScore()),
                a.getTotalEarnedPoints() != null ? a.getTotalEarnedPoints().doubleValue() : null,
                a.getTotalPossiblePoints() != null ? a.getTotalPossiblePoints().doubleValue() : null,
                a.getStartedAt() != null ? a.getStartedAt().toString() : null,
                finishedAt != null ? finishedAt.toString() : null,
                duration
        );
    }

    private String resolveDeadlineState(AssessmentAttempt a, LocalDateTime dueAt) {
        if (a.getStatus() == AssessmentAttemptStatus.IN_PROGRESS) {
            if (dueAt != null && LocalDateTime.now().isAfter(dueAt)) return "OVERDUE";
            return "NONE";
        }
        if (a.isLate()) return "LATE";
        return "ON_TIME";
    }

    private boolean isTerminal(AssessmentAttempt a) {
        return a.getStatus() == AssessmentAttemptStatus.SUBMITTED
                || a.getStatus() == AssessmentAttemptStatus.TIMED_OUT;
    }

    private static String overallBand(Double medianPercent) {
        if (medianPercent == null) return null;
        if (medianPercent >= 80) return "HIGH";
        if (medianPercent >= 50) return "MID";
        return "LOW";
    }

    private static double median(List<Double> sorted) {
        int n = sorted.size();
        if (n % 2 == 1) return sorted.get(n / 2);
        return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }

    private static Double round1(double v) {
        return BigDecimal.valueOf(v).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private Double toDoublePercent(BigDecimal percentageScore) {
        if (percentageScore == null) return null;
        // Stored as 0–100 or 0–1 depending on grading path; normalize presentation to 0–100
        double v = percentageScore.doubleValue();
        if (v <= 1.0) return round1(v * 100.0);
        return round1(v);
    }

    private Assignment requireAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private static String toPublicStatus(AttemptPartStatus status) {
        if (status == null) return "UNANSWERED";
        return switch (status) {
            case CORRECT -> "CORRECT";
            case PARTIALLY_CORRECT -> "PARTIAL";
            case INCORRECT -> "INCORRECT";
            case UNANSWERED -> "UNANSWERED";
        };
    }

    private static AttemptPartStatus rollup(List<AssessmentAttemptPartResult> parts, AssessmentAttemptQuestion question) {
        if (question.isExample()) return AttemptPartStatus.UNANSWERED;
        if (parts.isEmpty()) {
            return question.getAnswerPayload() == null || question.getAnswerPayload().isEmpty()
                    ? AttemptPartStatus.UNANSWERED
                    : AttemptPartStatus.INCORRECT;
        }
        boolean anyPartial = false;
        boolean anyCorrect = false;
        boolean anyIncorrect = false;
        boolean allUnanswered = true;
        for (AssessmentAttemptPartResult part : parts) {
            AttemptPartStatus status = part.getStatus();
            if (status != AttemptPartStatus.UNANSWERED) allUnanswered = false;
            switch (status) {
                case CORRECT -> anyCorrect = true;
                case PARTIALLY_CORRECT -> anyPartial = true;
                case INCORRECT -> anyIncorrect = true;
                case UNANSWERED -> { }
            }
        }
        if (allUnanswered) return AttemptPartStatus.UNANSWERED;
        if (anyPartial || (anyCorrect && anyIncorrect)) return AttemptPartStatus.PARTIALLY_CORRECT;
        if (anyCorrect) return AttemptPartStatus.CORRECT;
        return AttemptPartStatus.INCORRECT;
    }

    private static String extractPrompt(Map<String, Object> snapshot) {
        if (snapshot == null) return "";
        Object student = snapshot.get("student");
        if (student instanceof Map<?, ?> m) {
            Object prompt = m.get("prompt");
            if (prompt != null) return String.valueOf(prompt);
            Object stem = m.get("stem");
            if (stem != null) return String.valueOf(stem);
        }
        Object prompt = snapshot.get("prompt");
        return prompt != null ? String.valueOf(prompt) : "";
    }

    private static String extractType(Map<String, Object> snapshot) {
        if (snapshot == null) return "UNKNOWN";
        Object student = snapshot.get("student");
        if (student instanceof Map<?, ?> m && m.get("type") != null) {
            return String.valueOf(m.get("type"));
        }
        Object type = snapshot.get("type");
        return type != null ? String.valueOf(type) : "UNKNOWN";
    }

    private static Object extractAnswerKey(Map<String, Object> snapshot) {
        if (snapshot == null) return null;
        Object grading = snapshot.get("grading");
        if (!(grading instanceof Map<?, ?> map)) return null;
        Map<String, Object> result = new LinkedHashMap<>();
        if (map.get("options") != null) result.put("options", map.get("options"));
        if (map.get("answers") != null) result.put("answers", map.get("answers"));
        if (map.get("explanation") != null) result.put("explanation", map.get("explanation"));
        return result.isEmpty() ? null : result;
    }
}
