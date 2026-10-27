package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.SaveAttemptAnswerRequest;
import e_learning.server.assessmentattempt.dto.response.SaveAttemptAnswerResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswer;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Answer autosave implementation scaffold.
 *
 * This class deliberately contains no business logic. Implement the TODOs in order,
 * and add tests before considering the endpoint ready for use.
 */
@Service
@RequiredArgsConstructor
public class AssessmentAttemptAnswerService {
    private final AssessmentAttemptRepository attemptRepository;

    /**
     * 1. Define transaction boundary and load the AssessmentAttempt.
     * 2. Verify student ownership, activeSessionId, attempt state and deadline.
     * 3. Verify attemptQuestionId belongs to the attempt.
     * 4. Calculate canonical payload hash.
     * 5. Resolve/replay idempotency using requestId and payload hash.
     * 6. Load the current AssessmentAttemptAnswer.
     * 7. Compare expectedRevision with the current answer revision.
     * 8. Validate answerPayload against the immutable question snapshot.
     * 9. Persist answer using optimistic locking (@Version).
     * 10. Persist idempotency mutation atomically.
     * 11. Update lastActivityAt.
     * 12. Return SaveAttemptAnswerResponse acknowledgement.
     *
     * Concurrency policy:
     * - No pessimistic lock.
     * - AssessmentAttemptAnswer.revision uses @Version.
     * - activeSessionId rejects stale/inactive sessions.
     * - Race conditions between autosave, submit, timeout and refresh
     *   are intentionally tolerated by the current product scope.
     */
    @Transactional
    public SaveAttemptAnswerResponse saveAnswer(
            Long attemptId,
            Long attemptQuestionId,
            Long studentId,
            SaveAttemptAnswerRequest request
    ) {
        // 1. Load attempt.
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND
                ));

        // 2. Verify ownership.
        verifyStudentOwnership(attempt, studentId);

        // 3. Verify active session.
        verifyActiveSession(attempt, request.activeSessionId());

        // 4. Verify attempt state and deadline.
        validateAnswerSavingAllowed(attempt);

        // 5. Verify question belongs to this attempt.
        AssessmentAttemptQuestion attemptQuestion =
                attemptQuestionRepository
                        .findByIdAndAttemptId(attemptQuestionId, attemptId)
                        .orElseThrow(() -> new AppException(
                                ErrorCode.ASSESSMENT_ATTEMPT_QUESTION_NOT_FOUND
                        ));

        // 6. Calculate canonical payload hash.
        String payloadHash = calculateCanonicalPayloadHash(
                attemptId,
                attemptQuestionId,
                request.answerPayload()
        );

        // 7. Resolve idempotency.
        Optional<AttemptMutation> existing =
                mutationRepository.findByAttemptIdAndRequestId(
                        attemptId,
                        request.requestId()
                );

        if (existing.isPresent()) {
            AttemptMutation mutation = existing.get();

            if (!mutation.getPayloadHash().equals(payloadHash)) {
                throw new AppException(
                        ErrorCode.IDEMPOTENCY_KEY_REUSED
                );
            }

            return responseForOriginalMutation(mutation);
        }

        // 8. Load current answer.
        Optional<AssessmentAttemptAnswer> existingAnswer =
                answerRepository.findByAttemptQuestionId(attemptQuestionId);

        // 9. Validate expected revision.
        validateExpectedRevision(
                existingAnswer,
                request.expectedRevision()
        );

        // 10. Validate payload against immutable snapshot.
        validateAnswerPayload(
                attemptQuestion.getQuestionSnapshot(),
                request.answerPayload()
        );

        // 11. Persist answer.
        AssessmentAttemptAnswer answer;

        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.setAnswerPayload(request.answerPayload());

            // DO NOT manually increment revision.
            //
            // Hibernate @Version will increment it.
        } else {
            answer = new AssessmentAttemptAnswer();
            answer.setAttemptQuestion(attemptQuestion);
            answer.setAnswerPayload(request.answerPayload());

            // Initial version is managed by Hibernate.
        }

        answerRepository.save(answer);

        // Flush if the mutation needs the final generated revision.
        answerRepository.flush();

        // 12. Persist idempotency mutation.
        AttemptMutation mutation = new AttemptMutation();
        mutation.setAttempt(attempt);
        mutation.setRequestId(request.requestId());
        mutation.setPayloadHash(payloadHash);
        mutation.setAttemptQuestionId(attemptQuestionId);
        mutation.setRevision(answer.getRevision());

        mutationRepository.save(mutation);

        // 13. Update activity.
        attempt.setLastActivityAt(LocalDateTime.now());

        // 14. Return acknowledgement.
        return new SaveAttemptAnswerResponse(
                attemptQuestionId,
                answer.getRevision()
        );
    }


    private void verifyStudentOwnership(AssessmentAttempt attempt, Long studentId) {
        boolean ownerShip = attemptRepository.exitsByByAssignmentIdAndUser_Id(attempt.getId(), studentId);
        if (!ownerShip) throw  new AppException(ErrorCode.);

    }

    private void verifyActiveSession(
            AssessmentAttempt attempt,
            UUID activeSessionId
    ) {
        if (attempt.getActiveSessionId() == null
                || !attempt.getActiveSessionId().equals(activeSessionId)) {
            throw new AppException(
                    ErrorCode.ASSESSMENT_ATTEMPT_SESSION_INVALID
            );
        }
    }

    private void validateAnswerSavingAllowed(
            AssessmentAttempt attempt
    ) {
        if (attempt.getStatus() != AssessmentAttemptStatus.IN_PROGRESS) {
            throw new AppException(
                    ErrorCode.ASSESSMENT_ATTEMPT_NOT_ACTIVE
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (attempt.getDeadlineAt() != null
                && now.isAfter(attempt.getDeadlineAt())) {
            throw new AppException(
                    ErrorCode.ASSESSMENT_ATTEMPT_DEADLINE_EXCEEDED
            );
        }
    }
}
