package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.SubmitAttemptRequest;
import e_learning.server.assessmentattempt.dto.response.AttemptResultResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerMutationRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssessmentAttemptSubmitService {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptAnswerMutationRepository mutationRepository;
    private final AssessmentAttemptGradingService gradingService;
    private final AssessmentAttemptResultMapper resultMapper;

    /**
     * Manual submit. Allowed after due_at / deadline_at; marks late when after due.
     */
    @Transactional
    public AttemptResultResponse submit(Long assignmentId, Long studentId, SubmitAttemptRequest request) {
        if (request == null || request.activeSessionId() == null || request.requestId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        UUID activeSessionId = parseUuid(request.activeSessionId());
        // requestId reserved for future strict idempotency storage; status check is enough for MVP.
        parseUuid(request.requestId());

        AssessmentAttempt attempt = attemptRepository
                .findByAssignmentIdAndStudentIdForUpdate(assignmentId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));

        if (attempt.getStudent() == null || !attempt.getStudent().getId().equals(studentId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_ACCESS_DENIED);
        }

        if (isTerminal(attempt)) {
            return resultMapper.toResponse(attempt);
        }

        if (attempt.getActiveSessionId() == null || !attempt.getActiveSessionId().equals(activeSessionId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_SESSION_LOST);
        }

        finalizeAttempt(attempt, false);
        return resultMapper.toResponse(attempt);
    }

    /**
     * Read finalized result. Rejects while still in progress.
     */
    @Transactional(readOnly = true)
    public AttemptResultResponse getResult(Long assignmentId, Long studentId) {
        AssessmentAttempt attempt = attemptRepository
                .findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));

        if (attempt.getStudent() == null || !attempt.getStudent().getId().equals(studentId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_ACCESS_DENIED);
        }
        if (!isTerminal(attempt)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_STATE);
        }
        return resultMapper.toResponse(attempt);
    }

    /**
     * Timeout auto-finalize entry point (job / lazy). No session required.
     */
    @Transactional
    public void finalizeTimeoutIfDue(Long attemptId) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElse(null);
        if (attempt == null || isTerminal(attempt)) {
            return;
        }
        if (attempt.getDeadlineAt() == null || LocalDateTime.now().isBefore(attempt.getDeadlineAt())) {
            return;
        }

        attempt = attemptRepository
                .findByAssignmentIdAndStudentIdForUpdate(
                        attempt.getAssignment().getId(),
                        attempt.getStudent().getId())
                .orElse(null);
        if (attempt == null || isTerminal(attempt)) {
            return;
        }
        if (LocalDateTime.now().isBefore(attempt.getDeadlineAt())) {
            return;
        }

        finalizeAttempt(attempt, true);
    }

    private void finalizeAttempt(AssessmentAttempt attempt, boolean timedOut) {
        LocalDateTime now = LocalDateTime.now();

        gradingService.gradeAndPersist(attempt);

        attempt.setSubmittedAt(now);
        attempt.setLate(resolveLate(attempt, now));
        attempt.setActiveSessionId(null);

        if (timedOut) {
            attempt.setStatus(AssessmentAttemptStatus.TIMED_OUT);
            attempt.setTimedOutAt(now);
        } else {
            attempt.setStatus(AssessmentAttemptStatus.SUBMITTED);
            attempt.setTimedOutAt(null);
        }

        mutationRepository.deleteByAttemptId(attempt.getId());
        attemptRepository.saveAndFlush(attempt);
    }

    private static boolean resolveLate(AssessmentAttempt attempt, LocalDateTime submittedAt) {
        Assignment assignment = attempt.getAssignment();
        if (assignment == null || assignment.getDueAt() == null) {
            return false;
        }
        return !submittedAt.isBefore(assignment.getDueAt());
    }

    private static boolean isTerminal(AssessmentAttempt attempt) {
        AssessmentAttemptStatus status = attempt.getStatus();
        return status == AssessmentAttemptStatus.SUBMITTED || status == AssessmentAttemptStatus.TIMED_OUT;
    }

    private static UUID parseUuid(String value) {
        try {
            return UUID.fromString(value.trim());
        } catch (Exception ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
}
