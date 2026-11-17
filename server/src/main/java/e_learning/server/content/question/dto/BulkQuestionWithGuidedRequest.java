package e_learning.server.content.question.dto;

import e_learning.server.question.guided.dto.GuidedDefinitionUpsertRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** One local Bulk Composer draft and its optional Guided draft. */
public record BulkQuestionWithGuidedRequest(
        @NotBlank String draftId,
        @NotNull @Valid CreateQuestionRequest question,
        @Valid GuidedDefinitionUpsertRequest guidedDefinition
) {
}
