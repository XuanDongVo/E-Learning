package e_learning.server.grades.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateGradeRequest(
        @NotBlank
        String code,
        @NotBlank
        String name,
        int displayOrder
) {
}
