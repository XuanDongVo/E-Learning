package e_learning.server.question.guided;

import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.dto.GuidedDefinitionIssue;
import org.springframework.stereotype.Service;

import java.util.*;

/** Keeps Guided validation close to the canonical QuestionEngine instead of introducing a second grader. */
@Service
public class GuidedDefinitionValidationService {
    private static final Set<QuestionType> SUPPORTED_STEP_TYPES = EnumSet.of(
            QuestionType.SINGLE_CHOICE, QuestionType.TRUE_FALSE, QuestionType.TYPE_ANSWER);
    private static final Set<QuestionType> SUPPORTED_FINAL_TYPES = EnumSet.of(
            QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE,
            QuestionType.FILL_IN_BLANK, QuestionType.TYPE_ANSWER);

    private final QuestionEngine questionEngine;

    public GuidedDefinitionValidationService(QuestionEngine questionEngine) {
        this.questionEngine = questionEngine;
    }

    public List<GuidedDefinitionIssue> validateDraftShape(GuidedDefinitionPayload payload) {
        List<GuidedDefinitionIssue> issues = new ArrayList<>();
        Set<String> keys = new HashSet<>();
        List<GuidedStepPayload> steps = payload.steps();
        for (int index = 0; index < steps.size(); index++) {
            GuidedStepPayload step = steps.get(index);
            String path = "steps[" + index + "]";
            if (!hasText(step.stepKey())) {
                issues.add(issue(path + ".stepKey", "required"));
            } else if (!keys.add(step.stepKey())) {
                issues.add(issue(path + ".stepKey", "duplicate"));
            }
            if (step.position() == null || step.position() != index) {
                issues.add(issue(path + ".position", "must_match_order"));
            }
            if (step.type() == null || !SUPPORTED_STEP_TYPES.contains(step.type())) {
                issues.add(issue(path + ".type", "unsupported"));
            }
        }
        return List.copyOf(issues);
    }

    public List<GuidedDefinitionIssue> validateReady(Question question, GuidedDefinitionPayload payload) {
        List<GuidedDefinitionIssue> issues = new ArrayList<>(validateDraftShape(payload));
        if (!question.isComplete()) {
            issues.add(issue("question", "final_question_incomplete"));
        }
        if (!SUPPORTED_FINAL_TYPES.contains(question.getType())) {
            issues.add(issue("question.type", "final_type_unsupported"));
        }
        if (payload.steps().isEmpty()) {
            issues.add(issue("steps", "minimum_one_required"));
        }
        for (int index = 0; index < payload.steps().size(); index++) {
            GuidedStepPayload step = payload.steps().get(index);
            String path = "steps[" + index + "]";
            if (step.hintEnabled() && !hasText(step.hint())) {
                issues.add(issue(path + ".hint", "required_when_hint_enabled"));
            }
            if (step.type() == null || !SUPPORTED_STEP_TYPES.contains(step.type())) {
                continue;
            }
            validateOptionKeys(step, path, issues);
            DefinitionValidation result = questionEngine.validateDefinition(toSpec(question, step));
            for (String error : result.errors()) {
                issues.add(issue(path + "." + error, result.status().name().toLowerCase(Locale.ROOT)));
            }
        }
        return List.copyOf(issues);
    }

    public QuestionSpec toSpec(Question question, GuidedStepPayload step) {
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                valueOrEmpty(step.prompt()), question.getDifficulty(), step.explanation(), null, List.of());
        return switch (step.type()) {
            case SINGLE_CHOICE -> new SingleChoiceSpec(common,
                    step.options().stream().map(choice -> new QuestionSpec.Choice(
                            valueOrEmpty(choice.key()), valueOrEmpty(choice.content()))).toList(),
                    trimToNull(step.correctKey()));
            case TRUE_FALSE -> new TrueFalseSpec(common, step.expected());
            case TYPE_ANSWER -> new TypeAnswerSpec(common, step.acceptedAnswers(),
                    step.matchingMode() == null ? MatchingMode.CASE_INSENSITIVE_TRIM : step.matchingMode());
            default -> throw new IllegalArgumentException("Unsupported guided step type: " + step.type());
        };
    }

    public static boolean isSupportedStepType(QuestionType type) {
        return type != null && SUPPORTED_STEP_TYPES.contains(type);
    }

    private void validateOptionKeys(GuidedStepPayload step, String path, List<GuidedDefinitionIssue> issues) {
        if (step.type() != QuestionType.SINGLE_CHOICE) return;
        Set<String> keys = new HashSet<>();
        for (int optionIndex = 0; optionIndex < step.options().size(); optionIndex++) {
            String key = trimToNull(step.options().get(optionIndex).key());
            String optionPath = path + ".options[" + optionIndex + "].key";
            if (key == null) issues.add(issue(optionPath, "required"));
            else if (!keys.add(key)) issues.add(issue(optionPath, "duplicate"));
        }
    }

    private GuidedDefinitionIssue issue(String path, String code) {
        return new GuidedDefinitionIssue(path, code);
    }

    private static boolean hasText(String value) {
        return trimToNull(value) != null;
    }

    private static String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
