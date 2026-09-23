package e_learning.server.content.section.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateSectionRequest(

        @NotBlank(message = "Section name is required")
        @Size(max = 150, message = "Section name must not exceed 150 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @PositiveOrZero(message = "Display order must be greater than or equal to 0")
        Integer displayOrder

) {
}
