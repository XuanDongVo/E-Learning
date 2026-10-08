package e_learning.server.activitysession.dto;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ActivitySessionResponse(
        Long id, ActivitySessionStatus status, ActivityMode mode,
        SelectionStrategy selectionStrategy, LocalDateTime startedAt,
        LocalDateTime completedAt, int totalQuestions, int firstCorrectCount,
        int finalCorrectCount, int hintUsedCount, BigDecimal score, Integer lives,
        List<ActivitySessionQuestionResponse> questions) {}
