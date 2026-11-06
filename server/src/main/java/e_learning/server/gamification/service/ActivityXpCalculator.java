package e_learning.server.gamification.service;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivityQuestionResolution;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.gamification.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.entity.XpQuestionOutcome;
import e_learning.server.question.enums.Difficulty;
import java.math.BigDecimal;

/** Pure, deterministic Activity XP v2.2 calculation boundary. */
public interface ActivityXpCalculator {
    /**
     * Maps a server-adjudicated, resolved question state to the canonical XP
     * outcome. Missing or inconsistent final state is rejected.
     */
    XpQuestionOutcome mapResolvedOutcome(
            ActivityMode mode,
            ActivityQuestionResolution resolutionReason,
            int answerAttempts,
            boolean hintUsed,
            Boolean finalCorrect);

    /** Throws/rejects missing historical Question difficulty snapshots. */
    ActivityXpQuestionEvaluation evaluateQuestion(
            long sessionQuestionId, Difficulty difficulty, XpQuestionOutcome outcome,
            BigDecimal sessionMultiplier);

    /** Completion bonus is zero for GAME_OVER/ABANDONED/IN_PROGRESS. */
    int completionBonus(int totalQuestions, ActivitySessionStatus status, BigDecimal sessionMultiplier);

    /** Activity XP v2.2 multiplier frozen from the official session-start Level. */
    BigDecimal levelMultiplier(int level);

    /** XP required to advance from the supplied Level to the next Level. */
    long xpToNext(int level);

    /** Total lifetime XP to enter target level, starting at level 1 = zero XP. */
    long lifetimeXpRequiredForLevel(int level);

    /** Derive official Level after the profile's atomic lifetime XP increment. */
    int levelForLifetimeXp(long lifetimeXp);
}
