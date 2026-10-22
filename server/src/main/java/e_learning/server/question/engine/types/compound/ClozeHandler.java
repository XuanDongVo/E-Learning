package e_learning.server.question.engine.types.compound;

import e_learning.server.question.engine.core.AbstractQuestionTypeHandler;
import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.*;
import e_learning.server.question.enums.QuestionType;
import java.math.BigDecimal;
import java.util.*;

public final class ClozeHandler extends AbstractQuestionTypeHandler {
    public QuestionType type() { return QuestionType.CLOZE; }
    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        DefinitionValidation common = common(spec); if (common != null) return common; ClozeSpec q = (ClozeSpec) spec;
        if (q.segments().isEmpty() || q.blanks().isEmpty()) return DefinitionValidation.incomplete("cloze.blanks.required");
        if (q.segments().size() != q.blanks().size() + 1) return DefinitionValidation.incomplete("cloze.segments.invalid");
        Set<String> keys = new HashSet<>();
        if (q.blanks().stream().anyMatch(b -> b.key().isBlank() || !keys.add(b.key()) || b.acceptedAnswers().stream().noneMatch(v -> v != null && !v.isBlank()))) return DefinitionValidation.incomplete("cloze.blank.invalid");
        return DefinitionValidation.ready();
    }
    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer raw) {
        requireType(spec); if (raw == null || !(raw.value() instanceof Map<?, ?> input)) return AnswerParseResult.invalid("answer.cloze.required");
        Map<String, String> values = new LinkedHashMap<>();
        for (var entry : input.entrySet()) { if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof String value)) return AnswerParseResult.invalid("answer.cloze.invalid"); values.put(key.trim(), value.trim()); }
        Set<String> keys = ((ClozeSpec) spec).blanks().stream().map(ClozeSpec.Blank::key).collect(java.util.stream.Collectors.toSet());
        if (!keys.containsAll(values.keySet())) return AnswerParseResult.invalid("answer.cloze.invalid");
        return AnswerParseResult.valid(new ValidatedAnswer(type(), new ClozeAnswer(values)));
    }
    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        ClozeSpec q = (ClozeSpec) spec; ClozeAnswer submitted = (ClozeAnswer) answer.value(); int total = q.blanks().size(); List<PartGrade> parts = new ArrayList<>(); BigDecimal base = BigDecimal.ONE.divide(BigDecimal.valueOf(total), 12, java.math.RoundingMode.DOWN);
        for (int index = 0; index < q.blanks().size(); index++) { var blank = q.blanks().get(index); String actual = submitted.values().get(blank.key()); boolean present = actual != null && !actual.isBlank(); boolean correct = present && blank.acceptedAnswers().stream().anyMatch(v -> q.caseSensitive() ? v.trim().equals(actual.trim()) : v.trim().equalsIgnoreCase(actual.trim())); BigDecimal weight = index == total - 1 ? BigDecimal.ONE.subtract(base.multiply(BigDecimal.valueOf(total - 1))) : base; parts.add(new PartGrade(blank.key(), !present ? PartStatus.UNANSWERED : correct ? PartStatus.CORRECT : PartStatus.INCORRECT, correct ? weight : BigDecimal.ZERO, weight, present ? Optional.of(new NormalizedAnswerValue(q.caseSensitive() ? actual.trim() : actual.trim().toLowerCase(Locale.ROOT))) : Optional.empty())); }
        return new GradeResult(parts.stream().map(PartGrade::earnedWeight).reduce(BigDecimal.ZERO, BigDecimal::add), parts);
    }
}
