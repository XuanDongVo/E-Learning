package e_learning.server.assignmentanalysis.dto.response;

import java.math.BigDecimal;

public record AttemptReviewPart(
        String key,
        String status,
        BigDecimal earnedPoints,
        BigDecimal possiblePoints,
        String normalized
) {}
