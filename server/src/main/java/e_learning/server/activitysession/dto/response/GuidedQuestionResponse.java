package e_learning.server.activitysession.dto.response;

import e_learning.server.activitysession.enums.GuidedQuestionStage;

/** Present only for Guided Activity session questions. */
public record GuidedQuestionResponse(
        GuidedQuestionStage stage, String introContent, GuidedCurrentStepResponse currentStep) {}
