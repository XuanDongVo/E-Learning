package e_learning.server.vocabulary.review.dto;

import io.github.openspacedrepetition.Rating;
import java.time.Instant;
import java.util.Map;

/** Non-mutating schedule preview for the four review actions. */
public record VocabularyReviewPreviewResponse(Long wordId, Map<Rating, Instant> dueAtByRating) {}
