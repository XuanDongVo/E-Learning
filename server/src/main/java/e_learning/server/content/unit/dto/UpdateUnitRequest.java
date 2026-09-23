package e_learning.server.content.unit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUnitRequest(

        @NotBlank(message = "Unit code is required")
        @Size(max = 30, message = "Unit code must not exceed 30 characters")
        String code,

        @NotBlank(message = "Unit name is required")
        @Size(max = 150, message = "Unit name must not exceed 150 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        Long coverMediaId,

        Integer displayOrder

) {
}