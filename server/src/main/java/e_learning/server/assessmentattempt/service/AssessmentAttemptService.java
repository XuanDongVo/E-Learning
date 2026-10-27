package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.StartOrResumeAttemptRequest;
import e_learning.server.assessmentattempt.dto.response.AttemptIntroResponse;
import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.entity.AssignmentItem;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.entity.ClassStatus;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssessmentAttemptService {
    private static final String QUESTION_ITEM = "QUESTION";
    private static final String UNIQUE_ATTEMPT_CONSTRAINT = "uq_assessment_attempt_assignment_student";

    private final AssessmentAttemptRepository attemptRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentItemRepository assignmentItemRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssessmentAttemptCreationService creationService;
    private final AssessmentAttemptRuntimeProjectionService runtimeProjectionService;

    @Transactional(readOnly = true)
    public AttemptIntroResponse getIntro(Long assignmentId, Long studentId) {
        Assignment assignment = getPublishedAssignment(assignmentId);
        requireActiveStudent(studentId);
        ClassMember membership = requireActiveMembership(studentId);
        validateTarget(assignment, membership);

        long questionCount = assignmentItemRepository
                .findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId)
                .stream().filter(item -> QUESTION_ITEM.equals(item.getItemType())).count();

        Optional<AssessmentAttempt> existing = attemptRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
        LocalDateTime now = LocalDateTime.now();
        boolean late = existing.map(attempt ->
                attempt.getStatus() == AssessmentAttemptStatus.IN_PROGRESS
                        ? !now.isBefore(assignment.getDueAt())
                        : attempt.isLate()
        ).orElseGet(() -> !now.isBefore(assignment.getDueAt()));

        return AttemptIntroResponse.map(assignment, questionCount, assignment.getGrade().getName(),
                existing.map(AssessmentAttempt::getStatus).orElse(null), late);
    }

    /**
     * Do not wrap this orchestration method in a transaction: createAttempt runs in its own
     * transaction so a unique-constraint race is rolled back before we re-read the winner.
     */
    public AttemptRuntimeResponse startOrResume(Long assignmentId, Long studentId, StartOrResumeAttemptRequest request) {
        if (request == null || request.activeSessionId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Optional<AttemptRuntimeResponse> existing = runtimeProjectionService.findForStartOrResume(
                assignmentId, studentId, request.activeSessionId());
        if (existing.isPresent()) return existing.get();

        try {
            Long attemptId = creationService.createAttempt(assignmentId, studentId, request.activeSessionId());
            return runtimeProjectionService.getRuntime(attemptId);
        } catch (DataIntegrityViolationException exception) {
            if (!isAttemptUniqueConflict(exception)) throw exception;

            Optional<AttemptRuntimeResponse> winner = runtimeProjectionService.findForStartOrResume(
                    assignmentId, studentId, request.activeSessionId());
            if (winner.isPresent()) return winner.get();
            throw exception;
        }
    }

    private Assignment getPublishedAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }
        return assignment;
    }

    private void requireActiveStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        if (student.getRole() != Role.STUDENT || student.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private ClassMember requireActiveMembership(Long studentId) {
        ClassMember membership = classMemberRepository.findActiveMembershipByUserId(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS));
        if (membership.getClassEntity().getStatus() != ClassStatus.ACTIVE) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS);
        }
        return membership;
    }

    private void validateTarget(Assignment assignment, ClassMember membership) {
        Long classId = membership.getClassEntity().getId();
        if (assignment.getClassIds() == null ||
                assignment.getClassIds().stream().noneMatch(id -> Objects.equals(id, classId))) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }
    }

    private boolean isAttemptUniqueConflict(DataIntegrityViolationException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof ConstraintViolationException violation &&
                    UNIQUE_ATTEMPT_CONSTRAINT.equals(violation.getConstraintName())) return true;
            if (cause instanceof SQLException sql &&
                    "23505".equals(sql.getSQLState()) &&
                    sql.getMessage() != null && sql.getMessage().contains(UNIQUE_ATTEMPT_CONSTRAINT)) return true;
            cause = cause.getCause();
        }
        return exception.getMessage() != null && exception.getMessage().contains(UNIQUE_ATTEMPT_CONSTRAINT);
    }
}
