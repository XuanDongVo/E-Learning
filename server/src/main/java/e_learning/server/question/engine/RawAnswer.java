package e_learning.server.question.engine;

import java.util.List;
import java.util.Objects;

/**
 * Untrusted answer value at the domain boundary; never exposes a JSON library type.
 */
public record RawAnswer(Object value) {
    public RawAnswer {
        value = immutable(value);
    }

    private static Object immutable(Object value) {
        if (value instanceof List<?> list) return List.copyOf(list);
        return value;
    }

    public boolean unanswered() {
        return value == null || (value instanceof String s && s.isBlank());
    }
}
