package e_learning.server.activitysession.dto;

import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

public record ActivitySessionAnswerRequest(String requestId, @NotNull JsonNode answer) {}
