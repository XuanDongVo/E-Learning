package e_learning.server.question.engine.types.truefalse;

import e_learning.server.question.engine.core.AbstractQuestionTypeHandler;
import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.*;
import e_learning.server.question.enums.QuestionType;
import java.util.Locale;

public final class TrueFalseHandler extends AbstractQuestionTypeHandler {
    public QuestionType type() { return QuestionType.TRUE_FALSE; }
    public DefinitionValidation validateDefinition(QuestionSpec s) { DefinitionValidation c = common(s); if (c != null) return c; return ((TrueFalseSpec) s).expected() == null ? DefinitionValidation.incomplete("answers.true_false.required") : DefinitionValidation.ready(); }
    public AnswerParseResult parseAndValidate(QuestionSpec s, RawAnswer raw) { requireType(s); String v = text(raw == null ? null : raw.value()).toUpperCase(Locale.ROOT); if (!v.equals("TRUE") && !v.equals("FALSE")) return AnswerParseResult.invalid("answer.true_false.required"); return AnswerParseResult.valid(new ValidatedAnswer(type(), Boolean.valueOf(v))); }
    public GradeResult grade(QuestionSpec s, ValidatedAnswer a) { return gradeOne("answer", true, ((TrueFalseSpec) s).expected().equals(a.value()), String.valueOf(a.value())); }
}
