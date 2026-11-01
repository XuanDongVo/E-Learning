package e_learning.server.assignmentanalysis.dto;

import java.util.List;

public record AttemptReviewResponse(
        Long attemptId,
        Long studentId,
        String studentName,
        Long assignmentId,
        String assignmentTitle,
        Long classId,
        String className,
        String lifecycleStatus,
        String deadlineState,
        String startedAt,
        String finishedAt,
        Long durationSeconds,
        Double earnedPoints,
        Double possiblePoints,
        Double scorePercent,
        List<Object> questions
) {}
