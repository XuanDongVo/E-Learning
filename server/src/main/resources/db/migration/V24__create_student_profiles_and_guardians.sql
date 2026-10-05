CREATE TABLE student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_student_profile_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER'))
);

CREATE TABLE student_guardians (
    id BIGSERIAL PRIMARY KEY,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    relationship VARCHAR(20) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_student_guardian_relationship CHECK (relationship IN ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'))
);

CREATE INDEX idx_student_guardians_profile ON student_guardians (student_profile_id);
