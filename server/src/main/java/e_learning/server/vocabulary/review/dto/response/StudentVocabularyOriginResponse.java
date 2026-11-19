package e_learning.server.vocabulary.review.dto.response;

import e_learning.server.vocabulary.review.enums.VocabularyOriginType;

/** Display metadata only; FSRS ownership remains Student plus VocabularyWord. */
public record StudentVocabularyOriginResponse(
        VocabularyOriginType type,
        Long id,
        String code,
        String name
) {}
