package e_learning.server.assignment.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record CreateAssignmentRequest(
        @NotNull Long gradeId,
        @NotBlank @Size(max = 20) String academicYear,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 2000) String description,
        @NotNull LocalDateTime startAt,
        @NotNull LocalDateTime dueAt,
        @NotNull @Positive Integer timeLimitMinutes,
        Boolean showAnswersAfterSubmit,
        @NotEmpty List<@NotNull @Positive Long> classIds
) {
}
