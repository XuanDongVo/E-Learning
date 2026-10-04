CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    grade_level SMALLINT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    start_at TIMESTAMP,
    due_at TIMESTAMP NOT NULL,
    time_limit_seconds INTEGER,
    answers_released_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assignment_grade_year_name UNIQUE (grade_level, academic_year, name),
    CONSTRAINT ck_assignment_grade CHECK (grade_level BETWEEN 6 AND 8),
    CONSTRAINT ck_assignment_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_assignment_time_limit CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0)
);

CREATE TABLE assignment_targets (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT ck_assignment_target_type CHECK (target_type IN ('GRADE', 'CLASS')),
    CONSTRAINT ck_assignment_target_reference CHECK (
        (target_type = 'GRADE' AND class_id IS NULL)
        OR (target_type = 'CLASS' AND class_id IS NOT NULL)
    ),
    CONSTRAINT uq_assignment_target_class UNIQUE (assignment_id, class_id)
);

CREATE INDEX idx_assignments_status_due ON assignments (status, due_at);
CREATE INDEX idx_assignment_targets_assignment ON assignment_targets (assignment_id);
