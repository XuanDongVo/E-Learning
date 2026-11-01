package e_learning.server.assignmentanalysis.dto.response;

import java.math.BigDecimal;

public record AnalysisSummary(
        Long assignmentId,
        String title,
        String status,
        String dueAt,
        Integer timeLimitMinutes,
        BigDecimal totalPossibleScoredPoints,
        int assignedStudentCount,
        int classCount
) {}
