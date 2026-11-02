package e_learning.server.assignmentanalysis.dto.response;

public record ProgressCounts(
        int assigned,
        int notStarted,
        int inProgress,
        int submitted,
        int timedOut,
        int late,
        int overdue,
        Double submissionRate
) {}
