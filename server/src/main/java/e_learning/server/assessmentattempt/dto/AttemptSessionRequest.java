package e_learning.server.assessmentattempt.dto;

import jakarta.validation.constraints.NotBlank;

public record AttemptSessionRequest(
        @NotBlank String activeSessionId
) {
}
