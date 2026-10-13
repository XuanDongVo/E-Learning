package e_learning.server.question.engine.types.text;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;
import java.util.List;

public final class TypeAnswerHandler extends TextAnswerHandler {
    public QuestionType type() { return QuestionType.TYPE_ANSWER; }
    protected List<String> accepted(QuestionSpec s) { return ((TypeAnswerSpec) s).acceptedAnswers(); }
    protected MatchingMode mode(QuestionSpec s) { return ((TypeAnswerSpec) s).matchingMode(); }
}
