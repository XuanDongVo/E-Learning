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
                    .complete(complete)
                    .matchingMode("CASE_INSENSITIVE_TRIM")
                    .build();

            Question saved = questionRepository.save(question);
            saveChildEntities(saved, request);
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
        question.setComplete(questionContentValidator.isComplete(
                request.getType(),
                request.getContent(),
                request.getOptions(),
                request.getAnswers()
        ));

        Set<Long> previousMediaIds = questionMediaRepository.findMediaIdsByQuestionIdIn(Set.of(questionId));

        questionOptionRepository.deleteByQuestionId(questionId);
        questionAnswerRepository.deleteByQuestionId(questionId);
        questionMediaRepository.deleteByQuestionId(questionId);
        saveChildEntities(question, request);
        releaseUnusedMedia(previousMediaIds);

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

    private void saveChildEntities(Question question, QuestionWriteRequest request) {
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
                        .optionKey(String.valueOf((char) ('A' + i)))
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
                    .map(answer -> {
                        String raw = answer.getRawValue().trim();

                        if (type == QuestionType.TRUE_FALSE) {
                            raw = "TRUE".equalsIgnoreCase(raw) ? "TRUE" : "FALSE";
                        }

                        return QuestionAnswer.builder()
                                .question(question)
                                .rawValue(raw)
                                .normalizedValue(raw.toLowerCase())
                                .build();
                    })
                    .toList();

            questionAnswerRepository.saveAll(entities);
        }

        if (request.getMediaIds() != null) {
            int displayOrder = 1;

            for (Long mediaId : request.getMediaIds()) {
                Media media = mediaRepository.findById(mediaId).orElse(null);
                if (media == null) continue;

                media.setStatus(MediaStatus.READY);
                mediaRepository.save(media);

                questionMediaRepository.save(QuestionMedia.builder()
                        .question(question)
                        .media(media)
                        .displayOrder(displayOrder++)
                        .build());
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
}
