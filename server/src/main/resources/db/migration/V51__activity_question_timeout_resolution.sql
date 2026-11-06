-- Persist authoritative Activity question resolution for new sessions.
-- Existing questions remain NULL: correctness alone cannot reconstruct historical timeouts.
ALTER TABLE activity_session_questions
    ADD COLUMN resolution_reason VARCHAR(20),
    ADD CONSTRAINT ck_activity_question_resolution_reason
        CHECK (resolution_reason IS NULL OR resolution_reason IN ('CORRECT', 'WRONG', 'TIMEOUT'));
