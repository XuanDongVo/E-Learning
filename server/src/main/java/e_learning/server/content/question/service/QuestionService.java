package e_learning.server.content.question.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import e_learning.server.content.media.entity.Media;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.content.question.dto.*;
import e_learning.server.content.question.entity.Question;
import e_learning.server.content.question.entity.QuestionAnswer;
import e_learning.server.content.question.entity.QuestionMedia;
import e_learning.server.content.question.entity.QuestionOption;
import e_learning.server.content.question.repository.QuestionAnswerRepository;
import e_learning.server.content.question.repository.QuestionMediaRepository;
import e_learning.server.content.question.repository.QuestionOptionRepository;
import e_learning.server.content.question.repository.QuestionRepository;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionMediaRepository questionMediaRepository;
    private final MediaRepository mediaRepository;

    public PageResponse<QuestionResponse> getQuestions(
            Long questionBankId,
            String search,
            QuestionType type,
            Difficulty difficulty,
            Boolean isComplete,
            int page,
            int size
    ) {
        questionBankRepository.findById(questionBankId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        int pageNum = Math.max(0, page - 1);
        int pageSize = size <= 0 ? 10 : size;

        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("questionBank").get("id"), questionBankId));

            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("content")), "%" + search.trim().toLowerCase() + "%"));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            if (isComplete != null) {
                predicates.add(cb.equal(root.get("complete"), isComplete));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Question> questionPage = questionRepository.findAll(spec, pageable);

        List<QuestionResponse> responses = questionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.from(questionPage, responses);
    }

    public QuestionResponse getQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return mapToResponse(question);
    }

    @Transactional
    public List<QuestionResponse> createQuestion(List<CreateQuestionRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_QUESTION);
        }

        return requests.stream()
                .map(request -> {
                    QuestionBank bank = questionBankRepository
                            .findById(request.getQuestionBankId())
                            .orElseThrow(() ->
                                    new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

                    boolean isComplete = computeIsComplete(request.getType(), request.getContent(), request.getOptions(), request.getAnswers());

                    Difficulty difficulty = request.getDifficulty() != null
                            ? request.getDifficulty()
                            : Difficulty.EASY;

                    Question question = Question.builder()
                            .questionBank(bank)
                            .type(request.getType())
                            .difficulty(difficulty)
                            .content(request.getContent().trim())
                            .explanation(
                                    StringUtils.hasText(request.getExplanation())
                                            ? request.getExplanation().trim()
                                            : null
                            )
                            .complete(isComplete)
                            .matchingMode("CASE_INSENSITIVE_TRIM")
                            .build();

                    Question saved = questionRepository.save(question);

                    saveChildEntities(saved, request.getType(), request.getOptions(), request.getAnswers(), request.getMediaIds());

                    return mapToResponse(saved);
                })
                .toList();
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        boolean isComplete = computeIsComplete(
                request.getType(), request.getContent(), request.getOptions(), request.getAnswers()
        );

        Difficulty difficulty = request.getDifficulty() != null ? request.getDifficulty() : question.getDifficulty();

        question.setType(request.getType());
        question.setDifficulty(difficulty);
        question.setContent(request.getContent().trim());
        question.setExplanation(StringUtils.hasText(request.getExplanation()) ? request.getExplanation().trim() : null);
        question.setComplete(isComplete);

        Question saved = questionRepository.save(question);

        // Delete previous options, answers, media links to handle type changes cleanly
        questionOptionRepository.deleteByQuestionId(saved.getId());
        questionAnswerRepository.deleteByQuestionId(saved.getId());
        questionMediaRepository.deleteByQuestionId(saved.getId());

        saveChildEntities(saved, request.getType(), request.getOptions(), request.getAnswers(), request.getMediaIds());

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        questionOptionRepository.deleteByQuestionId(id);
        questionAnswerRepository.deleteByQuestionId(id);
        questionMediaRepository.deleteByQuestionId(id);
        questionRepository.delete(question);
    }

    private void saveChildEntities(
            Question question,
            QuestionType type,
            List<QuestionOptionRequest> options,
            List<QuestionAnswerRequest> answers,
            List<Long> mediaIds
    ) {
        // Options for SINGLE_CHOICE and MULTIPLE_CHOICE
        if ((type == QuestionType.SINGLE_CHOICE || type == QuestionType.MULTIPLE_CHOICE) && options != null) {
            List<QuestionOption> optionEntities = new ArrayList<>();
            for (int i = 0; i < options.size(); i++) {
                QuestionOptionRequest opt = options.get(i);
                String key = String.valueOf((char) ('A' + i));
                optionEntities.add(QuestionOption.builder()
                        .question(question)
                        .optionKey(key)
                        .content(opt.getContent() != null ? opt.getContent().trim() : "")
                        .correct(opt.isCorrect())
                        .build());
            }
            questionOptionRepository.saveAll(optionEntities);
        }

        // Answers for TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER
        if ((type == QuestionType.TRUE_FALSE || type == QuestionType.FILL_IN_BLANK || type == QuestionType.TYPE_ANSWER) && answers != null) {
            List<QuestionAnswer> answerEntities = answers.stream()
                    .filter(ans -> StringUtils.hasText(ans.getRawValue()))
                    .map(ans -> {
                        String raw = ans.getRawValue().trim();
                        String norm = raw.toLowerCase();
                        if (type == QuestionType.TRUE_FALSE) {
                            raw = "TRUE".equalsIgnoreCase(raw) ? "TRUE" : "FALSE";
                            norm = raw.toLowerCase();
                        }
                        return QuestionAnswer.builder()
                                .question(question)
                                .rawValue(raw)
                                .normalizedValue(norm)
                                .build();
                    })
                    .collect(Collectors.toList());
            questionAnswerRepository.saveAll(answerEntities);
        }

        // Media links
        if (mediaIds != null && !mediaIds.isEmpty()) {
            int displayOrder = 1;
            for (Long mediaId : mediaIds) {
                Media media = mediaRepository.findById(mediaId).orElse(null);
                if (media != null) {
                    media.setStatus(MediaStatus.READY);
                    mediaRepository.save(media);

                    QuestionMedia qm = QuestionMedia.builder()
                            .question(question)
                            .media(media)
                            .displayOrder(displayOrder++)
                            .build();
                    questionMediaRepository.save(qm);
                }
            }
        }
    }

    public boolean computeIsComplete(
            QuestionType type,
            String prompt,
            List<QuestionOptionRequest> options,
            List<QuestionAnswerRequest> answers
    ) {
        if (!StringUtils.hasText(prompt)) return false;
        String trimmedPrompt = prompt.trim();

        if (type == QuestionType.SINGLE_CHOICE || type == QuestionType.MULTIPLE_CHOICE) {
            if (options == null || options.size() < 2) return false;
            boolean allNonEmpty = options.stream()
                    .allMatch(opt -> opt.getContent() != null && StringUtils.hasText(opt.getContent().trim()));
            long correctCount = options.stream().filter(QuestionOptionRequest::isCorrect).count();
            if (!allNonEmpty) return false;

            if (type == QuestionType.SINGLE_CHOICE) {
                return correctCount == 1;
            } else {
                return correctCount >= 1;
            }
        } else if (type == QuestionType.TRUE_FALSE) {
            if (answers == null || answers.isEmpty()) return false;
            long validTfCount = answers.stream()
                    .filter(a -> a.getRawValue() != null && ("TRUE".equalsIgnoreCase(a.getRawValue().trim()) || "FALSE".equalsIgnoreCase(a.getRawValue().trim())))
                    .count();
            return validTfCount == 1;
        } else if (type == QuestionType.FILL_IN_BLANK) {
            if (!trimmedPrompt.contains("____")) return false;
            if (answers == null || answers.isEmpty()) return false;
            return answers.stream().anyMatch(a -> a.getRawValue() != null && StringUtils.hasText(a.getRawValue().trim()));
        } else if (type == QuestionType.TYPE_ANSWER) {
            if (answers == null || answers.isEmpty()) return false;
            return answers.stream().anyMatch(a -> a.getRawValue() != null && StringUtils.hasText(a.getRawValue().trim()));
        }
        return false;
    }

    private QuestionResponse mapToResponse(Question question) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());
        List<QuestionAnswer> answers = questionAnswerRepository.findByQuestionId(question.getId());
        List<QuestionMedia> mediaList = questionMediaRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId());

        List<QuestionOptionResponse> optionResponses = options.stream()
                .map(opt -> QuestionOptionResponse.builder()
                        .id(opt.getId())
                        .content(opt.getContent())
                        .correct(opt.isCorrect())
                        .build())
                .collect(Collectors.toList());

        List<QuestionAnswerResponse> answerResponses = answers.stream()
                .map(ans -> QuestionAnswerResponse.builder()
                        .id(ans.getId())
                        .rawValue(ans.getRawValue())
                        .normalizedValue(ans.getNormalizedValue())
                        .build())
                .collect(Collectors.toList());

        List<QuestionMediaResponse> mediaResponses = mediaList.stream()
                .map(m -> QuestionMediaResponse.builder()
                        .id(m.getId())
                        .mediaId(m.getMedia() != null ? m.getMedia().getId() : null)
                        .mediaType(m.getMedia() != null && m.getMedia().getMediaType() != null ? m.getMedia().getMediaType().name() : null)
                        .url(m.getMedia() != null ? m.getMedia().getPublicId() : null)
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .questionBankId(question.getQuestionBank().getId())
                .type(question.getType())
                .difficulty(question.getDifficulty())
                .content(question.getContent())
                .explanation(question.getExplanation())
                .complete(question.isComplete())
                .matchingMode(question.getMatchingMode())
                .options(optionResponses)
                .answers(answerResponses)
                .media(mediaResponses)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
