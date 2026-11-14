package e_learning.server.question.guided;

import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GuidedDefinitionValidationServiceTest {
    private final GuidedDefinitionValidationService service =
            new GuidedDefinitionValidationService(new QuestionEngine());

    @Test
    void draftAllowsZeroSteps() {
        assertTrue(service.validateDraftShape(new GuidedDefinitionPayload(null, List.of())).isEmpty());
    }

    @Test
    void readyRequiresACompleteSupportedFinalAndAtLeastOneStep() {
        Question finalQuestion = question(QuestionType.CLOZE, false);

        var issues = service.validateReady(finalQuestion, new GuidedDefinitionPayload(null, List.of()));

        assertEquals(List.of("question:final_question_incomplete", "question.type:final_type_unsupported",
                        "steps:minimum_one_required"),
                issues.stream().map(issue -> issue.path() + ":" + issue.code()).toList());
    }

    @Test
    void readyUsesQuestionEngineForEverySupportedStepType() {
        GuidedDefinitionPayload payload = new GuidedDefinitionPayload("Think before answering", List.of(
                new GuidedStepPayload("step-a", 0, QuestionType.SINGLE_CHOICE, "Choose one",
                        List.of(new GuidedChoicePayload("A", "Wrong"), new GuidedChoicePayload("B", "Right")),
                        "B", null, List.of(), MatchingMode.CASE_INSENSITIVE_TRIM, null, false, null, false),
                new GuidedStepPayload("step-b", 1, QuestionType.TRUE_FALSE, "True or false?",
                        List.of(), null, Boolean.TRUE, List.of(), MatchingMode.CASE_INSENSITIVE_TRIM,
                        null, false, null, true),
                new GuidedStepPayload("step-c", 2, QuestionType.TYPE_ANSWER, "Type the word",
                        List.of(), null, null, List.of("answer"), MatchingMode.CASE_INSENSITIVE_TRIM,
                        "Explanation", true, "A small clue", false)
        ));

        assertTrue(service.validateReady(question(QuestionType.TYPE_ANSWER, true), payload).isEmpty());
    }

    @Test
    void readyRejectsAnEnabledHintWithoutContent() {
        GuidedDefinitionPayload payload = new GuidedDefinitionPayload(null, List.of(
                new GuidedStepPayload("step-a", 0, QuestionType.TRUE_FALSE, "True or false?", List.of(),
                        null, Boolean.TRUE, List.of(), MatchingMode.CASE_INSENSITIVE_TRIM,
                        null, true, " ", false)
        ));

        assertTrue(service.validateReady(question(QuestionType.TRUE_FALSE, true), payload).stream()
                .anyMatch(issue -> issue.path().equals("steps[0].hint")
                        && issue.code().equals("required_when_hint_enabled")));
    }

    private Question question(QuestionType type, boolean complete) {
        return Question.builder().type(type).difficulty(Difficulty.EASY).content("Final question")
                .complete(complete).contentRevision(4L).build();
    }
}
