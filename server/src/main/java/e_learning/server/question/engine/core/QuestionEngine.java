package e_learning.server.question.engine.core;

import e_learning.server.question.engine.model.AnswerParseResult;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.model.ValidatedAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.result.GradeResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
public final class QuestionEngine {
    private final QuestionTypeHandlerRegistry registry;

    public QuestionEngine(QuestionTypeHandlerRegistry registry) {
        this.registry = registry;
    }

    public QuestionEngine() {
        this(new QuestionTypeHandlerRegistry());
    }

    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        return registry.get(spec.type()).validateDefinition(spec);
    }

    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer raw) {
        return registry.get(spec.type()).parseAndValidate(spec, raw);
    }

    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        return registry.get(spec.type()).grade(spec, answer);
    }
}
