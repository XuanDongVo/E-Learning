package e_learning.server.activitysession.dto;

import e_learning.server.question.enums.QuestionType;

import java.util.List;

/** Sanitized Step projection. Correct values and explanations never leave the server here. */
public record GuidedCurrentStepResponse(
        String stepKey, int position, int totalSteps, QuestionType type, String prompt,
        List<Option> options, boolean hintAvailable, boolean hintUsed,
        int attemptsUsed, int attemptsAllowed) {
    public record Option(String key, String content) {}
}
