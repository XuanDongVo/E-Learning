package e_learning.server.question.guided.dto;

import java.util.List;

public record GuidedDefinitionValidationResponse(
        boolean ready,
        List<GuidedDefinitionIssue> issues,
        GuidedDefinitionResponse definition
) {
}
