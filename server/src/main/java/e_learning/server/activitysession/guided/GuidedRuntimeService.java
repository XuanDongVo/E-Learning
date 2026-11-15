package e_learning.server.activitysession.guided;

import e_learning.server.activitysession.dto.GuidedCurrentStepResponse;
import e_learning.server.activitysession.dto.GuidedQuestionResponse;
import e_learning.server.activitysession.entity.ActivitySessionGuidedStepAttempt;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.repository.ActivitySessionGuidedStepAttemptRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.result.GradeResult;
import e_learning.server.question.guided.GuidedDefinition;
import e_learning.server.question.guided.GuidedDefinitionPayload;
import e_learning.server.question.guided.GuidedDefinitionRepository;
import e_learning.server.question.guided.GuidedDefinitionStatus;
import e_learning.server.question.guided.GuidedDefinitionValidationService;
import e_learning.server.question.guided.GuidedStepPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Owns Guided-only snapshotting, public projection and atomic Step transitions. */
@Service
@RequiredArgsConstructor
public class GuidedRuntimeService {
    public static final int SNAPSHOT_SCHEMA_VERSION = 1;

    private final GuidedDefinitionRepository definitionRepository;
    private final GuidedDefinitionValidationService definitionValidationService;
    private final ActivitySessionGuidedStepAttemptRepository attemptRepository;
    private final QuestionEngine questionEngine;
    private final ObjectMapper objectMapper;

    public void initialize(ActivitySessionQuestion item) {
        GuidedDefinition definition = definitionRepository.findByQuestionId(item.getQuestion().getId())
                .filter(value -> value.getStatus() == GuidedDefinitionStatus.READY)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY));
        if (definition.getSourceQuestionRevision() == null
                || !definition.getSourceQuestionRevision().equals(item.getQuestion().getContentRevision())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
        }
        try {
            GuidedDefinitionPayload payload = objectMapper.convertValue(
                    definition.getDefinitionPayload(), GuidedDefinitionPayload.class);
            item.setGuidedSnapshotSchemaVersion(SNAPSHOT_SCHEMA_VERSION);
            item.setGuidedSnapshotPayload(objectMapper.writeValueAsString(
                    new GuidedRuntimeSnapshot(SNAPSHOT_SCHEMA_VERSION, payload)));
            item.setGuidedStage(GuidedQuestionStage.STEP_ACTIVE);
            item.setGuidedCurrentStepIndex(0);
            item.setGuidedCurrentStepAttempts(0);
            item.setGuidedCurrentStepHintUsed(false);
            item.setGuidedHintUsedStepKeys("[]");
        } catch (Exception error) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY,
                    "Guided snapshot could not be created");
        }
    }

    public boolean isGuided(ActivitySessionQuestion item) {
        return item.getGuidedSnapshotPayload() != null;
    }

    public boolean finalAvailable(ActivitySessionQuestion item) {
        return item.getGuidedStage() == GuidedQuestionStage.FINAL_PENDING
                || item.getGuidedStage() == GuidedQuestionStage.FINAL_RETRY
                || item.getGuidedStage() == GuidedQuestionStage.QUESTION_RESOLVED;
    }

    public GuidedQuestionResponse publicView(ActivitySessionQuestion item) {
        GuidedRuntimeSnapshot snapshot = snapshot(item);
        GuidedQuestionStage stage = item.getGuidedStage();
        if (stage == GuidedQuestionStage.FINAL_PENDING || stage == GuidedQuestionStage.FINAL_RETRY
                || stage == GuidedQuestionStage.QUESTION_RESOLVED) {
            return new GuidedQuestionResponse(stage, snapshot.definition().introContent(), null);
        }
        GuidedStepPayload step = currentStep(item, snapshot);
        List<GuidedCurrentStepResponse.Option> options = step.options().stream()
                .map(option -> new GuidedCurrentStepResponse.Option(option.key(), option.content()))
                .toList();
        int allowed = step.retryEnabled() ? 2 : 1;
        return new GuidedQuestionResponse(stage, snapshot.definition().introContent(),
                new GuidedCurrentStepResponse(step.stepKey(), step.position(), snapshot.definition().steps().size(),
                        step.type(), step.prompt(), options, step.hintEnabled() && step.hint() != null && !step.hint().isBlank(),
                        Boolean.TRUE.equals(item.getGuidedCurrentStepHintUsed()),
                        item.getGuidedCurrentStepAttempts(), allowed));
    }

    public StepResult answer(ActivitySessionQuestion item, String stepKey, String requestId, JsonNode answer) {
        GuidedRuntimeSnapshot snapshot = snapshot(item);
        GuidedStepPayload step = currentStep(item, snapshot);
        if (!step.stepKey().equals(stepKey)) {
            throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);
        }
        UUID id;
        try { id = UUID.fromString(requestId); }
        catch (IllegalArgumentException error) { throw new AppException(ErrorCode.INVALID_REQUEST, "requestId must be a UUID"); }

        ActivitySessionGuidedStepAttempt existing = attemptRepository
                .findBySessionQuestionIdAndRequestId(item.getId(), id).orElse(null);
        if (existing != null) {
            if (!existing.getStepKey().equals(stepKey)
                    || !existing.getSubmittedAnswer().equals(answer.toString())) {
                throw new AppException(ErrorCode.GUIDED_IDEMPOTENCY_CONFLICT);
            }
            return new StepResult(existing.isCorrect(), existing.getAttemptNumber(),
                    item.getGuidedStage() == GuidedQuestionStage.STEP_RETRY, item.getGuidedStage() != GuidedQuestionStage.STEP_RETRY,
                    item.getGuidedStage());
        }

        Object raw = rawAnswer(answer);
        var parsed = questionEngine.parseAndValidate(
                definitionValidationService.toSpec(snapshotDifficulty(item), step), new RawAnswer(raw));
        if (!parsed.valid()) throw new AppException(ErrorCode.ACTIVITY_SESSION_ANSWER_INVALID);
        GradeResult grade = questionEngine.grade(
                definitionValidationService.toSpec(snapshotDifficulty(item), step), parsed.answer().orElseThrow());
        boolean correct = grade.scoreFraction().compareTo(BigDecimal.ONE) == 0;
        int attemptNumber = item.getGuidedCurrentStepAttempts() + 1;
        boolean retry = !correct && step.retryEnabled() && attemptNumber == 1;
        attemptRepository.save(new ActivitySessionGuidedStepAttempt(item, stepKey, attemptNumber, id,
                answer.toString(), correct));
        item.setGuidedCurrentStepAttempts(attemptNumber);
        if (retry) {
            item.setGuidedStage(GuidedQuestionStage.STEP_RETRY);
            return new StepResult(false, attemptNumber, true, false, GuidedQuestionStage.STEP_RETRY);
        }

        int nextIndex = item.getGuidedCurrentStepIndex() + 1;
        if (nextIndex >= snapshot.definition().steps().size()) {
            item.setGuidedStage(GuidedQuestionStage.FINAL_PENDING);
        } else {
            item.setGuidedCurrentStepIndex(nextIndex);
            item.setGuidedCurrentStepAttempts(0);
            item.setGuidedCurrentStepHintUsed(false);
            item.setGuidedStage(GuidedQuestionStage.STEP_ACTIVE);
        }
        return new StepResult(correct, attemptNumber, false, true, item.getGuidedStage());
    }

    public String useHint(ActivitySessionQuestion item, String stepKey) {
        GuidedStepPayload step = currentStep(item, snapshot(item));
        if (!step.stepKey().equals(stepKey)) throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);
        if (!step.hintEnabled() || step.hint() == null || step.hint().isBlank()) {
            throw new AppException(ErrorCode.GUIDED_HINT_UNAVAILABLE);
        }
        item.setGuidedCurrentStepHintUsed(true);
        try {
            List<String> usedKeys = new ArrayList<>(objectMapper.readValue(
                    item.getGuidedHintUsedStepKeys(), objectMapper.getTypeFactory()
                            .constructCollectionType(List.class, String.class)));
            if (!usedKeys.contains(stepKey)) usedKeys.add(stepKey);
            item.setGuidedHintUsedStepKeys(objectMapper.writeValueAsString(usedKeys));
        } catch (Exception error) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY, "Guided hint state is invalid");
        }
        return step.hint();
    }

    public void markFinalResolved(ActivitySessionQuestion item) {
        if (isGuided(item)) item.setGuidedStage(GuidedQuestionStage.QUESTION_RESOLVED);
    }

    private GuidedRuntimeSnapshot snapshot(ActivitySessionQuestion item) {
        if (!isGuided(item)) throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
        try { return objectMapper.readValue(item.getGuidedSnapshotPayload(), GuidedRuntimeSnapshot.class); }
        catch (Exception error) { throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY, "Guided snapshot is invalid"); }
    }

    private GuidedStepPayload currentStep(ActivitySessionQuestion item, GuidedRuntimeSnapshot snapshot) {
        if (finalAvailable(item)) throw new AppException(ErrorCode.GUIDED_STEP_ALREADY_RESOLVED);
        Integer index = item.getGuidedCurrentStepIndex();
        if (index == null || index < 0 || index >= snapshot.definition().steps().size()) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
        }
        return snapshot.definition().steps().get(index);
    }

    private e_learning.server.question.enums.Difficulty snapshotDifficulty(ActivitySessionQuestion item) {
        // Guided Steps inherit only immutable difficulty from the final Question snapshot.
        try {
            var finalSnapshot = objectMapper.readValue(item.getSnapshotPayload(),
                    e_learning.server.activitysession.entity.ActivityQuestionSnapshot.class);
            return finalSnapshot.difficulty();
        } catch (Exception error) { throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY); }
    }

    private Object rawAnswer(JsonNode answer) {
        if (answer == null || answer.isNull()) return null;
        if (!answer.isArray()) return answer.asText();
        List<String> values = new ArrayList<>();
        answer.forEach(value -> values.add(value.asText()));
        return values;
    }

    public record StepResult(boolean correct, int attemptNumber, boolean retryAvailable,
                             boolean stepResolved, GuidedQuestionStage stage) {}
}
