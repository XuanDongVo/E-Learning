package e_learning.server.question.engine.types.compound;

import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.*;
import e_learning.server.question.enums.Difficulty;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CompoundQuestionHandlerTest {
    private final QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon("Complete", Difficulty.EASY, null, null, List.of());

    @Test
    void matchingGradesEachPairWithEqualWeight() {
        MatchingSpec spec = new MatchingSpec(common, List.of(new MatchingSpec.Item("one", "One"), new MatchingSpec.Item("two", "Two")), List.of("A", "B"), Map.of("one", "A", "two", "B"));
        QuestionEngine engine = new QuestionEngine();
        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer(Map.of("one", "A", "two", "wrong"))).answer().orElseThrow();
        GradeResult result = engine.grade(spec, answer);
        assertEquals(2, result.parts().size());
        assertEquals(0.5, result.scoreFraction().doubleValue(), 0.0001);
        assertEquals(PartStatus.INCORRECT, result.parts().get(1).status());
    }

    @Test
    void clozeNormalizesAndGradesBlankParts() {
        ClozeSpec spec = new ClozeSpec(common, List.of(new ClozeSpec.Segment("I ____ it.")), List.of(new ClozeSpec.Blank("b1", List.of("like")), new ClozeSpec.Blank("b2", List.of("English"))));
        QuestionEngine engine = new QuestionEngine();
        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer(Map.of("b1", " LIKE ", "b2", "no"))).answer().orElseThrow();
        GradeResult result = engine.grade(spec, answer);
        assertEquals(0.5, result.scoreFraction().doubleValue(), 0.0001);
        assertEquals("like", result.parts().get(0).normalizedSubmittedValue().orElseThrow().value());
    }

    @Test
    void compoundHandlersAreRegisteredAsFirstClassTypes() {
        assertEquals(7, e_learning.server.question.enums.QuestionType.values().length);
        assertNotNull(new MatchingHandler());
        assertNotNull(new ClozeHandler());
    }
}
