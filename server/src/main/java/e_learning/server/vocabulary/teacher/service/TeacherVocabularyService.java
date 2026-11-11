package e_learning.server.vocabulary.teacher.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.common.dto.PageResponse;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyDifficulty;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.review.repository.StudentVocabularyProgressRepository;
import e_learning.server.vocabulary.teacher.dto.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherVocabularyService {

    private final VocabularyWordRepository vocabularyWordRepository;
    private final UnitRepository unitRepository;
    private final VocabularyRelatedTermsNormalizer relatedTermsNormalizer;
    private final StudentVocabularyProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public List<VocabularySearchItemResponse> searchCandidates(Long unitId, String q, int limit) {
        Unit sourceUnit = unitRepository.findById(unitId)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND, "Không tìm thấy Unit: " + unitId));
        String needle = q == null ? "" : q.strip().toLowerCase(java.util.Locale.ROOT);
        if (needle.length() < 2 || needle.length() > 100) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Từ khóa tìm kiếm phải có từ 2 đến 100 ký tự");
        }
        int safeLimit = Math.max(1, Math.min(limit, 20));
        String escaped = needle.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        Specification<VocabularyWord> specification = (root, query, cb) -> {
            var wordLower = cb.lower(root.get("word"));
            query.orderBy(
                    cb.asc(cb.<Integer>selectCase().when(cb.equal(wordLower, needle), 0)
                            .when(cb.like(wordLower, escaped + "%", '\\'), 1).otherwise(2)),
                    cb.asc(wordLower), cb.asc(root.get("id")));
            return cb.and(
                    cb.equal(root.get("unit").get("grade").get("id"), sourceUnit.getGrade().getId()),
                    cb.equal(root.get("status"), VocabularyStatus.ACTIVE),
                    cb.like(wordLower, "%" + escaped + "%", '\\'));
        };
        return vocabularyWordRepository.findAll(specification, PageRequest.of(0, safeLimit))
                .getContent().stream().map(VocabularySearchItemResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<VocabularyWordResponse> getWordsByUnit(Long unitId, String status, String search, int page, int size) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND, "Không tìm thấy bài học (Unit) với ID: " + unitId));

        int safePage = Math.max(0, page - 1);
        int safeSize = size <= 0 ? 10 : size;
        Pageable pageable = PageRequest.of(safePage, safeSize,
                Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.ASC, "id")));

        VocabularyStatus filteredStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                filteredStatus = VocabularyStatus.valueOf(status.trim().toUpperCase(java.util.Locale.ROOT));
            } catch (IllegalArgumentException invalidStatus) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Trạng thái lọc từ vựng không hợp lệ");
            }
        }
        final VocabularyStatus requestedStatus = filteredStatus;

        Specification<VocabularyWord> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("unit").get("id"), unit.getId()));

            if (requestedStatus != null) {
                predicates.add(cb.equal(root.get("status"), requestedStatus));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("word")), pattern),
                        cb.like(cb.lower(root.get("meaningVi")), pattern),
                        cb.like(cb.lower(root.get("pronunciationUk")), pattern),
                        cb.like(cb.lower(root.get("pronunciationUs")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<VocabularyWord> pageResult = vocabularyWordRepository.findAll(spec, pageable);
        List<VocabularyWordResponse> mappedContent = pageResult.getContent().stream()
                .map(VocabularyWordResponse::fromEntity)
                .toList();

        return PageResponse.from(pageResult, mappedContent);
    }

    @Transactional(readOnly = true)
    public VocabularyWordResponse getWordById(Long wordId) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> wordNotFound(wordId));
        return VocabularyWordResponse.fromEntity(word);
    }

    @Transactional
    public VocabularyWordResponse createWord(Long unitId, CreateVocabularyWordRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND, "Không tìm thấy bài học (Unit) với ID: " + unitId));

        String cleanWord = request.word().trim();
        if (vocabularyWordRepository.existsByUnitIdAndWordIgnoreCase(unitId, cleanWord)) {
            throw duplicateWord(cleanWord);
        }

        int nextOrder = vocabularyWordRepository.findMaxDisplayOrderByUnitId(unitId) + 1;

        VocabularyWord word = VocabularyWord.builder()
                .unit(unit)
                .word(cleanWord)
                .meaningVi(request.meaningVi().trim())
                .pronunciationUk(request.pronunciationUk() != null ? request.pronunciationUk().trim() : null)
                .pronunciationUs(request.pronunciationUs() != null ? request.pronunciationUs().trim() : null)
                .partOfSpeech(request.partOfSpeech())
                .exampleSentence(request.exampleSentence() != null ? request.exampleSentence().trim() : null)
                .exampleMeaningVi(request.exampleMeaningVi() != null ? request.exampleMeaningVi().trim() : null)
                .difficulty(request.difficulty() != null ? request.difficulty() : VocabularyDifficulty.EASY)
                .displayOrder(nextOrder)
                .status(VocabularyStatus.ACTIVE)
                .audioUrl(request.audioUrl() != null ? request.audioUrl().trim() : null)
                .imageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null)
                .relatedTerms(relatedTermsNormalizer.normalize(request.relatedTerms()))
                .build();

        VocabularyWord saved = vocabularyWordRepository.save(word);
        log.info("Teacher created vocabulary word '{}' (id: {}) in unit '{}' (id: {})",
                saved.getWord(), saved.getId(), unit.getName(), unit.getId());

        return VocabularyWordResponse.fromEntity(saved);
    }

    @Transactional
    public List<VocabularyWordResponse> bulkCreateWords(Long unitId, BulkCreateVocabularyWordsRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND, "Không tìm thấy bài học (Unit) với ID: " + unitId));

        int nextOrder = vocabularyWordRepository.findMaxDisplayOrderByUnitId(unitId) + 1;
        List<VocabularyWord> toSave = new ArrayList<>();

        for (CreateVocabularyWordRequest item : request.words()) {
            String cleanWord = item.word().trim();
            // If already exists in this unit, skip or ignore duplicate
            if (vocabularyWordRepository.existsByUnitIdAndWordIgnoreCase(unitId, cleanWord)) {
                log.warn("Skipping duplicate word '{}' during bulk import for unit {}", cleanWord, unitId);
                continue;
            }

            VocabularyWord word = VocabularyWord.builder()
                .unit(unit)
                .word(cleanWord)
                .meaningVi(item.meaningVi().trim())
                .pronunciationUk(item.pronunciationUk() != null ? item.pronunciationUk().trim() : null)
                .pronunciationUs(item.pronunciationUs() != null ? item.pronunciationUs().trim() : null)
                .partOfSpeech(item.partOfSpeech())
                .exampleSentence(item.exampleSentence() != null ? item.exampleSentence().trim() : null)
                .exampleMeaningVi(item.exampleMeaningVi() != null ? item.exampleMeaningVi().trim() : null)
                .difficulty(item.difficulty() != null ? item.difficulty() : VocabularyDifficulty.EASY)
                .displayOrder(nextOrder++)
                .status(VocabularyStatus.ACTIVE)
                .audioUrl(item.audioUrl() != null ? item.audioUrl().trim() : null)
                .imageUrl(item.imageUrl() != null ? item.imageUrl().trim() : null)
                .relatedTerms(relatedTermsNormalizer.normalize(item.relatedTerms()))
                .build();

            toSave.add(word);
        }

        List<VocabularyWord> saved = vocabularyWordRepository.saveAll(toSave);
        log.info("Teacher bulk created {} vocabulary words in unit '{}' (id: {})",
                saved.size(), unit.getName(), unit.getId());

        return saved.stream()
                .map(VocabularyWordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VocabularyWordResponse updateWord(Long wordId, UpdateVocabularyWordRequest request) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> wordNotFound(wordId));

        String cleanWord = request.word().trim();
        if (vocabularyWordRepository.existsByUnitIdAndWordIgnoreCaseAndIdNot(word.getUnit().getId(), cleanWord, wordId)) {
            throw duplicateWord(cleanWord);
        }

        word.setWord(cleanWord);
        word.setMeaningVi(request.meaningVi().trim());
        word.setPronunciationUk(request.pronunciationUk() != null ? request.pronunciationUk().trim() : null);
        word.setPronunciationUs(request.pronunciationUs() != null ? request.pronunciationUs().trim() : null);
        word.setPartOfSpeech(request.partOfSpeech());
        word.setExampleSentence(request.exampleSentence() != null ? request.exampleSentence().trim() : null);
        word.setExampleMeaningVi(request.exampleMeaningVi() != null ? request.exampleMeaningVi().trim() : null);
        if (request.difficulty() != null) {
            word.setDifficulty(request.difficulty());
        }
        if (request.status() != null) {
            word.setStatus(request.status());
        }
        word.setAudioUrl(request.audioUrl() != null ? request.audioUrl().trim() : null);
        word.setImageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null);
        // An omitted field from older clients must never erase existing related terms.
        if (request.relatedTerms() != null) {
            word.setRelatedTerms(relatedTermsNormalizer.normalize(request.relatedTerms()));
        }

        VocabularyWord updated = vocabularyWordRepository.save(word);
        log.info("Teacher updated vocabulary word '{}' (id: {})", updated.getWord(), updated.getId());

        return VocabularyWordResponse.fromEntity(updated);
    }

    @Transactional
    public VocabularyWordResponse updateWordStatus(Long wordId, VocabularyStatus status) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> wordNotFound(wordId));

        word.setStatus(status);
        VocabularyWord updated = vocabularyWordRepository.save(word);
        log.info("Teacher updated status of word '{}' (id: {}) to {}", updated.getWord(), updated.getId(), status);

        return VocabularyWordResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteWord(Long wordId) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> wordNotFound(wordId));

        if (progressRepository.existsByWordId(wordId)) {
            throw new AppException(ErrorCode.VOCABULARY_WORD_HAS_PROGRESS,
                    "Từ '" + word.getWord() + "' đã có tiến độ học sinh. Hãy chọn 'Tạm ẩn' để giữ lịch ôn.");
        }

        vocabularyWordRepository.delete(word);
        log.info("Teacher deleted vocabulary word '{}' (id: {}) from unit {}",
                word.getWord(), word.getId(), word.getUnit() != null ? word.getUnit().getId() : null);
    }

    @Transactional
    public void reorderWords(Long unitId, ReorderVocabularyRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND, "Không tìm thấy bài học (Unit) với ID: " + unitId));

        for (ReorderVocabularyRequest.ReorderItem item : request.items()) {
            vocabularyWordRepository.findById(item.id()).ifPresent(word -> {
                if (word.getUnit().getId().equals(unit.getId())) {
                    word.setDisplayOrder(item.displayOrder());
                    vocabularyWordRepository.save(word);
                }
            });
        }
        log.info("Teacher reordered {} words in unit '{}' (id: {})",
                request.items().size(), unit.getName(), unit.getId());
    }

    private AppException wordNotFound(Long wordId) {
        return new AppException(ErrorCode.VOCABULARY_WORD_NOT_FOUND, "Không tìm thấy từ vựng với ID: " + wordId);
    }

    private AppException duplicateWord(String word) {
        return new AppException(ErrorCode.VOCABULARY_WORD_ALREADY_EXISTS,
                "Từ vựng '" + word + "' đã tồn tại trong bài học này");
    }
}

