package e_learning.server.question.engine;

import e_learning.server.question.enums.QuestionType;
import java.util.Objects;

public record TrueFalseSpec(QuestionSpec.QuestionCommon common, Boolean expected) implements QuestionSpec {
    public TrueFalseSpec { common = Objects.requireNonNull(common); }
    public QuestionType type() { return QuestionType.TRUE_FALSE; }
}
