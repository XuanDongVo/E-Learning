package e_learning.server.question.engine.result;

import java.util.Objects;

public record NormalizedAnswerValue(String value) {
    public NormalizedAnswerValue { value = Objects.requireNonNull(value); }
}
