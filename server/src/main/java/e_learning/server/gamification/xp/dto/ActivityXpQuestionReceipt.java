package e_learning.server.gamification.xp.dto;

import e_learning.server.gamification.xp.entity.XpQuestionOutcome;

/** Persisted per-question XP audit exposed only after a terminal result. */
public record ActivityXpQuestionReceipt(
        Long sessionQuestionId,
        XpQuestionOutcome outcome,
        int baseXp,
        int finalXp
) {}
