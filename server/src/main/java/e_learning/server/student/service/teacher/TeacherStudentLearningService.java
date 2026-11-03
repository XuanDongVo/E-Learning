package e_learning.server.student.service.teacher;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.activitysession.repository.ActivitySessionRepository;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.dto.PageResponse;
import e_learning.server.student.dto.StudentActivitySessionItemResponse;
import e_learning.server.student.dto.StudentAssignmentItemResponse;
import e_learning.server.student.dto.StudentLearningSummaryResponse;
import e_learning.server.student.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherStudentLearningService {
    private final StudentProfileService profileService;
    private final ClassMemberRepository classMemberRepository;
    private final ClassRepository classRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final ActivitySessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public PageResponse<StudentAssignmentItemResponse> listAssignments(
            Long studentId, Long teacherId, String status, int page, int size
    ) {
        profileService.getForTeacher(studentId, teacherId);
        List<StudentAssignmentItemResponse> all = buildAssignmentRows(studentId, teacherId);
        if (StringUtils.hasText(status)) {
            String normalized = status.trim().toUpperCase(Locale.ROOT);
            all = all.stream().filter(r -> r.status().equals(normalized)).toList();
        }
        return PageResponse.fromList(all, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentActivitySessionItemResponse> listActivitySessions(
            Long studentId, Long teacherId, String mode, String status, int page, int size
    ) {
        profileService.getForTeacher(studentId, teacherId);

        ActivityMode modeEnum = StringUtils.hasText(mode) ? parseMode(mode) : null;
        ActivitySessionStatus statusEnum = StringUtils.hasText(status) ? parseSessionStatus(status) : null;

        int safeSize = size <= 0 ? 20 : size;
        int safePage = Math.max(1, page);
        PageRequest pageable = PageRequest.of(safePage - 1, safeSize, Sort.by(Sort.Direction.DESC, "startedAt"));

        Page<ActivitySession> result = sessionRepository.searchByStudent(
                studentId, modeEnum, statusEnum, pageable
        );
        List<StudentActivitySessionItemResponse> rows = result.getContent().stream()
                .map(this::toSessionRow)
                .toList();
        return PageResponse.from(result, rows);
    }

    @Transactional(readOnly = true)
    public StudentLearningSummaryResponse summary(Long studentId, Long teacherId) {
        profileService.getForTeacher(studentId, teacherId);
        List<StudentAssignmentItemResponse> rows = buildAssignmentRows(studentId, teacherId);
        long submitted = rows.stream().filter(r -> "SUBMITTED".equals(r.status())).count();
        long late = rows.stream().filter(r -> "LATE".equals(r.status())).count();
        long timedOut = rows.stream().filter(r -> "TIMED_OUT".equals(r.status())).count();
        long notStarted = rows.stream().filter(r -> "NOT_STARTED".equals(r.status())).count();
        long inProgress = rows.stream().filter(r -> "IN_PROGRESS".equals(r.status())).count();
        long sessionTotal = sessionRepository.countByStudentId(studentId);
        return new StudentLearningSummaryResponse(
                rows.size(), submitted, late, timedOut, notStarted, inProgress, sessionTotal
        );
    }

    private List<StudentAssignmentItemResponse> buildAssignmentRows(Long studentId, Long teacherId) {
        Set<Long> teacherClassIds = classRepository.findAllByTeacherId(teacherId).stream()
                .map(ClassEntity::getId)
                .collect(Collectors.toSet());

        Set<Long> studentClassIds = classMemberRepository.findAllByStudentAndTeacher(studentId, teacherId).stream()
                .map(m -> m.getClassEntity().getId())
                .collect(Collectors.toSet());

        Map<Long, AssessmentAttempt> attemptsByAssignment = attemptRepository
                .findAllByStudentIdWithAssignment(studentId)
                .stream()
                .filter(a -> intersects(a.getAssignment().getClassIds(), teacherClassIds)
                        || teacherClassIds.contains(a.getClassIdAtStart()))
                .collect(Collectors.toMap(a -> a.getAssignment().getId(), a -> a, (x, y) -> x));

        List<Assignment> published = assignmentRepository
                .findAllByStatusOrderByDueAtAscIdAsc(AssignmentStatus.PUBLISHED);

        Map<Long, Assignment> visible = new LinkedHashMap<>();
        for (Assignment assignment : published) {
            if (intersects(assignment.getClassIds(), studentClassIds)) {
                visible.put(assignment.getId(), assignment);
            }
        }
        for (AssessmentAttempt attempt : attemptsByAssignment.values()) {
            visible.putIfAbsent(attempt.getAssignment().getId(), attempt.getAssignment());
        }

        return visible.values().stream()
                .sorted(Comparator
                        .comparing(Assignment::getDueAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Assignment::getId))
                .map(assignment -> toAssignmentRow(assignment, attemptsByAssignment.get(assignment.getId())))
                .toList();
    }

    private static boolean intersects(List<Long> a, Set<Long> b) {
        if (a == null || a.isEmpty() || b.isEmpty()) return false;
        for (Long id : a) {
            if (b.contains(id)) return true;
        }
        return false;
    }

    private StudentAssignmentItemResponse toAssignmentRow(Assignment assignment, AssessmentAttempt attempt) {
        String status = "NOT_STARTED";
        Long attemptId = null;
        Double scorePercent = null;
        boolean late = false;
        java.time.LocalDateTime submittedAt = null;

        if (attempt != null) {
            attemptId = attempt.getId();
            late = attempt.isLate();
            submittedAt = attempt.getSubmittedAt() != null ? attempt.getSubmittedAt() : attempt.getTimedOutAt();
            if (attempt.getPercentageScore() != null) {
                scorePercent = attempt.getPercentageScore().doubleValue() * 100.0;
            }
            status = switch (attempt.getStatus()) {
                case IN_PROGRESS -> "IN_PROGRESS";
                case TIMED_OUT -> "TIMED_OUT";
                case SUBMITTED -> late ? "LATE" : "SUBMITTED";
            };
        }

        return new StudentAssignmentItemResponse(
                assignment.getId(), assignment.getName(), assignment.getDueAt(), status,
                attemptId, submittedAt, scorePercent, late
        );
    }

    private StudentActivitySessionItemResponse toSessionRow(ActivitySession session) {
        var activity = session.getActivity();
        var unit = activity.getUnit();
        return new StudentActivitySessionItemResponse(
                session.getId(), activity.getId(), activity.getName(),
                unit.getCode() + " · " + unit.getName(),
                session.getMode().name(), session.getStatus().name(),
                session.getTotalQuestions(), session.getFirstCorrectCount(),
                session.getFinalCorrectCount(), session.getHintUsedCount(),
                session.getStartedAt(), session.getCompletedAt()
        );
    }

    private static ActivityMode parseMode(String raw) {
        try { return ActivityMode.valueOf(raw.trim().toUpperCase(Locale.ROOT)); }
        catch (Exception e) { return null; }
    }

    private static ActivitySessionStatus parseSessionStatus(String raw) {
        try { return ActivitySessionStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT)); }
        catch (Exception e) { return null; }
    }
}
