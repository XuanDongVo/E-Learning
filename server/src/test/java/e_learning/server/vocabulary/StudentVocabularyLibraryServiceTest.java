package e_learning.server.vocabulary;

import e_learning.server.common.exception.AppException;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.vocabulary.entity.VocabularyRelatedTerms;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import e_learning.server.vocabulary.review.enums.VocabularyScheduleStatus;
import e_learning.server.vocabulary.review.repository.StudentVocabularyProgressRepository;
import e_learning.server.vocabulary.review.service.StudentVocabularyAccessPolicy;
import e_learning.server.vocabulary.review.service.StudentVocabularyLibraryService;
import io.github.openspacedrepetition.Card;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentVocabularyLibraryServiceTest {

    @Mock private StudentVocabularyProgressRepository progressRepository;
    @Mock private StudentVocabularyAccessPolicy accessPolicy;

    private StudentVocabularyLibraryService service;

    @BeforeEach
    void setUp() {
        service = new StudentVocabularyLibraryService(progressRepository, accessPolicy);
        Specification<StudentVocabularyProgress> accessible =
                (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        when(accessPolicy.accessibleProgress(anyLong())).thenReturn(accessible);
    }

    @Test
    void summaryDerivesWaitingFromTheSameLearnedPopulation() {
        when(progressRepository.count(any(Specification.class))).thenReturn(12L, 5L);

        var result = service.getSummary(7L);

        assertThat(result.learnedCount()).isEqualTo(12L);
        assertThat(result.dueCount()).isEqualTo(5L);
        assertThat(result.waitingCount()).isEqualTo(7L);
        assertThat(result.asOf()).isNotNull();
    }

    @Test
    void dueListUsesOneBasedPaginationAndStableMapping() {
        StudentVocabularyProgress due = progress(10L, Instant.now().minusSeconds(60));
        when(progressRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(due)));

        var result = service.getDue(7L, 1, 500, "  Engage  ");

        assertThat(result.getItems()).hasSize(1);
        var item = result.getItems().getFirst();
        assertThat(item.wordId()).isEqualTo(10L);
        assertThat(item.origin().code()).isEqualTo("U01");
        assertThat(item.scheduleStatus()).isEqualTo(VocabularyScheduleStatus.DUE);

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(progressRepository).findAll(any(Specification.class), pageable.capture());
        assertThat(pageable.getValue().getPageNumber()).isZero();
        assertThat(pageable.getValue().getPageSize()).isEqualTo(100);
        assertThat(pageable.getValue().getSort().getOrderFor("dueAt")).isNotNull();
        assertThat(pageable.getValue().getSort().getOrderFor("word.id")).isNotNull();
    }

    @Test
    void waitingListIsClassifiedFromTheRequestTimestamp() {
        StudentVocabularyProgress waiting = progress(10L, Instant.now().plusSeconds(3600));
        when(progressRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(waiting)));

        var result = service.getWaiting(7L, 1, 20, null);

        assertThat(result.getItems().getFirst().scheduleStatus())
                .isEqualTo(VocabularyScheduleStatus.WAITING);
    }

    @Test
    void reviewQueueReturnsEveryRepositoryRowWithFullFlashcardContent() {
        var first = progress(10L, Instant.now().minusSeconds(120));
        var second = progress(11L, Instant.now().minusSeconds(60));
        when(progressRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(first, second));

        var result = service.getReviewQueue(7L);

        assertThat(result.totalDue()).isEqualTo(2);
        assertThat(result.items()).extracting(card -> card.wordId())
                .containsExactly(10L, 11L);
        assertThat(result.items().getFirst().exampleSentence()).isEqualTo("Please engage.");
        assertThat(result.items().getFirst().due()).isTrue();
        assertThat(result.items().getFirst().canUndoBrowseMark()).isFalse();
        assertThat(result.items().getFirst().needsRelearning()).isFalse();
    }

    @Test
    void rejectsSearchThatExceedsTheContractLimit() {
        assertThatThrownBy(() -> service.getLearned(7L, 1, 20, "x".repeat(101)))
                .isInstanceOf(AppException.class);
    }

    private StudentVocabularyProgress progress(Long wordId, Instant dueAt) {
        VocabularyWord word = VocabularyWord.builder()
                .id(wordId)
                .unit(Unit.builder().id(2L).code("U01").name("School").build())
                .word("engage-" + wordId)
                .meaningVi("tham gia")
                .partOfSpeech(VocabularyPartOfSpeech.VERB)
                .pronunciationUk("/ɪnˈɡeɪdʒ/")
                .pronunciationUs("/ɪnˈɡeɪdʒ/")
                .exampleSentence("Please engage.")
                .exampleMeaningVi("Hãy tham gia.")
                .relatedTerms(VocabularyRelatedTerms.empty())
                .status(VocabularyStatus.ACTIVE)
                .build();
        return StudentVocabularyProgress.builder()
                .word(word)
                .cardJson(Card.builder().due(dueAt).build().toJson())
                .dueAt(dueAt)
                .lastReviewedAt(dueAt.minusSeconds(600))
                .reviewCount(2)
                .needsRelearning(false)
                .build();
    }
}
