package e_learning.server.question.guided.dto;

import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.enums.QuestionType;

import java.util.List;

/** Teacher-only authoring projection. It intentionally contains step answer keys. */
public record GuidedStepResponse(
        String stepKey,
        int position,
        QuestionType type,
        String prompt,
        List<GuidedChoiceRequest> options,
        String correctKey,
        Boolean expected,
        List<String> acceptedAnswers,
        MatchingMode matchingMode,
        String explanation,
        boolean hintEnabled,
        String hint,
        boolean retryEnabled
) {
}
