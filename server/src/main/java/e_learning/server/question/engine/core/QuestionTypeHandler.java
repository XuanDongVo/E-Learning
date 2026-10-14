package e_learning.server.question.engine.core;

import e_learning.server.question.engine.model.AnswerParseResult;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.model.ValidatedAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.result.GradeResult;
import e_learning.server.question.enums.QuestionType;

public interface QuestionTypeHandler {
    QuestionType type();

    DefinitionValidation validateDefinition(QuestionSpec spec);

    AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer rawAnswer);

    GradeResult grade(QuestionSpec spec, ValidatedAnswer answer);
}
