package e_learning.server.vocabulary.teacher.dto;

import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyDifficulty;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.enums.VocabularyStatus;

import java.time.LocalDateTime;

public record VocabularyWordResponse(
        Long id,
        Long unitId,
        String unitName,
        String word,
        String meaningVi,
        String pronunciationUk,
        String pronunciationUs,
        VocabularyPartOfSpeech partOfSpeech,
        String exampleSentence,
        String exampleMeaningVi,
        String audioUrl,
        String imageUrl,
        VocabularyDifficulty difficulty,
        Integer displayOrder,
        VocabularyStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static VocabularyWordResponse fromEntity(VocabularyWord entity) {
        return new VocabularyWordResponse(
                entity.getId(),
                entity.getUnit() != null ? entity.getUnit().getId() : null,
                entity.getUnit() != null ? entity.getUnit().getName() : null,
                entity.getWord(),
                entity.getMeaningVi(),
                entity.getPronunciationUk(),
                entity.getPronunciationUs(),
                entity.getPartOfSpeech(),
                entity.getExampleSentence(),
                entity.getExampleMeaningVi(),
                entity.getAudioUrl(),
                entity.getImageUrl(),
                entity.getDifficulty(),
                entity.getDisplayOrder(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

