package e_learning.server.gamification.xp.service;

import e_learning.server.gamification.xp.dto.ActivityXpPreview;
import e_learning.server.gamification.xp.dto.ActivityXpRewardReceipt;
import java.util.Optional;

/** Atomic, idempotent Activity XP reward boundary. */
public interface ActivityXpRewardWorkflow {
    /** Query current provisional XP; never commit account XP here. */
    ActivityXpPreview preview(long sessionId);

    /**
     * Called when ActivitySession transitions to COMPLETED or GAME_OVER, not only
     * from finish(). ABANDONED is ineligible. Repeat calls must return the same
     * durable receipt without creating another PRACTICE XP transaction.
     */
    ActivityXpRewardReceipt finalizeTerminalSession(long sessionId);

    /** Mark a zero-award terminal session finalized without a positive ledger row. */
    ActivityXpRewardReceipt finalizeZeroAward(long sessionId);

    /** Forfeit any provisional XP on ABANDONED; do not create a reward transaction. */
    void forfeitAbandonedSession(long sessionId);

    /** Read finalized reward without repeating calculation or credit. */
    Optional<ActivityXpRewardReceipt> findFinalizedReward(long sessionId);
}
