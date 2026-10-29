package e_learning.server.question.engine.types.choice;

import e_learning.server.question.engine.core.AbstractQuestionTypeHandler;
import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.*;
import e_learning.server.question.enums.QuestionType;
import java.util.*;

public final class SingleChoiceHandler extends AbstractQuestionTypeHandler {
    public QuestionType type() { return QuestionType.SINGLE_CHOICE; }
    public DefinitionValidation validateDefinition(QuestionSpec s) {
        DefinitionValidation c = common(s); if (c != null) return c;
        if (!(s instanceof SingleChoiceSpec q) || q.choices().size() < 2) return DefinitionValidation.invalid("options.minimum");
        if (q.choices().stream().anyMatch(x -> x.content().isBlank())) return DefinitionValidation.incomplete("options.content.required");
        if (q.correctKey() == null || q.choices().stream().filter(x -> x.key().equals(q.correctKey())).count() != 1) return DefinitionValidation.incomplete("options.single_correct.required");
        return DefinitionValidation.ready();
    }
    public AnswerParseResult parseAndValidate(QuestionSpec s, RawAnswer raw) {
        requireType(s);
        if (raw == null || raw.unanswered()) return AnswerParseResult.unansweredResult();
        String v = text(raw.value());
        if (v.isBlank()) return AnswerParseResult.unansweredResult();
        SingleChoiceSpec q = (SingleChoiceSpec) s;
        if (q.choices().stream().noneMatch(c -> c.key().equalsIgnoreCase(v))) return AnswerParseResult.invalid("answer.option.invalid");
        return AnswerParseResult.valid(new ValidatedAnswer(type(), q.choices().stream().filter(c -> c.key().equalsIgnoreCase(v)).findFirst().orElseThrow().key()));
    }
    public GradeResult grade(QuestionSpec s, ValidatedAnswer a) {
        requireType(s); return gradeOne("answer", true, ((SingleChoiceSpec) s).correctKey().equalsIgnoreCase(text(a.value())), text(a.value()).toUpperCase(Locale.ROOT));
    }
}
