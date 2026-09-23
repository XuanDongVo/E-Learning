package e_learning.server.content.common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record ReorderRequest(
        @NotEmpty @Valid List<Item> items
) {
    public record Item(
            @NotNull Long id,
            @NotNull @Positive Integer displayOrder
    ) {
    }
}
