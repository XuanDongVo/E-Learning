-- Student-owned, manual study planning. No dependency on Activities or Assignments.
CREATE TABLE student_study_tasks (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(140) NOT NULL,
    notes VARCHAR(600),
    planned_date DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_study_task_nonblank_title CHECK (length(btrim(title)) > 0),
    CONSTRAINT ck_study_task_completion_consistent CHECK (
        (completed = TRUE AND completed_at IS NOT NULL)
        OR (completed = FALSE AND completed_at IS NULL)
    )
);
CREATE INDEX ix_study_tasks_owner_status_date
    ON student_study_tasks(student_id, completed, planned_date, created_at DESC);
