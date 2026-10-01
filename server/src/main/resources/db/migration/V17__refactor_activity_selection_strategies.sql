CREATE TABLE activity_selection_strategies (
    activity_id BIGINT NOT NULL,
    selection_strategy VARCHAR(30) NOT NULL,

    CONSTRAINT pk_activity_selection_strategies
        PRIMARY KEY (activity_id, selection_strategy),

    CONSTRAINT fk_activity_selection_strategies_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_activity_selection_strategy
        CHECK (selection_strategy IN ('RANDOM', 'WEAKNESS_PRIORITY'))
);

INSERT INTO activity_selection_strategies (activity_id, selection_strategy)
SELECT id, selection_strategy
FROM activities;

ALTER TABLE activities
    DROP CONSTRAINT IF EXISTS ck_activity_selection_strategy;

ALTER TABLE activities
    DROP COLUMN selection_strategy;
