package e_learning.server.activitysession.dto;

import e_learning.server.activitysession.enums.GuidedQuestionStage;

public record GuidedStepAnswerResponse(
        ActivitySessionResponse session, boolean correct, int attemptNumber,
        boolean retryAvailable, boolean stepResolved, GuidedQuestionStage stage) {}
