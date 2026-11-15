package e_learning.server.activitysession.dto.response;

public record ActivitySessionAnswerResponse(
        ActivitySessionResponse session, boolean correct, boolean retryAvailable,
        boolean answerRevealed, String correctAnswer, String explanation) {}
