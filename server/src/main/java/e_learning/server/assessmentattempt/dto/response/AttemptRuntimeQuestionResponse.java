package e_learning.server.assessmentattempt.dto.response;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Student-safe question snapshot projection. A student may leave any question unanswered.
 */
public record AttemptRuntimeQuestionResponse(
        Long attemptQuestionId, Long assignmentItemId, Long questionId, String sectionKey, String sectionTitle,
        Integer position, Map<String, Object> questionSnapshot, BigDecimal possiblePoints,
        boolean example, Map<String, Object> answerPayload, long answerRevision) {
}
