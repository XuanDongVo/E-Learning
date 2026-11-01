package e_learning.server.assessmentattempt.dto.request;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptEventType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Client soft signal while an official attempt is in progress.
 * SESSION_TAKEOVER is not accepted from students (ADR 0027).
 */
public record AttemptEventRequest(
        @NotNull AssessmentAttemptEventType eventType,
        @NotNull UUID activeSessionId
) {
}
