package e_learning.server.vocabulary.review.dto;

import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.teacher.dto.VocabularyRelatedTermsDto;

import java.time.Instant;

public record StudentVocabularyCardResponse(
        Long wordId,
        String word,
        String meaningVi,
        String pronunciationUk,
        String pronunciationUs,
        VocabularyPartOfSpeech partOfSpeech,
        String imageUrl,
        String exampleSentence,
        String exampleMeaningVi,
        VocabularyRelatedTermsDto relatedTerms,
        String state,
        Instant dueAt,
        int reviewCount,
        boolean due
) {}
