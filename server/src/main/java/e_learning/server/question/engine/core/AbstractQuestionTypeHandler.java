package e_learning.server.question.engine.core;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.engine.result.*;

import java.math.BigDecimal;
import java.util.Locale;

abstract class AbstractQuestionTypeHandler implements QuestionTypeHandler {
    protected void requireType(QuestionSpec spec) {
        if (spec == null || spec.type() != type()) throw new IllegalArgumentException("Unexpected question type");
    }
    protected DefinitionValidation common(QuestionSpec spec) {
        requireType(spec);
        if (spec.content().isBlank()) return DefinitionValidation.incomplete("content.required");
        return null;
    }
    protected GradeResult gradeOne(String key, boolean answered, boolean correct, String normalized) {
        PartStatus status = !answered ? PartStatus.UNANSWERED : correct ? PartStatus.CORRECT : PartStatus.INCORRECT;
        BigDecimal earned = correct ? BigDecimal.ONE : BigDecimal.ZERO;
        return new GradeResult(earned, java.util.List.of(new PartGrade(key, status, earned, BigDecimal.ONE,
                answered ? java.util.Optional.of(new NormalizedAnswerValue(normalized)) : java.util.Optional.empty())));
    }
    protected String text(Object value) { return value instanceof String s ? s.trim() : value == null ? "" : String.valueOf(value).trim(); }
    protected String normalize(String value, e_learning.server.question.engine.types.text.MatchingMode mode) {
        String result = value.trim();
        return mode == e_learning.server.question.engine.types.text.MatchingMode.CASE_INSENSITIVE_TRIM ? result.toLowerCase(Locale.ROOT) : result;
    }
}
