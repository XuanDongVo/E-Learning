package e_learning.server.classmanagement.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateClassRequest(
        @NotBlank String name,
        @Min(6) @Max(8) Short grade,
        @NotBlank String academicYear
) {
}