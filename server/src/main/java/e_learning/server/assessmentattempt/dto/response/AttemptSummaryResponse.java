package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;

import java.time.LocalDateTime;

/**
 * Safe status projection. Do not add answer keys, grading snapshots or normalized values here.
 */
public record AttemptSummaryResponse(
        Long id,
        Long assignmentId,
        AssessmentAttemptStatus status,
        LocalDateTime startedAt,
        LocalDateTime deadlineAt,
        LocalDateTime submittedAt,
        LocalDateTime timedOutAt,
        boolean late
) {
}
