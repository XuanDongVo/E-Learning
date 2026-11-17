package e_learning.server.activitysession.dto.response;

import e_learning.server.activitysession.dto.response.ordering.OrderingAnswerRevealResponse;

public record ActivitySessionAnswerResponse(
        ActivitySessionResponse session, boolean correct, boolean retryAvailable,
        boolean answerRevealed, String correctAnswer,
        OrderingAnswerRevealResponse orderingAnswer, String explanation) {}
