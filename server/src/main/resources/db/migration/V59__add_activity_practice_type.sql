ALTER TABLE activities
    ADD COLUMN practice_type VARCHAR(30) NOT NULL DEFAULT 'CLASSIC';

ALTER TABLE activities
    ADD CONSTRAINT ck_activity_practice_type
        CHECK (practice_type IN ('CLASSIC', 'GUIDED_REASONING'));
