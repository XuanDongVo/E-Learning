package e_learning.server.assignment.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CompositionItemResponse(
        Long id,
        Integer position,
        String itemType,
        Long questionId,
        BigDecimal possiblePoints,
        boolean example,
        Map<String, Object> blockPayload,
        List<CompositionItemResponse> children
) {
}
