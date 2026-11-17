package e_learning.server.question.engine.types.ordering;

import java.util.List;

public record OrderingAnswer(List<String> order) {
    public OrderingAnswer {
        order = List.copyOf(order == null ? List.of() : order);
    }
}
