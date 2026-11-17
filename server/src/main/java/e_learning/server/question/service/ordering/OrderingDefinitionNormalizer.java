package e_learning.server.question.service.ordering;

import e_learning.server.question.dto.request.QuestionDefinitionRequest;
import e_learning.server.question.dto.request.QuestionWriteRequest;
import e_learning.server.question.dto.request.ordering.OrderingDefinitionRequest;
import e_learning.server.question.engine.types.ordering.OrderingCanonicalizer;
import e_learning.server.question.engine.types.ordering.OrderingSpec;
import e_learning.server.question.enums.QuestionType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class OrderingDefinitionNormalizer {
    public void normalize(QuestionWriteRequest request) {
        if (request.getType() != QuestionType.ORDERING) return;
        QuestionDefinitionRequest definition = request.getDefinition();
        OrderingDefinitionRequest ordering = definition == null ? null : definition.getOrdering();
        if (ordering == null) return;

        if (ordering.getSchemaVersion() == null) ordering.setSchemaVersion(OrderingSpec.SCHEMA_VERSION);
        List<OrderingDefinitionRequest.Item> items = ordering.getItems() == null
                ? new ArrayList<>()
                : new ArrayList<>(ordering.getItems());
        for (OrderingDefinitionRequest.Item item : items) {
            if (item == null) continue;
            item.setKey(item.getKey() == null ? null : item.getKey().trim());
            item.setContent(OrderingCanonicalizer.content(item.getContent()));
        }
        ordering.setItems(items);
        ordering.setAcceptedOrders(deduplicateVisibleOrders(items, ordering.getAcceptedOrders()));
    }

    private List<List<String>> deduplicateVisibleOrders(
            List<OrderingDefinitionRequest.Item> items,
            List<List<String>> orders) {
        if (orders == null) return new ArrayList<>();
        Map<String, String> contentByKey = new LinkedHashMap<>();
        for (OrderingDefinitionRequest.Item item : items) {
            if (item != null && item.getKey() != null) contentByKey.put(item.getKey(), item.getContent());
        }   
        Map<List<String>, List<String>> distinct = new LinkedHashMap<>();
        for (List<String> order : orders) {
            List<String> safeOrder = order == null ? List.of() : order.stream()
                    .map(key -> key == null ? "" : key.trim()).toList();
            List<String> visible = safeOrder.stream().map(contentByKey::get).toList();
            distinct.putIfAbsent(visible, safeOrder);
        }
        return new ArrayList<>(distinct.values());
    }
}
