package e_learning.server.vocabulary.review.dto;

public record StudentVocabularyUnitOverviewResponse(
        Long unitId,
        String code,
        String name,
        String coverUrl,
        int displayOrder,
        long totalCount,
        long newCount,
        long dueCount,
        long learnedCount
) {}
