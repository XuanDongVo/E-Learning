package e_learning.server.gamification.service;

import e_learning.server.gamification.dto.ActivityXpPolicySnapshot;
import e_learning.server.gamification.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.dto.ActivityXpPreview;
import e_learning.server.gamification.dto.ActivityXpRewardReceipt;
import java.util.Optional;

/**
 * SKELETON CONTRACT ONLY, deliberately NO @Service implementation and NO callers.
 * A later implementation must serialize the reward-critical update and make
 * ledger insert + profile lifetime XP / Level update one database transaction.
 */
public interface ActivityXpRewardWorkflow {
    /** Capture official Level, multiplier and policy version on session start. */
    ActivityXpPolicySnapshot captureStartSnapshot(long studentId);

    /** Persist authoritative XP outcome when a Question becomes resolved. */
    ActivityXpQuestionEvaluation onQuestionResolved(long sessionQuestionId);

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
