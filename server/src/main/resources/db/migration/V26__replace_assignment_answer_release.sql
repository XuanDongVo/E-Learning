ALTER TABLE assignments
    ADD COLUMN show_answers_after_submit BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE assignments
    DROP COLUMN answers_released_at;
