package e_learning.server.question.guided;

import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.enums.QuestionType;

import java.util.List;

public record GuidedStepPayload(
        String stepKey,
        Integer position,
        QuestionType type,
        String prompt,
        List<GuidedChoicePayload> options,
        String correctKey,
        Boolean expected,
        List<String> acceptedAnswers,
        MatchingMode matchingMode,
        String explanation,
        boolean hintEnabled,
        String hint,
        boolean retryEnabled
) {
    public GuidedStepPayload {
        options = List.copyOf(options == null ? List.of() : options);
        acceptedAnswers = List.copyOf(acceptedAnswers == null ? List.of() : acceptedAnswers);
    }
}
