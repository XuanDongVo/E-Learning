package e_learning.server.assignmentanalysis.dto.response;

public record ClassComparisonRow(
        Long classId,
        String className,
        int assignedCount,
        int submittedCount,
        Double submissionRate,
        Double averagePercent,
        Double medianPercent,
        Double accuracyPercent,
        String overallBand
) {}
