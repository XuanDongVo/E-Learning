package e_learning.server.question.dto.request.ordering;

import e_learning.server.question.engine.types.ordering.OrderingSubtype;
import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class OrderingDefinitionRequest {
    private Integer schemaVersion;
    private OrderingSubtype subtype;
    @Valid
    private List<Item> items;
    private List<List<String>> acceptedOrders;

    @Data
    public static class Item {
        private String key;
        private String content;
    }
}
