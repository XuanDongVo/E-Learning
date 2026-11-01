package e_learning.server.assignmentanalysis.dto;

public record StudentResultRowDto(
        Long studentId,
        String studentName,
        Long classId,
        String className,
        Long attemptId,
        String lifecycleStatus,
        String deadlineState,
        Double scorePercent,
        Double earnedPoints,
        Double possiblePoints,
        String startedAt,
        String finishedAt,
        Long durationSeconds
) {}
