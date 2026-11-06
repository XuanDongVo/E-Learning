package e_learning.server.gamification.service;

import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.gamification.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.entity.XpQuestionOutcome;
import e_learning.server.question.enums.Difficulty;
import java.math.BigDecimal;

/**
 * SKELETON ONLY: pure calculation boundary, no Spring bean or implementation.
 * Outcome -> base XP table and replay policy are pending explicit approval.
 */
public interface ActivityXpCalculator {
    /** Throws/rejects missing historical Question difficulty snapshots. */
    ActivityXpQuestionEvaluation evaluateQuestion(
            long sessionQuestionId, Difficulty difficulty, XpQuestionOutcome outcome,
            BigDecimal sessionMultiplier);

    /** Completion bonus is zero for GAME_OVER/ABANDONED/IN_PROGRESS. */
    int completionBonus(int servedQuestionCount, ActivitySessionStatus status, BigDecimal sessionMultiplier);

    /** Total lifetime XP to enter target level, starting at level 1 = zero XP. */
    long lifetimeXpRequiredForLevel(int level);

    /** Derive official Level after the profile's atomic lifetime XP increment. */
    int levelForLifetimeXp(long lifetimeXp);
}
