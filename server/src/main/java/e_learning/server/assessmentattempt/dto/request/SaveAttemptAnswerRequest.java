package e_learning.server.assessmentattempt.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Incremental answer write contract. The server owns grading, normalized values and timing.
 */
public record SaveAttemptAnswerRequest(
        @NotNull Long attemptQuestionId,
        @NotNull Map<String, Object> answerPayload,
        @NotNull Long expectedRevision,
        @NotBlank String activeSessionId,
        @NotBlank String requestId
) {
}
