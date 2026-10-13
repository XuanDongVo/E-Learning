package e_learning.server.question.engine.model;

import java.util.List;

/** Untrusted answer value at the domain boundary; never exposes a JSON library type. */
public record RawAnswer(Object value) {
    public RawAnswer { value = immutable(value); }
    private static Object immutable(Object value) { return value instanceof List<?> list ? List.copyOf(list) : value; }
    public boolean unanswered() { return value == null || (value instanceof String s && s.isBlank()); }
}
