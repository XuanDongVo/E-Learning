package e_learning.server.content.question.service;

import e_learning.server.content.common.enums.QuestionType;
import e_learning.server.content.question.dto.QuestionAnswerRequest;
import e_learning.server.content.question.dto.QuestionOptionRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
public class QuestionContentValidator {

    public ValidationResult validate(
            QuestionType type,
            String prompt,
            List<QuestionOptionRequest> options,
            List<QuestionAnswerRequest> answers
    ) {
        List<String> errors = new ArrayList<>();
        if (!StringUtils.hasText(prompt)) {
            errors.add("content.required");
            return new ValidationResult(false, errors);
        }

        String trimmedPrompt = prompt.trim();
        if (type == QuestionType.SINGLE_CHOICE || type == QuestionType.MULTIPLE_CHOICE) {
            if (options == null || options.size() < 2) {
                errors.add("options.minimum");
            } else {
                if (options.stream().anyMatch(option -> !StringUtils.hasText(option.getContent()))) {
                    errors.add("options.content.required");
                }
                long correctCount = options.stream().filter(QuestionOptionRequest::isCorrect).count();
                if (type == QuestionType.SINGLE_CHOICE && correctCount != 1) {
                    errors.add("options.single_correct.required");
                } else if (type == QuestionType.MULTIPLE_CHOICE && correctCount < 1) {
                    errors.add("options.multiple_correct.required");
                }
            }
        } else if (type == QuestionType.TRUE_FALSE) {
            long validCount = answers == null ? 0 : answers.stream()
                    .filter(answer -> answer.getRawValue() != null)
                    .filter(answer -> "TRUE".equalsIgnoreCase(answer.getRawValue().trim())
                            || "FALSE".equalsIgnoreCase(answer.getRawValue().trim()))
                    .count();
            if (validCount != 1) errors.add("answers.true_false.required");
        } else if (type == QuestionType.FILL_IN_BLANK) {
            if (!trimmedPrompt.contains("____")) errors.add("content.blank_marker.required");
            if (!hasNonEmptyAnswer(answers)) errors.add("answers.required");
        } else if (type == QuestionType.TYPE_ANSWER && !hasNonEmptyAnswer(answers)) {
            errors.add("answers.required");
        }

        return new ValidationResult(errors.isEmpty(), errors);
    }

    public boolean isComplete(
            QuestionType type,
            String prompt,
            List<QuestionOptionRequest> options,
            List<QuestionAnswerRequest> answers
    ) {
        return validate(type, prompt, options, answers).complete();
    }

    private boolean hasNonEmptyAnswer(List<QuestionAnswerRequest> answers) {
        return answers != null && answers.stream().anyMatch(answer -> StringUtils.hasText(answer.getRawValue()));
    }

    public record ValidationResult(boolean complete, List<String> errors) {
    }
}
