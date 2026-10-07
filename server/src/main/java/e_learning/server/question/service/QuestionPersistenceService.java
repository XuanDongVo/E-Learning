package e_learning.server.question.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.media.entity.Media;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.question.dto.QuestionAnswerRequest;
import e_learning.server.question.dto.QuestionOptionRequest;
import e_learning.server.question.dto.QuestionWriteRequest;
import e_learning.server.question.entity.Question;
import e_learning.server.question.entity.QuestionAnswer;
import e_learning.server.question.entity.QuestionMedia;
import e_learning.server.question.entity.QuestionOption;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionMediaRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityManager;
import java.util.*;

@Service
@RequiredArgsConstructor
public class QuestionPersistenceService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionMediaRepository questionMediaRepository;
    private final MediaRepository mediaRepository;
    private final QuestionContentValidator questionContentValidator;
    private final EntityManager entityManager;

    @Transactional
    public List<Question> createQuestions(List<? extends QuestionWriteRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_QUESTION);
        }

        List<Question> questions = new ArrayList<>();

        for (QuestionWriteRequest request : requests) {
            boolean complete = questionContentValidator.isComplete(
                    request.getType(),
                    request.getContent(),
                    request.getOptions(),
                    request.getAnswers()
            );

            Question question = Question.builder()
                    .type(request.getType())
                    .difficulty(request.getDifficulty() != null ? request.getDifficulty() : Difficulty.EASY)
                    .content(request.getContent().trim())
                    .explanation(StringUtils.hasText(request.getExplanation())
                            ? request.getExplanation().trim() : null)
                    .hint(StringUtils.hasText(request.getHint())
                            ? request.getHint().trim() : null)
                    .complete(complete)
                    .matchingMode("CASE_INSENSITIVE_TRIM")
                    .build();

            Question saved = questionRepository.save(question);
            createChildEntities(saved, request);
            questions.add(saved);
        }

        return questions;
    }

    @Transactional
    public Question updateQuestion(Long questionId, QuestionWriteRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        question.setType(request.getType());
        question.setDifficulty(request.getDifficulty() != null
                ? request.getDifficulty() : question.getDifficulty());
        question.setContent(request.getContent().trim());
        question.setExplanation(StringUtils.hasText(request.getExplanation())
                ? request.getExplanation().trim() : null);
        question.setHint(StringUtils.hasText(request.getHint())
                ? request.getHint().trim() : null);
        question.setComplete(questionContentValidator.isComplete(
                request.getType(),
                request.getContent(),
                request.getOptions(),
                request.getAnswers()
        ));
        updateChildEntities(question, request);
        return question;
    }

    @Transactional
    public void deleteQuestions(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        }

        Set<Long> questionIds = new HashSet<>(ids);
        Set<Long> mediaIds = questionMediaRepository.findMediaIdsByQuestionIdIn(questionIds);

        questionRepository.deleteAllByIdInBatch(questionIds);
        releaseUnusedMedia(mediaIds);
    }

    private void createChildEntities(Question question, QuestionWriteRequest request) {
        QuestionType type = request.getType();
        List<QuestionOptionRequest> options = request.getOptions();
        List<QuestionAnswerRequest> answers = request.getAnswers();

        if ((type == QuestionType.SINGLE_CHOICE || type == QuestionType.MULTIPLE_CHOICE)
                && options != null) {
            List<QuestionOption> entities = new ArrayList<>();

            for (int i = 0; i < options.size(); i++) {
                QuestionOptionRequest option = options.get(i);
                entities.add(QuestionOption.builder()
                        .question(question)
                        .optionKey(toOptionKey(i))
                        .content(option.getContent() != null ? option.getContent().trim() : "")
                        .correct(option.isCorrect())
                        .build());
            }

            questionOptionRepository.saveAll(entities);
        }

        if ((type == QuestionType.TRUE_FALSE
                || type == QuestionType.FILL_IN_BLANK
                || type == QuestionType.TYPE_ANSWER)
                && answers != null) {
            List<QuestionAnswer> entities = answers.stream()
                    .filter(answer -> StringUtils.hasText(answer.getRawValue()))
                    .map(answer -> buildAnswer(question, answer, type))
                    .toList();

            questionAnswerRepository.saveAll(entities);
        }

        createMedia(question, request.getMediaIds());
    }

    private void updateChildEntities(Question question, QuestionWriteRequest request) {
        Set<Long> oldMediaIds = questionMediaRepository
                .findMediaIdsByQuestionIdIn(Set.of(question.getId()));

        questionOptionRepository.deleteByQuestionId(question.getId());
        questionAnswerRepository.deleteByQuestionId(question.getId());
        questionMediaRepository.deleteByQuestionId(question.getId());

        entityManager.flush();

        createChildEntities(question, request);

        releaseUnusedMedia(oldMediaIds);
    }

    private void createMedia(Question question, List<Long> mediaIds) {
        if (mediaIds == null || mediaIds.isEmpty()) {
            return;
        }

        int displayOrder = 1;

        for (Long mediaId : mediaIds) {
            Media media = mediaRepository.findById(mediaId).orElse(null);
            if (media == null) {
                continue;
            }

            media.setStatus(MediaStatus.READY);
            mediaRepository.save(media);

            questionMediaRepository.save(QuestionMedia.builder()
                    .question(question)
                    .media(media)
                    .displayOrder(displayOrder++)
                    .build());
        }
    }

    private QuestionAnswer buildAnswer(
            Question question,
            QuestionAnswerRequest request,
            QuestionType type
    ) {
        String raw = normalizeAnswer(request.getRawValue(), type);

        return QuestionAnswer.builder()
                .question(question)
                .rawValue(raw)
                .normalizedValue(raw.toLowerCase())
                .build();
    }

    private String normalizeAnswer(String rawValue, QuestionType type) {
        String raw = rawValue.trim();

        if (type == QuestionType.TRUE_FALSE) {
            raw = "TRUE".equalsIgnoreCase(raw) ? "TRUE" : "FALSE";
        }

        return raw;
    }

    private String toOptionKey(int index) {
        return String.valueOf((char) ('A' + index));
    }

    private void releaseUnusedMedia(Set<Long> mediaIds) {
        for (Long mediaId : mediaIds) {
            if (questionMediaRepository.existsByMediaId(mediaId)) {
                continue;
            }

            Media media = mediaRepository.findById(mediaId).orElse(null);
            if (media != null && media.getStatus() != MediaStatus.DELETED) {
                media.setStatus(MediaStatus.DELETED);
                mediaRepository.save(media);
            }
        }
    }
}
