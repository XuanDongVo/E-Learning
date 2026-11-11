package e_learning.server.vocabulary.teacher.dto;

import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.entity.RelatedTerm;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RelatedTermDto(
        @NotBlank(message = "Từ liên quan không được để trống")
        @Size(max = 120, message = "Từ liên quan tối đa 120 ký tự")
        String term,
        @Size(max = 255, message = "Nghĩa của từ liên quan tối đa 255 ký tự")
        String meaningVi,
        VocabularyPartOfSpeech partOfSpeech
) {
    public static RelatedTermDto fromValue(RelatedTerm value) {
        return new RelatedTermDto(value.term(), value.meaningVi(), value.partOfSpeech());
    }
}
