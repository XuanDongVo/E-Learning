package e_learning.server.gamification.dto;

import e_learning.server.gamification.entity.XpQuestionOutcome;

/** Persisted per-question XP audit exposed only after a terminal result. */
public record ActivityXpQuestionReceipt(
        Long sessionQuestionId,
        XpQuestionOutcome outcome,
        int baseXp,
        int finalXp
) {}
