package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.StartOrResumeAttemptRequest;
import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeResponse;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptPartResultRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Phase 7B runtime orchestration entry point.
 *
 * This is intentionally a skeleton: do not expose start/save/submit endpoints until
 * snapshot assembly and all supported Question Engine handlers are verified end-to-end.
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

    /**
     * Sprint 1 method stub only. Product logic is intentionally left for the owner to implement.
     *
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
        throw new UnsupportedOperationException("Sprint 1 startOrResume logic is pending owner implementation");
    }

    // Next implementation slice:
    // 1. startOrResume: validate assignment visibility/target/schedule, create one immutable snapshot.
    // 2. saveAnswer: enforce owner, IN_PROGRESS, deadline, active_session_id and idempotency.
    // 3. submit: lock attempt, grade from stored snapshot, persist part results and aggregate once.
    // 4. timeout: server-authoritative deadline processing; no client-only timer.
    // 5. hard-lock Assignment authoring after first attempt, enforced transaction-safely.
}
