package e_learning.server.vocabulary.teacher.service;

import e_learning.server.vocabulary.teacher.dto.RelatedTermDto;
import e_learning.server.vocabulary.teacher.dto.VocabularyRelatedTermsDto;
import e_learning.server.vocabulary.value.RelatedTerm;
import e_learning.server.vocabulary.value.VocabularyRelatedTerms;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
public class VocabularyRelatedTermsNormalizer {
    public VocabularyRelatedTerms normalize(VocabularyRelatedTermsDto input) {
        if (input == null) return VocabularyRelatedTerms.empty();
        return new VocabularyRelatedTerms(
                normalizeGroup(input.wordFamilies()),
                normalizeGroup(input.synonyms()),
                normalizeGroup(input.antonyms()));
    }

    private List<RelatedTerm> normalizeGroup(List<RelatedTermDto> input) {
        if (input == null) return List.of();
        if (input.size() > 20) throw new IllegalArgumentException("Mỗi nhóm chỉ được có tối đa 20 từ liên quan");

        Map<String, RelatedTerm> unique = new LinkedHashMap<>();
        for (RelatedTermDto item : input) {
            if (item == null || item.term() == null) throw new IllegalArgumentException("Từ liên quan không được để trống");
            String term = normalizeWhitespace(item.term());
            if (term.isEmpty() || term.length() > 120) {
                throw new IllegalArgumentException("Từ liên quan phải có 1–120 ký tự");
            }
            String meaning = item.meaningVi() == null ? null : normalizeWhitespace(item.meaningVi());
            if (meaning != null && meaning.length() > 255) {
                throw new IllegalArgumentException("Nghĩa của từ liên quan tối đa 255 ký tự");
            }
            String key = term.toLowerCase(Locale.ROOT);
            unique.putIfAbsent(key, new RelatedTerm(term, meaning == null || meaning.isEmpty() ? null : meaning,
                    item.partOfSpeech()));
        }
        return new ArrayList<>(unique.values());
    }

    private String normalizeWhitespace(String input) {
        return input.strip().replaceAll("\\s+", " ");
    }
}
