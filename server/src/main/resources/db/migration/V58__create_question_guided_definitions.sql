CREATE TABLE question_guided_definitions (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    version BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    source_question_revision BIGINT,
    definition_payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_question_guided_definition_question UNIQUE (question_id),
    CONSTRAINT fk_question_guided_definition_question
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT ck_question_guided_definition_schema_version_positive
        CHECK (schema_version > 0),
    CONSTRAINT ck_question_guided_definition_status
        CHECK (status IN ('DRAFT', 'READY'))
);

CREATE INDEX ix_question_guided_definitions_status
    ON question_guided_definitions(status);
