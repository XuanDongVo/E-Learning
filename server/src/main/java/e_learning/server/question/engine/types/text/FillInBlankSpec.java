package e_learning.server.question.engine.types.text;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;
import java.util.*;

public record FillInBlankSpec(QuestionSpec.QuestionCommon common, List<String> acceptedAnswers) implements QuestionSpec {
    public FillInBlankSpec { common = Objects.requireNonNull(common); acceptedAnswers = List.copyOf(acceptedAnswers == null ? List.of() : acceptedAnswers); }
    public QuestionType type() { return QuestionType.FILL_IN_BLANK; }
}
