package e_learning.server.activitysession.guided;

import e_learning.server.activitysession.dto.response.GuidedCurrentStepResponse;
import e_learning.server.activitysession.dto.response.GuidedQuestionResponse;
import e_learning.server.activitysession.entity.*;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import e_learning.server.activitysession.repository.ActivitySessionGuidedStepAttemptRepository;
import e_learning.server.activitysession.repository.ActivitySessionGuidedStepHintRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.result.GradeResult;
import e_learning.server.question.guided.*;
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
    private final ActivitySessionGuidedStepHintRepository hintRepository;
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
            String snapshot = objectMapper.writeValueAsString(
                    new GuidedRuntimeSnapshot(SNAPSHOT_SCHEMA_VERSION, payload));
            item.attachGuidedProgress(new ActivitySessionGuidedProgress(SNAPSHOT_SCHEMA_VERSION, snapshot));
        } catch (Exception error) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY,
                    "Guided snapshot could not be created");
        }
    }

    public boolean isGuided(ActivitySessionQuestion item) {
        return item.getDeliveryType() == QuestionDeliveryType.GUIDED_REASONING;
    }

    public boolean finalAvailable(ActivitySessionQuestion item) {
        GuidedQuestionStage stage = progress(item).getStage();
        return stage == GuidedQuestionStage.FINAL_PENDING
                || stage == GuidedQuestionStage.FINAL_RETRY
                || stage == GuidedQuestionStage.QUESTION_RESOLVED;
    }

    public GuidedQuestionResponse publicView(ActivitySessionQuestion item) {
        ActivitySessionGuidedProgress progress = progress(item);
        GuidedRuntimeSnapshot snapshot = snapshot(progress);
        GuidedQuestionStage stage = progress.getStage();
        if (stage == GuidedQuestionStage.FINAL_PENDING || stage == GuidedQuestionStage.FINAL_RETRY
                || stage == GuidedQuestionStage.QUESTION_RESOLVED) {
            return new GuidedQuestionResponse(stage, snapshot.definition().introContent(), null);
        }
        GuidedStepPayload step = currentStep(progress, snapshot);
        List<GuidedCurrentStepResponse.Option> options = step.options().stream()
                .map(option -> new GuidedCurrentStepResponse.Option(option.key(), option.content()))
                .toList();
        int attempts = Math.toIntExact(attemptRepository
                .countBySessionQuestionIdAndStepKey(item.getId(), step.stepKey()));
        boolean hintUsed = hintRepository.existsBySessionQuestionIdAndStepKey(item.getId(), step.stepKey());
        return new GuidedQuestionResponse(stage, snapshot.definition().introContent(),
                new GuidedCurrentStepResponse(step.stepKey(), step.position(), snapshot.definition().steps().size(),
                        step.type(), step.prompt(), options,
                        step.hintEnabled() && step.hint() != null && !step.hint().isBlank(),
                        hintUsed, attempts, step.retryEnabled() ? 2 : 1));
    }

    public StepResult answer(ActivitySessionQuestion item, String stepKey, String requestId, JsonNode answer) {
        UUID id = requestId(requestId);
        ActivitySessionGuidedStepAttempt existing = attemptRepository
                .findBySessionQuestionIdAndRequestId(item.getId(), id).orElse(null);
        if (existing != null) {
            if (!existing.getStepKey().equals(stepKey)
                    || !existing.getSubmittedAnswer().equals(answer.toString())) {
                throw new AppException(ErrorCode.GUIDED_IDEMPOTENCY_CONFLICT);
            }
            return storedResult(existing);
        }

        ActivitySessionGuidedProgress progress = progress(item);
        GuidedRuntimeSnapshot snapshot = snapshot(progress);
        GuidedStepPayload step = currentStep(progress, snapshot);
        if (!step.stepKey().equals(stepKey)) throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);

        var spec = definitionValidationService.toSpec(snapshotDifficulty(item), step);
        var parsed = questionEngine.parseAndValidate(spec, new RawAnswer(rawAnswer(answer)));
        if (!parsed.valid()) throw new AppException(ErrorCode.ACTIVITY_SESSION_ANSWER_INVALID);
        GradeResult grade = questionEngine.grade(spec, parsed.answer().orElseThrow());
        boolean correct = grade.scoreFraction().compareTo(BigDecimal.ONE) == 0;
        int attemptNumber = Math.toIntExact(
                attemptRepository.countBySessionQuestionIdAndStepKey(item.getId(), stepKey) + 1);
        boolean retry = !correct && step.retryEnabled() && attemptNumber == 1;
        boolean resolved = !retry;

        if (retry) {
            progress.setStage(GuidedQuestionStage.STEP_RETRY);
        } else {
            int nextIndex = progress.getCurrentStepIndex() + 1;
            if (nextIndex >= snapshot.definition().steps().size()) {
                progress.setStage(GuidedQuestionStage.FINAL_PENDING);
            } else {
                progress.setCurrentStepIndex(nextIndex);
                progress.setStage(GuidedQuestionStage.STEP_ACTIVE);
            }
        }
        GuidedQuestionStage stageAfter = progress.getStage();
        attemptRepository.save(new ActivitySessionGuidedStepAttempt(item, stepKey, attemptNumber, id,
                answer.toString(), correct, retry, resolved, stageAfter));
        return new StepResult(correct, attemptNumber, retry, resolved, stageAfter);
    }

    public String useHint(ActivitySessionQuestion item, String stepKey) {
        ActivitySessionGuidedProgress progress = progress(item);
        GuidedStepPayload step = currentStep(progress, snapshot(progress));
        if (!step.stepKey().equals(stepKey)) throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);
        if (!step.hintEnabled() || step.hint() == null || step.hint().isBlank()) {
            throw new AppException(ErrorCode.GUIDED_HINT_UNAVAILABLE);
        }
        if (!hintRepository.existsBySessionQuestionIdAndStepKey(item.getId(), stepKey)) {
            hintRepository.save(new ActivitySessionGuidedStepHint(item, stepKey));
        }
        return step.hint();
    }

    public void markFinalRetry(ActivitySessionQuestion item) {
        if (isGuided(item)) progress(item).setStage(GuidedQuestionStage.FINAL_RETRY);
    }

    public void markFinalResolved(ActivitySessionQuestion item) {
        if (isGuided(item)) progress(item).setStage(GuidedQuestionStage.QUESTION_RESOLVED);
    }

    private StepResult storedResult(ActivitySessionGuidedStepAttempt attempt) {
        if (attempt.getRetryAvailable() == null || attempt.getStepResolved() == null
                || attempt.getStageAfter() == null) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY,
                    "Historical guided attempt cannot be replayed");
        }
        return new StepResult(attempt.isCorrect(), attempt.getAttemptNumber(),
                attempt.getRetryAvailable(), attempt.getStepResolved(), attempt.getStageAfter());
    }

    private ActivitySessionGuidedProgress progress(ActivitySessionQuestion item) {
        if (!isGuided(item) || item.getGuidedProgress() == null) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
        }
        return item.getGuidedProgress();
    }

    private GuidedRuntimeSnapshot snapshot(ActivitySessionGuidedProgress progress) {
        try { return objectMapper.readValue(progress.getSnapshotPayload(), GuidedRuntimeSnapshot.class); }
        catch (Exception error) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY, "Guided snapshot is invalid");
        }
    }

    private GuidedStepPayload currentStep(ActivitySessionGuidedProgress progress, GuidedRuntimeSnapshot snapshot) {
        GuidedQuestionStage stage = progress.getStage();
        if (stage == GuidedQuestionStage.FINAL_PENDING || stage == GuidedQuestionStage.FINAL_RETRY
                || stage == GuidedQuestionStage.QUESTION_RESOLVED) {
            throw new AppException(ErrorCode.GUIDED_STEP_ALREADY_RESOLVED);
        }
        int index = progress.getCurrentStepIndex();
        if (index < 0 || index >= snapshot.definition().steps().size()) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
        }
        return snapshot.definition().steps().get(index);
    }

    private e_learning.server.question.enums.Difficulty snapshotDifficulty(ActivitySessionQuestion item) {
        try {
            var finalSnapshot = objectMapper.readValue(item.getSnapshotPayload(),
                    e_learning.server.activitysession.entity.ActivityQuestionSnapshot.class);
            return finalSnapshot.difficulty();
        } catch (Exception error) { throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY); }
    }

    private UUID requestId(String value) {
        try { return UUID.fromString(value); }
        catch (RuntimeException error) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "requestId must be a UUID");
        }
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
