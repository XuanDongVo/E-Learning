package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;

import java.time.LocalDateTime;

/**
 * Student-safe metadata used before Start/Resume.
 * Do not add class target IDs, authoring internals, answer keys or grading snapshots.
 */
public record AttemptIntroResponse(
        Long assignmentId,
        String assignmentTitle,
        String gradeName,
        Integer questionCount,
        LocalDateTime dueAt,
        Integer timeLimitSeconds,
        AssessmentAttemptStatus attemptStatus,
        boolean late,
        String availabilityCode
) {
}
