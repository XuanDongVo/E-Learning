package e_learning.server.question.guided.dto;

import jakarta.validation.constraints.NotNull;

public record GuidedDefinitionValidateRequest(@NotNull Long expectedVersion) {
}
