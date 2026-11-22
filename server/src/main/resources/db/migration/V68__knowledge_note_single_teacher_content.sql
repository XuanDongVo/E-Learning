-- Single-teacher authoring: no per-editor identity or cross-editor optimistic version.
-- Keep created_by and updated_at; JWT authorization still applies.
ALTER TABLE knowledge_notes
    DROP COLUMN IF EXISTS updated_by,
    DROP COLUMN IF EXISTS edit_version;

-- Initial metadata-only scaffold notes contain no authored v1 content.
-- Upgrade only these empty records without modifying any unexpected legacy data.
UPDATE knowledge_notes
SET schema_version = 2,
    summary_json = COALESCE(summary_json, '{"type":"doc","content":[]}'::jsonb)
WHERE schema_version = 1
  AND document_json IN (
    '{"type":"doc","content":[]}'::jsonb,
    '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
  );
