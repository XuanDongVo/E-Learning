package e_learning.server.studyplanner.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record StudyTaskResponse(
        Long id,
        String title,
        String notes,
        LocalDate plannedDate,
        boolean completed,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
