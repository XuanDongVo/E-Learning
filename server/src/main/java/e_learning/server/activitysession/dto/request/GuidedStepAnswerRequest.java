package e_learning.server.activitysession.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

public record GuidedStepAnswerRequest(@NotBlank String requestId, @NotNull JsonNode answer) {}
