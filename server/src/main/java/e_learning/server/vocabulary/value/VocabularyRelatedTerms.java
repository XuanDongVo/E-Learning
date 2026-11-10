package e_learning.server.vocabulary.value;

import java.util.List;

public record VocabularyRelatedTerms(
        List<RelatedTerm> wordFamilies,
        List<RelatedTerm> synonyms,
        List<RelatedTerm> antonyms
) {
    public static VocabularyRelatedTerms empty() {
        return new VocabularyRelatedTerms(List.of(), List.of(), List.of());
    }
}
