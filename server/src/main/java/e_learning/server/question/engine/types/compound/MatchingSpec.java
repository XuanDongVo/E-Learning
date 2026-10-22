package e_learning.server.question.engine.types.compound;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;

import java.util.*;

public record MatchingSpec(QuestionSpec.QuestionCommon common, String poolId,
                           String correctEntryId) implements QuestionSpec {

    public MatchingSpec {
        common = Objects.requireNonNull(common);

        poolId = poolId == null || poolId.isBlank() ? null : poolId.trim();
        correctEntryId = correctEntryId == null || correctEntryId.isBlank() ? null : correctEntryId.trim();
    }

    @Override
    public QuestionType type() {
        return QuestionType.MATCHING;
    }
}