package e_learning.server.vocabulary;

import e_learning.server.common.exception.AppException;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.grades.entity.Grade;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.teacher.service.TeacherVocabularyService;
import e_learning.server.vocabulary.teacher.service.VocabularyRelatedTermsNormalizer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherVocabularySearchServiceTest {
    @Mock private VocabularyWordRepository vocabularyWordRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private VocabularyRelatedTermsNormalizer normalizer;
    @InjectMocks private TeacherVocabularyService service;

    @Test
    void searchesWithinSourceGradeAndLimitsResults() {
        Grade grade = mock(Grade.class);
        Unit unit = Unit.builder().id(1L).name("Unit 01").grade(grade).build();
        VocabularyWord word = VocabularyWord.builder().id(42L).unit(unit).word("participate in")
                .meaningVi("tham gia").build();
        when(unitRepository.findById(1L)).thenReturn(Optional.of(unit));
        when(vocabularyWordRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(word)));

        var result = service.searchCandidates(1L, "  PARTiCiPATE  ", 999);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).word()).isEqualTo("participate in");
        assertThat(result.get(0).unitName()).isEqualTo("Unit 01");
        verify(vocabularyWordRepository).findAll(any(Specification.class),
                argThat((Pageable pageable) -> pageable.getPageSize() == 20));
    }

    @Test
    void rejectsQueriesShorterThanTwoCharacters() {
        when(unitRepository.findById(1L)).thenReturn(Optional.of(Unit.builder().id(1L).build()));
        assertThatThrownBy(() -> service.searchCandidates(1L, "a", 10))
                .isInstanceOf(AppException.class);
        verifyNoInteractions(vocabularyWordRepository);
    }
}
