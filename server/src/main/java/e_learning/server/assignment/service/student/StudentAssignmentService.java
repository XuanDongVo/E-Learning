package e_learning.server.assignment.service.student;

import e_learning.server.assignment.dto.student.StudentAssignmentItemResponse;
import e_learning.server.assignment.dto.student.StudentAssignmentStatus;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentAssignmentService {

    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentItemRepository assignmentItemRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;

    /**
     * Student assignment lifecycle is derived from the student's attempt:
     * TODO = no attempt, IN_PROGRESS = active attempt,
     * SUBMITTED = submitted or timed out attempt.
     *
     * The TODO tab intentionally includes IN_PROGRESS so unfinished work remains
     * visible. Submitted work is returned only for the explicit SUBMITTED tab.
     */
    public List<StudentAssignmentItemResponse> getMyAssignments(
            Long studentId,
            String statusFilter
    ) {
        User student = userRepository.findById(studentId)
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ClassMember membership = classMemberRepository.findActiveMembershipByUserId(student.getId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS));

        Long activeClassId = membership.getClassEntity().getId();
        LocalDateTime now = LocalDateTime.now();

        final StudentAssignmentStatus requestedStatus;
        try {
            requestedStatus = StudentAssignmentStatus.fromRequest(statusFilter);
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return assignmentRepository.findAllByStatusOrderByDueAtAscIdAsc(AssignmentStatus.PUBLISHED)
                .stream()
                .filter(assignment -> isVisibleToClass(assignment, activeClassId))
                .filter(assignment -> assignment.getStartAt() == null
                        || !assignment.getStartAt().isAfter(now))
                .map(assignment -> toResponse(assignment, studentId, requestedStatus, now))
                .filter(response -> response != null)
                .sorted(Comparator.comparing(
                        StudentAssignmentItemResponse::dueAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    private boolean isVisibleToClass(Assignment assignment, Long activeClassId) {
        return assignment.getClassIds() != null
                && assignment.getClassIds().contains(activeClassId);
    }

    private StudentAssignmentItemResponse toResponse(
            Assignment assignment,
            Long studentId,
            StudentAssignmentStatus requestedStatus,
            LocalDateTime now
    ) {
        AssessmentAttempt attempt = assessmentAttemptRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), studentId)
                .orElse(null);

        StudentAssignmentStatus actualStatus = resolveStatus(attempt);

        if (!matchesRequestedTab(actualStatus, requestedStatus)) {
            return null;
        }

        long questionCount = assignmentItemRepository
                .countByAssignmentIdAndItemType(assignment.getId(), "QUESTION");

        int dueInDays = assignment.getDueAt() == null
                ? 0
                : Math.toIntExact(ChronoUnit.DAYS.between(
                        now.toLocalDate(),
                        assignment.getDueAt().toLocalDate()
                ));

        boolean late = resolveLate(assignment, attempt, now);

        return new StudentAssignmentItemResponse(
                assignment.getId(),
                assignment.getName(),
                dueInDays,
                assignment.getDueAt(),
                questionCount,
                assignment.getTimeLimitMinutes(),
                actualStatus,
                late,
                assignment.getDescription()
        );
    }

    private StudentAssignmentStatus resolveStatus(AssessmentAttempt attempt) {
        if (attempt == null) {
            return StudentAssignmentStatus.TODO;
        }

        return switch (attempt.getStatus()) {
            case IN_PROGRESS -> StudentAssignmentStatus.IN_PROGRESS;
            case SUBMITTED, TIMED_OUT -> StudentAssignmentStatus.SUBMITTED;
        };
    }

    private boolean resolveLate(
            Assignment assignment,
            AssessmentAttempt attempt,
            LocalDateTime now
    ) {
        LocalDateTime dueAt = assignment.getDueAt();
        if (dueAt == null) {
            return false;
        }

        if (attempt == null) {
            return now.isAfter(dueAt);
        }

        if (attempt.getStatus() == AssessmentAttemptStatus.IN_PROGRESS) {
            return now.isAfter(dueAt);
        }

        return attempt.isLate();
    }

    private boolean matchesRequestedTab(
            StudentAssignmentStatus actualStatus,
            StudentAssignmentStatus requestedStatus
    ) {
        if (requestedStatus == StudentAssignmentStatus.TODO) {
            return actualStatus == StudentAssignmentStatus.TODO
                    || actualStatus == StudentAssignmentStatus.IN_PROGRESS;
        }

        return actualStatus == requestedStatus;
    }
}
