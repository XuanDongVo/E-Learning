package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.StartOrResumeAttemptRequest;
import e_learning.server.assessmentattempt.dto.response.AttemptIntroResponse;
import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptPartResultRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.entity.ClassStatus;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

/**
 * Phase 7B runtime orchestration entry point.
 * <p>
 * Sprint 1 contains contract method stubs only. The controller shells exist for FE contract
 * alignment, but this service is intentionally non-functional until the owner implements
 * business rules. Do not treat these endpoints as usable runtime while the methods throw.
 * Implement each write path transactionally with attempt locking and active-session checks.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AssessmentAttemptService {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptQuestionRepository attemptQuestionRepository;
    private final AssessmentAttemptAnswerRepository attemptAnswerRepository;
    private final AssessmentAttemptPartResultRepository partResultRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentItemRepository assignmentItemRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;


    /**
     *
     */
    @Transactional(readOnly = true)
    public AttemptIntroResponse getIntro(Long assignmentId, Long studentId) {

        // 1. Assignment phải tồn tại
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));

        // 2. Assignment phải được publish để Student có thể truy cập
        if (!AssignmentStatus.PUBLISHED.equals(assignment.getStatus())) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }

        // 3. Student phải thuộc một ACTIVE class
        ClassMember classMember = classMemberRepository
                .findActiveMembershipByUserId(studentId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.CLASS_MEMBER_NOT_FOUND));

        // 5. Assignment phải target đúng class của Student
        Long studentClassId = classMember.getClassEntity().getId();

        boolean assignmentTargetsStudentClass = assignment.getClassIds()
                .stream()
                .anyMatch(classId -> Objects.equals(classId, studentClassId));

        if (!assignmentTargetsStudentClass) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }

        // 6. Lấy số lượng question trong Assignment
        long questionCount = assignmentQuestionRepository.countByAssignmentId(assignmentId);

        // 7. Tìm Attempt hiện tại của Student
        Optional<AssessmentAttempt> existingAttempt =
                attemptRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        AssessmentAttemptStatus attemptStatus =
                existingAttempt
                        .map(AssessmentAttempt::getStatus)
                        .orElse(null);

        // 8. Assignment được xem là hoàn thành khi Attempt đã SUBMITTED.
        boolean completed = AssessmentAttemptStatus.SUBMITTED.equals(attemptStatus);

        // 9. late = đã quá dueAt nhưng Student chưa hoàn thành Assignment.
        LocalDateTime now = LocalDateTime.now();

        boolean late = !completed && !now.isBefore(assignment.getDueAt());

        // 10. Lấy grade name
        String gradeName = assignment.getGrade().getName();

        // 11. Trả dữ liệu Intro
        return AttemptIntroResponse.map(
                assignment,
                questionCount,
                gradeName,
                attemptStatus,
                late
        );
    }

    /**
     * Sprint 1 method stub only. Product logic is intentionally left for the owner to implement.
     * <p>
     * TODO(owner):
     * - authenticate/authorize the Student and validate Assignment visibility, target and schedule;
     * - enforce one official Attempt per Assignment/Student under concurrent first-start requests;
     * - validate the stable client-generated session credential without silently replacing it;
     * - resolve the Student's single ACTIVE class on the server;
     * - build an immutable Composition/settings/Question snapshot;
     * - return a student-safe DTO that cannot expose answer keys or grading internals.
     */
    public AttemptRuntimeResponse startOrResume(
            Long assignmentId,
            Long studentId,
            StartOrResumeAttemptRequest request
    ) {



        return null;
    }

    // Next implementation slice:
    // 1. startOrResume: validate assignment visibility/target/schedule, create one immutable snapshot.
    // 2. saveAnswer: enforce owner, IN_PROGRESS, deadline, active_session_id and idempotency.
    // 3. submit: lock attempt, grade from stored snapshot, persist part results and aggregate once.
    // 4. timeout: server-authoritative deadline processing; no client-only timer.
    // 5. hard-lock Assignment authoring after first attempt, enforced transaction-safely.
}
