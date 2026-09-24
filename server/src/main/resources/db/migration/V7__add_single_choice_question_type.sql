ALTER TABLE content_questions
    DROP CONSTRAINT IF EXISTS ck_content_question_type;

ALTER TABLE content_questions
    ADD CONSTRAINT ck_content_question_type
    CHECK (type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'TYPE_ANSWER'));
