package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Result projection; visibility flags are server-derived from assignment settings. */
public record AttemptResultResponse(
        Long attemptId, Long assignmentId, AssessmentAttemptStatus status, LocalDateTime submittedAt,
        LocalDateTime timedOutAt, boolean late, BigDecimal totalPossiblePoints, BigDecimal totalEarnedPoints,
        BigDecimal percentageScore, boolean scoreVisible, boolean answersVisible, List<AttemptResultQuestionResponse> questions) {}
