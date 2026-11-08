package e_learning.server.gamification.xp.dto;

import java.util.List;

/** Read-only provisional amount; MUST NOT update ledger or profile. */
public record ActivityXpPreview(
        Long sessionId,
        int provisionalQuestionXp,
        List<ActivityXpQuestionEvaluation> resolvedQuestions
) {}
