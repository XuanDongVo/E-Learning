package e_learning.server.vocabulary.review.dto;

import io.github.openspacedrepetition.Rating;

import java.time.Instant;
import java.util.UUID;

public record VocabularyReviewResultResponse(
        Long wordId,
        UUID requestId,
        Rating rating,
        String state,
        Instant reviewedAt,
        Instant dueAt,
        int reviewCount
) {}
