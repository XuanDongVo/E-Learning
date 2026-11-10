package e_learning.server.vocabulary;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.review.dto.RecordVocabularyReviewRequest;
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
    void newActiveWordIsImmediatelyDueWithoutPersistingAProgressRow() {
        when(progress.findAllByStudentIdAndWordUnitId(7L, 2L)).thenReturn(List.of());
        when(words.findByUnitIdAndStatusOrderByDisplayOrderAsc(2L, VocabularyStatus.ACTIVE))
                .thenReturn(List.of(word()));

        var cards = service.listUnitCards(7L, 2L);

        assertThat(cards).hasSize(1);
        assertThat(cards.getFirst().state()).isEqualTo("NEW");
        assertThat(cards.getFirst().due()).isTrue();
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

    private VocabularyWord word() {
        return VocabularyWord.builder().id(10L).unit(Unit.builder().id(2L).build())
                .word("engage").meaningVi("tham gia").status(VocabularyStatus.ACTIVE).build();
    }
}
