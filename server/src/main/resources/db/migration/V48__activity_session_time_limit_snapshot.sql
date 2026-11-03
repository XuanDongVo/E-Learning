-- ADR 0025: freeze Try Hard per-question time limit at session start.
-- Existing rows stay NULL; runtime falls back to live Activity only for legacy sessions.
ALTER TABLE activity_sessions
    ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER NULL;
