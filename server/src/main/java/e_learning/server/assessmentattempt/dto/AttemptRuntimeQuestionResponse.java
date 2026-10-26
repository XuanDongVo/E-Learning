package e_learning.server.assessmentattempt.dto;

import java.math.BigDecimal;
import java.util.Map;

/** Student-safe question snapshot projection. */
public record AttemptRuntimeQuestionResponse(
        Long attemptQuestionId,
        Long assignmentItemId,
        Long questionId,
        String sectionKey,
        String sectionTitle,
        Integer position,
        Map<String, Object> questionSnapshot,
        BigDecimal possiblePoints,
        boolean required,
        boolean example,
        Map<String, Object> answerPayload,
        long answerRevision
) {
}
