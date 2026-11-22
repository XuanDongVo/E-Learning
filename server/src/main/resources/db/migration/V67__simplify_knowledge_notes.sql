-- Forward-only simplification of the V66 scaffold.
-- Do not rewrite V66: it may already have been applied by Flyway.
-- No Knowledge Note business API was enabled in V66; existing scaffold data, if any,
-- must be reviewed before this migration because the old draft/revision tables are dropped.
ALTER TABLE knowledge_notes
    DROP CONSTRAINT IF EXISTS fk_knowledge_note_published_revision_owner;
ALTER TABLE knowledge_notes
    DROP COLUMN IF EXISTS published_revision_id;
ALTER TABLE knowledge_notes
    ADD COLUMN document_json JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
    ADD COLUMN summary_json JSONB,
    ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN edit_version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE knowledge_notes
    ADD CONSTRAINT ck_knowledge_note_schema_version CHECK (schema_version > 0),
    ADD CONSTRAINT ck_knowledge_note_edit_version CHECK (edit_version >= 0);
DROP TABLE IF EXISTS knowledge_note_drafts;
DROP TABLE IF EXISTS knowledge_note_revisions;
