-- Every Assignment must have a whole-number time limit greater than one minute.
-- Backfill legacy rows before enforcing the invariant; 60 minutes matches the Builder default.
UPDATE assignments
SET time_limit_minutes = 60
WHERE time_limit_minutes IS NULL OR time_limit_minutes <= 1;

ALTER TABLE assignments
    ALTER COLUMN time_limit_minutes SET NOT NULL;

ALTER TABLE assignments
    ADD CONSTRAINT ck_assignments_time_limit_minutes_gt_one
    CHECK (time_limit_minutes > 1);
