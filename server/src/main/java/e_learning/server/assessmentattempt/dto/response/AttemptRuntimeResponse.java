package e_learning.server.assessmentattempt.dto.response;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Student-safe runtime projection. Never expose answer keys, accepted answers, grading internals or hidden normalized values while active. */
public record AttemptRuntimeResponse(
        Long attemptId, Long assignmentId, String assignmentTitle, AssessmentAttemptStatus status,
        LocalDateTime startedAt, LocalDateTime deadlineAt, LocalDateTime serverNow, Integer timeLimitSeconds,
        Long classIdAtStart, String classNameAtStart, boolean late, Integer snapshotVersion,
        Map<String,Object> document, Map<String,Object> settings, List<AttemptRuntimeQuestionResponse> questions) {}
