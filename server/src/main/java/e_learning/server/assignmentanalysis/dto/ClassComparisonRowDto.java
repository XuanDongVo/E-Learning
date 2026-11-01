package e_learning.server.assignmentanalysis.dto;

public record ClassComparisonRowDto(
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
