package e_learning.server.question.engine.types.compound;

import e_learning.server.question.engine.exception.QuestionEngineException;

import java.util.Objects;

public record MatchingAnswer(String entryId) {
    public MatchingAnswer {
        entryId = Objects.requireNonNull(entryId, "entryId").trim();
        if (entryId.isEmpty()) throw new QuestionEngineException("entryId must not be blank");
    }
}
