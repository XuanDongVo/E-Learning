package e_learning.server.vocabulary.review.dto;

import io.github.openspacedrepetition.Rating;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RecordVocabularyReviewRequest(
        @NotNull(message = "Thiếu mã yêu cầu ôn tập") UUID requestId,
        @NotNull(message = "Vui lòng chọn mức độ ghi nhớ") Rating rating
) {}
