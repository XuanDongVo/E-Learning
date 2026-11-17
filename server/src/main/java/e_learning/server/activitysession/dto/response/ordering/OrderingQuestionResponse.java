package e_learning.server.activitysession.dto.response.ordering;

import e_learning.server.question.engine.types.ordering.OrderingSubtype;

import java.util.List;

/** Sanitized Student projection. Accepted orders never leave the server snapshot. */
public record OrderingQuestionResponse(OrderingSubtype subtype, List<Item> items) {
    public OrderingQuestionResponse {
        items = List.copyOf(items == null ? List.of() : items);
    }

    public record Item(String key, String content) {}
}
