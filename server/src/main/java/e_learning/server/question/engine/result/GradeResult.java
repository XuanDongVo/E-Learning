package e_learning.server.question.engine.result;

import java.math.BigDecimal;
import java.util.List;

public record GradeResult(BigDecimal scoreFraction, List<PartGrade> parts) {
    public GradeResult {
        if (scoreFraction == null || scoreFraction.signum() < 0 || scoreFraction.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("Score fraction must be between zero and one");
        parts = List.copyOf(parts == null ? List.of() : parts);
        BigDecimal total = parts.stream().map(PartGrade::possibleWeight).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal earned = parts.stream().map(PartGrade::earnedWeight).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(BigDecimal.ONE) != 0 || earned.compareTo(scoreFraction) != 0)
            throw new IllegalArgumentException("Part weights must sum to the score fraction");
    }
}
