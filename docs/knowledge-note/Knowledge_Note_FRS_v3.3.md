# Knowledge Note — FRS v3.3 (Phase 02.4 / 02.5)

Date: 2026-11-20
Status: Accepted by owner, source implemented; runtime validation pending
Supersedes contradictory clauses in v3.2. ADR 0041 governs the new behavior.

## Domain

- One standalone, grade-scoped `knowledge_notes` row with title, description, document_json JSONB, status, created_by, created_at, updated_at, published_at.
- `knowledge_note_topic_links` is a many-to-many association with optional per-Topic Primary and display order. Linking APIs remain deferred.
- No summary_json, schema_version, edit_version, updated_by, Draft table, Revision table, media entity, or Topic column on KnowledgeNote.
- ID-bearing H2/H3 headings and marked Learning Blocks/Tables are stored as Tiptap JSON attributes: `id`, `isKeyPoint`. Outline and key-point collections are derived from Document; no duplicated storage.

## Teacher behavior

1. Create Grade/title/description -> DRAFT with empty Document.
2. GET/PUT content -> one validated Document only. PUT is accepted only for DRAFT/UNPUBLISHED.
3. Auto-save after 2 seconds idle; serial PUT queue, no-op suppression and manual Save. On failure retain in-memory content and show retry/warning.
4. Import/export supports schema v3 portable JSON, plus reading legacy v1/v2. Nonempty old Summary is migrated into a marked Callout, not discarded. File schemaVersion is NOT the autosave concurrency counter.
5. Teacher Preview uses same-origin, per-session BroadcastChannel from the current editor and supports full article versus a two-tab outline/key-point Dialog.
6. Publish (POST /publish) validates document, requires real readable text; when any Topic link is Primary, also requires at least one H2/H3 heading and marked Learning Block/Table.
7. Unpublish (POST /unpublish) moves PUBLISHED to UNPUBLISHED, retaining content and links. Re-publish is allowed.
8. Archive (PATCH /archive) makes any nonarchived Note permanently read-only/hidden in MVP; repeated archive is idempotent.
9. PUBLISHED/ARCHIVED cannot be content-edited or autosaved, regardless of what the client sends.

## API

- POST/GET `/v1/teacher/knowledge-notes`
- GET `/v1/teacher/knowledge-notes/{id}`
- GET/PUT `/v1/teacher/knowledge-notes/{id}/content`
- POST `/v1/teacher/knowledge-notes/{id}/publish`
- POST `/v1/teacher/knowledge-notes/{id}/unpublish`
- PATCH `/v1/teacher/knowledge-notes/{id}/archive`

PUT body: `{"document":{"type":"doc","content":[]}}`.

GET content data: `{"knowledgeNoteId":12,"document":{"type":"doc","content":[]},"updatedAt":"..."}`.

Lifecycle responses use existing `KnowledgeNoteResponse`, wrapped in standard `ApiResponse<T>`.

## Deferred Student behavior

- Library lists all eligible PUBLISHED notes including unlinked ones; Note Detail renders one full article.
- Topic shows a Dialog only for PUBLISHED links, with Primary preferred and supplementary notes selectable.
- The Dialog has two tabs: automatically derived outline (H2/H3) and teacher-marked key points.
- Selecting an outline item opens the independent Student Note Detail at the anchored section. No second full Reader in Dialog.
- Student authorization and grade restrictions must be implemented on server in a later phase. Teacher Preview is not Student access.

## Acceptance checks

- V69 safeguards/migrates existing summary content without modifying old Flyway scripts.
- GET/PUT preserves table merge geometry and Learning Block rich text.
- Auto-save and reloading preserve IDs and key-point flags; no update when nothing changed.
- Published and Archived PUT rejected, empty Publish rejected; Primary rules enforced.
- Existing features/roles unaffected; CI/local runtime checks required before deployment.
