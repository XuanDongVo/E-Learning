-- V43 was already applied. Keep it immutable and migrate the Attempt unit in a new version.
-- No runtime implementation existed when V43 was applied, so any legacy rows are not expected.
-- Round up rather than truncate if an earlier environment created a non-whole-minute duration.
ALTER TABLE assessment_attempts
    RENAME COLUMN time_limit_seconds TO time_limit_minutes;

UPDATE assessment_attempts
SET time_limit_minutes = CEIL(time_limit_minutes / 60.0)::INTEGER;

ALTER TABLE assessment_attempts
    RENAME CONSTRAINT ck_assessment_attempt_time_limit_positive
    TO ck_assessment_attempt_time_limit_minutes_positive;
