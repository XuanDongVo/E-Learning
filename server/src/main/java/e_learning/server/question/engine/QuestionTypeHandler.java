package e_learning.server.question.engine;

import e_learning.server.question.enums.QuestionType;

public interface QuestionTypeHandler {
    QuestionType type();
    DefinitionValidation validateDefinition(QuestionSpec spec);
    AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer rawAnswer);
    GradeResult grade(QuestionSpec spec, ValidatedAnswer answer);
}
