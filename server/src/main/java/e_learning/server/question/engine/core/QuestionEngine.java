package e_learning.server.question.engine.core;

import e_learning.server.question.engine.exception.QuestionEngineException;
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

    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        Objects.requireNonNull(spec, "spec");
        Objects.requireNonNull(spec.type(), "spec.type");
        return registry.get(spec.type()).validateDefinition(spec);
    }

    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer raw) {
        Objects.requireNonNull(spec, "spec");
        Objects.requireNonNull(spec.type(), "spec.type");
        return registry.get(spec.type()).parseAndValidate(spec, raw);
    }

    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        Objects.requireNonNull(spec, "spec");
        Objects.requireNonNull(answer, "answer");
        if (spec.type() == null || answer.type() != spec.type()) {
            throw new QuestionEngineException("Validated answer type must match question type");
        }
        return registry.get(spec.type()).grade(spec, answer);
    }
}
