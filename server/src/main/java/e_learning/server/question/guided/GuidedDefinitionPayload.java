package e_learning.server.question.guided;

import java.util.List;

public record GuidedDefinitionPayload(String introContent, List<GuidedStepPayload> steps) {
    public GuidedDefinitionPayload {
        steps = List.copyOf(steps == null ? List.of() : steps);
    }
}
