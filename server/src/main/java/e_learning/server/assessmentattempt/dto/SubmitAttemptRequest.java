package e_learning.server.assessmentattempt.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitAttemptRequest(@NotBlank String activeSessionId, @NotBlank String requestId) {}
