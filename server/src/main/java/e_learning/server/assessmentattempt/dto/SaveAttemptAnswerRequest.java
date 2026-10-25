package e_learning.server.assessmentattempt.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Client answer input only. Scores, normalized values, status and timing are server-owned.
 */
public record SaveAttemptAnswerRequest(
        @NotNull Map<String, Object> answerPayload
) {
}
