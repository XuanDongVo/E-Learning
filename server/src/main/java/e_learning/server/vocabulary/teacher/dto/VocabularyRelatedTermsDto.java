package e_learning.server.vocabulary.teacher.dto;

import e_learning.server.vocabulary.entity.VocabularyRelatedTerms;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record VocabularyRelatedTermsDto(
        @Size(max = 20, message = "Tối đa 20 từ cùng họ")
        List<@NotNull @Valid RelatedTermDto> wordFamilies,
        @Size(max = 20, message = "Tối đa 20 từ đồng nghĩa")
        List<@NotNull @Valid RelatedTermDto> synonyms,
        @Size(max = 20, message = "Tối đa 20 từ trái nghĩa")
        List<@NotNull @Valid RelatedTermDto> antonyms
) {
    public static VocabularyRelatedTermsDto fromValue(VocabularyRelatedTerms value) {
        VocabularyRelatedTerms safe = value != null ? value : VocabularyRelatedTerms.empty();
        return new VocabularyRelatedTermsDto(
                safe.wordFamilies() == null ? List.of() : safe.wordFamilies().stream().map(RelatedTermDto::fromValue).toList(),
                safe.synonyms() == null ? List.of() : safe.synonyms().stream().map(RelatedTermDto::fromValue).toList(),
                safe.antonyms() == null ? List.of() : safe.antonyms().stream().map(RelatedTermDto::fromValue).toList());
    }
}
