package e_learning.server.gamification.dto;

import e_learning.server.activitysession.enums.ActivitySessionStatus;
import java.time.LocalDateTime;

/** Stable terminal reward result returned also on idempotent repeat requests. */
public record ActivityXpRewardReceipt(
        Long sessionId,
        ActivitySessionStatus status,
        int questionXp,
        int completionBonus,
        int committedXp,
        long lifetimeXpAfter,
        int levelAfter,
        LocalDateTime finalizedAt
) {}
