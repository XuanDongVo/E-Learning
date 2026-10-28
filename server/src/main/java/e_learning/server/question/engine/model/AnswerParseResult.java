package e_learning.server.question.engine.model;

import e_learning.server.question.engine.exception.QuestionEngineException;

import java.util.List;
import java.util.Optional;

/** Result of parsing untrusted student input into a canonical answer. */
public record AnswerParseResult(
        Optional<ValidatedAnswer> answer,
        List<String> errors,
        Status status
) {
    public enum Status {
        VALID,
        INVALID,
        UNANSWERED
    }

    public AnswerParseResult {
        answer = answer == null ? Optional.empty() : answer;
        errors = List.copyOf(errors == null ? List.of() : errors);
        status = status == null ? inferStatus(answer, errors) : status;

        boolean hasAnswer = answer.isPresent();
        boolean hasErrors = !errors.isEmpty();
        boolean consistent = switch (status) {
            case VALID -> hasAnswer && !hasErrors;
            case INVALID -> !hasAnswer && hasErrors;
            case UNANSWERED -> !hasAnswer && !hasErrors;
        };
        if (!consistent) {
            throw new QuestionEngineException("Answer parse result status does not match its content");
        }
    }

    /** Backward-compatible constructor for callers that only distinguish valid and invalid. */
    public AnswerParseResult(Optional<ValidatedAnswer> answer, List<String> errors) {
        this(answer, errors, inferStatus(answer, errors));
    }

    private static Status inferStatus(Optional<ValidatedAnswer> answer, List<String> errors) {
        Optional<ValidatedAnswer> safeAnswer = answer == null ? Optional.empty() : answer;
        List<String> safeErrors = errors == null ? List.of() : errors;
        if (safeAnswer.isPresent()) {
            return Status.VALID;
        }
        return safeErrors.isEmpty() ? Status.UNANSWERED : Status.INVALID;
    }

    public static AnswerParseResult valid(ValidatedAnswer answer) {
        return new AnswerParseResult(Optional.of(answer), List.of(), Status.VALID);
    }

    public static AnswerParseResult invalid(String... errors) {
        return new AnswerParseResult(Optional.empty(), List.of(errors), Status.INVALID);
    }

    public static AnswerParseResult unansweredResult() {
        return new AnswerParseResult(Optional.empty(), List.of(), Status.UNANSWERED);
    }

    public boolean valid() {
        return status == Status.VALID;
    }

    public boolean invalid() {
        return status == Status.INVALID;
    }

    public boolean isUnanswered() {
        return status == Status.UNANSWERED;
    }
}
