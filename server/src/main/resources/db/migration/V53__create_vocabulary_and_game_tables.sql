-- ========================================================
-- 1. BẢNG TỪ VỰNG THEO UNIT (vocabulary_words)
-- ========================================================
CREATE TABLE vocabulary_words (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    word VARCHAR(100) NOT NULL,
    meaning_vi VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(100),
    part_of_speech VARCHAR(30),
    example_sentence TEXT,
    example_meaning_vi TEXT,
    audio_url VARCHAR(500),
    image_url VARCHAR(500),
    difficulty VARCHAR(20) NOT NULL DEFAULT 'EASY',
    display_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vocab_unit FOREIGN KEY (unit_id) REFERENCES content_units(id) ON DELETE CASCADE,
    CONSTRAINT ck_vocab_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT ck_vocab_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_vocab_words_unit ON vocabulary_words(unit_id);
CREATE INDEX idx_vocab_words_status ON vocabulary_words(unit_id, status);

-- ========================================================
-- 2. BẢNG PHIÊN CHƠI MINI GAME (vocabulary_game_sessions)
-- (Không có cơ chế mất mạng - 100% học sinh hoàn thành bài)
-- ========================================================
CREATE TABLE vocabulary_game_sessions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'PRACTICE',
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    total_words INT NOT NULL DEFAULT 0,
    first_try_correct INT NOT NULL DEFAULT 0,
    total_score INT NOT NULL DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
    earned_xp INT DEFAULT 0,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,

    CONSTRAINT fk_game_session_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_session_unit FOREIGN KEY (unit_id) REFERENCES content_units(id) ON DELETE CASCADE,
    CONSTRAINT ck_game_session_type CHECK (game_type IN ('BUBBLE_POP', 'WORD_RAIN')),
    CONSTRAINT ck_game_session_mode CHECK (mode IN ('PRACTICE', 'CHALLENGE')),
    CONSTRAINT ck_game_session_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))
);

CREATE INDEX idx_game_sessions_student ON vocabulary_game_sessions(student_id);
CREATE INDEX idx_game_sessions_unit ON vocabulary_game_sessions(unit_id);

-- ========================================================
-- 3. BẢNG KẾT QUẢ TỪNG TỪ TRONG PHIÊN (vocabulary_game_answers)
-- ========================================================
CREATE TABLE vocabulary_game_answers (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    word_id BIGINT NOT NULL,
    first_try_correct BOOLEAN NOT NULL DEFAULT FALSE,
    attempts_count INT NOT NULL DEFAULT 1,
    response_time_ms INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_game_answer_session FOREIGN KEY (session_id) REFERENCES vocabulary_game_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_answer_word FOREIGN KEY (word_id) REFERENCES vocabulary_words(id) ON DELETE CASCADE
);

CREATE INDEX idx_game_answers_session ON vocabulary_game_answers(session_id);

