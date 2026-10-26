package e_learning.server.assessmentattempt;

/** Sprint 0 logical contract for the V43 JSONB snapshot. */
public final class AssessmentAttemptSnapshotContract {
    public static final int CURRENT_VERSION = 1;
    public static final String DOCUMENT_VERSION = "version";
    public static final String DOCUMENT_SECTIONS = "sections";
    public static final String DOCUMENT_ITEMS = "items";
    public static final String DOCUMENT_BLOCKS = "blocks";
    public static final String DOCUMENT_QUESTIONS = "questions";
    public static final String SETTINGS_SHOW_SCORE_AFTER_SUBMIT = "show_score_after_submit";
    public static final String SETTINGS_SHOW_ANSWERS_AFTER_SUBMIT = "show_answers_after_submit";
    public static final String SETTINGS_SHOW_POINTS_PER_QUESTION = "show_points_per_question";
    private AssessmentAttemptSnapshotContract() {}
}
