package e_learning.server.assignmentanalysis.dto;

import java.math.BigDecimal;

public record AssignmentAnalysisSummaryDto(
        Long assignmentId,
        String title,
        String status,
        String dueAt,
        Integer timeLimitMinutes,
        BigDecimal totalPossibleScoredPoints,
        int assignedStudentCount,
        int classCount
) {}
