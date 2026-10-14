package e_learning.server.assignment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CompositionSectionRequest(
        Long id,
        @NotNull @Positive Integer position,
        @Size(max = 200) String title,
        String instructions,
        @Size(max = 200) String titleVi,
        String instructionsVi,
        @Valid List<CompositionItemRequest> items
) {
}
