-- Knowledge Note structural foundation only; no learning/authoring behavior is enabled yet.
-- Notes are Grade-owned, independent of Topics. Topic relationships are optional.
CREATE TABLE knowledge_notes (
    id BIGSERIAL PRIMARY KEY,
    grade_id BIGINT NOT NULL REFERENCES grades(id),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_revision_id BIGINT,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    CONSTRAINT ck_knowledge_note_status CHECK (status IN ('DRAFT','PUBLISHED','UNPUBLISHED','ARCHIVED'))
);
CREATE INDEX idx_knowledge_notes_grade_status ON knowledge_notes(grade_id,status);
CREATE INDEX idx_knowledge_notes_updated_at ON knowledge_notes(updated_at);

CREATE TABLE knowledge_note_drafts (
    knowledge_note_id BIGINT PRIMARY KEY REFERENCES knowledge_notes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    summary_json JSONB,
    document_json JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
    schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
    edit_version BIGINT NOT NULL DEFAULT 0 CHECK (edit_version >= 0),
    updated_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_note_revisions (
    id BIGSERIAL PRIMARY KEY,
    knowledge_note_id BIGINT NOT NULL REFERENCES knowledge_notes(id),
    revision_number INTEGER NOT NULL CHECK (revision_number > 0),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    summary_json JSONB,
    document_json JSONB NOT NULL,
    schema_version INTEGER NOT NULL CHECK (schema_version > 0),
    published_by BIGINT REFERENCES users(id),
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_knowledge_note_revision_number UNIQUE (knowledge_note_id,revision_number),
    CONSTRAINT uk_knowledge_note_revision_owner UNIQUE (knowledge_note_id,id)
);
-- A published revision must belong to the referenced Note.
ALTER TABLE knowledge_notes ADD CONSTRAINT fk_knowledge_note_published_revision_owner
    FOREIGN KEY (id,published_revision_id)
    REFERENCES knowledge_note_revisions(knowledge_note_id,id);

CREATE TABLE knowledge_note_topic_links (
    id BIGSERIAL PRIMARY KEY,
    knowledge_note_id BIGINT NOT NULL REFERENCES knowledge_notes(id),
    topic_id BIGINT NOT NULL REFERENCES content_topics(id),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_knowledge_note_topic_link UNIQUE (knowledge_note_id,topic_id)
);
CREATE UNIQUE INDEX uk_knowledge_note_topic_primary ON knowledge_note_topic_links(topic_id) WHERE is_primary;
CREATE INDEX idx_knowledge_note_links_note ON knowledge_note_topic_links(knowledge_note_id);
CREATE INDEX idx_knowledge_note_links_topic_order ON knowledge_note_topic_links(topic_id,display_order);
