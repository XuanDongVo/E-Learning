package e_learning.server.activitysession.review;

import e_learning.server.activitysession.dto.response.ActivitySessionReviewResponse;
import e_learning.server.activitysession.dto.response.ActivitySessionReviewResponse.*;
import e_learning.server.activitysession.entity.*;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import e_learning.server.activitysession.guided.GuidedRuntimeSnapshot;
import e_learning.server.activitysession.repository.*;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.guided.GuidedStepPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ActivitySessionReviewService {
    private final ActivitySessionRepository sessionRepository;
    private final ActivitySessionGuidedStepAttemptRepository stepAttemptRepository;
    private final ActivitySessionGuidedStepHintRepository stepHintRepository;
    private final ActivitySessionFinalAnswerAttemptRepository finalAttemptRepository;
    private final ActivityQuestionSnapshotAssembler snapshotAssembler;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ActivitySessionReviewResponse studentReview(Long sessionId, Long studentId) {
        ActivitySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_NOT_FOUND));
        if (!Objects.equals(session.getStudent().getId(), studentId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return project(session);
    }

    private ActivitySessionReviewResponse project(ActivitySession session) {
        var activity = session.getActivity();
        var unit = activity.getUnit();
        return new ActivitySessionReviewResponse(
                session.getId(), session.getStatus(), session.getMode(),
                activity.getId(), activity.getName(), unit.getId(),
                unit.getCode() + " · " + unit.getName(),
                session.getStartedAt(), session.getCompletedAt(), session.getScore(),
                session.getTotalQuestions(), session.getFirstCorrectCount(),
                session.getFinalCorrectCount(),
                session.getQuestions().stream().map(this::questionReview).toList());
    }

    private QuestionReview questionReview(ActivitySessionQuestion item) {
        ActivityQuestionSnapshot snapshot = readSnapshot(item);
        boolean reveal = item.isResolved();
        GuidedReview guided = item.getDeliveryType() == QuestionDeliveryType.GUIDED_REASONING
                ? guidedReview(item, reveal)
                : null;
        boolean finalVisible = item.getDeliveryType() == QuestionDeliveryType.CLASSIC
                || reveal
                || item.getGuidedProgress() != null && (
                    item.getGuidedProgress().getStage() == GuidedQuestionStage.FINAL_PENDING
                    || item.getGuidedProgress().getStage() == GuidedQuestionStage.FINAL_RETRY);
        List<OptionReview> options = snapshot != null && finalVisible
                ? snapshot.options().stream().map(option ->
                    new OptionReview(option.key(), option.content())).toList()
                : List.of();
        return new QuestionReview(
                item.getId(), item.getPosition(), item.getDeliveryType(), item.isResolved(),
                item.getResolutionReason(), item.getFirstCorrect(), item.getFinalCorrect(),
                item.isHintUsed(), snapshot != null,
                snapshot != null && finalVisible ? snapshot.type() : null,
                snapshot != null && finalVisible ? snapshot.content() : null,
                options,
                reveal && snapshot != null ? finalCorrectAnswers(snapshot) : List.of(),
                reveal && snapshot != null ? snapshot.explanation() : null,
                guided,
                finalReview(item, snapshot, reveal));
    }

    private GuidedReview guidedReview(ActivitySessionQuestion item, boolean reveal) {
        ActivitySessionGuidedProgress progress = item.getGuidedProgress();
        if (progress == null) return null;
        GuidedRuntimeSnapshot runtime;
        try {
            runtime = objectMapper.readValue(progress.getSnapshotPayload(), GuidedRuntimeSnapshot.class);
        } catch (Exception error) {
            return new GuidedReview(progress.getStage(), null, List.of());
        }
        Map<String, ActivitySessionGuidedStepHint> hints = new HashMap<>();
        stepHintRepository.findAllBySessionQuestionId(item.getId())
                .forEach(hint -> hints.put(hint.getStepKey(), hint));
        Map<String, List<ActivitySessionGuidedStepAttempt>> attempts = new HashMap<>();
        stepAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(item.getId())
                .forEach(attempt -> attempts.computeIfAbsent(attempt.getStepKey(), ignored -> new ArrayList<>())
                        .add(attempt));
        int lastVisibleIndex = reveal
                || progress.getStage() == GuidedQuestionStage.FINAL_PENDING
                || progress.getStage() == GuidedQuestionStage.FINAL_RETRY
                ? runtime.definition().steps().size() - 1
                : progress.getCurrentStepIndex();
        List<StepReview> steps = runtime.definition().steps().stream()
                .filter(step -> step.position() <= lastVisibleIndex)
                .map(step -> stepReview(step, attempts.getOrDefault(step.stepKey(), List.of()),
                        hints.get(step.stepKey()), reveal))
                .toList();
        return new GuidedReview(progress.getStage(), runtime.definition().introContent(), steps);
    }

    private StepReview stepReview(
            GuidedStepPayload step,
            List<ActivitySessionGuidedStepAttempt> attempts,
            ActivitySessionGuidedStepHint hint,
            boolean reveal) {
        var attemptViews = attempts.stream().map(attempt -> new AttemptReview(
                attempt.getAttemptNumber(), parseAnswer(attempt.getSubmittedAnswer()),
                attempt.isCorrect(), attempt.getRetryAvailable(), attempt.getStepResolved(),
                attempt.getCreatedAt(), hint != null && hint.getUsedAt() != null
                    && !hint.getUsedAt().isAfter(attempt.getCreatedAt()))).toList();
        Boolean finalCorrect = attempts.isEmpty() ? null : attempts.getLast().isCorrect();
        return new StepReview(
                step.stepKey(), step.position(), step.type(), step.prompt(),
                step.options().stream().map(option ->
                        new OptionReview(option.key(), option.content())).toList(),
                hint != null, hint == null ? null : hint.getUsedAt(), finalCorrect,
                attemptViews, reveal ? stepCorrectAnswers(step) : List.of(),
                reveal ? step.explanation() : null);
    }

    private FinalReview finalReview(
            ActivitySessionQuestion item,
            ActivityQuestionSnapshot snapshot,
            boolean reveal) {
        List<ActivitySessionFinalAnswerAttempt> attempts = finalAttemptRepository
                .findAllBySessionQuestionIdOrderByAttemptNumberAsc(item.getId());
        HistoryState historyState = !attempts.isEmpty()
                ? HistoryState.AVAILABLE
                : item.getAnswerAttempts() > 0
                    ? HistoryState.LEGACY_UNAVAILABLE
                    : HistoryState.NOT_ANSWERED;
        List<AttemptReview> views = attempts.stream().map(attempt -> new AttemptReview(
                attempt.getAttemptNumber(), parseAnswer(attempt.getSubmittedAnswer()),
                attempt.isCorrect(), attempt.isRetryAvailable(), attempt.isResolved(),
                attempt.getCreatedAt(), item.isHintUsed())).toList();
        return new FinalReview(historyState, views,
                reveal && snapshot != null ? finalCorrectAnswers(snapshot) : List.of(),
                reveal && snapshot != null ? snapshot.explanation() : null);
    }

    private ActivityQuestionSnapshot readSnapshot(ActivitySessionQuestion item) {
        if (item.getSnapshotPayload() == null || item.getSnapshotSchemaVersion() == null
                || item.getSnapshotContentRevision() == null) return null;
        try {
            return snapshotAssembler.read(item);
        } catch (RuntimeException error) {
            return null;
        }
    }

    private JsonNode parseAnswer(String value) {
        try {
            return objectMapper.readTree(value);
        } catch (Exception error) {
            return objectMapper.getNodeFactory().textNode(value);
        }
    }

    private List<String> finalCorrectAnswers(ActivityQuestionSnapshot snapshot) {
        if (snapshot.type() == e_learning.server.question.enums.QuestionType.SINGLE_CHOICE
                || snapshot.type() == e_learning.server.question.enums.QuestionType.MULTIPLE_CHOICE) {
            return snapshot.options().stream().filter(ActivityQuestionSnapshot.Option::correct)
                    .map(ActivityQuestionSnapshot.Option::key).sorted().toList();
        }
        return snapshot.answers();
    }

    private List<String> stepCorrectAnswers(GuidedStepPayload step) {
        return switch (step.type()) {
            case SINGLE_CHOICE -> step.correctKey() == null ? List.of() : List.of(step.correctKey());
            case TRUE_FALSE -> step.expected() == null ? List.of() : List.of(step.expected().toString());
            case TYPE_ANSWER -> step.acceptedAnswers();
            default -> List.of();
        };
    }
}
