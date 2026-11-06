package e_learning.server.activitysession.dto;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.gamification.dto.ActivityXpQuestionReceipt;
import e_learning.server.gamification.dto.ActivityXpRewardReceipt;
import java.math.BigDecimal;
import java.util.List;

public record ActivitySessionResultResponse(
        Long id, ActivitySessionStatus status, ActivityMode mode,
        SelectionStrategy selectionStrategy, int totalQuestions,
        int firstCorrectCount, int finalCorrectCount, int hintUsedCount,
        BigDecimal score, Integer lives,
        ActivityXpRewardReceipt xpReward,
        List<ActivityXpQuestionReceipt> xpQuestions) {}
