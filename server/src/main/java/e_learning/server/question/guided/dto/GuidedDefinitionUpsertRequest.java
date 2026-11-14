package e_learning.server.question.guided.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record GuidedDefinitionUpsertRequest(
        @NotNull Long expectedVersion,
        String introContent,
        List<GuidedStepRequest> steps
) {
}
