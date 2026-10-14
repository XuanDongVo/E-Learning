package e_learning.server.assignment.dto;

import java.util.List;

public record CompositionSectionResponse(
        Long id,
        Integer position,
        String title,
        String instructions,
        List<CompositionItemResponse> items
) {
}
