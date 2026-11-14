package e_learning.server.question.guided.dto;

import e_learning.server.question.enums.QuestionType;

import java.util.List;

public record GuidedCapabilitiesResponse(
        List<QuestionType> supportedStepTypes,
        boolean hintEnabledByDefault,
        boolean retryEnabledByDefault,
        int maxAttemptsWhenRetryEnabled
) {
}
