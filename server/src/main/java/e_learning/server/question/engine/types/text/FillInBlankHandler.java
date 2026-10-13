package e_learning.server.question.engine.types.text;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.enums.QuestionType;
import java.util.List;

public final class FillInBlankHandler extends TextAnswerHandler {
    public QuestionType type() { return QuestionType.FILL_IN_BLANK; }
    protected List<String> accepted(QuestionSpec s) { return ((FillInBlankSpec) s).acceptedAnswers(); }
    protected MatchingMode mode(QuestionSpec s) { return MatchingMode.CASE_INSENSITIVE_TRIM; }
    public DefinitionValidation validateDefinition(QuestionSpec s) { DefinitionValidation c = common(s); if (c != null) return c; if (!s.content().contains("____")) return DefinitionValidation.invalid("content.blank_marker.required"); return super.validateDefinition(s); }
}
