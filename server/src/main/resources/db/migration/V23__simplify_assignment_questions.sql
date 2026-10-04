-- Assignment questions own a Question directly.
-- Topic grouping and manual ordering are intentionally deferred.

DROP INDEX IF EXISTS idx_assignment_questions_assignment_position;
DROP INDEX IF EXISTS idx_assignment_questions_topic;

ALTER TABLE assignment_questions
    DROP CONSTRAINT IF EXISTS uq_assignment_question_position;

ALTER TABLE assignment_questions
    DROP CONSTRAINT IF EXISTS fk_assignment_question_topic;

ALTER TABLE assignment_questions
    DROP CONSTRAINT IF EXISTS ck_assignment_question_position;

ALTER TABLE assignment_questions
    DROP COLUMN IF EXISTS topic_id;

ALTER TABLE assignment_questions
    DROP COLUMN IF EXISTS position;
