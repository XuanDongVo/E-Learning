package e_learning.server.assignmentanalysis.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AttemptReviewQuestion(
        Long questionId,
        int position,
        String sectionTitle,
        String prompt,
        String questionType,
        boolean isExample,
        BigDecimal possiblePoints,
        BigDecimal earnedPoints,
        String outcome,
        Map<String, Object> studentAnswer,
        Object correctAnswer,
        List<AttemptReviewPart> parts
) {}
