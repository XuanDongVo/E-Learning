package e_learning.server.assignmentanalysis.dto;

public record ScoreBucketDto(
        int fromPercent,
        int toPercent,
        int count
) {}
