-- Forward-only: preserve legacy content before retiring active Summary and schema version.
-- No changes to V66-V68 checksums. The backup is archival, not an authoring source.
CREATE TABLE IF NOT EXISTS knowledge_note_legacy_content_backup (
    knowledge_note_id BIGINT PRIMARY KEY,
    document_json JSONB NOT NULL,
    summary_json JSONB,
    schema_version INTEGER NOT NULL,
    backed_up_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO knowledge_note_legacy_content_backup
    (knowledge_note_id, document_json, summary_json, schema_version)
SELECT id, document_json, summary_json, schema_version
FROM knowledge_notes
ON CONFLICT (knowledge_note_id) DO NOTHING;

-- v1 learning blocks may require a structural migration: do not silently corrupt them.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM knowledge_notes
    WHERE schema_version <> 2
      AND document_json NOT IN (
        '{"type":"doc","content":[]}'::jsonb,
        '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
      )
  ) THEN
    RAISE EXCEPTION 'Knowledge Notes with nonempty legacy document require a reviewed migration before V69';
  END IF;
END $$;

-- Preserve meaningful old summaries inside the canonical document, as a marked callout.
-- This is a one-time conversion; all future writes target document_json only.
UPDATE knowledge_notes
SET document_json = jsonb_set(
  document_json,
  '{content}',
  (document_json->'content') || jsonb_build_array(
    jsonb_build_object(
      'type', 'learningBlock',
      'attrs', jsonb_build_object(
        'id', 'legacy-summary-' || id,
        'kind', 'callout',
        'title', 'Ghi chú từ Quick Summary cũ',
        'variant', 'note',
        'isKeyPoint', TRUE
      ),
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'learningSection',
          'attrs', '{"role":"body"}'::jsonb,
          'content', summary_json->'content'
        ),
        jsonb_build_object(
          'type', 'learningSection',
          'attrs', '{"role":"explanation"}'::jsonb,
          'content', '[{"type":"paragraph"}]'::jsonb
        )
      )
    )
  )
)
WHERE summary_json IS NOT NULL
  AND jsonb_typeof(summary_json->'content') = 'array'
  AND jsonb_array_length(summary_json->'content') > 0
  AND summary_json::text ~ '"text"[[:space:]]*:[[:space:]]*"[^"]';

ALTER TABLE knowledge_notes
    DROP COLUMN summary_json,
    DROP COLUMN schema_version;
