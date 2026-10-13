package e_learning.server.question.engine;

import e_learning.server.question.enums.Difficulty;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class QuestionEngineTest {
    private final QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
            "Choose one", Difficulty.EASY, null, null, List.of());

    @Test
    void preservesExactSetMultipleChoiceScoring() {
        QuestionSpec spec = new MultipleChoiceSpec(common,
                List.of(new QuestionSpec.Choice("A", "A"), new QuestionSpec.Choice("B", "B")),
                Set.of("A", "B"));
        QuestionEngine engine = new QuestionEngine();
        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer(List.of("A"))).answer().orElseThrow();
        assertEquals(0, engine.grade(spec, answer).scoreFraction().signum());
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
    void registryRejectsMissingOrDuplicateHandlers() {
        assertThrows(IllegalArgumentException.class, () -> new QuestionTypeHandlerRegistry(List.of(new SingleChoiceHandler())));
        assertThrows(IllegalArgumentException.class, () -> new QuestionTypeHandlerRegistry(
                List.of(new SingleChoiceHandler(), new SingleChoiceHandler(), new MultipleChoiceHandler(),
                        new TrueFalseHandler(), new FillInBlankHandler(), new TypeAnswerHandler())));
    }
}
