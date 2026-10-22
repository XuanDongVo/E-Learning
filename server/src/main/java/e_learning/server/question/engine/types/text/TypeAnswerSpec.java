package e_learning.server.question.engine.types.text;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;

import java.util.*;

public record TypeAnswerSpec(QuestionSpec.QuestionCommon common, List<String> acceptedAnswers,
                             MatchingMode matchingMode) implements QuestionSpec {
    public TypeAnswerSpec {
        common = Objects.requireNonNull(common);
        acceptedAnswers = List.copyOf(acceptedAnswers == null ? List.of() : acceptedAnswers);
        matchingMode = matchingMode == null ? MatchingMode.CASE_INSENSITIVE_TRIM : matchingMode;
    }

    public QuestionType type() {
        return QuestionType.TYPE_ANSWER;
    }
}
