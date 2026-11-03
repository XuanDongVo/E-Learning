package e_learning.server.student.dto;

import java.time.LocalDateTime;

/**
 * One assignment row for a student from the teacher hub.
 * status: NOT_STARTED | IN_PROGRESS | SUBMITTED | LATE | TIMED_OUT
 */
public record StudentAssignmentItemResponse(
        Long assignmentId,
        String title,
        LocalDateTime dueAt,
        String status,
        Long attemptId,
        LocalDateTime submittedAt,
        Double scorePercent,
        boolean late
) {}
