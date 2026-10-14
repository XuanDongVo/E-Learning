package e_learning.server.assignment.dto;

import java.util.List;

public record CompositionSectionResponse(
        Long id,
        Integer position,
        String title,
        String instructions,
        String titleVi,
        String instructionsVi,
        List<CompositionItemResponse> items
) {
}
