package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptEventType;

import java.time.LocalDateTime;

public record CreateAttemptEventResponse(
        Long eventId,
        AssessmentAttemptEventType eventType,
        LocalDateTime occurredAt,
        long leaveEventCount
) {
}
