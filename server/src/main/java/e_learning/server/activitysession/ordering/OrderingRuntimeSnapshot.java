package e_learning.server.activitysession.ordering;

import e_learning.server.question.engine.types.ordering.OrderingSubtype;

import java.util.List;

/** Server-only immutable Ordering definition and frozen presentation order. */
public record OrderingRuntimeSnapshot(
        int canonicalizationVersion,
        int gradingVersion,
        OrderingSubtype subtype,
        List<Item> items,
        List<List<String>> acceptedOrders,
        List<String> presentationOrder
) {
    public static final int CANONICALIZATION_VERSION = 1;
    public static final int GRADING_VERSION = 1;

    public OrderingRuntimeSnapshot {
        items = List.copyOf(items == null ? List.of() : items);
        acceptedOrders = acceptedOrders == null ? List.of() : acceptedOrders.stream()
                .map(order -> List.copyOf(order == null ? List.of() : order))
                .toList();
        presentationOrder = List.copyOf(presentationOrder == null ? List.of() : presentationOrder);
    }

    public record Item(String key, String content) {}
}
