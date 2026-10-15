package e_learning.server.question.engine.core;

import e_learning.server.question.engine.model.*;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.types.choice.*;
import e_learning.server.question.engine.types.text.*;
import e_learning.server.question.engine.types.truefalse.TrueFalseHandler;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class QuestionEngineTest {
    private final QuestionSpec.QuestionCommon common =
            new QuestionSpec.QuestionCommon("Choose one", Difficulty.EASY, null, null, List.of());

    @Test
    void gradesSingleChoiceUsingCanonicalOptionKey() {
        QuestionSpec spec = new SingleChoiceSpec(common,
                List.of(new QuestionSpec.Choice("A", "First"), new QuestionSpec.Choice("B", "Second")), "B");
        QuestionEngine engine = new QuestionEngine();

        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer("b")).answer().orElseThrow();

        assertEquals("B", answer.value());
        assertEquals(1, engine.grade(spec, answer).scoreFraction().intValue());
    }

    @Test
    void preservesExactSetMultipleChoiceScoring() {
        QuestionSpec spec = new MultipleChoiceSpec(common,
                List.of(new QuestionSpec.Choice("A", "A"), new QuestionSpec.Choice("B", "B")), Set.of("A", "B"));
        QuestionEngine engine = new QuestionEngine();

        ValidatedAnswer partial = engine.parseAndValidate(spec, new RawAnswer(List.of("A"))).answer().orElseThrow();
        ValidatedAnswer exact = engine.parseAndValidate(spec, new RawAnswer(List.of("A", "B"))).answer().orElseThrow();

        assertEquals(0, engine.grade(spec, partial).scoreFraction().signum());
        assertEquals(1, engine.grade(spec, exact).scoreFraction().intValue());
    }

    @Test
    void gradesTrueFalseAsItsOwnCanonicalType() {
        QuestionSpec spec = new TrueFalseSpec(common, Boolean.TRUE);
        QuestionEngine engine = new QuestionEngine();

        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer("true")).answer().orElseThrow();

        assertEquals(QuestionType.TRUE_FALSE, answer.type());
        assertEquals(Boolean.TRUE, answer.value());
        assertEquals(1, engine.grade(spec, answer).scoreFraction().intValue());
    }

    @Test
    void normalizesTextAnswersByTrimAndCase() {
        QuestionSpec spec = new TypeAnswerSpec(common, List.of("London"), MatchingMode.CASE_INSENSITIVE_TRIM);
        QuestionEngine engine = new QuestionEngine();

        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer("  LONDON ")).answer().orElseThrow();

        assertEquals(1, engine.grade(spec, answer).scoreFraction().intValue());
    }

    @Test
    void fillInBlankRequiresItsLegacyMarker() {
        QuestionSpec spec = new FillInBlankSpec(common, List.of("answer"));
        assertEquals(DefinitionValidation.Status.INVALID, new QuestionEngine().validateDefinition(spec).status());
    }

    @Test
    void rejectsAnswerThatWasValidatedForAnotherQuestionType() {
        QuestionSpec spec = new SingleChoiceSpec(common,
                List.of(new QuestionSpec.Choice("A", "First"), new QuestionSpec.Choice("B", "Second")), "B");
        ValidatedAnswer wrongType = new ValidatedAnswer(QuestionType.TRUE_FALSE, Boolean.TRUE);

        assertThrows(IllegalArgumentException.class, () -> new QuestionEngine().grade(spec, wrongType));
    }

    @Test
    void rejectsMissingOrDuplicateHandlers() {
        assertThrows(IllegalArgumentException.class,
                () -> new QuestionTypeHandlerRegistry(List.of(new SingleChoiceHandler())));
        assertThrows(IllegalArgumentException.class,
                () -> new QuestionTypeHandlerRegistry(List.of(
                        new SingleChoiceHandler(), new SingleChoiceHandler(), new MultipleChoiceHandler(),
                        new TrueFalseHandler(), new FillInBlankHandler(), new TypeAnswerHandler())));
    }
}
