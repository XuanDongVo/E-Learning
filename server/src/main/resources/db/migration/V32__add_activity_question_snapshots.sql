UPDATE activity_sessions
SET status = 'ABANDONED',
    completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
WHERE status = 'IN_PROGRESS';

ALTER TABLE activity_session_questions
    ADD COLUMN snapshot_schema_version INTEGER,
    ADD COLUMN snapshot_content_revision BIGINT,
    ADD COLUMN snapshot_payload TEXT;
