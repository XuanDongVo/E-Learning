package e_learning.server.vocabulary.teacher.service;

import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.teacher.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional(readOnly = true)
    public List<VocabularyWordResponse> getWordsByUnit(Long unitId, String status, String search) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học (Unit) với ID: " + unitId));

        List<VocabularyWord> words;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            words = vocabularyWordRepository.findByUnitIdAndStatusOrderByDisplayOrderAsc(unit.getId(), status.toUpperCase());
        } else {
            words = vocabularyWordRepository.findByUnitIdOrderByDisplayOrderAsc(unit.getId());
        }

        if (search != null && !search.isBlank()) {
            String lowerSearch = search.trim().toLowerCase();
            words = words.stream()
                    .filter(w -> (w.getWord() != null && w.getWord().toLowerCase().contains(lowerSearch))
                            || (w.getMeaningVi() != null && w.getMeaningVi().toLowerCase().contains(lowerSearch))
                            || (w.getPronunciation() != null && w.getPronunciation().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        return words.stream()
                .map(VocabularyWordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VocabularyWordResponse getWordById(Long wordId) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng với ID: " + wordId));
        return VocabularyWordResponse.fromEntity(word);
    }

    @Transactional
    public VocabularyWordResponse createWord(Long unitId, CreateVocabularyWordRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học (Unit) với ID: " + unitId));

        String cleanWord = request.word().trim();
        if (vocabularyWordRepository.existsByUnitIdAndWordIgnoreCase(unitId, cleanWord)) {
            throw new IllegalArgumentException("Từ vựng '" + cleanWord + "' đã tồn tại trong bài học này");
        }

        int nextOrder = vocabularyWordRepository.findMaxDisplayOrderByUnitId(unitId) + 1;

        VocabularyWord word = VocabularyWord.builder()
                .unit(unit)
                .word(cleanWord)
                .meaningVi(request.meaningVi().trim())
                .pronunciation(request.pronunciation() != null ? request.pronunciation().trim() : null)
                .partOfSpeech(request.partOfSpeech() != null ? request.partOfSpeech().trim() : null)
                .exampleSentence(request.exampleSentence() != null ? request.exampleSentence().trim() : null)
                .exampleMeaningVi(request.exampleMeaningVi() != null ? request.exampleMeaningVi().trim() : null)
                .difficulty(request.difficulty() != null && !request.difficulty().isBlank() ? request.difficulty().toUpperCase() : "EASY")
                .displayOrder(nextOrder)
                .status("ACTIVE")
                .audioUrl(request.audioUrl() != null ? request.audioUrl().trim() : null)
                .imageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null)
                .build();

        VocabularyWord saved = vocabularyWordRepository.save(word);
        log.info("Teacher created vocabulary word '{}' (id: {}) in unit '{}' (id: {})",
                saved.getWord(), saved.getId(), unit.getName(), unit.getId());

        return VocabularyWordResponse.fromEntity(saved);
    }

    @Transactional
    public List<VocabularyWordResponse> bulkCreateWords(Long unitId, BulkCreateVocabularyWordsRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học (Unit) với ID: " + unitId));

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
                .pronunciation(item.pronunciation() != null ? item.pronunciation().trim() : null)
                .partOfSpeech(item.partOfSpeech() != null ? item.partOfSpeech().trim() : null)
                .exampleSentence(item.exampleSentence() != null ? item.exampleSentence().trim() : null)
                .exampleMeaningVi(item.exampleMeaningVi() != null ? item.exampleMeaningVi().trim() : null)
                .difficulty(item.difficulty() != null && !item.difficulty().isBlank() ? item.difficulty().toUpperCase() : "EASY")
                .displayOrder(nextOrder++)
                .status("ACTIVE")
                .audioUrl(item.audioUrl() != null ? item.audioUrl().trim() : null)
                .imageUrl(item.imageUrl() != null ? item.imageUrl().trim() : null)
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
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng với ID: " + wordId));

        String cleanWord = request.word().trim();
        if (vocabularyWordRepository.existsByUnitIdAndWordIgnoreCaseAndIdNot(word.getUnit().getId(), cleanWord, wordId)) {
            throw new IllegalArgumentException("Từ vựng '" + cleanWord + "' đã tồn tại trong bài học này");
        }

        word.setWord(cleanWord);
        word.setMeaningVi(request.meaningVi().trim());
        word.setPronunciation(request.pronunciation() != null ? request.pronunciation().trim() : null);
        word.setPartOfSpeech(request.partOfSpeech() != null ? request.partOfSpeech().trim() : null);
        word.setExampleSentence(request.exampleSentence() != null ? request.exampleSentence().trim() : null);
        word.setExampleMeaningVi(request.exampleMeaningVi() != null ? request.exampleMeaningVi().trim() : null);
        if (request.difficulty() != null && !request.difficulty().isBlank()) {
            word.setDifficulty(request.difficulty().toUpperCase());
        }
        if (request.status() != null && !request.status().isBlank()) {
            word.setStatus(request.status().toUpperCase());
        }
        word.setAudioUrl(request.audioUrl() != null ? request.audioUrl().trim() : null);
        word.setImageUrl(request.imageUrl() != null ? request.imageUrl().trim() : null);

        VocabularyWord updated = vocabularyWordRepository.save(word);
        log.info("Teacher updated vocabulary word '{}' (id: {})", updated.getWord(), updated.getId());

        return VocabularyWordResponse.fromEntity(updated);
    }

    @Transactional
    public VocabularyWordResponse updateWordStatus(Long wordId, String status) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng với ID: " + wordId));

        word.setStatus(status.toUpperCase());
        VocabularyWord updated = vocabularyWordRepository.save(word);
        log.info("Teacher updated status of word '{}' (id: {}) to {}", updated.getWord(), updated.getId(), status);

        return VocabularyWordResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteWord(Long wordId) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng với ID: " + wordId));

        vocabularyWordRepository.delete(word);
        log.info("Teacher deleted vocabulary word '{}' (id: {}) from unit {}",
                word.getWord(), word.getId(), word.getUnit() != null ? word.getUnit().getId() : null);
    }

    @Transactional
    public void reorderWords(Long unitId, ReorderVocabularyRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học (Unit) với ID: " + unitId));

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
}

