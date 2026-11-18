package e_learning.server.vocabulary.review.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MarkVocabularyWordRequest(
        @NotNull(message = "Thiếu mã yêu cầu đánh dấu") UUID requestId
) {}
