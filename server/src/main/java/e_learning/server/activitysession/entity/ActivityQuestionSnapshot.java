package e_learning.server.activitysession.entity;

import e_learning.server.question.enums.QuestionType;

import java.util.List;

/** Immutable runtime representation serialized into an activity session row. */
public record ActivityQuestionSnapshot(
        int schemaVersion,
        long contentRevision,
        QuestionType type,
        String content,
        String explanation,
        String hint,
        String matchingMode,
        List<Option> options,
        List<String> answers,
        String payload
) {
    public ActivityQuestionSnapshot {
        options = List.copyOf(options == null ? List.of() : options);
        answers = List.copyOf(answers == null ? List.of() : answers);
    }

    public record Option(String key, String content, boolean correct) {}

    public ActivityQuestionSnapshot withoutPayload() {
        return new ActivityQuestionSnapshot(schemaVersion, contentRevision, type, content, explanation, hint,
                matchingMode, options, answers, null);
    }
}
