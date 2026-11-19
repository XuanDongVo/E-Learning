package e_learning.server.vocabulary.review.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyCardResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyLibrarySummaryResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyLibraryWordResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyOriginResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyReviewQueueResponse;
import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import e_learning.server.vocabulary.review.enums.VocabularyScheduleStatus;
import e_learning.server.vocabulary.review.enums.VocabularyOriginType;
import e_learning.server.vocabulary.review.repository.StudentVocabularyProgressRepository;
import e_learning.server.vocabulary.teacher.dto.VocabularyRelatedTermsDto;
import io.github.openspacedrepetition.Card;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class StudentVocabularyLibraryService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_SEARCH_LENGTH = 100;

    private final StudentVocabularyProgressRepository progressRepository;
    private final StudentVocabularyAccessPolicy accessPolicy;

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public StudentVocabularyLibrarySummaryResponse getSummary(long userId) {
        Instant asOf = Instant.now();
        Specification<StudentVocabularyProgress> learned = learned(userId);
        long learnedCount = progressRepository.count(learned);
        long dueCount = progressRepository.count(learned.and(dueAtOrBefore(asOf)));
        return new StudentVocabularyLibrarySummaryResponse(
                learnedCount,
                dueCount,
                learnedCount - dueCount,
                asOf
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentVocabularyLibraryWordResponse> getLearned(
            long userId, int page, int size, String search) {
        Instant asOf = Instant.now();
        return getPage(learned(userId).and(search(search)), page, size, asOf);
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentVocabularyLibraryWordResponse> getDue(
            long userId, int page, int size, String search) {
        Instant asOf = Instant.now();
        return getPage(learned(userId).and(dueAtOrBefore(asOf)).and(search(search)), page, size, asOf);
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentVocabularyLibraryWordResponse> getWaiting(
            long userId, int page, int size, String search) {
        Instant asOf = Instant.now();
        return getPage(learned(userId).and(dueAfter(asOf)).and(search(search)), page, size, asOf);
    }

    @Transactional(readOnly = true)
    public StudentVocabularyReviewQueueResponse getReviewQueue(long userId) {
        Instant asOf = Instant.now();
        var rows = progressRepository.findAll(
                learned(userId).and(dueAtOrBefore(asOf)),
                stableDueSort()
        );
        List<StudentVocabularyCardResponse> items = rows.stream()
                .map(this::toReviewCard)
                .toList();
        return new StudentVocabularyReviewQueueResponse(asOf, items.size(), items);
    }

    private PageResponse<StudentVocabularyLibraryWordResponse> getPage(
            Specification<StudentVocabularyProgress> specification,
            int page,
            int size,
            Instant asOf) {
        int safePage = Math.max(1, page);
        int safeSize = size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        var result = progressRepository.findAll(
                specification,
                PageRequest.of(safePage - 1, safeSize, stableDueSort())
        );
        var mapped = result.getContent().stream()
                .map(progress -> toLibraryWord(progress, asOf))
                .toList();
        return PageResponse.from(result, mapped);
    }

    private Specification<StudentVocabularyProgress> learned(long userId) {
        return accessPolicy.accessibleProgress(userId)
                .and((root, query, criteriaBuilder) ->
                        criteriaBuilder.isFalse(root.get("needsRelearning")));
    }

    private Specification<StudentVocabularyProgress> dueAtOrBefore(Instant asOf) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("dueAt"), asOf);
    }

    private Specification<StudentVocabularyProgress> dueAfter(Instant asOf) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThan(root.get("dueAt"), asOf);
    }

    private Specification<StudentVocabularyProgress> search(String value) {
        String normalized = value == null ? "" : value.strip().toLowerCase(Locale.ROOT);
        if (normalized.length() > MAX_SEARCH_LENGTH) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "Từ khóa tìm kiếm không được vượt quá 100 ký tự");
        }
        if (normalized.isEmpty()) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }
        String escaped = normalized
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        String pattern = "%" + escaped + "%";
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("word").get("word")), pattern, '\\'),
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("word").get("meaningVi")), pattern, '\\')
        );
    }

    private Sort stableDueSort() {
        return Sort.by(Sort.Direction.ASC, "dueAt")
                .and(Sort.by(Sort.Direction.ASC, "word.id"));
    }

    private StudentVocabularyLibraryWordResponse toLibraryWord(
            StudentVocabularyProgress progress,
            Instant asOf) {
        VocabularyWord word = progress.getWord();
        var unit = word.getUnit();
        return new StudentVocabularyLibraryWordResponse(
                word.getId(),
                new StudentVocabularyOriginResponse(
                        VocabularyOriginType.UNIT,
                        unit.getId(),
                        unit.getCode(),
                        unit.getName()
                ),
                word.getWord(),
                word.getMeaningVi(),
                word.getPartOfSpeech(),
                word.getPronunciationUk(),
                word.getPronunciationUs(),
                Card.fromJson(progress.getCardJson()).getState().name(),
                progress.getDueAt().isAfter(asOf)
                        ? VocabularyScheduleStatus.WAITING
                        : VocabularyScheduleStatus.DUE,
                progress.getDueAt(),
                progress.getLastReviewedAt(),
                progress.getReviewCount()
        );
    }

    private StudentVocabularyCardResponse toReviewCard(StudentVocabularyProgress progress) {
        VocabularyWord word = progress.getWord();
        return new StudentVocabularyCardResponse(
                word.getId(),
                word.getWord(),
                word.getMeaningVi(),
                word.getPronunciationUk(),
                word.getPronunciationUs(),
                word.getPartOfSpeech(),
                word.getImageUrl(),
                word.getExampleSentence(),
                word.getExampleMeaningVi(),
                VocabularyRelatedTermsDto.fromValue(word.getRelatedTerms()),
                Card.fromJson(progress.getCardJson()).getState().name(),
                progress.getDueAt(),
                progress.getReviewCount(),
                true,
                false,
                false
        );
    }
}
