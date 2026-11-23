package e_learning.server.studyplanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudyTaskUpsertRequest(
        @NotBlank @Size(max = 140) String title,
        @Size(max = 600) String notes,
        LocalDate plannedDate
) {}
