ALTER TABLE questions
    ADD COLUMN content_revision BIGINT NOT NULL DEFAULT 1;

ALTER TABLE question_options
    ADD COLUMN display_order INTEGER;

WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY id) AS position
    FROM question_options
)
UPDATE question_options qo
SET display_order = ordered.position
FROM ordered
WHERE qo.id = ordered.id;

ALTER TABLE question_options
    ALTER COLUMN display_order SET NOT NULL,
    ADD CONSTRAINT ck_question_option_display_order_positive CHECK (display_order > 0),
    ADD CONSTRAINT uk_question_option_display_order UNIQUE (question_id, display_order);

ALTER TABLE questions
    ADD CONSTRAINT ck_question_content_revision_positive CHECK (content_revision > 0);
