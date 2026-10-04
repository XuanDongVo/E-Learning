package e_learning.server.content.question.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.question.dto.*;
import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.content.media.entity.Media;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.question.dto.QuestionAnswerResponse;
import e_learning.server.question.dto.QuestionMediaResponse;
import e_learning.server.question.dto.QuestionOptionResponse;
import e_learning.server.question.entity.Question;
import e_learning.server.question.entity.QuestionAnswer;
import e_learning.server.question.entity.QuestionMedia;
import e_learning.server.question.entity.QuestionOption;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionMediaRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.repository.QuestionRepository;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.service.QuestionContentValidator;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final ContentQuestionRepository contentQuestionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionMediaRepository questionMediaRepository;
    private final MediaRepository mediaRepository;
    private final QuestionContentValidator questionContentValidator;

    public PageResponse<QuestionResponse> getQuestions(Long questionBankId, String search, QuestionType type,
                                                       Difficulty difficulty, Boolean isComplete, int page, int size) {
        questionBankRepository.findById(questionBankId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size <= 0 ? 10 : size,
                Sort.by(Sort.Direction.DESC, "questionId"));

        Specification<ContentQuestion> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("questionBank").get("id"), questionBankId));
            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("question").get("content")),
                        "%" + search.trim().toLowerCase() + "%"));
            }
            if (type != null) predicates.add(cb.equal(root.get("question").get("type"), type));
            if (difficulty != null) predicates.add(cb.equal(root.get("question").get("difficulty"), difficulty));
            if (isComplete != null) predicates.add(cb.equal(root.get("question").get("complete"), isComplete));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ContentQuestion> pageResult = contentQuestionRepository.findAll(spec, pageable);
        List<QuestionResponse> responses = pageResult.getContent().stream()
                .map(cq -> mapToResponse(cq.getQuestion(), cq.getQuestionBank().getId()))
                .toList();
        return PageResponse.from(pageResult, responses);
    }

    public QuestionResponse getQuestion(Long id) {
        ContentQuestion contentQuestion = contentQuestionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return mapToResponse(contentQuestion.getQuestion(), contentQuestion.getQuestionBank().getId());
    }

    @Transactional
    public List<QuestionResponse> createQuestion(List<CreateQuestionRequest> requests) {
        if (requests == null || requests.isEmpty()) throw new AppException(ErrorCode.EMPTY_QUESTION);

        return requests.stream().map(request -> {
            QuestionBank bank = questionBankRepository.findById(request.getQuestionBankId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

            boolean complete = questionContentValidator.isComplete(
                    request.getType(), request.getContent(), request.getOptions(), request.getAnswers());

            Question question = Question.builder()
                    .type(request.getType())
                    .difficulty(request.getDifficulty() != null ? request.getDifficulty() : Difficulty.EASY)
                    .content(request.getContent().trim())
                    .explanation(StringUtils.hasText(request.getExplanation()) ? request.getExplanation().trim() : null)
                    .complete(complete)
                    .matchingMode("CASE_INSENSITIVE_TRIM")
                    .build();

            Question saved = questionRepository.save(question);

            ContentQuestion ownership = ContentQuestion.builder()
                    .question(saved)
                    .questionBank(bank)
                    .build();
            contentQuestionRepository.save(ownership);

            saveChildEntities(saved, request.getType(), request.getOptions(), request.getAnswers(), request.getMediaIds());
            return mapToResponse(saved, bank.getId());
        }).toList();
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, UpdateQuestionRequest request) {
        ContentQuestion contentQuestion = contentQuestionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        Question question = contentQuestion.getQuestion();

        question.setType(request.getType());
        question.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : question.getDifficulty());
        question.setContent(request.getContent().trim());
        question.setExplanation(StringUtils.hasText(request.getExplanation()) ? request.getExplanation().trim() : null);
        question.setComplete(questionContentValidator.isComplete(
                request.getType(), request.getContent(), request.getOptions(), request.getAnswers()));

        questionOptionRepository.deleteByQuestionId(id);
        questionAnswerRepository.deleteByQuestionId(id);
        questionMediaRepository.deleteByQuestionId(id);
        saveChildEntities(question, request.getType(), request.getOptions(), request.getAnswers(), request.getMediaIds());

        return mapToResponse(question, contentQuestion.getQuestionBank().getId());
    }

    @Transactional
    public void deleteQuestion(BulkDeleteQuestionsRequest request) {
        Set<Long> ids = new HashSet<>(request.getIds());
        List<ContentQuestion> ownerships = contentQuestionRepository.findAllById(ids);

        if (ownerships.size() != ids.size()) throw new AppException(ErrorCode.QUESTION_NOT_FOUND);

        boolean allInBank = ownerships.stream().allMatch(cq ->
                cq.getQuestionBank().getId().equals(request.getQuestionBankId()));
        if (!allInBank) throw new IllegalArgumentException("All questions must belong to the specified question bank.");

        Set<Long> mediaIds = questionMediaRepository.findMediaIdsByQuestionIdIn(ids);
        questionRepository.deleteAllByIdInBatch(ids);
        releaseUnusedMedia(mediaIds);
    }

    private void saveChildEntities(Question question, QuestionType type,
                                   List<e_learning.server.question.dto.QuestionOptionRequest> options,
                                   List<e_learning.server.question.dto.QuestionAnswerRequest> answers,
                                   List<Long> mediaIds) {
        if ((type == QuestionType.SINGLE_CHOICE || type == QuestionType.MULTIPLE_CHOICE) && options != null) {
            List<QuestionOption> entities = new ArrayList<>();
            for (int i = 0; i < options.size(); i++) {
                var option = options.get(i);
                entities.add(QuestionOption.builder()
                        .question(question).optionKey(String.valueOf((char) ('A' + i)))
                        .content(option.getContent() != null ? option.getContent().trim() : "")
                        .correct(option.isCorrect()).build());
            }
            questionOptionRepository.saveAll(entities);
        }

        if ((type == QuestionType.TRUE_FALSE || type == QuestionType.FILL_IN_BLANK || type == QuestionType.TYPE_ANSWER)
                && answers != null) {
            List<QuestionAnswer> entities = answers.stream()
                    .filter(a -> StringUtils.hasText(a.getRawValue()))
                    .map(a -> {
                        String raw = a.getRawValue().trim();
                        if (type == QuestionType.TRUE_FALSE) raw = "TRUE".equalsIgnoreCase(raw) ? "TRUE" : "FALSE";
                        return QuestionAnswer.builder().question(question).rawValue(raw)
                                .normalizedValue(raw.toLowerCase()).build();
                    }).toList();
            questionAnswerRepository.saveAll(entities);
        }

        if (mediaIds != null) {
            int order = 1;
            for (Long mediaId : mediaIds) {
                Media media = mediaRepository.findById(mediaId).orElse(null);
                if (media == null) continue;
                media.setStatus(MediaStatus.READY);
                mediaRepository.save(media);
                questionMediaRepository.save(QuestionMedia.builder()
                        .question(question).media(media).displayOrder(order++).build());
            }
        }
    }

    private void releaseUnusedMedia(Set<Long> mediaIds) {
        for (Long mediaId : mediaIds) {
            if (questionMediaRepository.existsByMediaId(mediaId)) continue;
            Media media = mediaRepository.findById(mediaId).orElse(null);
            if (media != null && media.getStatus() != MediaStatus.DELETED) {
                media.setStatus(MediaStatus.DELETED);
                mediaRepository.save(media);
            }
        }
    }

    private QuestionResponse mapToResponse(Question question, Long bankId) {
        List<QuestionOptionResponse> options = questionOptionRepository.findByQuestionId(question.getId()).stream()
                .map(o -> QuestionOptionResponse.builder().id(o.getId()).content(o.getContent()).correct(o.isCorrect()).build()).toList();
        List<QuestionAnswerResponse> answers = questionAnswerRepository.findByQuestionId(question.getId()).stream()
                .map(a -> QuestionAnswerResponse.builder().id(a.getId()).rawValue(a.getRawValue()).normalizedValue(a.getNormalizedValue()).build()).toList();
        List<QuestionMediaResponse> media = questionMediaRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId()).stream()
                .map(m -> QuestionMediaResponse.builder().id(m.getId())
                        .mediaId(m.getMedia() != null ? m.getMedia().getId() : null)
                        .mediaType(m.getMedia() != null && m.getMedia().getMediaType() != null ? m.getMedia().getMediaType().name() : null)
                        .url(m.getMedia() != null ? m.getMedia().getPublicId() : null).build()).toList();

        return QuestionResponse.builder()
                .id(question.getId()).questionBankId(bankId)
                .type(question.getType()).difficulty(question.getDifficulty())
                .content(question.getContent()).explanation(question.getExplanation())
                .complete(question.isComplete()).matchingMode(question.getMatchingMode())
                .options(options).answers(answers).media(media)
                .createdAt(question.getCreatedAt()).updatedAt(question.getUpdatedAt()).build();
    }
}