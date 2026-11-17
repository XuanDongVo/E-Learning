package e_learning.server.question.engine.types.ordering;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;

import java.util.List;
import java.util.Objects;

public record OrderingSpec(
        QuestionCommon common,
        int schemaVersion,
        OrderingSubtype subtype,
        List<Item> items,
        List<List<String>> acceptedOrders
) implements QuestionSpec {
    public static final int SCHEMA_VERSION = 1;

    public OrderingSpec {
        common = Objects.requireNonNull(common);
        items = List.copyOf(items == null ? List.of() : items);
        acceptedOrders = acceptedOrders == null ? List.of() : acceptedOrders.stream()
                .map(order -> List.copyOf(order == null ? List.of() : order))
                .toList();
    }

    @Override
    public QuestionType type() {
        return QuestionType.ORDERING;
    }

    public record Item(String key, String content) {
        public Item {
            key = key == null ? "" : key.trim();
            content = OrderingCanonicalizer.content(content);
        }
    }
}
