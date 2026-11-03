package e_learning.server.student.dto;

import java.time.LocalDateTime;

/**
 * One ActivitySession row for teacher view of a student.
 * status: IN_PROGRESS | COMPLETED | GAME_OVER | ABANDONED
 * mode: LEARNING | TRY_HARD
 */
public record StudentActivitySessionItemResponse(
        Long sessionId,
        Long activityId,
        String activityName,
        String unitLabel,
        String mode,
        String status,
        int totalQuestions,
        int firstCorrectCount,
        int finalCorrectCount,
        int hintUsedCount,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {}
