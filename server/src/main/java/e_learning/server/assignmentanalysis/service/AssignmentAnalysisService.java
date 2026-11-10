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
import e_learning.server.assignmentanalysis.dto.response.*;
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
import java.util.*;
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
        Map<Long, Double> accuracyByClass = computeClassAccuracy(attempts);
        List<ClassComparisonRow> classRows = buildClassComparison(roster, attemptByStudent, accuracyByClass);
        BigDecimal totalPossible = attempts.stream().filter(this::isTerminal)
                .map(AssessmentAttempt::getTotalPossiblePoints).filter(Objects::nonNull)
                .findFirst().orElse(BigDecimal.ZERO);
        AnalysisSummary summary = new AnalysisSummary(
                assignment.getId(), assignment.getName(),
                assignment.getStatus() != null ? assignment.getStatus().name() : "UNKNOWN",
                assignment.getDueAt() != null ? assignment.getDueAt().toString() : null,
                assignment.getTimeLimitMinutes(), totalPossible,
                roster.students.size(), roster.classIds.size());
        return new AnalysisOverviewResponse(summary, progress, score, classRows);
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentResultRow> getStudents(Long assignmentId, Long teacherId, int page, int size,
                                                      String lifecycleStatus, String deadlineState, Long classId, String search) {
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
        int safePage = Math.max(1, page);
        int from = (safePage - 1) * safeSize;
        int total = rows.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) safeSize);
        List<StudentResultRow> slice = from >= total ? List.of() : rows.subList(from, Math.min(from + safeSize, total));
        return PageResponse.<StudentResultRow>builder().items(slice).page(safePage).size(safeSize)
                .totalElements(total).totalPages(totalPages)
                .isFirst(safePage <= 1).isLast(totalPages == 0 || safePage >= totalPages).build();
    }

    @Transactional(readOnly = true)
    public QuestionAnalysisListResponse getQuestions(Long assignmentId, Long teacherId) {
        requireAssignment(assignmentId);
        List<AssessmentAttempt> attempts = attemptRepository.findAllByAssignmentIdWithStudent(assignmentId)
                .stream().filter(this::isTerminal).toList();
        if (attempts.isEmpty()) return new QuestionAnalysisListResponse(List.of());
        List<Long> attemptIds = attempts.stream().map(AssessmentAttempt::getId).toList();
        List<AssessmentAttemptQuestion> allQuestions =
                questionRepository.findAllByAttemptIdInOrderByAttemptIdAscPositionAsc(attemptIds);
        List<AssessmentAttemptPartResult> allParts = partResultRepository.findAllByAttemptIds(attemptIds);
        Map<Long, List<AssessmentAttemptPartResult>> partsByQuestionId = allParts.stream()
                .collect(Collectors.groupingBy(p -> p.getAttemptQuestion().getId()));
        Map<Integer, QuestionAgg> byPosition = new LinkedHashMap<>();
        Map<Integer, List<AssessmentAttemptQuestion>> questionsByPosition = new LinkedHashMap<>();
        Map<Integer, Map<String, Object>> snapshotByPosition = new LinkedHashMap<>();
        for (AssessmentAttemptQuestion q : allQuestions) {
            if (q.isExample()) continue;
            int pos = q.getPosition() != null ? q.getPosition() : 0;
            QuestionAgg agg = byPosition.computeIfAbsent(pos, QuestionAgg::new);
            agg.seedFrom(q);
            questionsByPosition.computeIfAbsent(pos, p -> new ArrayList<>()).add(q);
            snapshotByPosition.putIfAbsent(pos, q.getQuestionSnapshot());
            List<AssessmentAttemptPartResult> qParts = partsByQuestionId.getOrDefault(q.getId(), List.of());
            AttemptPartStatus status = rollup(qParts, q);
            BigDecimal earned = qParts.stream().map(AssessmentAttemptPartResult::getEarnedPoints)
                    .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal possible = q.getPossiblePoints() != null ? q.getPossiblePoints() : BigDecimal.ZERO;
            agg.attemptCount++;
            switch (status) {
                case CORRECT -> agg.correctCount++;
                case PARTIALLY_CORRECT -> agg.partialCount++;
                case INCORRECT -> agg.incorrectCount++;
                case UNANSWERED -> agg.unansweredCount++;
            }
            agg.earnedSum = agg.earnedSum.add(earned);
            agg.possibleSum = agg.possibleSum.add(possible);
        }
        List<QuestionAnalysisRow> items = byPosition.values().stream()
                .sorted(Comparator.comparingInt(a -> a.position))
                .map(agg -> agg.toRow(QuestionDistributionBuilder.build(
                        agg.questionType,
                        snapshotByPosition.get(agg.position),
                        questionsByPosition.getOrDefault(agg.position, List.of()))))
                .toList();
        return new QuestionAnalysisListResponse(items);
    }

    @Transactional(readOnly = true)
    public SectionAnalysisListResponse getSections(Long assignmentId, Long teacherId) {
        QuestionAnalysisListResponse questions = getQuestions(assignmentId, teacherId);
        Map<String, SectionAgg> bySection = new LinkedHashMap<>();
        for (QuestionAnalysisRow q : questions.items()) {
            if (q.isExample()) continue;
            String key = q.sectionId() != null ? q.sectionId()
                    : (q.sectionTitle() != null ? q.sectionTitle() : "_");
            SectionAgg agg = bySection.computeIfAbsent(key, k -> new SectionAgg(q.sectionId(), q.sectionTitle()));
            agg.questionCount++;
            agg.sampleSlots += q.attemptCount();
            agg.correctCount += q.correctCount();
            agg.partialCount += q.partialCount();
            agg.incorrectCount += q.incorrectCount();
            agg.unansweredCount += q.unansweredCount();
            if (q.scoreRatePercent() != null && q.attemptCount() > 0) {
                agg.scoreRateWeightedSum += q.scoreRatePercent() * q.attemptCount();
                agg.scoreRateWeight += q.attemptCount();
            }
        }
        return new SectionAnalysisListResponse(bySection.values().stream().map(SectionAgg::toRow).toList());
    }

    @Transactional(readOnly = true)
    public AttemptReviewResponse getAttemptReview(Long assignmentId, Long studentId, Long teacherId) {
        Assignment assignment = requireAssignment(assignmentId);
        AssessmentAttempt attempt = attemptRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));
        if (!isTerminal(attempt)) throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_STATE);
        List<AssessmentAttemptQuestion> questions = questionRepository.findAllByAttemptIdOrderByPositionAsc(attempt.getId());
        List<AssessmentAttemptPartResult> parts = partResultRepository
                .findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(attempt.getId());
        Map<Long, List<AssessmentAttemptPartResult>> partsByQuestion = parts.stream()
                .collect(Collectors.groupingBy(p -> p.getAttemptQuestion().getId(), LinkedHashMap::new, Collectors.toList()));
        List<AttemptReviewQuestion> questionRows = new ArrayList<>();
        for (AssessmentAttemptQuestion q : questions) {
            List<AssessmentAttemptPartResult> qParts = partsByQuestion.getOrDefault(q.getId(), List.of());
            BigDecimal earned = qParts.stream().map(AssessmentAttemptPartResult::getEarnedPoints)
                    .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            List<AttemptReviewPart> partRows = qParts.stream()
                    .map(p -> new AttemptReviewPart(p.getPartKey(), toPublicStatus(p.getStatus()),
                            p.getEarnedPoints(), p.getPossiblePoints(), null)).toList();
            questionRows.add(new AttemptReviewQuestion(
                    q.getId(), q.getPosition(), q.getSectionTitle(), extractPrompt(q.getQuestionSnapshot()),
                    extractType(q.getQuestionSnapshot()), q.isExample(), q.getPossiblePoints(), earned,
                    toPublicStatus(rollup(qParts, q)), q.getAnswerPayload(),
                    extractAnswerKey(q.getQuestionSnapshot()), partRows));
        }
        LocalDateTime finishedAt = attempt.getSubmittedAt() != null ? attempt.getSubmittedAt() : attempt.getTimedOutAt();
        Long durationSeconds = null;
        if (finishedAt != null && attempt.getStartedAt() != null)
            durationSeconds = Math.max(0, Duration.between(attempt.getStartedAt(), finishedAt).getSeconds());
        User student = attempt.getStudent();
        return new AttemptReviewResponse(
                attempt.getId(), student != null ? student.getId() : studentId,
                student != null ? student.getFullName() : null,
                assignment.getId(), assignment.getName(),
                attempt.getClassIdAtStart(), attempt.getClassNameAtStart(),
                attempt.getStatus().name(), resolveDeadlineState(attempt, assignment.getDueAt()),
                attempt.getStartedAt() != null ? attempt.getStartedAt().toString() : null,
                finishedAt != null ? finishedAt.toString() : null, durationSeconds,
                attempt.getTotalEarnedPoints(), attempt.getTotalPossiblePoints(),
                toDoublePercent(attempt.getPercentageScore()), questionRows);
    }

    private record RosterStudent(Long studentId, String studentName, Long classId, String className) {
    }

    private record RosterContext(List<Long> classIds, Map<Long, String> classNames, List<RosterStudent> students) {
    }

    private RosterContext buildRoster(Assignment assignment) {
        List<Long> classIds = assignment.getClassIds() != null
                ? assignment.getClassIds().stream().filter(Objects::nonNull).distinct().toList() : List.of();
        Map<Long, String> classNames = new HashMap<>();
        if (!classIds.isEmpty())
            for (ClassEntity c : classRepository.findAllById(classIds)) classNames.put(c.getId(), c.getName());
        Map<Long, RosterStudent> byStudent = new LinkedHashMap<>();
        for (Long classId : classIds) {
            String className = classNames.getOrDefault(classId, "Class " + classId);
            for (ClassMember member : classMemberRepository.findStudentsByClassId(classId)) {
                User user = member.getUser();
                if (user == null) continue;
                byStudent.putIfAbsent(user.getId(), new RosterStudent(user.getId(), user.getFullName(), classId, className));
            }
        }
        return new RosterContext(classIds, classNames, new ArrayList<>(byStudent.values()));
    }

    private Map<Long, AssessmentAttempt> indexAttempts(List<AssessmentAttempt> attempts) {
        Map<Long, AssessmentAttempt> map = new HashMap<>();
        for (AssessmentAttempt a : attempts)
            if (a.getStudent() != null) map.put(a.getStudent().getId(), a);
        return map;
    }

    private ProgressCounts buildProgress(RosterContext roster, Map<Long, AssessmentAttempt> attemptByStudent, LocalDateTime dueAt) {
        int assigned = roster.students.size(), notStarted = 0, inProgress = 0, submitted = 0, timedOut = 0, late = 0, overdue = 0;
        LocalDateTime now = LocalDateTime.now();
        for (RosterStudent rs : roster.students) {
            AssessmentAttempt a = attemptByStudent.get(rs.studentId());
            if (a == null) {
                notStarted++;
                if (dueAt != null && !now.isBefore(dueAt)) overdue++;
                continue;
            }
            if (a.getStatus() == AssessmentAttemptStatus.IN_PROGRESS) {
                inProgress++;
                if (dueAt != null && !now.isBefore(dueAt)) overdue++;
            }
            else if (a.getStatus() == AssessmentAttemptStatus.SUBMITTED) {
                submitted++;
                if (a.isLate()) late++;
            } else if (a.getStatus() == AssessmentAttemptStatus.TIMED_OUT) {
                timedOut++;
                if (a.isLate()) late++;
            }
        }
        return new ProgressCounts(assigned, notStarted, inProgress, submitted, timedOut, late, overdue,
                assigned == 0 ? null : submitted / (double) assigned);
    }

    private ScoreSummary buildScoreSummary(List<AssessmentAttempt> attempts) {
        List<Double> percents = attempts.stream().filter(this::isTerminal).map(AssessmentAttempt::getPercentageScore)
                .filter(Objects::nonNull).map(this::toDoublePercent).filter(Objects::nonNull).sorted().toList();
        List<ScoreBucket> buckets = new ArrayList<>();
        for (int i = 0; i < 10; i++) buckets.add(new ScoreBucket(i * 10, i * 10 + 10, 0));
        for (Double p : percents) {
            int idx = Math.min(9, Math.max(0, (int) Math.floor(p / 10.0)));
            if (p >= 100) idx = 9;
            ScoreBucket b = buckets.get(idx);
            buckets.set(idx, new ScoreBucket(b.fromPercent(), b.toPercent(), b.count() + 1));
        }
        if (percents.isEmpty()) return new ScoreSummary(0, null, null, null, null, buckets);
        double avg = percents.stream().mapToDouble(Double::doubleValue).sum() / percents.size();
        return new ScoreSummary(percents.size(), round1(avg), round1(median(percents)),
                percents.get(percents.size() - 1), percents.get(0), buckets);
    }

    private Map<Long, Double> computeClassAccuracy(List<AssessmentAttempt> attempts) {
        List<AssessmentAttempt> terminal = attempts.stream().filter(this::isTerminal).toList();
        if (terminal.isEmpty()) return Map.of();
        List<Long> attemptIds = terminal.stream().map(AssessmentAttempt::getId).toList();
        Map<Long, Long> attemptToClass = new HashMap<>();
        for (AssessmentAttempt a : terminal)
            if (a.getClassIdAtStart() != null) attemptToClass.put(a.getId(), a.getClassIdAtStart());
        List<AssessmentAttemptQuestion> allQ = questionRepository.findAllByAttemptIdInOrderByAttemptIdAscPositionAsc(attemptIds);
        List<AssessmentAttemptPartResult> allP = partResultRepository.findAllByAttemptIds(attemptIds);
        Map<Long, List<AssessmentAttemptPartResult>> partsByQ = allP.stream()
                .collect(Collectors.groupingBy(p -> p.getAttemptQuestion().getId()));
        Map<Long, long[]> acc = new HashMap<>();
        for (AssessmentAttemptQuestion q : allQ) {
            if (q.isExample()) continue;
            Long classId = attemptToClass.get(q.getAttempt().getId());
            if (classId == null) continue;
            AttemptPartStatus st = rollup(partsByQ.getOrDefault(q.getId(), List.of()), q);
            long[] c = acc.computeIfAbsent(classId, k -> new long[2]);
            c[1]++;
            if (st == AttemptPartStatus.CORRECT) c[0]++;
        }
        Map<Long, Double> result = new HashMap<>();
        for (Map.Entry<Long, long[]> e : acc.entrySet())
            if (e.getValue()[1] > 0) result.put(e.getKey(), round1(100.0 * e.getValue()[0] / e.getValue()[1]));
        return result;
    }

    private List<ClassComparisonRow> buildClassComparison(RosterContext roster,
                                                          Map<Long, AssessmentAttempt> attemptByStudent, Map<Long, Double> accuracyByClass) {
        Map<Long, List<RosterStudent>> byClass = roster.students.stream()
                .collect(Collectors.groupingBy(RosterStudent::classId, LinkedHashMap::new, Collectors.toList()));
        List<ClassComparisonRow> rows = new ArrayList<>();
        for (Long classId : roster.classIds) {
            List<RosterStudent> members = byClass.getOrDefault(classId, List.of());
            int assigned = members.size(), submitted = 0;
            List<Double> percents = new ArrayList<>();
            for (RosterStudent rs : members) {
                AssessmentAttempt a = attemptByStudent.get(rs.studentId());
                if (a != null && a.getStatus() == AssessmentAttemptStatus.SUBMITTED) submitted++;
                if (a != null && isTerminal(a) && a.getPercentageScore() != null) {
                    Double p = toDoublePercent(a.getPercentageScore());
                    if (p != null) percents.add(p);
                }
            }
            percents.sort(Double::compareTo);
            Double avg = percents.isEmpty() ? null : round1(percents.stream().mapToDouble(d -> d).average().orElse(0));
            Double med = percents.isEmpty() ? null : round1(median(percents));
            rows.add(new ClassComparisonRow(classId, roster.classNames.getOrDefault(classId, "Class " + classId),
                    assigned, submitted, assigned == 0 ? null : submitted / (double) assigned,
                    avg, med, accuracyByClass.get(classId), overallBand(med)));
        }
        return rows;
    }

    private StudentResultRow toStudentRow(RosterStudent rs, AssessmentAttempt a, LocalDateTime dueAt) {
        if (a == null) {
            String deadline = (dueAt != null && !LocalDateTime.now().isBefore(dueAt)) ? "OVERDUE" : "NONE";
            return new StudentResultRow(rs.studentId(), rs.studentName(), rs.classId(), rs.className(),
                    null, "NOT_STARTED", deadline, null, null, null, null, null, null, null, null);
        }
        LocalDateTime finishedAt = a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getTimedOutAt();
        Long duration = null;
        if (finishedAt != null && a.getStartedAt() != null)
            duration = Math.max(0, Duration.between(a.getStartedAt(), finishedAt).getSeconds());
        String lifecycle = a.getStatus().name();
        Double scorePercent = toDoublePercent(a.getPercentageScore());
        Double earned = a.getTotalEarnedPoints() != null ? a.getTotalEarnedPoints().doubleValue() : null;
        Double possible = a.getTotalPossiblePoints() != null ? a.getTotalPossiblePoints().doubleValue() : null;
        return new StudentResultRow(rs.studentId(), rs.studentName(),
                a.getClassIdAtStart() != null ? a.getClassIdAtStart() : rs.classId(),
                a.getClassNameAtStart() != null ? a.getClassNameAtStart() : rs.className(),
                a.getId(), lifecycle, resolveDeadlineState(a, dueAt),
                scorePercent, earned, possible,
                a.getStartedAt() != null ? a.getStartedAt().toString() : null,
                finishedAt != null ? finishedAt.toString() : null,
                duration, null, null);
    }

    private Assignment requireAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private boolean isTerminal(AssessmentAttempt a) {
        return a.getStatus() == AssessmentAttemptStatus.SUBMITTED || a.getStatus() == AssessmentAttemptStatus.TIMED_OUT;
    }

    private String resolveDeadlineState(AssessmentAttempt a, LocalDateTime dueAt) {
        if (a.isLate()) return "LATE";
        if (a.getStatus() == AssessmentAttemptStatus.IN_PROGRESS)
            return dueAt != null && !LocalDateTime.now().isBefore(dueAt) ? "OVERDUE" : "OPEN";
        if (a.getStatus() == AssessmentAttemptStatus.SUBMITTED || a.getStatus() == AssessmentAttemptStatus.TIMED_OUT)
            return "ON_TIME";
        if (dueAt != null && !LocalDateTime.now().isBefore(dueAt)) return "OVERDUE";
        return "NONE";
    }

    private static String overallBand(Double medianPercent) {
        if (medianPercent == null) return null;
        if (medianPercent >= 80) return "HIGH";
        if (medianPercent >= 50) return "MID";
        return "LOW";
    }

    private static double median(List<Double> sorted) {
        int n = sorted.size();
        if (n == 0) return 0;
        if (n % 2 == 1) return sorted.get(n / 2);
        return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }

    private static Double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private Double toDoublePercent(BigDecimal percentageScore) {
        if (percentageScore == null) return null;
        double v = percentageScore.doubleValue();
        if (v <= 1.0) return round1(v * 100.0);
        return round1(v);
    }

    private static String toPublicStatus(AttemptPartStatus status) {
        return status == null ? "UNANSWERED" : status.name();
    }

    private static AttemptPartStatus rollup(List<AssessmentAttemptPartResult> parts, AssessmentAttemptQuestion question) {
        if (question.isExample()) return AttemptPartStatus.UNANSWERED;
        if (parts.isEmpty())
            return (question.getAnswerPayload() == null || question.getAnswerPayload().isEmpty())
                    ? AttemptPartStatus.UNANSWERED : AttemptPartStatus.INCORRECT;
        boolean anyPartial = false, anyCorrect = false, anyIncorrect = false, allUnanswered = true;
        for (AssessmentAttemptPartResult part : parts) {
            AttemptPartStatus status = part.getStatus();
            if (status != AttemptPartStatus.UNANSWERED) allUnanswered = false;
            switch (status) {
                case CORRECT -> anyCorrect = true;
                case PARTIALLY_CORRECT -> anyPartial = true;
                case INCORRECT -> anyIncorrect = true;
                case UNANSWERED -> {
                }
            }
        }
        if (allUnanswered) return AttemptPartStatus.UNANSWERED;
        if (anyPartial || (anyCorrect && anyIncorrect)) return AttemptPartStatus.PARTIALLY_CORRECT;
        if (anyCorrect) return AttemptPartStatus.CORRECT;
        return AttemptPartStatus.INCORRECT;
    }

    private static String extractPrompt(Map<String, Object> snapshot) {
        if (snapshot == null) {
            return "";
        }

        Object student = snapshot.get("student");
        if (student instanceof Map<?, ?> studentMap) {
            Object spec = studentMap.get("spec");

            if (spec instanceof Map<?, ?> specMap) {
                Object prompt = specMap.get("prompt");
                if (prompt != null) {
                    return String.valueOf(prompt);
                }
            }

            if (spec instanceof String s) {
                return s;
            }
        }

        Object prompt = snapshot.get("prompt");
        return prompt != null ? String.valueOf(prompt) : "";
    }

    private static String extractType(Map<String, Object> snapshot) {
        if (snapshot == null) {
            return "UNKNOWN";
        }

        Object student = snapshot.get("student");
        if (!(student instanceof Map<?, ?> studentMap)) {
            return "UNKNOWN";
        }

        Object spec = studentMap.get("spec");
        if (!(spec instanceof Map<?, ?> specMap)) {
            return "UNKNOWN";
        }

        Object type = specMap.get("type");
        return type == null ? "UNKNOWN" : String.valueOf(type);
    }

    private static Object extractAnswerKey(Map<String, Object> snapshot) {
        if (snapshot == null) {
            return null;
        }

        Object grading = snapshot.get("grading");
        if (!(grading instanceof Map<?, ?> gradingMap)) {
            return null;
        }

        Map<String, Object> result = new LinkedHashMap<>();

        Object options = gradingMap.get("options");
        if (options != null) {
            result.put("options", options);
        }

        Object answers = gradingMap.get("answers");
        if (answers != null) {
            result.put("answers", answers);
        }

        Object explantation = gradingMap.get("explantation");
        if (explantation != null) {
            result.put("explanation", explantation);
        }

        return result.isEmpty() ? null : result;
    }

    private static final class QuestionAgg {
        final int position;
        String sectionId, sectionTitle, promptPreview, questionType, questionId;
        int attemptCount, correctCount, partialCount, incorrectCount, unansweredCount;
        BigDecimal earnedSum = BigDecimal.ZERO, possibleSum = BigDecimal.ZERO;

        QuestionAgg(int position) {
            this.position = position;
        }

        void seedFrom(AssessmentAttemptQuestion q) {
            if (promptPreview == null) {
                String prompt = extractPrompt(q.getQuestionSnapshot());
                promptPreview = prompt.length() > 160 ? prompt.substring(0, 160) + "…" : prompt;
                questionType = extractType(q.getQuestionSnapshot());
                sectionTitle = q.getSectionTitle();
                sectionId = q.getSectionKey();
                questionId = "pos-" + position;
            }
        }

        QuestionAnalysisRow toRow(QuestionAnswerDistribution distribution) {
            Double accuracy = attemptCount == 0 ? null : round1(100.0 * correctCount / attemptCount);
            Double scoreRate = possibleSum.compareTo(BigDecimal.ZERO) <= 0 ? null
                    : round1(earnedSum.multiply(BigDecimal.valueOf(100))
                    .divide(possibleSum, 1, RoundingMode.HALF_UP).doubleValue());
            String difficulty = null;
            if (accuracy != null) {
                if (accuracy < 40.0) difficulty = "HARD";
                else if (accuracy > 90.0) difficulty = "EASY";
            }
            return new QuestionAnalysisRow(
                    questionId != null ? questionId : "pos-" + position, position, sectionId, sectionTitle,
                    promptPreview != null ? promptPreview : "", questionType != null ? questionType : "UNKNOWN",
                    false, attemptCount, correctCount, partialCount, incorrectCount, unansweredCount,
                    accuracy, scoreRate, difficulty, distribution);
        }
    }

    private static final class SectionAgg {
        final String sectionId, sectionTitle;
        int questionCount, sampleSlots, correctCount, partialCount, incorrectCount, unansweredCount;
        double scoreRateWeightedSum;
        int scoreRateWeight;

        SectionAgg(String sectionId, String sectionTitle) {
            this.sectionId = sectionId;
            this.sectionTitle = sectionTitle;
        }

        SectionAnalysisRow toRow() {
            Double accuracy = sampleSlots == 0 ? null : round1(100.0 * correctCount / sampleSlots);
            Double blank = sampleSlots == 0 ? null : round1(100.0 * unansweredCount / sampleSlots);
            Double scoreRate = scoreRateWeight == 0 ? null : round1(scoreRateWeightedSum / scoreRateWeight);
            return new SectionAnalysisRow(sectionId, sectionTitle, questionCount, sampleSlots,
                    correctCount, partialCount, incorrectCount, unansweredCount, accuracy, scoreRate, blank);
        }
    }
}
