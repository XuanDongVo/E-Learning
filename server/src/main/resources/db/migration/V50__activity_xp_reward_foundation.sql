-- XP v2.2 persistence ONLY. Do not award or backfill historical XP.
ALTER TABLE activity_sessions
    ADD COLUMN xp_level_snapshot INTEGER,
    ADD COLUMN xp_policy_version VARCHAR(40),
    ADD COLUMN xp_multiplier NUMERIC(4,2),
    ADD COLUMN xp_question_total INTEGER,
    ADD COLUMN xp_completion_bonus INTEGER,
    ADD COLUMN xp_total INTEGER,
    ADD COLUMN xp_finalized_at TIMESTAMP,
    ADD CONSTRAINT ck_activity_session_xp_level CHECK (xp_level_snapshot IS NULL OR xp_level_snapshot >= 1),
    ADD CONSTRAINT ck_activity_session_xp_multiplier CHECK (xp_multiplier IS NULL OR xp_multiplier BETWEEN 0.20 AND 1.00),
    ADD CONSTRAINT ck_activity_session_xp_question_total CHECK (xp_question_total IS NULL OR xp_question_total >= 0),
    ADD CONSTRAINT ck_activity_session_xp_completion_bonus CHECK (xp_completion_bonus IS NULL OR xp_completion_bonus >= 0),
    ADD CONSTRAINT ck_activity_session_xp_total CHECK (xp_total IS NULL OR xp_total >= 0);

ALTER TABLE activity_session_questions
    ADD COLUMN xp_outcome VARCHAR(40),
    ADD COLUMN xp_base INTEGER,
    ADD COLUMN xp_final INTEGER,
    ADD COLUMN xp_resolved_at TIMESTAMP,
    ADD CONSTRAINT ck_activity_session_question_xp_base CHECK (xp_base IS NULL OR xp_base >= 0),
    ADD CONSTRAINT ck_activity_session_question_xp_final CHECK (xp_final IS NULL OR xp_final >= 0);

ALTER TABLE xp_transactions
    ADD COLUMN policy_version VARCHAR(40),
    ADD COLUMN level_snapshot INTEGER,
    ADD COLUMN xp_multiplier NUMERIC(4,2),
    ADD CONSTRAINT ck_xp_transaction_level_snapshot CHECK (level_snapshot IS NULL OR level_snapshot >= 1),
    ADD CONSTRAINT ck_xp_transaction_multiplier CHECK (xp_multiplier IS NULL OR xp_multiplier BETWEEN 0.20 AND 1.00);

-- Defense in depth: only one PRACTICE reward transaction per ActivitySession.
-- Preflight: check pre-existing PRACTICE rows for duplicates before Flyway.
CREATE UNIQUE INDEX uq_xp_transactions_practice_session
    ON xp_transactions (activity_session_id)
    WHERE source_type = 'PRACTICE' AND activity_session_id IS NOT NULL;
