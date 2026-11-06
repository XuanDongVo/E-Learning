package e_learning.server.gamification.entity;

/** Stored outcome vocabulary; no outcome mapping or XP calculation is active yet. */
public enum XpQuestionOutcome {
    CORRECT_FIRST_TRY,
    CORRECT_RETRY,
    CORRECT_WITH_HINT,
    WRONG_EXHAUSTED,
    TRY_HARD_WRONG,
    TIMEOUT_AFTER_INTERACTION,
    TIMEOUT_NO_INTERACTION,
    NO_INTERACTION
}
