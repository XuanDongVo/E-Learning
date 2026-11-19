package e_learning.server.vocabulary.review.dto.response;

import java.time.Instant;

public record StudentVocabularyLibrarySummaryResponse(
        long learnedCount,
        long dueCount,
        long waitingCount,
        Instant asOf
) {}
