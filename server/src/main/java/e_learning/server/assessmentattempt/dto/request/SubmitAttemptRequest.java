package e_learning.server.assessmentattempt.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SubmitAttemptRequest(@NotBlank String activeSessionId, @NotBlank String requestId) {}
