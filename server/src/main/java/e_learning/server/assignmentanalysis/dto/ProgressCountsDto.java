package e_learning.server.assignmentanalysis.dto;

public record ProgressCountsDto(
        int assigned,
        int notStarted,
        int inProgress,
        int submitted,
        int timedOut,
        int late,
        int overdue,
        Double submissionRate
) {}
