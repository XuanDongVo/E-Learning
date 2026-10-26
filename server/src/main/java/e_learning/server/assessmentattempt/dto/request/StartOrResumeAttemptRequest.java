package e_learning.server.assessmentattempt.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * The client generates and persists this credential before the first request.
 * It is not echoed from the generic runtime response.
 */
public record StartOrResumeAttemptRequest(@NotNull UUID activeSessionId) {
}
