package e_learning.server.vocabulary.teacher.dto;

import e_learning.server.vocabulary.enums.VocabularyDifficulty;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.enums.VocabularyStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateVocabularyWordRequest(
        @NotBlank(message = "Từ vựng tiếng Anh không được để trống")
        @Size(max = 100, message = "Từ vựng tối đa 100 ký tự")
        String word,

        @NotBlank(message = "Nghĩa tiếng Việt không được để trống")
        @Size(max = 255, message = "Nghĩa tiếng Việt tối đa 255 ký tự")
        String meaningVi,

        @Size(max = 100, message = "Phiên âm Anh tối đa 100 ký tự")
        String pronunciationUk,

        @Size(max = 100, message = "Phiên âm Mỹ tối đa 100 ký tự")
        String pronunciationUs,

        VocabularyPartOfSpeech partOfSpeech,

        String exampleSentence,
        String exampleMeaningVi,

        VocabularyDifficulty difficulty,

        VocabularyStatus status,
        String audioUrl,
        String imageUrl
) {}

