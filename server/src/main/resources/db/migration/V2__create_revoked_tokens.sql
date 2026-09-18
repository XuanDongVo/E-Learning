CREATE TABLE revoked_tokens (
    id BIGSERIAL PRIMARY KEY,
    jwt_id VARCHAR(36) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_revoked_tokens_expires_at ON revoked_tokens (expires_at);