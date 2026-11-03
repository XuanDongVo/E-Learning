package e_learning.server.student.service;

import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.repository.ActivitySessionRepository;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.student.dto.StudentActivitySessionItemResponse;
import e_learning.server.student.dto.StudentAssignmentItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentLearningService {
    private final StudentProfileService profileService;
    private final ClassMemberRepository classMemberRepository;
    private final ClassRepository classRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final ActivitySessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public List<StudentAssignmentItemResponse> listAssignments(Long studentId, Long teacherId) {
        profileService.getForTeacher(studentId, teacherId);

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

    @Transactional(readOnly = true)
    public List<StudentActivitySessionItemResponse> listActivitySessions(Long studentId, Long teacherId) {
        profileService.getForTeacher(studentId, teacherId);

        return sessionRepository.findAllByStudentIdWithActivityOrderByStartedAtDesc(studentId).stream()
                .map(this::toSessionRow)
                .toList();
    }

    private static boolean intersects(List<Long> a, Set<Long> b) {
        if (a == null || a.isEmpty() || b.isEmpty()) {
            return false;
        }
        for (Long id : a) {
            if (b.contains(id)) {
                return true;
            }
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
                assignment.getId(),
                assignment.getName(),
                assignment.getDueAt(),
                status,
                attemptId,
                submittedAt,
                scorePercent,
                late
        );
    }

    private StudentActivitySessionItemResponse toSessionRow(ActivitySession session) {
        var activity = session.getActivity();
        var unit = activity.getUnit();
        String unitLabel = unit.getCode() + " · " + unit.getName();
        return new StudentActivitySessionItemResponse(
                session.getId(),
                activity.getId(),
                activity.getName(),
                unitLabel,
                session.getMode().name(),
                session.getStatus().name(),
                session.getTotalQuestions(),
                session.getFirstCorrectCount(),
                session.getFinalCorrectCount(),
                session.getHintUsedCount(),
                session.getStartedAt(),
                session.getCompletedAt()
        );
    }
}
