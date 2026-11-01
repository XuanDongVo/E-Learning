package e_learning.server.assignmentanalysis.dto.response;

public record StudentResultRow(
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
