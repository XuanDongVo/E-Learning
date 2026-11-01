-- Merge draft answer storage into assessment_attempt_questions.
-- Owner confirmed environment data is cleared; no backfill from assessment_attempt_answers.
-- Do not edit V43–V46.

ALTER TABLE assessment_attempt_questions
    ADD COLUMN answer_payload JSONB NULL,
    ADD COLUMN revision BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN saved_at TIMESTAMP WITHOUT TIME ZONE NULL;

ALTER TABLE assessment_attempt_questions
    ADD CONSTRAINT ck_attempt_question_revision_nonnegative CHECK (revision >= 0);

DROP TABLE assessment_attempt_answers;
