package e_learning.server.question.engine;

import e_learning.server.question.enums.QuestionType;
import java.util.*;

public record MatchingSpec(QuestionSpec.QuestionCommon common, List<Item> items,
                           List<String> answerPool, Map<String, String> expectedPairs) implements QuestionSpec {
    public MatchingSpec {
        common = Objects.requireNonNull(common);
        items = List.copyOf(items == null ? List.of() : items);
        answerPool = List.copyOf(answerPool == null ? List.of() : answerPool);
        expectedPairs = Map.copyOf(expectedPairs == null ? Map.of() : expectedPairs);
    }
    public QuestionType type() { return QuestionType.MATCHING; }
    public record Item(String key, String prompt) {
        public Item { key = Objects.requireNonNull(key).trim(); prompt = Objects.requireNonNull(prompt); }
    }
}
