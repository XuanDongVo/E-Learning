CREATE TABLE assignment_question_idempotency (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    idempotency_key VARCHAR(200) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    question_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assignment_question_idempotency_key
        UNIQUE (assignment_id, idempotency_key),
    CONSTRAINT fk_assignment_question_idempotency_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    CONSTRAINT fk_assignment_question_idempotency_question
        FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE INDEX ix_assignment_question_idempotency_question
    ON assignment_question_idempotency (question_id);
