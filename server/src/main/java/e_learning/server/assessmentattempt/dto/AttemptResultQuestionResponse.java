package e_learning.server.assessmentattempt.dto;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;

import java.math.BigDecimal;
import java.util.Map;

public record AttemptResultQuestionResponse(
        Long attemptQuestionId,
        Integer position,
        BigDecimal possiblePoints,
        BigDecimal earnedPoints,
        AssessmentAttemptStatus status,
        Map<String, Object> answerPayload,
        Object answerKey
) {
}
