package e_learning.server.assignment.dto.student;

import java.time.LocalDateTime;

public record StudentAssignmentItemResponse(
        Long id,
        String title,
        int dueInDays,
        LocalDateTime dueAt,
        long questionCount,
        Integer timeLimitMinutes,
        StudentAssignmentStatus status,
        boolean late,
        String description
) {
}
