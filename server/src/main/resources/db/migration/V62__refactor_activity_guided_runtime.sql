ALTER TABLE activity_session_questions
    ADD COLUMN delivery_type VARCHAR(30);

UPDATE activity_session_questions
SET delivery_type = CASE
    WHEN guided_snapshot_payload IS NOT NULL THEN 'GUIDED_REASONING'
    ELSE 'CLASSIC'
END;

ALTER TABLE activity_session_questions
    ALTER COLUMN delivery_type SET NOT NULL,
    ADD CONSTRAINT ck_activity_session_question_delivery_type
        CHECK (delivery_type IN ('CLASSIC', 'GUIDED_REASONING'));

CREATE TABLE activity_session_guided_progress (
    session_question_id BIGINT PRIMARY KEY
        REFERENCES activity_session_questions(id) ON DELETE CASCADE,
    snapshot_schema_version INTEGER NOT NULL,
    snapshot_payload JSONB NOT NULL,
    stage VARCHAR(30) NOT NULL,
    current_step_index INTEGER NOT NULL,
    CONSTRAINT ck_guided_progress_stage CHECK (
        stage IN ('STEP_ACTIVE', 'STEP_RETRY', 'FINAL_PENDING', 'FINAL_RETRY', 'QUESTION_RESOLVED')
    ),
    CONSTRAINT ck_guided_progress_step_index CHECK (current_step_index >= 0)
);

INSERT INTO activity_session_guided_progress (
    session_question_id, snapshot_schema_version, snapshot_payload, stage, current_step_index
)
SELECT id, guided_snapshot_schema_version, guided_snapshot_payload, guided_stage, guided_current_step_index
FROM activity_session_questions
WHERE delivery_type = 'GUIDED_REASONING';

CREATE TABLE activity_session_guided_step_hints (
    session_question_id BIGINT NOT NULL
        REFERENCES activity_session_questions(id) ON DELETE CASCADE,
    step_key VARCHAR(120) NOT NULL,
    used_at TIMESTAMP,
    PRIMARY KEY (session_question_id, step_key)
);

INSERT INTO activity_session_guided_step_hints (session_question_id, step_key, used_at)
SELECT question.id, used_step.step_key, NULL
FROM activity_session_questions question
CROSS JOIN LATERAL jsonb_array_elements_text(
    COALESCE(question.guided_hint_used_step_keys, '[]'::jsonb)
) AS used_step(step_key)
WHERE question.delivery_type = 'GUIDED_REASONING'
ON CONFLICT (session_question_id, step_key) DO NOTHING;

ALTER TABLE activity_session_guided_step_attempts
    ADD COLUMN retry_available BOOLEAN,
    ADD COLUMN step_resolved BOOLEAN,
    ADD COLUMN stage_after VARCHAR(30),
    ADD CONSTRAINT ck_guided_step_attempt_stage_after CHECK (
        stage_after IS NULL OR stage_after IN (
            'STEP_ACTIVE', 'STEP_RETRY', 'FINAL_PENDING', 'FINAL_RETRY', 'QUESTION_RESOLVED'
        )
    );

CREATE TABLE activity_session_final_answer_attempts (
    id BIGSERIAL PRIMARY KEY,
    session_question_id BIGINT NOT NULL
        REFERENCES activity_session_questions(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    request_id UUID NOT NULL,
    submitted_answer JSONB NOT NULL,
    correct BOOLEAN NOT NULL,
    retry_available BOOLEAN NOT NULL,
    resolved BOOLEAN NOT NULL,
    answer_revealed BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_final_answer_attempt_number
        UNIQUE (session_question_id, attempt_number),
    CONSTRAINT uq_final_answer_attempt_request
        UNIQUE (session_question_id, request_id),
    CONSTRAINT ck_final_answer_attempt_number CHECK (attempt_number >= 1)
);

CREATE INDEX idx_final_answer_attempts_question
    ON activity_session_final_answer_attempts(session_question_id, attempt_number);

