package e_learning.server.question.engine.types.choice;

import e_learning.server.question.engine.core.AbstractQuestionTypeHandler;
import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.*;
import e_learning.server.question.enums.QuestionType;
import java.util.*;
import java.util.stream.Collectors;

public final class MultipleChoiceHandler extends AbstractQuestionTypeHandler {
    public QuestionType type() { return QuestionType.MULTIPLE_CHOICE; }
    public DefinitionValidation validateDefinition(QuestionSpec s) {
        DefinitionValidation c = common(s); if (c != null) return c; MultipleChoiceSpec q = (MultipleChoiceSpec) s;
        if (q.choices().size() < 2) return DefinitionValidation.invalid("options.minimum");
        if (q.choices().stream().anyMatch(x -> x.content().isBlank())) return DefinitionValidation.incomplete("options.content.required");
        if (q.correctKeys().isEmpty()) return DefinitionValidation.incomplete("options.multiple_correct.required");
        return DefinitionValidation.ready();
    }
    public AnswerParseResult parseAndValidate(QuestionSpec s, RawAnswer raw) {
        requireType(s); if (raw == null || !(raw.value() instanceof List<?> list) || list.isEmpty()) return AnswerParseResult.invalid("answer.options.required");
        List<String> values = list.stream().map(this::text).map(String::toUpperCase).toList();
        Set<String> keys = ((MultipleChoiceSpec) s).choices().stream().map(QuestionSpec.Choice::key).map(String::toUpperCase).collect(Collectors.toSet());
        if (values.stream().anyMatch(v -> v.isBlank() || !keys.contains(v))) return AnswerParseResult.invalid("answer.option.invalid");
        if (new HashSet<>(values).size() != values.size()) return AnswerParseResult.invalid("answer.option.duplicate");
        return AnswerParseResult.valid(new ValidatedAnswer(type(), List.copyOf(values)));
    }
    public GradeResult grade(QuestionSpec s, ValidatedAnswer a) {
        Set<String> actual = ((List<?>) a.value()).stream().map(this::text).map(String::toUpperCase).collect(Collectors.toSet());
        Set<String> expected = ((MultipleChoiceSpec) s).correctKeys().stream().map(String::toUpperCase).collect(Collectors.toSet());
        return gradeOne("answer", true, actual.equals(expected), String.join(",", actual.stream().sorted().toList()));
    }
}
