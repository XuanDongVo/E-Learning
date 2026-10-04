package e_learning.server.assignment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record CreateAssignmentRequest(
        @NotNull @Min(6) @Max(8) Integer gradeLevel,
        @NotBlank @Size(max = 20) String academicYear,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 2000) String description,
        LocalDateTime startAt,
        @NotNull LocalDateTime dueAt,
        @Positive Integer timeLimitSeconds,
        @NotEmpty List<@Valid AssignmentTargetRequest> targets
) {
}
