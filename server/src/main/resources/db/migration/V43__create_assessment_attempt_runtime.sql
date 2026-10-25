-- Phase 7B: formal Assignment runtime. ActivitySession remains a separate aggregate.
-- Never modify earlier migrations; V43 is allocated after the documented V42 baseline.

CREATE TABLE assessment_attempts (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    timed_out_at TIMESTAMP WITHOUT TIME ZONE,
    time_limit_seconds INTEGER NOT NULL,
    deadline_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    total_possible_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_earned_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    percentage_score NUMERIC(7, 4),
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    active_session_id UUID,
    last_activity_at TIMESTAMP WITHOUT TIME ZONE,
    snapshot_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_assessment_attempt_assignment_student UNIQUE (assignment_id, student_id),
    CONSTRAINT ck_assessment_attempt_status
        CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT')),
    CONSTRAINT ck_assessment_attempt_time_limit_positive
        CHECK (time_limit_seconds > 0),
    CONSTRAINT ck_assessment_attempt_deadline
        CHECK (deadline_at >= started_at),
    CONSTRAINT ck_assessment_attempt_points_nonnegative
        CHECK (total_possible_points >= 0 AND total_earned_points >= 0),
    CONSTRAINT ck_assessment_attempt_snapshot_version
        CHECK (snapshot_version > 0),
    CONSTRAINT ck_assessment_attempt_percentage
        CHECK (percentage_score IS NULL OR (percentage_score >= 0 AND percentage_score <= 100))
);

CREATE INDEX ix_assessment_attempt_student_status
    ON assessment_attempts (student_id, status);

CREATE INDEX ix_assessment_attempt_assignment_status
    ON assessment_attempts (assignment_id, status);

CREATE TABLE assessment_attempt_questions (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    assignment_item_id BIGINT REFERENCES assignment_items(id) ON DELETE SET NULL,
    question_id BIGINT REFERENCES questions(id) ON DELETE SET NULL,
    position INTEGER NOT NULL,
    question_snapshot JSONB NOT NULL,
    possible_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_example BOOLEAN NOT NULL DEFAULT FALSE,
    snapshot_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_attempt_question_position UNIQUE (attempt_id, position),
    CONSTRAINT ck_attempt_question_position_nonnegative CHECK (position >= 0),
    CONSTRAINT ck_attempt_question_points_nonnegative CHECK (possible_points >= 0),
    CONSTRAINT ck_attempt_question_snapshot_version CHECK (snapshot_version > 0)
);

CREATE INDEX ix_assessment_attempt_questions_attempt
    ON assessment_attempt_questions (attempt_id, position);

CREATE TABLE assessment_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_question_id BIGINT NOT NULL
        REFERENCES assessment_attempt_questions(id) ON DELETE CASCADE,
    answer_payload JSONB NOT NULL,
    normalized_value JSONB,
    saved_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_attempt_answer_question UNIQUE (attempt_question_id)
);

CREATE TABLE assessment_attempt_part_results (
    id BIGSERIAL PRIMARY KEY,
    attempt_question_id BIGINT NOT NULL
        REFERENCES assessment_attempt_questions(id) ON DELETE CASCADE,
    part_key VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL,
    earned_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    possible_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    snapshot_version INTEGER NOT NULL DEFAULT 1,
    normalizer_version VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_attempt_part_result_key UNIQUE (attempt_question_id, part_key),
    CONSTRAINT ck_attempt_part_result_status
        CHECK (status IN ('CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'UNANSWERED')),
    CONSTRAINT ck_attempt_part_result_points
        CHECK (earned_points >= 0 AND possible_points >= 0 AND earned_points <= possible_points),
    CONSTRAINT ck_attempt_part_result_snapshot_version CHECK (snapshot_version > 0)
);

CREATE INDEX ix_attempt_part_results_question
    ON assessment_attempt_part_results (attempt_question_id);
