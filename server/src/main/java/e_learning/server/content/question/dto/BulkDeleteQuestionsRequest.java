
package e_learning.server.content.question.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BulkDeleteQuestionsRequest(
        @NotNull(message = "Question bank ID is required")
        Long questionBankId,

        @NotEmpty(message = "At least one question ID is required")
        @Size(max = 100, message = "Cannot delete more than 100 questions at once")
        List<@NotNull Long> ids
) {
}
