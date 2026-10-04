package e_learning.server.assignment.dto;

import e_learning.server.assignment.entity.AssignmentQuestion;
import e_learning.server.question.entity.Question;
import e_learning.server.question.entity.QuestionAnswer;
import e_learning.server.question.entity.QuestionMedia;
import e_learning.server.question.entity.QuestionOption;

import java.time.LocalDateTime;
import java.util.List;

public record AssignmentQuestionResponse(
        Long questionId,
        Long assignmentId,
        Long topicId,
        Integer position,
        QuestionContentResponse question
) {

    public static AssignmentQuestionResponse from(
            AssignmentQuestion assignmentQuestion,
            List<QuestionOption> options,
            List<QuestionAnswer> answers,
            List<QuestionMedia> media
    ) {
        Question question = assignmentQuestion.getQuestion();

        return new AssignmentQuestionResponse(
                question.getId(),
                assignmentQuestion.getAssignment().getId(),
                assignmentQuestion.getTopic() == null
                        ? null
                        : assignmentQuestion.getTopic().getId(),
                assignmentQuestion.getPosition(),
                QuestionContentResponse.from(question, options, answers, media)
        );
    }

    public record QuestionContentResponse(
            Long id,
            String type,
            String difficulty,
            String content,
            String explanation,
            boolean complete,
            String matchingMode,
            List<OptionResponse> options,
            List<AnswerResponse> answers,
            List<MediaResponse> media,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        static QuestionContentResponse from(
                Question question,
                List<QuestionOption> options,
                List<QuestionAnswer> answers,
                List<QuestionMedia> media
        ) {
            return new QuestionContentResponse(
                    question.getId(),
                    question.getType().name(),
                    question.getDifficulty().name(),
                    question.getContent(),
                    question.getExplanation(),
                    question.isComplete(),
                    question.getMatchingMode(),
                    options.stream()
                            .map(OptionResponse::from)
                            .toList(),
                    answers.stream()
                            .map(AnswerResponse::from)
                            .toList(),
                    media.stream()
                            .map(MediaResponse::from)
                            .toList(),
                    question.getCreatedAt(),
                    question.getUpdatedAt()
            );
        }
    }

    public record OptionResponse(
            Long id,
            String content,
            boolean isCorrect
    ) {
        static OptionResponse from(QuestionOption option) {
            return new OptionResponse(
                    option.getId(),
                    option.getContent(),
                    option.isCorrect()
            );
        }
    }

    public record AnswerResponse(
            Long id,
            String rawValue,
            String normalizedValue
    ) {
        static AnswerResponse from(QuestionAnswer answer) {
            return new AnswerResponse(
                    answer.getId(),
                    answer.getRawValue(),
                    answer.getNormalizedValue()
            );
        }
    }

    public record MediaResponse(
            Long id,
            Long mediaId,
            String mediaType,
            String url
    ) {
        static MediaResponse from(QuestionMedia media) {
            return new MediaResponse(
                    media.getId(),
                    media.getMedia().getId(),
                    media.getMedia().getMimeType(),
                    media.getMedia().getPublicId()
            );
        }
    }
}