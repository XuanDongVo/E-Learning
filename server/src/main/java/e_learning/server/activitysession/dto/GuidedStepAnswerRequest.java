package e_learning.server.activitysession.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

public record GuidedStepAnswerRequest(@NotBlank String requestId, @NotNull JsonNode answer) {}
