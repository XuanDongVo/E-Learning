package e_learning.server.question.engine;

import java.util.Map;

public record MatchingAnswer(Map<String, String> pairs) {
    public MatchingAnswer { pairs = Map.copyOf(pairs == null ? Map.of() : pairs); }
}
