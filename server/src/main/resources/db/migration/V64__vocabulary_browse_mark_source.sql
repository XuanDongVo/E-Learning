-- Preserve existing FSRS history as STUDY; Browse marks carry an explicit source.
ALTER TABLE vocabulary_review_logs
    ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'STUDY'
    CONSTRAINT chk_vocabulary_review_source CHECK (source IN ('STUDY', 'BROWSE_MARK'));
