package e_learning.server.vocabulary;

import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.teacher.dto.RelatedTermDto;
import e_learning.server.vocabulary.teacher.dto.UpdateVocabularyWordRequest;
import e_learning.server.vocabulary.teacher.dto.VocabularyRelatedTermsDto;
import e_learning.server.vocabulary.teacher.service.TeacherVocabularyService;
import e_learning.server.vocabulary.teacher.service.VocabularyRelatedTermsNormalizer;
import e_learning.server.vocabulary.value.RelatedTerm;
import e_learning.server.vocabulary.value.VocabularyRelatedTerms;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherVocabularyRelatedTermsServiceTest {
    @Mock private VocabularyWordRepository words;
    @Mock private UnitRepository units;
    @Spy private VocabularyRelatedTermsNormalizer normalizer = new VocabularyRelatedTermsNormalizer();
    @InjectMocks private TeacherVocabularyService service;

    @Test
    void omittedRelatedTermsPreservesExistingDataForOlderClients() {
        VocabularyRelatedTerms existing = new VocabularyRelatedTerms(List.of(),
                List.of(new RelatedTerm("participate in", "tham gia", null)), List.of());
        VocabularyWord word = wordWithRelatedTerms(existing);
        when(words.findById(5L)).thenReturn(Optional.of(word));
        when(words.save(any(VocabularyWord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.updateWord(5L, updateRequest(null));

        assertThat(word.getRelatedTerms()).isSameAs(existing);
    }

    @Test
    void explicitEmptyGroupsClearRelatedTerms() {
        VocabularyWord word = wordWithRelatedTerms(new VocabularyRelatedTerms(List.of(),
                List.of(new RelatedTerm("participate in", null, null)), List.of()));
        when(words.findById(5L)).thenReturn(Optional.of(word));
        when(words.save(any(VocabularyWord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.updateWord(5L, updateRequest(new VocabularyRelatedTermsDto(List.of(), List.of(), List.of())));

        assertThat(word.getRelatedTerms()).isEqualTo(VocabularyRelatedTerms.empty());
    }

    @Test
    void newRelatedTermStaysInlineInsteadOfCreatingVocabularyWord() {
        VocabularyWord word = wordWithRelatedTerms(VocabularyRelatedTerms.empty());
        when(words.findById(5L)).thenReturn(Optional.of(word));
        when(words.save(any(VocabularyWord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.updateWord(5L, updateRequest(new VocabularyRelatedTermsDto(null,
                List.of(new RelatedTermDto("take part in", "tham gia", null)), null)));

        assertThat(word.getRelatedTerms().synonyms()).hasSize(1);
        assertThat(word.getRelatedTerms().synonyms().get(0).term()).isEqualTo("take part in");
    }

    private VocabularyWord wordWithRelatedTerms(VocabularyRelatedTerms related) {
        return VocabularyWord.builder().id(5L).unit(Unit.builder().id(1L).name("Unit 01").build())
                .word("engage").meaningVi("tham gia").relatedTerms(related).build();
    }

    private UpdateVocabularyWordRequest updateRequest(VocabularyRelatedTermsDto relatedTerms) {
        return new UpdateVocabularyWordRequest("engage", "tham gia", null, null, null,
                null, null, null, null, null, null, relatedTerms);
    }
}
