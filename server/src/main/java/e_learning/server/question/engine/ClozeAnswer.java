package e_learning.server.question.engine;

import java.util.Map;

public record ClozeAnswer(Map<String, String> values) {
    public ClozeAnswer { values = Map.copyOf(values == null ? Map.of() : values); }
}
