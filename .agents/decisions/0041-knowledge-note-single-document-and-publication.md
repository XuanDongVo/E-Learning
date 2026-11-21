# ADR 0041 — Knowledge Note single-document authoring and publication

Status: **Accepted** (2026-11-20)
Scope: Phase 02.4 and Phase 02.5.
Supersedes relevant Summary, schema-version and Published-save assumptions in Knowledge Note FRS/SRS v3.2.

## Decisions

- One independent Knowledge Note may be reused across several Topics through `knowledge_note_topic_links`. Student Knowledge Library is a standalone destination; Topic will have a contextual Dialog for linked published notes (Student implementation remains deferred).
- Only `knowledge_notes.document_json` stores active authored content. No separately editable Quick Summary.
- The Topic Dialog uses H2/H3 headings to derive an outline and marked Learning Blocks/Tables to derive key points; no additional materialized outline/summary columns.
- Each navigable Heading, Learning Block and Table may have an ID; IDs must be unique. The editor generates stable IDs on insertion and regenerates copied duplicates.
- `summary_json` and `schema_version` are removed from the *active* Note table via V69 after archiving prior values and rejecting unreviewed nonempty legacy v1 documents. Existing meaningful Summary is appended to the canonical document as a marked callout.
- Content API GET/PUT contains only `document` plus response metadata; no `schemaVersion`, `baseVersion`, `editVersion`, or `updated_by`. `schemaVersion:3` remains in downloadable JSON files to decode older imported formats.
- Auto-save remains debounced by 2 seconds and serialized per Editor, ignoring no-op snapshots. No cross-teacher collaboration model is needed.
- DRAFT and UNPUBLISHED may be edited. PUBLISHED and ARCHIVED may not be edited directly. Publish requires nonempty validated content; if linked as Primary, at least one Heading and one marked key-point block. Unpublish hides from future Student APIs without erasing the Note or Topic links. Archive is final/read-only in the current MVP.
- No independent Draft/Revision entity or automatic published snapshot.

## Explicit exclusions

Phase 02.4/02.5 does NOT implement Student data APIs, a Student Knowledge Library page with live data, Topic-link management APIs, or a live Student Topic Dialog. Teacher-only live Preview demonstrates the proposed two-tab Dialog without granting Student access.

## Migration safety

V66–V68 are immutable. V69 creates `knowledge_note_legacy_content_backup` and stops if a nonempty v1 document cannot be safely converted. Running Flyway V69 on a production database requires a DB backup and inspecting old data beforehand.
