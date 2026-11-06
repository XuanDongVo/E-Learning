package e_learning.server.gamification.entity;

/** Canonical stored outcome vocabulary for Activity XP v2.2. */
public enum XpQuestionOutcome {
    CORRECT_FIRST_TRY,
    CORRECT_RETRY,
    CORRECT_WITH_HINT,
    WRONG_EXHAUSTED,
    TRY_HARD_WRONG,
    TIMEOUT,
    NO_INTERACTION
}
