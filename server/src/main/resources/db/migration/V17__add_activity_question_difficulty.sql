ALTER TABLE activities
    ADD COLUMN question_difficulty VARCHAR(20) NOT NULL DEFAULT 'MIXED';

ALTER TABLE activities
    ADD CONSTRAINT chk_activity_question_difficulty
    CHECK (question_difficulty IN ('EASY', 'MEDIUM', 'HARD', 'MIXED'));
