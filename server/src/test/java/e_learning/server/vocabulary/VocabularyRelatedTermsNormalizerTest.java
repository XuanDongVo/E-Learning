package e_learning.server.vocabulary;

import e_learning.server.common.exception.AppException;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.teacher.dto.RelatedTermDto;
import e_learning.server.vocabulary.teacher.dto.VocabularyRelatedTermsDto;
import e_learning.server.vocabulary.teacher.service.VocabularyRelatedTermsNormalizer;
import e_learning.server.vocabulary.value.VocabularyRelatedTerms;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VocabularyRelatedTermsNormalizerTest {
    private final VocabularyRelatedTermsNormalizer normalizer = new VocabularyRelatedTermsNormalizer();

    @Test
    void missingValueBecomesEmptyLists() {
        assertThat(normalizer.normalize(null)).isEqualTo(VocabularyRelatedTerms.empty());
    }

    @Test
    void trimsAndDeduplicatesWithinEachGroupWithoutCrossGroupCoupling() {
        VocabularyRelatedTerms result = normalizer.normalize(new VocabularyRelatedTermsDto(
                null,
                List.of(
                        new RelatedTermDto("  take   part in  ", "  tham   gia  ", VocabularyPartOfSpeech.VERB),
                        new RelatedTermDto("TAKE PART IN", null, null)),
                List.of(new RelatedTermDto("take part in", null, null))));

        assertThat(result.wordFamilies()).isEmpty();
        assertThat(result.synonyms()).hasSize(1);
        assertThat(result.synonyms().get(0).term()).isEqualTo("take part in");
        assertThat(result.synonyms().get(0).meaningVi()).isEqualTo("tham gia");
        assertThat(result.antonyms()).hasSize(1);
    }

    @Test
    void rejectsBlankTermAndTooManyItems() {
        assertThatThrownBy(() -> normalizer.normalize(new VocabularyRelatedTermsDto(
                List.of(new RelatedTermDto("   ", null, null)), null, null)))
                .isInstanceOf(AppException.class);

        var oversized = new ArrayList<RelatedTermDto>();
        for (int i = 0; i < 21; i++) oversized.add(new RelatedTermDto("term" + i, null, null));
        assertThatThrownBy(() -> normalizer.normalize(new VocabularyRelatedTermsDto(oversized, null, null)))
                .isInstanceOf(AppException.class);
    }

    @Test
    void rejectsNullEntriesAndOverlongMeaning() {
        assertThatThrownBy(() -> normalizer.normalize(new VocabularyRelatedTermsDto(
                null, java.util.Arrays.asList((RelatedTermDto) null), null)))
                .isInstanceOf(AppException.class);
        assertThatThrownBy(() -> normalizer.normalize(new VocabularyRelatedTermsDto(
                null, List.of(new RelatedTermDto("term", "x".repeat(256), null)), null)))
                .isInstanceOf(AppException.class);
    }
}
