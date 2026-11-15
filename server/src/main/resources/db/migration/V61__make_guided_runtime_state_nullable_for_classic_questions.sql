-- A session question is Classic unless it carries a Guided snapshot.
-- V60 initially used non-null defaults for mutable Guided state, which caused
-- Classic inserts to persist Guided-shaped values and made the JSON state
-- column mandatory. Relax those constraints before normalizing Classic rows.
ALTER TABLE activity_session_questions
    ALTER COLUMN guided_current_step_attempts DROP NOT NULL,
    ALTER COLUMN guided_current_step_attempts DROP DEFAULT,
    ALTER COLUMN guided_current_step_hint_used DROP NOT NULL,
    ALTER COLUMN guided_current_step_hint_used DROP DEFAULT,
    ALTER COLUMN guided_hint_used_step_keys DROP NOT NULL,
    ALTER COLUMN guided_hint_used_step_keys DROP DEFAULT;

UPDATE activity_session_questions
SET guided_snapshot_schema_version = NULL,
    guided_snapshot_payload = NULL,
    guided_stage = NULL,
    guided_current_step_index = NULL,
    guided_current_step_attempts = NULL,
    guided_current_step_hint_used = NULL,
    guided_hint_used_step_keys = NULL
WHERE guided_snapshot_payload IS NULL;

ALTER TABLE activity_session_questions
    ADD CONSTRAINT ck_activity_session_question_guided_runtime_shape CHECK (
        (
            guided_snapshot_payload IS NULL
            AND guided_snapshot_schema_version IS NULL
            AND guided_stage IS NULL
            AND guided_current_step_index IS NULL
            AND guided_current_step_attempts IS NULL
            AND guided_current_step_hint_used IS NULL
            AND guided_hint_used_step_keys IS NULL
        )
        OR
        (
            guided_snapshot_payload IS NOT NULL
            AND guided_snapshot_schema_version IS NOT NULL
            AND guided_stage IS NOT NULL
            AND guided_current_step_index IS NOT NULL
            AND guided_current_step_attempts IS NOT NULL
            AND guided_current_step_hint_used IS NOT NULL
            AND guided_hint_used_step_keys IS NOT NULL
        )
    );
