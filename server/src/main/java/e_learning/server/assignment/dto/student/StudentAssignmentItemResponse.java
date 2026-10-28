package e_learning.server.assignment.dto.student;

import java.time.LocalDateTime;

public record StudentAssignmentItemResponse(
        Long id,
        String title,
        LocalDateTime dueAt,
        long questionCount,
        Integer timeLimitMinutes,
        StudentAssignmentStatus status,
        String description
) {
}
