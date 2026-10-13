package e_learning.server.question.engine.types.compound;

import java.util.Map;

public record ClozeAnswer(Map<String, String> values) { public ClozeAnswer { values = Map.copyOf(values == null ? Map.of() : values); } }
