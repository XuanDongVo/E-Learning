package e_learning.server.vocabulary;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.teacher.dto.VocabularyWordResponse;
import e_learning.server.vocabulary.teacher.service.TeacherVocabularyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherVocabularyServicePaginationTest {

    @Mock
    private VocabularyWordRepository vocabularyWordRepository;

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private TeacherVocabularyService service;

    private Unit testUnit;
    private List<VocabularyWord> testWords;

    @BeforeEach
    void setUp() {
        testUnit = Unit.builder()
                .id(1L)
                .name("Unit 1: Hobbies")
                .code("U1")
                .build();

        VocabularyWord word1 = VocabularyWord.builder()
                .id(101L)
                .unit(testUnit)
                .word("hobby")
                .meaningVi("sở thích")
                .difficulty("EASY")
                .displayOrder(1)
                .status("ACTIVE")
                .build();

        VocabularyWord word2 = VocabularyWord.builder()
                .id(102L)
                .unit(testUnit)
                .word("collect")
                .meaningVi("sưu tầm")
                .difficulty("EASY")
                .displayOrder(2)
                .status("ACTIVE")
                .build();

        testWords = List.of(word1, word2);
    }

    @Test
    void getWordsByUnit_returnsPaginatedResponse() {
        when(unitRepository.findById(1L)).thenReturn(Optional.of(testUnit));

        Page<VocabularyWord> wordPage = new PageImpl<>(testWords, Pageable.ofSize(10), 20);
        when(vocabularyWordRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(wordPage);

        PageResponse<VocabularyWordResponse> response = service.getWordsByUnit(1L, "ACTIVE", "hobby", 1, 10);

        assertThat(response).isNotNull();
        assertThat(response.getPage()).isEqualTo(1);
        assertThat(response.getSize()).isEqualTo(10);
        assertThat(response.getTotalElements()).isEqualTo(20);
        assertThat(response.getTotalPages()).isEqualTo(2);
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getItems().get(0).word()).isEqualTo("hobby");
        assertThat(response.getItems().get(1).word()).isEqualTo("collect");

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(vocabularyWordRepository).findAll(any(Specification.class), pageableCaptor.capture());

        Pageable capturedPageable = pageableCaptor.getValue();
        assertThat(capturedPageable.getPageNumber()).isEqualTo(0);
        assertThat(capturedPageable.getPageSize()).isEqualTo(10);
    }

    @Test
    void getWordsByUnit_handlesSecondPageAndDefaultPageSize() {
        when(unitRepository.findById(1L)).thenReturn(Optional.of(testUnit));

        Page<VocabularyWord> emptySecondPage = new PageImpl<>(List.of(), Pageable.ofSize(10).withPage(1), 2);
        when(vocabularyWordRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptySecondPage);

        PageResponse<VocabularyWordResponse> response = service.getWordsByUnit(1L, "ALL", null, 2, 0);

        assertThat(response.getPage()).isEqualTo(2);
        assertThat(response.getSize()).isEqualTo(10); // default to 10 when size <= 0
        assertThat(response.getItems()).isEmpty();

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(vocabularyWordRepository).findAll(any(Specification.class), pageableCaptor.capture());

        Pageable captured = pageableCaptor.getValue();
        assertThat(captured.getPageNumber()).isEqualTo(1); // 0-indexed page for page 2
        assertThat(captured.getPageSize()).isEqualTo(10);
    }
}

