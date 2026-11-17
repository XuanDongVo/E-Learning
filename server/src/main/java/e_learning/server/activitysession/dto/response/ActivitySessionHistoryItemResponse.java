package e_learning.server.activitysession.dto.response;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.enums.ActivitySessionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ActivitySessionHistoryItemResponse(
        Long sessionId,

        ActivityMode mode,
        ActivitySessionStatus status,

        LocalDateTime startedAt,
        LocalDateTime completedAt,

        Integer totalQuestions,
        Integer firstCorrectCount,
        Integer finalCorrectCount,
        Integer hintUsedCount,

        BigDecimal score,
        Integer earnedXp
) {
    public static ActivitySessionHistoryItemResponse fromEntity(ActivitySession session) {
        return new ActivitySessionHistoryItemResponse(
                session.getId(),
                session.getMode(),
                session.getStatus(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getTotalQuestions(),
                session.getFirstCorrectCount(),
                session.getFinalCorrectCount(),
                session.getHintUsedCount(),
                session.getScore(),
                session.getXpFinalizedAt() != null ? session.getXpTotal() : null
        );
    }
}