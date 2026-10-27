package e_learning.server.assessmentattempt.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.Map;
import java.util.UUID;

/**
 * Request contract for saving one answer draft.
 *
 * Business validation intentionally does not live in this DTO.
 * TODO: Implement draft-payload validation in the service/Question Engine boundary.
 */
public record SaveAttemptAnswerRequest(
        @NotNull @PositiveOrZero Long expectedRevision,
        @NotNull UUID requestId,
        @NotNull Map<String, Object> answerPayload,
        @NotNull UUID activeSessionId
) {
}
