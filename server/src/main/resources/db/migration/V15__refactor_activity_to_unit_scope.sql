ALTER TABLE activities ADD COLUMN unit_id BIGINT;

UPDATE activities a
SET unit_id = s.unit_id
FROM content_topics t
JOIN content_sections s ON s.id = t.section_id
WHERE a.topic_id = t.id;

ALTER TABLE activities ADD CONSTRAINT fk_activity_unit
    FOREIGN KEY (unit_id) REFERENCES content_units(id);

ALTER TABLE activities ALTER COLUMN unit_id SET NOT NULL;

ALTER TABLE activities DROP CONSTRAINT IF EXISTS fk_activity_topic;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS uk_activity_topic_name;
DROP INDEX IF EXISTS idx_activities_topic;

ALTER TABLE activities DROP COLUMN topic_id;

ALTER TABLE activities ADD COLUMN display_order INT NOT NULL DEFAULT 0;

ALTER TABLE activities ADD CONSTRAINT uk_activity_unit_name UNIQUE (unit_id, name);
CREATE INDEX idx_activities_unit ON activities(unit_id);
CREATE INDEX idx_activities_unit_order ON activities(unit_id, display_order);

ALTER TABLE activities DROP CONSTRAINT IF EXISTS ck_activity_distribution_mode;
ALTER TABLE activities ADD CONSTRAINT ck_activity_distribution_mode
    CHECK (distribution_mode IN ('EQUAL', 'PERCENTAGE', 'FIXED_COUNT'));
