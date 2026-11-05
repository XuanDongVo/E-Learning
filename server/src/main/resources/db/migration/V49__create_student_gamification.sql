-- Student Gamification foundation (XP, Streak, Freeze)
-- No reward catalog / inventory in this phase.

CREATE TABLE student_gamification_profiles (
    id                      BIGSERIAL PRIMARY KEY,
    student_id              BIGINT NOT NULL UNIQUE REFERENCES users(id),
    lifetime_xp             BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_xp >= 0),
    current_level           INT NOT NULL DEFAULT 1 CHECK (current_level >= 1),
    current_streak          INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak          INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_qualified_date     DATE,
    active_avatar_key       VARCHAR(255),
    active_mascot_key       VARCHAR(255),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE xp_transactions (
    id                      BIGSERIAL PRIMARY KEY,
    student_id              BIGINT NOT NULL REFERENCES users(id),
    activity_session_id     BIGINT,
    source_type             VARCHAR(40) NOT NULL,
    source_id               BIGINT,
    amount                  INT NOT NULL,
    earned_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    idempotency_key         VARCHAR(255) NOT NULL UNIQUE,
    note                    VARCHAR(500)
);

CREATE INDEX idx_xp_transactions_student_earned
    ON xp_transactions (student_id, earned_at DESC);

CREATE TABLE student_learning_days (
    id                          BIGSERIAL PRIMARY KEY,
    student_id                  BIGINT NOT NULL REFERENCES users(id),
    learning_date               DATE NOT NULL,
    qualifying_session_count    INT NOT NULL DEFAULT 1 CHECK (qualifying_session_count >= 1),
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, learning_date)
);

CREATE TABLE student_streak_freeze_usages (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES users(id),
    used_for_date       DATE NOT NULL,
    used_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    source              VARCHAR(40) NOT NULL,
    UNIQUE (student_id, used_for_date)
);
