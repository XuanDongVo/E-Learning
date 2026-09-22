CREATE TABLE media (
    id BIGSERIAL PRIMARY KEY,
    media_type VARCHAR(20) NOT NULL,
    public_id VARCHAR(500) NOT NULL UNIQUE,
    resource_type VARCHAR(20) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    format VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_media_type CHECK (media_type IN ('IMAGE', 'AUDIO')),
    CONSTRAINT ck_media_status CHECK (status IN ('PENDING', 'READY', 'FAILED', 'DELETED')),
    CONSTRAINT ck_media_size CHECK (size_bytes > 0)
);

CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_created_at ON media(created_at);

CREATE TABLE content_units (
    id BIGSERIAL PRIMARY KEY,
    grade_id BIGINT NOT NULL REFERENCES grades(id),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    cover_media_id BIGINT REFERENCES media(id),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    CONSTRAINT uk_content_unit_grade_code UNIQUE (grade_id, code),
    CONSTRAINT ck_content_unit_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_content_unit_order CHECK (display_order >= 0)
);

CREATE INDEX idx_content_units_grade_status ON content_units(grade_id, status);

CREATE TABLE content_sections (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL REFERENCES content_units(id),
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_content_section_unit_name UNIQUE (unit_id, name),
    CONSTRAINT ck_content_section_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_content_section_order CHECK (display_order >= 0)
);

CREATE INDEX idx_content_sections_unit_order ON content_sections(unit_id, display_order);

CREATE TABLE content_topics (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES content_sections(id),
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_content_topic_section_name UNIQUE (section_id, name),
    CONSTRAINT ck_content_topic_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_content_topic_order CHECK (display_order >= 0)
);

CREATE INDEX idx_content_topics_section_order ON content_topics(section_id, display_order);

CREATE TABLE content_question_banks (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES content_topics(id),
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_content_bank_topic_name UNIQUE (topic_id, name),
    CONSTRAINT ck_content_bank_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_content_bank_order CHECK (display_order >= 0)
);

CREATE INDEX idx_content_banks_topic_order ON content_question_banks(topic_id, display_order);

CREATE TABLE content_questions (
    id BIGSERIAL PRIMARY KEY,
    question_bank_id BIGINT NOT NULL REFERENCES content_question_banks(id),
    type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_content_question_type CHECK (type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'TYPE_ANSWER')),
    CONSTRAINT ck_content_question_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT ck_content_question_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_content_question_order CHECK (display_order >= 0)
);

CREATE INDEX idx_content_questions_bank_order ON content_questions(question_bank_id, display_order);

CREATE TABLE content_question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES content_questions(id) ON DELETE CASCADE,
    option_key VARCHAR(5) NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_question_option_order UNIQUE (question_id, display_order)
);

CREATE TABLE content_question_answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES content_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    normalized_answer TEXT NOT NULL,
    matching_mode VARCHAR(30) NOT NULL DEFAULT 'CASE_INSENSITIVE'
);

CREATE TABLE question_media (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES content_questions(id) ON DELETE CASCADE,
    media_id BIGINT NOT NULL REFERENCES media(id),
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uk_question_media UNIQUE (question_id, media_id)
);

CREATE INDEX idx_question_media_question_order ON question_media(question_id, display_order);
CREATE INDEX idx_question_media_media ON question_media(media_id);
