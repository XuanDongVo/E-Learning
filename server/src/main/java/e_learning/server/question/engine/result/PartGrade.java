package e_learning.server.question.engine.result;

import e_learning.server.question.engine.exception.QuestionEngineException;

import java.math.BigDecimal;
import java.util.Optional;

public record PartGrade(String partKey, PartStatus status, BigDecimal earnedWeight,
                        BigDecimal possibleWeight, Optional<NormalizedAnswerValue> normalizedSubmittedValue) {
    public PartGrade {
        if (partKey == null || partKey.isBlank() || status == null || earnedWeight == null || possibleWeight == null)
            throw new QuestionEngineException("Part grade fields are required");
        normalizedSubmittedValue = normalizedSubmittedValue == null ? Optional.empty() : normalizedSubmittedValue;
        if (possibleWeight.signum() < 0 || earnedWeight.signum() < 0 || earnedWeight.compareTo(possibleWeight) > 0)
            throw new QuestionEngineException("Invalid part weight");
    }
}
