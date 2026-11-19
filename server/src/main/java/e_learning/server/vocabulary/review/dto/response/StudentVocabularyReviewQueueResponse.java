package e_learning.server.vocabulary.review.dto.response;

import java.time.Instant;
import java.util.List;

public record StudentVocabularyReviewQueueResponse(
        Instant asOf,
        int totalDue,
        List<StudentVocabularyCardResponse> items
) {}
