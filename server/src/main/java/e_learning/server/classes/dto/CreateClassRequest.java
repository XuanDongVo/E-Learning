package e_learning.server.classes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateClassRequest(
        @NotBlank String name,
        @NotNull Long gradeId,
        @NotBlank String academicYear
) {
}