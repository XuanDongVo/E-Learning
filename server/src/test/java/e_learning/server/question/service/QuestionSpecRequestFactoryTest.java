package e_learning.server.question.service;

import e_learning.server.question.dto.QuestionAnswerRequest;
import e_learning.server.question.dto.QuestionWriteRequest;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.enums.QuestionType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QuestionSpecRequestFactoryTest {
    private final QuestionSpecRequestFactory factory = new QuestionSpecRequestFactory();
    private final QuestionEngine engine = new QuestionEngine();

    @Test
    void invalidTrueFalseTokenDoesNotSilentlyBecomeFalse() {
        QuestionWriteRequest request = new QuestionWriteRequest();
        request.setType(QuestionType.TRUE_FALSE);
        request.setContent("The statement is true.");
        request.setAnswers(List.of(answer("yes")));

        TrueFalseSpec spec = (TrueFalseSpec) factory.toSpec(request);

        assertNull(spec.expected());
        assertEquals(DefinitionValidation.Status.INCOMPLETE, engine.validateDefinition(spec).status());
    }

    @Test
    void validFalseTokenRemainsFalse() {
        QuestionWriteRequest request = new QuestionWriteRequest();
        request.setType(QuestionType.TRUE_FALSE);
        request.setContent("The statement is false.");
        request.setAnswers(List.of(answer("FALSE")));

        TrueFalseSpec spec = (TrueFalseSpec) factory.toSpec(request);

        assertEquals(Boolean.FALSE, spec.expected());
        assertEquals(DefinitionValidation.Status.READY, engine.validateDefinition(spec).status());
    }

    private QuestionAnswerRequest answer(String rawValue) {
        QuestionAnswerRequest answer = new QuestionAnswerRequest();
        answer.setRawValue(rawValue);
        return answer;
    }
}
