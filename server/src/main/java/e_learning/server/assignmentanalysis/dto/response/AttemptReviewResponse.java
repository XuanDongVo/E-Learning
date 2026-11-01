package e_learning.server.assignmentanalysis.dto.response;

import java.math.BigDecimal;
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
        BigDecimal earnedPoints,
        BigDecimal possiblePoints,
        Double scorePercent,
        List<AttemptReviewQuestion> questions
) {}
