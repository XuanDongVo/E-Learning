package e_learning.server.assessmentattempt.dto;

import java.time.LocalDateTime;

public record SaveAttemptAnswerResponse(Long attemptQuestionId, long revision, LocalDateTime savedAt, LocalDateTime serverNow) {}
