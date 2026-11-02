package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AttemptPartStatus;
import java.math.BigDecimal;
import java.util.Map;

public record AttemptResultQuestionResponse(
        Long attemptQuestionId,
        Long assignmentItemId,
        Long sourceQuestionId,
        Integer position,
        String sectionKey,
        String sectionTitle,
        String sectionTitleVi,
        BigDecimal possiblePoints,
        BigDecimal earnedPoints,
        AttemptPartStatus status,
        boolean isExample,
        Map<String, Object> questionSnapshot,
        Map<String, Object> answerPayload,
        Map<String, Object> answerKey,
        String explanation
) {}
