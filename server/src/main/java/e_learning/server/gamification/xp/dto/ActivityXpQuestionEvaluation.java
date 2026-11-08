package e_learning.server.gamification.xp.dto;

import e_learning.server.gamification.xp.entity.XpQuestionOutcome;
import e_learning.server.question.enums.Difficulty;
import java.time.LocalDateTime;

/** Audit breakdown for one resolved ActivitySessionQuestion; not an account credit. */
public record ActivityXpQuestionEvaluation(
        Long sessionQuestionId,
        Difficulty difficulty,
        XpQuestionOutcome outcome,
        int baseXp,
        int finalXp,
        LocalDateTime resolvedAt
) {}
