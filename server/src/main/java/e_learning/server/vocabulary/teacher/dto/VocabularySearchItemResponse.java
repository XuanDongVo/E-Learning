package e_learning.server.vocabulary.teacher.dto;

import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;

public record VocabularySearchItemResponse(
        Long id,
        String word,
        String meaningVi,
        VocabularyPartOfSpeech partOfSpeech,
        Long unitId,
        String unitName
) {
    public static VocabularySearchItemResponse fromEntity(VocabularyWord word) {
        return new VocabularySearchItemResponse(word.getId(), word.getWord(), word.getMeaningVi(),
                word.getPartOfSpeech(), word.getUnit().getId(), word.getUnit().getName());
    }
}
