package e_learning.server.assignment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CompositionItemRequest(
        Long id,
        @NotNull @Positive Integer position,
        @NotBlank String itemType,
        Long questionId,
        @NotNull @DecimalMin("0.00") BigDecimal possiblePoints,
        boolean required,
        boolean example,
        Map<String, Object> blockPayload,
        @Valid List<CompositionItemRequest> children
) {
}
