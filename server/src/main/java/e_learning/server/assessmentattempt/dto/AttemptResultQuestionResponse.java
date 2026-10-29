package e_learning.server.assessmentattempt.dto;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptPartStatus;

import java.math.BigDecimal;
import java.util.Map;

public record AttemptResultQuestionResponse(
        Long attemptQuestionId,
        Integer position,
        BigDecimal possiblePoints,
        BigDecimal earnedPoints,
        AssessmentAttemptPartStatus status,
        Map<String, Object> answerPayload,
        Object answerKey
) {
}
