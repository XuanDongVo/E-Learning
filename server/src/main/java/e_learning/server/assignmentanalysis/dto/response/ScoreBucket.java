package e_learning.server.assignmentanalysis.dto.response;

public record ScoreBucket(
        int fromPercent,
        int toPercent,
        int count
) {}
