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

    @Override
    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        DefinitionValidation common = common(spec);
        if (common != null) {
            return common;
        }

        MatchingSpec q = (MatchingSpec) spec;

        if (q.poolId() == null || q.poolId().isBlank() ||
                q.correctEntryId() == null || q.correctEntryId().isBlank()) {
            return DefinitionValidation.incomplete("matching.pool.required");
        }

        return DefinitionValidation.ready();
    }

    @Override
    public AnswerParseResult parseAndValidate(
            QuestionSpec spec,
            RawAnswer raw
    ) {
        requireType(spec);

        if (raw == null || !(raw.value() instanceof String entryId)) {
            return AnswerParseResult.invalid("answer.matching.required");
        }

        entryId = entryId.trim();

        if (entryId.isEmpty()) {
            return AnswerParseResult.invalid("answer.matching.required");
        }

        MatchingSpec q = (MatchingSpec) spec;
        if (q.poolId() == null || q.correctEntryId() == null) {
            return AnswerParseResult.invalid("question.matching.definition.incomplete");
        }

        // Chỉ xác nhận định dạng và tạo câu trả lời đã chuẩn hóa.
        // Kiểm tra entryId có thuộc Pool của q.poolId() hay không
        // cần được thực hiện ở tầng có thể truy cập Shared Content.
        return AnswerParseResult.valid(
                new ValidatedAnswer(
                        type(),
                        new MatchingAnswer(entryId)
                )
        );
    }

    @Override
    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        requireType(spec);

        MatchingSpec q = (MatchingSpec) spec;
        MatchingAnswer submitted = (MatchingAnswer) answer.value();

        String actual = submitted.entryId();
        boolean correct = actual.equals(q.correctEntryId());

        BigDecimal earned = correct ? BigDecimal.ONE : BigDecimal.ZERO;

        PartGrade part = new PartGrade(
                q.correctEntryId(),
                correct ? PartStatus.CORRECT : PartStatus.INCORRECT,
                earned,
                BigDecimal.ONE,
                Optional.of(new NormalizedAnswerValue(actual))
        );

        return new GradeResult(
                earned,
                List.of(part)
        );
    }
}
