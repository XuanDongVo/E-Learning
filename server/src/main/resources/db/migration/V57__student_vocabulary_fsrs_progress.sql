-- Phase 02: only explicitly reviewed words get an FSRS card; no backfill from games.
CREATE TABLE student_vocabulary_progress (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id BIGINT NOT NULL REFERENCES vocabulary_words(id) ON DELETE RESTRICT,
    card_json TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_vocabulary_progress UNIQUE (student_id, word_id)
);

CREATE INDEX idx_student_vocabulary_due ON student_vocabulary_progress(student_id, due_at);

CREATE TABLE vocabulary_review_logs (
    id BIGSERIAL PRIMARY KEY,
    progress_id BIGINT NOT NULL REFERENCES student_vocabulary_progress(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id BIGINT NOT NULL REFERENCES vocabulary_words(id) ON DELETE RESTRICT,
    request_id UUID NOT NULL,
    rating VARCHAR(10) NOT NULL CHECK (rating IN ('AGAIN', 'HARD', 'GOOD', 'EASY')),
    reviewed_at TIMESTAMPTZ NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    card_state VARCHAR(15) NOT NULL CHECK (card_state IN ('LEARNING', 'REVIEW', 'RELEARNING')),
    review_count INT NOT NULL CHECK (review_count > 0),
    card_json TEXT NOT NULL,
    review_log_json TEXT NOT NULL,
    CONSTRAINT uk_vocabulary_review_request UNIQUE (student_id, request_id)
);

CREATE INDEX idx_vocabulary_review_history ON vocabulary_review_logs(student_id, word_id, reviewed_at DESC);
