package e_learning.server.assessmentattempt.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttemptSessionResponse(Long attemptId, UUID activeSessionId, LocalDateTime serverNow, LocalDateTime deadlineAt) {}
