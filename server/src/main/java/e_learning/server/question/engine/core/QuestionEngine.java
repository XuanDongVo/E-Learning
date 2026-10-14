package e_learning.server.question.engine.core;

import e_learning.server.question.engine.model.AnswerParseResult;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.model.ValidatedAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.result.GradeResult;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public final class QuestionEngine {
    private final QuestionTypeHandlerRegistry registry;

    public QuestionEngine(QuestionTypeHandlerRegistry registry) {
        this.registry = Objects.requireNonNull(registry, "registry");
    }

    public QuestionEngine() {
        this(new QuestionTypeHandlerRegistry());
    }

    /**
     * Validates authored content without treating incomplete-but-saveable drafts as invalid.
     */
    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        Objects.requireNonNull(spec, "spec");
        Objects.requireNonNull(spec.type(), "spec.type");
        return registry.get(spec.type()).validateDefinition(spec);
    }

    /**
     * Converts untrusted boundary input into a type-specific validated answer.
     */
    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer raw) {
        Objects.requireNonNull(spec, "spec");
        Objects.requireNonNull(spec.type(), "spec.type");
        return registry.get(spec.type()).parseAndValidate(spec, raw);
    }

    /**
     * Grades only answers validated for the same canonical question type.
     * This prevents callers from bypassing parseAndValidate and feeding a
     * structurally valid answer for a different question type to a handler.
     */
    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        Objects.requireNonNull(spec, "spec");
        Objects.requireNonNull(answer, "answer");
        if (spec.type() == null || answer.type() != spec.type()) {
            throw new IllegalArgumentException("Validated answer type must match question type");
        }
        return registry.get(spec.type()).grade(spec, answer);
    }
}
