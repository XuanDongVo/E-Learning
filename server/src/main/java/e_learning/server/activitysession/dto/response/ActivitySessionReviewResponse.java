package e_learning.server.activitysession.dto.response;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivityQuestionResolution;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import e_learning.server.activitysession.dto.response.ordering.OrderingAnswerRevealResponse;
import e_learning.server.activitysession.dto.response.ordering.OrderingQuestionResponse;
import e_learning.server.question.enums.QuestionType;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ActivitySessionReviewResponse(
        Long sessionId,
        ActivitySessionStatus status,
        ActivityMode mode,
        Long activityId,
        String activityName,
        Long unitId,
        String unitLabel,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        BigDecimal score,
        int totalQuestions,
        int firstCorrectCount,
        int finalCorrectCount,
        List<QuestionReview> questions
) {
    public enum HistoryState { AVAILABLE, NOT_ANSWERED, LEGACY_UNAVAILABLE }

    public record QuestionReview(
            Long sessionQuestionId,
            int position,
            QuestionDeliveryType deliveryType,
            boolean resolved,
            ActivityQuestionResolution resolutionReason,
            Boolean firstCorrect,
            Boolean finalCorrect,
            boolean finalHintUsed,
            boolean snapshotAvailable,
            QuestionType type,
            String prompt,
            List<OptionReview> options,
            OrderingQuestionResponse ordering,
            List<String> correctAnswers,
            String explanation,
            GuidedReview guided,
            FinalReview finalAnswer
    ) {}

    public record OptionReview(String key, String content) {}

    public record GuidedReview(
            GuidedQuestionStage stage,
            String introContent,
            List<StepReview> steps
    ) {}

    public record StepReview(
            String stepKey,
            int position,
            QuestionType type,
            String prompt,
            List<OptionReview> options,
            boolean hintUsed,
            LocalDateTime hintUsedAt,
            Boolean finalCorrect,
            List<AttemptReview> attempts,
            List<String> correctAnswers,
            String explanation
    ) {}

    public record FinalReview(
            HistoryState historyState,
            List<AttemptReview> attempts,
            List<String> correctAnswers,
            OrderingAnswerRevealResponse orderingAnswer,
            String explanation
    ) {}

    public record AttemptReview(
            int attemptNumber,
            JsonNode submittedAnswer,
            boolean correct,
            Boolean retryAvailable,
            Boolean resolved,
            LocalDateTime submittedAt,
            boolean hintUsedBeforeAttempt
    ) {}
}
