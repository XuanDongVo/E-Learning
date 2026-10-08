CREATE TABLE activity_sessions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    activity_id BIGINT NOT NULL REFERENCES activities(id),
    mode VARCHAR(20) NOT NULL,
    selection_strategy VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_questions INTEGER NOT NULL,
    first_correct_count INTEGER NOT NULL DEFAULT 0,
    final_correct_count INTEGER NOT NULL DEFAULT 0,
    hint_used_count INTEGER NOT NULL DEFAULT 0,
    score NUMERIC(5,2),
    lives INTEGER,
    CONSTRAINT ck_activity_session_mode CHECK (mode IN ('LEARNING', 'TRY_HARD')),
    CONSTRAINT ck_activity_session_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'GAME_OVER', 'ABANDONED')),
    CONSTRAINT ck_activity_session_counts CHECK (
        total_questions >= 1
        AND first_correct_count >= 0
        AND final_correct_count >= 0
        AND hint_used_count >= 0
    )
);

CREATE INDEX idx_activity_sessions_student_status ON activity_sessions(student_id, status);
CREATE INDEX idx_activity_sessions_activity ON activity_sessions(activity_id);

CREATE TABLE activity_session_questions (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id),
    position INTEGER NOT NULL,
    served_at TIMESTAMP,
    deadline_at TIMESTAMP,
    answer_attempts INTEGER NOT NULL DEFAULT 0,
    first_correct BOOLEAN,
    final_correct BOOLEAN,
    hint_used BOOLEAN NOT NULL DEFAULT FALSE,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_activity_session_question_position UNIQUE (session_id, position),
    CONSTRAINT uq_activity_session_question_question UNIQUE (session_id, question_id),
    CONSTRAINT ck_activity_session_question_position CHECK (position >= 0)
);

CREATE INDEX idx_activity_session_questions_session ON activity_session_questions(session_id, position);
