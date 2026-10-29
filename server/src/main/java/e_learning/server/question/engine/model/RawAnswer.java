package e_learning.server.question.engine.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Untrusted answer value at the domain boundary; never exposes a JSON library type. */
public record RawAnswer(Object value) {
    public RawAnswer {
        value = immutable(value);
    }

    private static Object immutable(Object value) {
        // Preserve malformed list elements (including null) so the handler can reject them
        // as invalid input instead of failing during request adaptation.
        return value instanceof List<?> list
                ? Collections.unmodifiableList(new ArrayList<>(list))
                : value;
    }

    public boolean unanswered() {
        return value == null || (value instanceof String s && s.isBlank());
    }
}
