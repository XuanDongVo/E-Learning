package e_learning.server.question.engine.types.compound;

import e_learning.server.question.engine.core.AbstractQuestionTypeHandler;
import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.*;
import e_learning.server.question.enums.QuestionType;

import java.math.BigDecimal;
import java.util.*;

public final class MatchingHandler extends AbstractQuestionTypeHandler {
    public QuestionType type() {
        return QuestionType.MATCHING;
    }

    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        DefinitionValidation common = common(spec);
        if (common != null) return common;
        MatchingSpec q = (MatchingSpec) spec;
        if (q.items().isEmpty() || q.answerPool().isEmpty())
            return DefinitionValidation.incomplete("matching.items.required");
        if (q.items().stream().anyMatch(i -> i.key().isBlank() || i.prompt().isBlank()))
            return DefinitionValidation.invalid("matching.item.invalid");
        if (q.expectedPairs().size() != q.items().size() || q.items().stream().anyMatch(i -> !q.expectedPairs().containsKey(i.key()) || !q.answerPool().contains(q.expectedPairs().get(i.key()))))
            return DefinitionValidation.incomplete("matching.pairs.required");
        return DefinitionValidation.ready();
    }

    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer raw) {
        requireType(spec);
        if (raw == null || !(raw.value() instanceof Map<?, ?> input))
            return AnswerParseResult.invalid("answer.matching.required");
        Map<String, String> pairs = new LinkedHashMap<>();
        for (var entry : input.entrySet()) {
            if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof String value))
                return AnswerParseResult.invalid("answer.matching.invalid");
            pairs.put(key.trim(), value.trim());
        }
        MatchingSpec q = (MatchingSpec) spec;
        if (!pairs.keySet().stream().allMatch(q.expectedPairs()::containsKey) || pairs.values().stream().anyMatch(v -> !q.answerPool().contains(v)))
            return AnswerParseResult.invalid("answer.matching.invalid");
        return AnswerParseResult.valid(new ValidatedAnswer(type(), new MatchingAnswer(pairs)));
    }

    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        MatchingSpec q = (MatchingSpec) spec;
        MatchingAnswer submitted = (MatchingAnswer) answer.value();
        int total = q.items().size();
        List<PartGrade> parts = new ArrayList<>();
        BigDecimal base = BigDecimal.ONE.divide(BigDecimal.valueOf(total), 12, java.math.RoundingMode.DOWN);
        for (int index = 0; index < q.items().size(); index++) {
            var item = q.items().get(index);
            String actual = submitted.pairs().get(item.key());
            boolean present = actual != null;
            boolean correct = present && actual.equals(q.expectedPairs().get(item.key()));
            BigDecimal weight = index == total - 1 ? BigDecimal.ONE.subtract(base.multiply(BigDecimal.valueOf(total - 1))) : base;
            parts.add(new PartGrade(item.key(), !present ? PartStatus.UNANSWERED : correct ? PartStatus.CORRECT : PartStatus.INCORRECT, correct ? weight : BigDecimal.ZERO, weight, present ? Optional.of(new NormalizedAnswerValue(actual)) : Optional.empty()));
        }
        return new GradeResult(parts.stream().map(PartGrade::earnedWeight).reduce(BigDecimal.ZERO, BigDecimal::add), parts);
    }
}
