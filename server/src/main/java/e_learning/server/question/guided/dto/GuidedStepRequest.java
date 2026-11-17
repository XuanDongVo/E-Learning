package e_learning.server.question.guided.dto;

import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.enums.QuestionType;

import java.util.List;

/**
 * A draft step deliberately allows incomplete answer fields. READY validation is
 * performed by the service using the canonical QuestionEngine.
 */
public record GuidedStepRequest(
        String stepKey,
        Integer position,
        QuestionType type,
        String prompt,
        List<GuidedChoiceRequest> options,
        String correctKey,
        Boolean expected,
        List<String> acceptedAnswers,
        MatchingMode matchingMode,
        String explanation,
        Boolean hintEnabled,
        String hint,
        Boolean retryEnabled
) {
}
