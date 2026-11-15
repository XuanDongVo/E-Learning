ALTER TABLE activity_session_questions
    ADD COLUMN guided_snapshot_schema_version INTEGER,
    ADD COLUMN guided_snapshot_payload JSONB,
    ADD COLUMN guided_stage VARCHAR(30),
    ADD COLUMN guided_current_step_index INTEGER,
    ADD COLUMN guided_current_step_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN guided_current_step_hint_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN guided_hint_used_step_keys JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE activity_session_guided_step_attempts (
    id BIGSERIAL PRIMARY KEY,
    session_question_id BIGINT NOT NULL REFERENCES activity_session_questions(id) ON DELETE CASCADE,
    step_key VARCHAR(120) NOT NULL,
    attempt_number INTEGER NOT NULL,
    request_id UUID NOT NULL,
    submitted_answer JSONB NOT NULL,
    correct BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_guided_step_attempt_number UNIQUE (session_question_id, step_key, attempt_number),
    CONSTRAINT uq_guided_step_attempt_request UNIQUE (session_question_id, request_id),
    CONSTRAINT ck_guided_step_attempt_number CHECK (attempt_number >= 1)
);

CREATE INDEX idx_guided_step_attempts_question
    ON activity_session_guided_step_attempts(session_question_id, step_key, attempt_number);
