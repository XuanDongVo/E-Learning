package e_learning.server.assessmentattempt.dto;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Student-safe runtime projection. Never expose answer keys, accepted answers,
 * grading internals or hidden normalized values while the attempt is active.
 */
public record AttemptRuntimeResponse(
        Long attemptId,
        Long assignmentId,
        String assignmentTitle,
        AssessmentAttemptStatus status,
        LocalDateTime startedAt,
        LocalDateTime deadlineAt,
        LocalDateTime serverNow,
        Integer timeLimitSeconds,
        Long classIdAtStart,
        String classNameAtStart,
        boolean late,
        UUID activeSessionId,
        Integer snapshotVersion,
        Map<String, Object> document,
        Map<String, Object> settings,
        List<AttemptRuntimeQuestionResponse> questions
) {
}
