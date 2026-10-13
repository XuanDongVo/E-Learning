package e_learning.server.question.engine;

import e_learning.server.question.enums.QuestionType;
import java.util.*;

public record MultipleChoiceSpec(QuestionSpec.QuestionCommon common, List<QuestionSpec.Choice> choices,
                                 Set<String> correctKeys) implements QuestionSpec {
    public MultipleChoiceSpec {
        common = Objects.requireNonNull(common);
        choices = List.copyOf(choices == null ? List.of() : choices);
        correctKeys = Set.copyOf(correctKeys == null ? Set.of() : correctKeys.stream().map(String::trim).toList());
    }
    public QuestionType type() { return QuestionType.MULTIPLE_CHOICE; }
}
