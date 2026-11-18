package e_learning.server.vocabulary.review.dto.response;

import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.review.enums.VocabularyScheduleStatus;

import java.time.Instant;

public record StudentVocabularyLibraryWordResponse(
        // Identity
        Long wordId,

        // Unit information
        Long unitId,
        String unitCode,
        String unitName,

        // Vocabulary
        String word,
        String meaningVi,
        VocabularyPartOfSpeech partOfSpeech,
        String pronunciationUk,
        String pronunciationUs,

        // FSRS progress
        String fsrsState,
        VocabularyScheduleStatus scheduleStatus,

        Instant dueAt,
        Instant lastReviewedAt,
        int reviewCount
) {}