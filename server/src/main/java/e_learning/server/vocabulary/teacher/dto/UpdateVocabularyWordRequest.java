package e_learning.server.vocabulary.teacher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateVocabularyWordRequest(
        @NotBlank(message = "Từ vựng tiếng Anh không được để trống")
        @Size(max = 100, message = "Từ vựng tối đa 100 ký tự")
        String word,

        @NotBlank(message = "Nghĩa tiếng Việt không được để trống")
        @Size(max = 255, message = "Nghĩa tiếng Việt tối đa 255 ký tự")
        String meaningVi,

        @Size(max = 100, message = "Phiên âm tối đa 100 ký tự")
        String pronunciation,

        @Size(max = 30, message = "Từ loại tối đa 30 ký tự")
        String partOfSpeech,

        String exampleSentence,
        String exampleMeaningVi,

        @Size(max = 20, message = "Độ khó tối đa 20 ký tự")
        String difficulty,

        String status,
        String audioUrl,
        String imageUrl
) {}

