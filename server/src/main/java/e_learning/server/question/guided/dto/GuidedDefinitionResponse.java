package e_learning.server.question.guided.dto;

import e_learning.server.question.guided.GuidedDefinitionStatus;

import java.util.List;

/** Teacher-only authoring projection; never reuse this DTO for Student runtime. */
public record GuidedDefinitionResponse(
        Long questionId,
        int schemaVersion,
        long version,
        GuidedDefinitionStatus status,
        Long sourceQuestionRevision,
        String introContent,
        List<GuidedStepResponse> steps
) {
}
