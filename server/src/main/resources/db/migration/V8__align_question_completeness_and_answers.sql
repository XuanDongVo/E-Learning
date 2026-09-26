ALTER TABLE content_questions
    ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE content_questions
    ADD COLUMN IF NOT EXISTS matching_mode VARCHAR(30) NOT NULL DEFAULT 'CASE_INSENSITIVE_TRIM';

ALTER TABLE content_question_options
    DROP CONSTRAINT IF EXISTS uk_question_option_order;

ALTER TABLE content_question_options
    DROP COLUMN IF EXISTS display_order;

ALTER TABLE content_question_answers
    RENAME COLUMN answer_text TO raw_value;

ALTER TABLE content_question_answers
    RENAME COLUMN normalized_answer TO normalized_value;

ALTER TABLE content_question_answers
    DROP COLUMN IF EXISTS matching_mode;
