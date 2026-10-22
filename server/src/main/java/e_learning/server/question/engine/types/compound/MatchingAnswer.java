package e_learning.server.question.engine.types.compound;

import java.util.Map;
import java.util.Objects;

public record MatchingAnswer(String entryId) {
    public MatchingAnswer {
        entryId = Objects.requireNonNull(entryId, "entryId")
                .trim();

        if (entryId.isEmpty()) {
            throw new IllegalArgumentException(
                    "entryId must not be blank"
            );
        }
    }
}
