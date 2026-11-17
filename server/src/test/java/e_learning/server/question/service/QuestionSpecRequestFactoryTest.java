package e_learning.server.question.service;

import e_learning.server.question.dto.request.QuestionAnswerRequest;
import e_learning.server.question.dto.request.QuestionWriteRequest;
import e_learning.server.question.dto.request.QuestionDefinitionRequest;
import e_learning.server.question.dto.request.ordering.OrderingDefinitionRequest;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.engine.types.ordering.OrderingSpec;
import e_learning.server.question.engine.types.ordering.OrderingSubtype;
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

    @Test
    void fillInBlankUsesExplicitMatchingModeFromRequest() {
        QuestionWriteRequest request = textRequest(QuestionType.FILL_IN_BLANK);
        request.setMatchingMode(MatchingMode.CASE_SENSITIVE_TRIM);

        FillInBlankSpec spec = (FillInBlankSpec) factory.toSpec(request);

        assertEquals(MatchingMode.CASE_SENSITIVE_TRIM, spec.matchingMode());
    }

    @Test
    void typeAnswerUsesExplicitMatchingModeFromRequest() {
        QuestionWriteRequest request = textRequest(QuestionType.TYPE_ANSWER);
        request.setMatchingMode(MatchingMode.CASE_SENSITIVE_TRIM);

        TypeAnswerSpec spec = (TypeAnswerSpec) factory.toSpec(request);

        assertEquals(MatchingMode.CASE_SENSITIVE_TRIM, spec.matchingMode());
    }

    @Test
    void mapsOrderingDefinitionWithoutLosingStableKeysOrOrder() {
        QuestionWriteRequest request = new QuestionWriteRequest();
        request.setType(QuestionType.ORDERING);
        request.setContent("Order the words");
        OrderingDefinitionRequest ordering = new OrderingDefinitionRequest();
        ordering.setSchemaVersion(1);
        ordering.setSubtype(OrderingSubtype.WORD);
        ordering.setItems(List.of(item("w1", "She"), item("w2", "learns"), item("w3", "English")));
        ordering.setAcceptedOrders(List.of(List.of("w1", "w2", "w3")));
        QuestionDefinitionRequest definition = new QuestionDefinitionRequest();
        definition.setOrdering(ordering);
        request.setDefinition(definition);

        OrderingSpec spec = (OrderingSpec) factory.toSpec(request);

        assertEquals(List.of("w1", "w2", "w3"), spec.items().stream().map(OrderingSpec.Item::key).toList());
        assertEquals(List.of(List.of("w1", "w2", "w3")), spec.acceptedOrders());
        assertEquals(DefinitionValidation.Status.READY, engine.validateDefinition(spec).status());
    }

    private OrderingDefinitionRequest.Item item(String key, String content) {
        OrderingDefinitionRequest.Item item = new OrderingDefinitionRequest.Item();
        item.setKey(key);
        item.setContent(content);
        return item;
    }

    private QuestionWriteRequest textRequest(QuestionType type) {
        QuestionWriteRequest request = new QuestionWriteRequest();
        request.setType(type);
        request.setContent("Answer the question");
        request.setAnswers(List.of(answer("Answer")));
        return request;
    }

    private QuestionAnswerRequest answer(String rawValue) {
        QuestionAnswerRequest answer = new QuestionAnswerRequest();
        answer.setRawValue(rawValue);
        return answer;
    }
}
