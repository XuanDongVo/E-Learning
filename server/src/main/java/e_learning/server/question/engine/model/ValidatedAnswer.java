package e_learning.server.question.engine.model;

import e_learning.server.question.enums.QuestionType;
import java.util.List;
import java.util.Objects;

public record ValidatedAnswer(QuestionType type, Object value) {
    public ValidatedAnswer {
        type = Objects.requireNonNull(type);
        if (value instanceof List<?> list) value = List.copyOf(list);
        value = Objects.requireNonNull(value);
    }
}
