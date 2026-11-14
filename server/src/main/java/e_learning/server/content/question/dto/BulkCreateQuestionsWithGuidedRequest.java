package e_learning.server.content.question.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/** Atomic Bulk Composer write: all Questions and Guided drafts persist together. */
public record BulkCreateQuestionsWithGuidedRequest(
        @NotEmpty List<@Valid BulkQuestionWithGuidedRequest> questions
) {
}
