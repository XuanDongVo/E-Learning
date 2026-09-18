CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade SMALLINT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_name_year UNIQUE (name, academic_year),
    CONSTRAINT ck_class_grade CHECK (grade BETWEEN 6 AND 8)
);

CREATE TABLE class_members (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_member UNIQUE (class_id, user_id),
    CONSTRAINT ck_class_member_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_class_members_user ON class_members (user_id);
CREATE INDEX idx_class_members_class ON class_members (class_id);