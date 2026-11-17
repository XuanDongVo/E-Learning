package e_learning.server.activitysession.enums;

/** Public runtime stage; Final content remains hidden until FINAL_PENDING. */
public enum GuidedQuestionStage {
    STEP_ACTIVE,
    STEP_RETRY,
    FINAL_PENDING,
    FINAL_RETRY,
    QUESTION_RESOLVED
}
