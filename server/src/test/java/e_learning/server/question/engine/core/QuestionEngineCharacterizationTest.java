package e_learning.server.question.engine.core;

import e_learning.server.question.engine.exception.QuestionEngineException;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.model.ValidatedAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.result.GradeResult;
import e_learning.server.question.engine.result.PartStatus;
import e_learning.server.question.engine.types.choice.MultipleChoiceSpec;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class QuestionEngineCharacterizationTest {
    private final QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon("Question text", Difficulty.EASY, null, null, List.of());
    private final QuestionEngine engine = new QuestionEngine();

    @Test
    void singleChoiceAwardsCreditOnlyForTheCorrectOption() {
        QuestionSpec spec = new SingleChoiceSpec(common, List.of(new QuestionSpec.Choice("A", "Alpha"), new QuestionSpec.Choice("B", "Beta")), "A");
        GradeResult correct = engine.grade(spec, engine.parseAndValidate(spec, new RawAnswer("A")).answer().orElseThrow());
        GradeResult incorrect = engine.grade(spec, engine.parseAndValidate(spec, new RawAnswer("B")).answer().orElseThrow());
        assertEquals(1, correct.scoreFraction().intValue());
        assertEquals(PartStatus.CORRECT, correct.parts().get(0).status());
        assertEquals(0, incorrect.scoreFraction().signum());
        assertEquals(PartStatus.INCORRECT, incorrect.parts().get(0).status());
    }

    @Test
    void singleChoiceRejectsUnknownOptionKeys() {
        QuestionSpec spec = new SingleChoiceSpec(common, List.of(new QuestionSpec.Choice("A", "Alpha"), new QuestionSpec.Choice("B", "Beta")), "A");
        assertFalse(engine.parseAndValidate(spec, new RawAnswer("Z")).valid());
    }

    @Test
    void multipleChoiceRetainsExactSetAllOrNothingScoring() {
        QuestionSpec spec = new MultipleChoiceSpec(common, List.of(new QuestionSpec.Choice("A", "Alpha"), new QuestionSpec.Choice("B", "Beta"), new QuestionSpec.Choice("C", "Gamma")), Set.of("A", "B"));
        GradeResult partial = engine.grade(spec, engine.parseAndValidate(spec, new RawAnswer(List.of("A"))).answer().orElseThrow());
        GradeResult exact = engine.grade(spec, engine.parseAndValidate(spec, new RawAnswer(List.of("A", "B"))).answer().orElseThrow());
        assertEquals(0, partial.scoreFraction().signum());
        assertEquals(1, exact.scoreFraction().intValue());
    }

    @Test
    void trueFalseAcceptsOnlyBooleanTokensAndGradesBothOutcomes() {
        QuestionSpec spec = new TrueFalseSpec(common, true);
        ValidatedAnswer correctAnswer = engine.parseAndValidate(spec, new RawAnswer(" true ")).answer().orElseThrow();
        ValidatedAnswer incorrectAnswer = engine.parseAndValidate(spec, new RawAnswer("FALSE")).answer().orElseThrow();
        assertEquals(1, engine.grade(spec, correctAnswer).scoreFraction().intValue());
        assertEquals(0, engine.grade(spec, incorrectAnswer).scoreFraction().signum());
        assertFalse(engine.parseAndValidate(spec, new RawAnswer("yes")).valid());
    }

    @Test
    void fillInBlankPreservesLegacyMarkerAndAcceptedAlternativeSemantics() {
        QuestionSpec spec = new FillInBlankSpec(new QuestionSpec.QuestionCommon("The capital is ____.", Difficulty.EASY, null, null, List.of()), List.of("Paris", "City of Paris"), MatchingMode.CASE_INSENSITIVE_TRIM);
        assertEquals(DefinitionValidation.Status.READY, engine.validateDefinition(spec).status());
        ValidatedAnswer alternative = engine.parseAndValidate(spec, new RawAnswer(" city of paris ")).answer().orElseThrow();
        assertEquals(1, engine.grade(spec, alternative).scoreFraction().intValue());
        QuestionSpec missingMarker = new FillInBlankSpec(common, List.of("Paris"), MatchingMode.CASE_INSENSITIVE_TRIM);
        assertEquals(DefinitionValidation.Status.INVALID, engine.validateDefinition(missingMarker).status());
    }

    @Test
    void typeAnswerKeepsTrimAndCaseInsensitiveMatching() {
        QuestionSpec spec = new TypeAnswerSpec(common, List.of("London"), MatchingMode.CASE_INSENSITIVE_TRIM);
        ValidatedAnswer answer = engine.parseAndValidate(spec, new RawAnswer("  LONDON ")).answer().orElseThrow();
        assertEquals(1, engine.grade(spec, answer).scoreFraction().intValue());
        assertFalse(engine.parseAndValidate(spec, new RawAnswer("   ")).valid());
    }

    @Test
    void gradingRejectsValidatedAnswerFromAnotherQuestionType() {
        QuestionSpec spec = new SingleChoiceSpec(common, List.of(new QuestionSpec.Choice("A", "Alpha"), new QuestionSpec.Choice("B", "Beta")), "A");
        ValidatedAnswer wrongType = new ValidatedAnswer(QuestionType.TRUE_FALSE, Boolean.TRUE);
        assertThrows(QuestionEngineException.class, () -> engine.grade(spec, wrongType));
    }

    @Test
    void definitionValidationDistinguishesIncompleteFromInvalid() {
        QuestionSpec incomplete = new SingleChoiceSpec(common, List.of(new QuestionSpec.Choice("A", "Alpha"), new QuestionSpec.Choice("B", "Beta")), null);
        QuestionSpec invalid = new FillInBlankSpec(common, List.of("answer"), MatchingMode.CASE_INSENSITIVE_TRIM);
        assertEquals(DefinitionValidation.Status.INCOMPLETE, engine.validateDefinition(incomplete).status());
        assertEquals(DefinitionValidation.Status.INVALID, engine.validateDefinition(invalid).status());
        assertEquals(7, QuestionType.values().length);
    }
}
