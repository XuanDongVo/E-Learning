package e_learning.server.assignmentanalysis.dto;

import java.util.List;

public record ScoreSummaryDto(
        int gradedAttemptCount,
        Double averagePercent,
        Double medianPercent,
        Double highestPercent,
        Double lowestPercent,
        List<ScoreBucketDto> distribution
) {}
