package e_learning.server.question.engine.model;

import e_learning.server.question.engine.exception.QuestionEngineException;

import java.util.List;
import java.util.Optional;

public record AnswerParseResult(Optional<ValidatedAnswer> answer, List<String> errors) {
    public AnswerParseResult {
        answer = answer == null ? Optional.empty() : answer;
        errors = List.copyOf(errors == null ? List.of() : errors);
        if (answer.isPresent() == !errors.isEmpty())
            throw new QuestionEngineException("A parse result must contain either an answer or errors");
    }

    public static AnswerParseResult valid(ValidatedAnswer answer) {
        return new AnswerParseResult(Optional.of(answer), List.of());
    }

    public static AnswerParseResult invalid(String... errors) {
        return new AnswerParseResult(Optional.empty(), List.of(errors));
    }

    public boolean valid() {
        return answer.isPresent();
    }
}
