package e_learning.server.question.engine.types.ordering;

import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.enums.Difficulty;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderingHandlerTest {
    private final QuestionSpec.QuestionCommon common =
            new QuestionSpec.QuestionCommon("Order the words", Difficulty.EASY, null, null, List.of());
    private final QuestionEngine engine = new QuestionEngine();

    @Test
    void validatesAndGradesMultipleAcceptedOrders() {
        OrderingSpec spec = spec(
                List.of(item("a", "Today"), item("b", "we learn"), item("c", "English")),
                List.of(List.of("a", "b", "c"), List.of("a", "c", "b")));

        assertEquals(DefinitionValidation.Status.READY, engine.validateDefinition(spec).status());
        var accepted = engine.parseAndValidate(spec, new RawAnswer(List.of("a", "c", "b"))).answer().orElseThrow();
        var rejected = engine.parseAndValidate(spec, new RawAnswer(List.of("b", "a", "c"))).answer().orElseThrow();
        assertEquals(1, engine.grade(spec, accepted).scoreFraction().intValue());
        assertEquals(0, engine.grade(spec, rejected).scoreFraction().intValue());
    }

    @Test
    void treatsSwappedDuplicateVisibleItemsAsEquivalent() {
        OrderingSpec spec = spec(
                List.of(item("a", "very"), item("b", "very"), item("c", "good")),
                List.of(List.of("a", "b", "c")));
        var answer = engine.parseAndValidate(spec, new RawAnswer(List.of("b", "a", "c"))).answer().orElseThrow();
        assertEquals(1, engine.grade(spec, answer).scoreFraction().intValue());
    }

    @Test
    void rejectsMalformedPermutationWithoutCreatingAValidatedAnswer() {
        OrderingSpec spec = spec(
                List.of(item("a", "one"), item("b", "two"), item("c", "three")),
                List.of(List.of("a", "b", "c")));
        assertTrue(engine.parseAndValidate(spec, new RawAnswer(List.of("a", "a", "c"))).invalid());
        assertTrue(engine.parseAndValidate(spec, new RawAnswer(List.of("a", "b"))).invalid());
        assertTrue(engine.parseAndValidate(spec, new RawAnswer(List.of("a", "b", "unknown"))).invalid());
    }

    @Test
    void rejectsDefinitionWhenEveryVisiblePermutationIsAccepted() {
        OrderingSpec spec = spec(
                List.of(item("a", "same"), item("b", "same"), item("c", "same")),
                List.of(List.of("a", "b", "c")));
        DefinitionValidation validation = engine.validateDefinition(spec);
        assertFalse(validation.isReady());
        assertEquals(List.of("ordering.shuffle.no_valid_permutation"), validation.errors());
    }

    private OrderingSpec spec(List<OrderingSpec.Item> items, List<List<String>> orders) {
        return new OrderingSpec(common, 1, OrderingSubtype.PHRASE, items, orders);
    }

    private OrderingSpec.Item item(String key, String content) {
        return new OrderingSpec.Item(key, content);
    }
}
