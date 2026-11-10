package e_learning.server.vocabulary.review.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.review.dto.*;
import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import e_learning.server.vocabulary.review.entity.VocabularyReviewLog;
import e_learning.server.vocabulary.review.repository.StudentVocabularyProgressRepository;
import e_learning.server.vocabulary.review.repository.VocabularyReviewLogRepository;
import e_learning.server.vocabulary.teacher.dto.VocabularyRelatedTermsDto;
import io.github.openspacedrepetition.Card;
import io.github.openspacedrepetition.CardAndReviewLog;
import io.github.openspacedrepetition.Scheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Server-authoritative FSRS; game attempts, activities and XP never mutate this ledger. */
@Service
@RequiredArgsConstructor
public class StudentVocabularyReviewService {
    private final UserRepository userRepository;
    private final StudentUnitService studentUnitService;
    private final VocabularyWordRepository wordRepository;
    private final StudentVocabularyProgressRepository progressRepository;
    private final VocabularyReviewLogRepository reviewLogRepository;

    @Transactional(readOnly = true)
    public List<StudentVocabularyCardResponse> listUnitCards(Long studentId, Long unitId) {
        studentUnitService.requireVisibleUnit(studentId, unitId);
        Instant now = Instant.now();
        Map<Long, StudentVocabularyProgress> progressByWord = progressRepository
                .findAllByStudentIdAndWordUnitId(studentId, unitId).stream()
                .collect(Collectors.toMap(progress -> progress.getWord().getId(), Function.identity()));

        return wordRepository.findByUnitIdAndStatusOrderByDisplayOrderAsc(unitId, VocabularyStatus.ACTIVE)
                .stream().map(word -> {
                    StudentVocabularyProgress progress = progressByWord.get(word.getId());
                    return new StudentVocabularyCardResponse(
                            word.getId(), word.getWord(), word.getMeaningVi(),
                            word.getPronunciationUk(), word.getPronunciationUs(), word.getPartOfSpeech(),
                            word.getImageUrl(), word.getExampleSentence(), word.getExampleMeaningVi(),
                            VocabularyRelatedTermsDto.fromValue(word.getRelatedTerms()),
                            progress == null ? "NEW" : Card.fromJson(progress.getCardJson()).getState().name(),
                            progress == null ? null : progress.getDueAt(),
                            progress == null ? 0 : progress.getReviewCount(),
                            progress == null || !progress.getDueAt().isAfter(now));
                }).toList();
    }

    @Transactional
    public VocabularyReviewResultResponse recordReview(Long studentId, Long wordId, RecordVocabularyReviewRequest request) {
        // The row lock also serializes two first reviews (when no progress row exists yet).
        User student = userRepository.findByIdForVocabularyReview(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (student.getRole() != Role.STUDENT) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Return the original result of a retried request, never schedule it twice.
        var prior = reviewLogRepository.findByStudentIdAndRequestId(studentId, request.requestId());
        if (prior.isPresent()) {
            VocabularyReviewLog log = prior.get();
            if (!log.getWord().getId().equals(wordId) || log.getRating() != request.rating()) {
                throw new AppException(ErrorCode.VOCABULARY_REVIEW_REQUEST_CONFLICT);
            }
            return toResult(log);
        }

        VocabularyWord word = wordRepository.findById(wordId)
                .filter(value -> value.getStatus() == VocabularyStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.VOCABULARY_WORD_NOT_FOUND));
        studentUnitService.requireVisibleUnit(studentId, word.getUnit().getId());

        Instant reviewedAt = Instant.now();
        StudentVocabularyProgress progress = progressRepository.findByStudentIdAndWordId(studentId, wordId)
                .orElse(null);
        if (progress != null && progress.getDueAt().isAfter(reviewedAt)) {
            throw new AppException(ErrorCode.VOCABULARY_REVIEW_NOT_DUE,
                    "Từ này chưa đến lịch ôn. Bạn có thể luyện thêm nhưng không ghi lịch FSRS trước hạn.");
        }

        // Never recalculate the FSRS algorithm ourselves; persist the complete library Card JSON.
        Card previousCard = progress == null ? Card.builder().due(reviewedAt).build()
                : Card.fromJson(progress.getCardJson());
        CardAndReviewLog scheduled = Scheduler.builder().build()
                .reviewCard(previousCard, request.rating(), reviewedAt);
        Card nextCard = scheduled.card();
        int count = progress == null ? 1 : progress.getReviewCount() + 1;
        if (progress == null) {
            progress = StudentVocabularyProgress.builder()
                    .student(student).word(word).build();
        }
        progress.setCardJson(nextCard.toJson());
        progress.setDueAt(nextCard.getDue());
        progress.setLastReviewedAt(reviewedAt);
        progress.setReviewCount(count);
        progress = progressRepository.save(progress);

        VocabularyReviewLog log = VocabularyReviewLog.builder()
                .progress(progress).student(student).word(word)
                .requestId(request.requestId()).rating(request.rating())
                .reviewedAt(reviewedAt).dueAt(nextCard.getDue())
                .cardState(nextCard.getState().name()).reviewCount(count)
                .cardJson(nextCard.toJson()).reviewLogJson(scheduled.reviewLog().toJson())
                .build();
        reviewLogRepository.save(log);
        return toResult(log);
    }

    private VocabularyReviewResultResponse toResult(VocabularyReviewLog log) {
        return new VocabularyReviewResultResponse(
                log.getWord().getId(), log.getRequestId(), log.getRating(),
                log.getCardState(), log.getReviewedAt(), log.getDueAt(), log.getReviewCount());
    }
}
