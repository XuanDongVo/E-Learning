package e_learning.server.assignment.dto;

import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AssignmentQuestionRequest(
        @NotNull QuestionType type,
        @NotNull Difficulty difficulty,
        @NotBlank String content,
        String explanation,
        Long topicId,
        @Valid List<OptionRequest> options,
        @Valid List<AnswerRequest> answers,
        List<Long> mediaIds
) {
    public record OptionRequest(
            @NotBlank String content,
            boolean isCorrect
    ) {
    }

    public record AnswerRequest(
            @NotBlank String rawValue
    ) {
    }
}