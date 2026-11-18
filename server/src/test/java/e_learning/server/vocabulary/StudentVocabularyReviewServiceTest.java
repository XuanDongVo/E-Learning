package e_learning.server.vocabulary;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.content.unit.dto.student.StudentUnitSummaryResponse;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.review.dto.RecordVocabularyReviewRequest;
import e_learning.server.vocabulary.review.dto.MarkVocabularyWordRequest;
import e_learning.server.vocabulary.review.entity.VocabularyReviewSource;
import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import e_learning.server.vocabulary.review.entity.VocabularyReviewLog;
import e_learning.server.vocabulary.review.repository.StudentVocabularyProgressRepository;
import e_learning.server.vocabulary.review.repository.VocabularyReviewLogRepository;
import e_learning.server.vocabulary.review.service.StudentVocabularyReviewService;
import io.github.openspacedrepetition.Card;
import io.github.openspacedrepetition.Rating;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentVocabularyReviewServiceTest {
    @Mock private UserRepository users;
    @Mock private StudentUnitService units;
    @Mock private VocabularyWordRepository words;
    @Mock private StudentVocabularyProgressRepository progress;
    @Mock private VocabularyReviewLogRepository logs;
    @InjectMocks private StudentVocabularyReviewService service;

    @Test
    void overviewOnlyAggregatesPublishedUnitsReturnedByStudentUnitService() {
        var visible = new StudentUnitSummaryResponse(2L, "U01", "School", null, null, 1, 1, 1);
        var empty = new StudentUnitSummaryResponse(3L, "U02", "Hobbies", null, null, 2, 1, 1);
        when(units.getMyUnits(7L)).thenReturn(List.of(visible, empty));
        var counts = mock(VocabularyWordRepository.StudentUnitVocabularyCounts.class);
        when(counts.getUnitId()).thenReturn(2L);
        when(counts.getTotalCount()).thenReturn(20L);
        when(counts.getNewCount()).thenReturn(8L);
        when(counts.getDueCount()).thenReturn(3L);
        when(words.countStudentUnitVocabulary(eq(7L), eq(List.of(2L, 3L)), any(Instant.class)))
                .thenReturn(List.of(counts));

        var result = service.listOverview(7L);

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().totalCount()).isEqualTo(20L);
        assertThat(result.getFirst().newCount()).isEqualTo(8L);
        assertThat(result.getFirst().dueCount()).isEqualTo(3L);
        assertThat(result.getFirst().learnedCount()).isEqualTo(12L);
        assertThat(result.get(1).totalCount()).isZero();
        assertThat(result.get(1).dueCount()).isZero();
    }

    @Test
    void emptyPublishedUnitListNeverQueriesWordCounts() {
        when(units.getMyUnits(7L)).thenReturn(List.of());
        assertThat(service.listOverview(7L)).isEmpty();
        verify(words, never()).countStudentUnitVocabulary(any(), any(), any());
    }

    @Test
    void newActiveWordIsAvailableToLearnButNotDueForFsrsReview() {
        when(progress.findAllByStudentIdAndWordUnitId(7L, 2L)).thenReturn(List.of());
        when(words.findByUnitIdAndStatusOrderByDisplayOrderAsc(2L, VocabularyStatus.ACTIVE))
                .thenReturn(List.of(word()));

        var cards = service.listUnitCards(7L, 2L);

        assertThat(cards).hasSize(1);
        assertThat(cards.getFirst().state()).isEqualTo("NEW");
        assertThat(cards.getFirst().due()).isFalse();
        assertThat(cards.getFirst().canUndoBrowseMark()).isFalse();
        assertThat(cards.getFirst().dueAt()).isNull();
        verify(progress, never()).save(any());
    }

    @Test
    void firstReviewSchedulesWithLibraryAndRetryDoesNotScheduleAgain() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.empty());
        when(progress.save(any(StudentVocabularyProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        AtomicReference<VocabularyReviewLog> stored = new AtomicReference<>();
        UUID requestId = UUID.randomUUID();
        when(logs.findByStudentIdAndRequestId(7L, requestId))
                .thenAnswer(invocation -> Optional.ofNullable(stored.get()));
        when(logs.save(any(VocabularyReviewLog.class))).thenAnswer(invocation -> {
            stored.set(invocation.getArgument(0));
            return invocation.getArgument(0);
        });

        var first = service.recordReview(7L, 10L, new RecordVocabularyReviewRequest(requestId, Rating.GOOD));
        var retried = service.recordReview(7L, 10L, new RecordVocabularyReviewRequest(requestId, Rating.GOOD));

        assertThat(first).isEqualTo(retried);
        assertThat(first.dueAt()).isAfter(first.reviewedAt());
        assertThat(first.reviewCount()).isEqualTo(1);
        assertThat(Card.fromJson(stored.get().getCardJson()).getDue()).isEqualTo(first.dueAt());
        verify(progress, times(1)).save(any());
        verify(logs, times(1)).save(any());
    }

    @Test
    void earlyReviewIsBlockedWithoutModifyingTheFsrsSchedule() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));
        Instant futureDue = Instant.now().plusSeconds(3600);
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.of(
                StudentVocabularyProgress.builder().word(word()).student(student)
                        .cardJson(Card.builder().due(futureDue).build().toJson())
                        .dueAt(futureDue).reviewCount(1).build()));

        assertThatThrownBy(() -> service.recordReview(7L, 10L,
                new RecordVocabularyReviewRequest(UUID.randomUUID(), Rating.AGAIN)))
                .isInstanceOfSatisfying(AppException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.VOCABULARY_REVIEW_NOT_DUE));
        verify(progress, never()).save(any());
        verify(logs, never()).save(any());
    }

    @Test
    void browseMarkCreatesFirstHardRatingDueAfterSixHours() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.empty());
        when(progress.save(any(StudentVocabularyProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AtomicReference<VocabularyReviewLog> stored = new AtomicReference<>();
        when(logs.save(any(VocabularyReviewLog.class))).thenAnswer(invocation -> {
            stored.set(invocation.getArgument(0));
            return invocation.getArgument(0);
        });
        var result = service.markKnown(7L, 10L, new MarkVocabularyWordRequest(UUID.randomUUID()));
        assertThat(result.rating()).isEqualTo(Rating.HARD);
        assertThat(result.dueAt()).isEqualTo(result.reviewedAt().plusSeconds(6 * 3600));
        assertThat(result.reviewCount()).isEqualTo(1);
        assertThat(stored.get().getSource()).isEqualTo(VocabularyReviewSource.BROWSE_MARK);
    }

    @Test
    void browseMarkCanBeUndoneBeforeAnyFurtherReview() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));
        StudentVocabularyProgress card = StudentVocabularyProgress.builder()
                .id(11L).student(student).word(word()).reviewCount(1).build();
        VocabularyReviewLog log = VocabularyReviewLog.builder()
                .id(12L).student(student).word(word()).progress(card)
                .source(VocabularyReviewSource.BROWSE_MARK).rating(Rating.HARD).build();
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.of(card));
        when(logs.findAllByStudentIdAndWordId(7L, 10L)).thenReturn(List.of(log));
        service.unmarkKnown(7L, 10L);
        var inOrder = inOrder(logs, progress);
        inOrder.verify(logs).delete(log);
        inOrder.verify(logs).flush();
        inOrder.verify(progress).delete(card);
    }

    @Test
    void cannotUndoBrowseMarkAfterAnotherReview() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));
        StudentVocabularyProgress card = StudentVocabularyProgress.builder()
                .student(student).word(word()).reviewCount(2).build();
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.of(card));
        assertThatThrownBy(() -> service.unmarkKnown(7L, 10L))
                .isInstanceOfSatisfying(AppException.class,
                        e -> assertThat(e.getErrorCode()).isEqualTo(ErrorCode.VOCABULARY_MARK_NOT_REVERSIBLE));
        verify(logs, never()).delete(any());
    }

    @Test
    void cannotUndoFirstReviewCreatedInLearnInsteadOfBrowse() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));
        StudentVocabularyProgress card = StudentVocabularyProgress.builder()
                .id(11L).student(student).word(word()).reviewCount(1).build();
        VocabularyReviewLog log = VocabularyReviewLog.builder().progress(card)
                .source(VocabularyReviewSource.STUDY).build();
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.of(card));
        when(logs.findAllByStudentIdAndWordId(7L, 10L)).thenReturn(List.of(log));
        assertThatThrownBy(() -> service.unmarkKnown(7L, 10L))
                .isInstanceOfSatisfying(AppException.class,
                        e -> assertThat(e.getErrorCode()).isEqualTo(ErrorCode.VOCABULARY_MARK_NOT_REVERSIBLE));
        verify(logs, never()).delete(any());
    }

    @Test
    void againResetsProgressButPreservesReviewHistory() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));

        Instant lastDue = Instant.now().minusSeconds(3600);
        Card previous = io.github.openspacedrepetition.Scheduler.builder()
                .learningSteps(new java.time.Duration[] {}).build()
                .reviewCard(Card.builder().due(lastDue.minusSeconds(86400)).build(),
                        Rating.GOOD, lastDue.minusSeconds(86400)).card();
        previous.setDue(lastDue);
        StudentVocabularyProgress existing = StudentVocabularyProgress.builder()
                .id(11L).student(student).word(word()).cardJson(previous.toJson())
                .dueAt(lastDue).reviewCount(4).needsRelearning(false).build();
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.of(existing));
        when(progress.save(any(StudentVocabularyProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AtomicReference<VocabularyReviewLog> saved = new AtomicReference<>();
        when(logs.save(any(VocabularyReviewLog.class))).thenAnswer(invocation -> {
            saved.set(invocation.getArgument(0));
            return invocation.getArgument(0);
        });

        var result = service.recordReview(7L, 10L,
                new RecordVocabularyReviewRequest(UUID.randomUUID(), Rating.AGAIN));

        assertThat(existing.isNeedsRelearning()).isTrue();
        assertThat(existing.getDueAt()).isEqualTo(result.reviewedAt());
        assertThat(existing.getReviewCount()).isEqualTo(5);
        assertThat(saved.get().getRating()).isEqualTo(Rating.AGAIN);
        assertThat(saved.get().getReviewCount()).isEqualTo(5);
        verify(logs).save(any(VocabularyReviewLog.class));
    }

    @Test
    void newLearningAfterAgainRestartsInitialIntervalsAndKeepsLogCount() {
        User student = mock(User.class);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(users.findByIdForVocabularyReview(7L)).thenReturn(Optional.of(student));
        when(words.findById(10L)).thenReturn(Optional.of(word()));

        Instant lastReview = Instant.now().minusSeconds(600);
        StudentVocabularyProgress existing = StudentVocabularyProgress.builder()
                .id(11L).student(student).word(word())
                .cardJson(Card.builder().due(lastReview).build().toJson())
                .dueAt(lastReview).reviewCount(5).needsRelearning(true).build();
        when(progress.findByStudentIdAndWordId(7L, 10L)).thenReturn(Optional.of(existing));
        when(progress.save(any(StudentVocabularyProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(logs.save(any(VocabularyReviewLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.recordReview(7L, 10L,
                new RecordVocabularyReviewRequest(UUID.randomUUID(), Rating.GOOD));

        assertThat(result.dueAt()).isEqualTo(result.reviewedAt().plusSeconds(12 * 3600));
        assertThat(existing.isNeedsRelearning()).isFalse();
        assertThat(existing.getReviewCount()).isEqualTo(6);
        assertThat(Card.fromJson(existing.getCardJson()).getDue()).isEqualTo(result.dueAt());
    }

    private VocabularyWord word() {
        return VocabularyWord.builder().id(10L).unit(Unit.builder().id(2L).build())
                .word("engage").meaningVi("tham gia").status(VocabularyStatus.ACTIVE).build();
    }
}
