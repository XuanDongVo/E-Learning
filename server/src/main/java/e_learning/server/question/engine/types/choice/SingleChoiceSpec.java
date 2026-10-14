package e_learning.server.question.engine.types.choice;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;

import java.util.List;
import java.util.Objects;

public record SingleChoiceSpec(QuestionSpec.QuestionCommon common, List<QuestionSpec.Choice> choices,
                               String correctKey) implements QuestionSpec {
    public SingleChoiceSpec {
        common = Objects.requireNonNull(common);
        choices = List.copyOf(choices == null ? List.of() : choices);
        correctKey = correctKey == null ? null : correctKey.trim();
    }

    public QuestionType type() {
        return QuestionType.SINGLE_CHOICE;
    }
}
