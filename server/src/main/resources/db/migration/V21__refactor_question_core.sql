-- Refactor Question into a shared core and separate domain ownership.
-- Existing question rows/children are intentionally removed and reseeded in V22.

DROP TABLE IF EXISTS assignment_questions;
DROP TABLE IF EXISTS question_media;
DROP TABLE IF EXISTS content_question_answers;
DROP TABLE IF EXISTS content_question_options;
DROP TABLE IF EXISTS content_questions;

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    matching_mode VARCHAR(30) NOT NULL DEFAULT 'CASE_INSENSITIVE_TRIM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_questions_type CHECK (type IN ('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','FILL_IN_BLANK','TYPE_ANSWER')),
    CONSTRAINT ck_questions_difficulty CHECK (difficulty IN ('EASY','MEDIUM','HARD'))
);

CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_complete ON questions(is_complete);

CREATE TABLE content_questions (
    question_id BIGINT PRIMARY KEY,
    question_bank_id BIGINT NOT NULL,
    CONSTRAINT fk_content_question_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_content_question_bank FOREIGN KEY (question_bank_id) REFERENCES content_question_banks(id) ON DELETE CASCADE
);
CREATE INDEX idx_content_questions_bank ON content_questions(question_bank_id);

CREATE TABLE assignment_questions (
    question_id BIGINT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    topic_id BIGINT,
    position INTEGER NOT NULL,
    CONSTRAINT fk_assignment_question_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_question_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_question_topic FOREIGN KEY (topic_id) REFERENCES content_topics(id) ON DELETE SET NULL,
    CONSTRAINT uq_assignment_question_position UNIQUE (assignment_id, position),
    CONSTRAINT ck_assignment_question_position CHECK (position >= 0)
);
CREATE INDEX idx_assignment_questions_assignment_position ON assignment_questions(assignment_id, position);
CREATE INDEX idx_assignment_questions_topic ON assignment_questions(topic_id);

CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_key VARCHAR(5) NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT uk_question_option_key UNIQUE (question_id, option_key)
);

CREATE TABLE question_answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    raw_value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    CONSTRAINT fk_question_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
CREATE INDEX idx_question_answers_question ON question_answers(question_id);

CREATE TABLE question_media (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    media_id BIGINT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_question_media_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_question_media_media FOREIGN KEY (media_id) REFERENCES media(id),
    CONSTRAINT uk_question_media UNIQUE (question_id, media_id)
);
CREATE INDEX idx_question_media_question_order ON question_media(question_id, display_order);
CREATE INDEX idx_question_media_media ON question_media(media_id);
