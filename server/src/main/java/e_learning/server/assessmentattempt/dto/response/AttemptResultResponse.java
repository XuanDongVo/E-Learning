package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Result projection; visibility flags are server-derived from assignment settings. */
public record AttemptResultResponse(
        Long attemptId,
        Long assignmentId,
        String assignmentTitle,
        AssessmentAttemptStatus status,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        LocalDateTime timedOutAt,
        LocalDateTime finishedAt,
        LocalDateTime deadlineAt,
        Integer timeLimitMinutes,
        boolean late,
        Long classIdAtStart,
        String classNameAtStart,
        BigDecimal totalPossiblePoints,
        BigDecimal totalEarnedPoints,
        BigDecimal percentageScore,
        boolean scoreVisible,
        boolean answersVisible,
        Map<String, Object> document,
        List<AttemptResultQuestionResponse> questions
) {}