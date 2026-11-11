package e_learning.server.vocabulary;

import e_learning.server.content.unit.entity.Unit;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyDifficulty;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.teacher.dto.VocabularyWordResponse;
import e_learning.server.vocabulary.entity.RelatedTerm;
import e_learning.server.vocabulary.entity.VocabularyRelatedTerms;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class VocabularyWordResponseTest {

    @Test
    void serializesIndependentIpaAndTypedMetadata() {
        VocabularyWord entity = VocabularyWord.builder()
                .id(42L)
                .unit(Unit.builder().id(1L).name("My New School").build())
                .word("schedule")
                .meaningVi("lịch trình")
                .pronunciationUk("/ˈʃedjuːl/")
                .pronunciationUs("/ˈskedʒuːl/")
                .partOfSpeech(VocabularyPartOfSpeech.NOUN)
                .difficulty(VocabularyDifficulty.MEDIUM)
                .status(VocabularyStatus.ACTIVE)
                .relatedTerms(new VocabularyRelatedTerms(
                        List.of(new RelatedTerm("engaging", "hấp dẫn", VocabularyPartOfSpeech.ADJECTIVE)),
                        List.of(new RelatedTerm("participate in", "tham gia", null)),
                        List.of()))
                .build();

        VocabularyWordResponse response = VocabularyWordResponse.fromEntity(entity);

        assertThat(response.pronunciationUk()).isEqualTo("/ˈʃedjuːl/");
        assertThat(response.pronunciationUs()).isEqualTo("/ˈskedʒuːl/");
        assertThat(response.partOfSpeech()).isEqualTo(VocabularyPartOfSpeech.NOUN);
        assertThat(response.difficulty()).isEqualTo(VocabularyDifficulty.MEDIUM);
        assertThat(response.status()).isEqualTo(VocabularyStatus.ACTIVE);
        assertThat(response.relatedTerms().wordFamilies()).hasSize(1);
        assertThat(response.relatedTerms().synonyms().get(0).term()).isEqualTo("participate in");
    }
}
