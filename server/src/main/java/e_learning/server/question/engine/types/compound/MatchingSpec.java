package e_learning.server.question.engine.types.compound;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;

import java.util.*;

public record MatchingSpec(QuestionSpec.QuestionCommon common, String poolId,
                           String correctEntryId) implements QuestionSpec {

    public MatchingSpec {
        common = Objects.requireNonNull(common);

        poolId = Objects.requireNonNull(poolId).trim();
        if (poolId.isEmpty()) {
            throw new IllegalArgumentException("poolId must not be blank");
        }

        correctEntryId = Objects.requireNonNull(correctEntryId).trim();
        if (correctEntryId.isEmpty()) {
            throw new IllegalArgumentException("correctEntryId must not be blank");
        }
    }

    @Override
    public QuestionType type() {
        return QuestionType.MATCHING;
    }
}