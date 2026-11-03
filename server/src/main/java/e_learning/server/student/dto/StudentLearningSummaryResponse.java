package e_learning.server.student.dto;

/** Aggregate counts for teacher student hub overview. */
public record StudentLearningSummaryResponse(
        long assigned,
        long submitted,
        long late,
        long timedOut,
        long notStarted,
        long inProgress,
        long sessionTotal
) {}
