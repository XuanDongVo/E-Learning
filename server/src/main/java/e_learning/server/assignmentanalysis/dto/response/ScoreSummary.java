package e_learning.server.assignmentanalysis.dto.response;

import java.util.List;

public record ScoreSummary(
        int gradedAttemptCount,
        Double averagePercent,
        Double medianPercent,
        Double highestPercent,
        Double lowestPercent,
        List<ScoreBucket> distribution
) {}
