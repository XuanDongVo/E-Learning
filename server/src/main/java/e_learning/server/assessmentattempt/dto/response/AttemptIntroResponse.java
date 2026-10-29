package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assignment.entity.Assignment;

import java.time.LocalDateTime;

/**
 * Student-safe metadata used before Start/Resume.
 * Do not add class target IDs, authoring internals, answer keys or grading snapshots.
 */
public record AttemptIntroResponse(
        Long assignmentId,
        String assignmentTitle,
        String gradeName,
        long questionCount,
        LocalDateTime dueAt,
        Integer timeLimitMinutes,
        AssessmentAttemptStatus attemptStatus,
        /**
         * True when the assignment is past its due time
         * and the student has not completed the attempt.
         */
        boolean late
) {

    public static AttemptIntroResponse map(
            Assignment assignment,
            long questionCount,
            String gradeName,
            AssessmentAttemptStatus attemptStatus,
            boolean late
    ) {
        return new AttemptIntroResponse(
                assignment.getId(),
                assignment.getName(),
                gradeName,
                questionCount,
                assignment.getDueAt(),
                assignment.getTimeLimitMinutes(),
                attemptStatus,
                late
        );
    }
}
