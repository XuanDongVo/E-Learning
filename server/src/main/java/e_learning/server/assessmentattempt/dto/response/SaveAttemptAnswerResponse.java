package e_learning.server.assessmentattempt.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Acknowledgement for an answer-save request.
 * Do not include answer payload, correctness, score or grading details here.
 */
public record SaveAttemptAnswerResponse(
        UUID requestId,
        Long attemptQuestionId,
        long revision,
        LocalDateTime savedAt,
        LocalDateTime serverNow
) {
    /**
     * Pure response mapping only. Caller supplies values already determined by the service.
     */
    public static SaveAttemptAnswerResponse map(
            UUID requestId,
            Long attemptQuestionId,
            long revision,
            LocalDateTime savedAt,
            LocalDateTime serverNow
    ) {
        return new SaveAttemptAnswerResponse(
                requestId,
                attemptQuestionId,
                revision,
                savedAt,
                serverNow
        );
    }
}
