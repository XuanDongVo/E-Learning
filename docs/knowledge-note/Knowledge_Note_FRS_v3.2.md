# Knowledge Note — FRS v3.2 (Simple MVP)
Status: Target contract only; APIs currently 501
Date: 2026-11-19
Supersedes FRS v3.1 for Draft/Revision and publication snapshot assumptions.

## Domain
1. `knowledge_notes` is the sole content store: id, grade_id, title, description, document_json JSONB, summary_json JSONB nullable, schema_version, edit_version, status, author/update timestamps and users, published_at. **No** draft/revision tables, published_revision_id, topic_id, category or mediaId.
2. `knowledge_note_topic_links`: id, note FK, topic FK, is_primary, display_order, created_at; unique(note_id, topic_id), partial unique(topic_id WHERE is_primary).
3. Existing `content_topics` remains unchanged. Same-Grade linkage must be validated at service layer.
4. Schema migration: V66 created preliminary 4 tables; V67 removes provisional Draft/Revision tables and moves JSON into KnowledgeNote. V66 remains immutable for Flyway checksums. If V66 has been populated outside the scaffold, review/backup old data before running V67.

## Functional requirements
**FR-01 Create:** Teacher creates a standalone DRAFT Note (Grade, title, optional description). Server initializes document_json to empty document JSON; no Topic required.

**FR-02 List/detail:** Teacher list supports search/Grade/status/linked filters and pagination; detail includes metadata. No category/cover filter.

**FR-03 Direct save:** GET/PUT `/{id}/content` returns/updates KnowledgeNote.document_json, summary_json, schema_version and edit_version, with baseVersion optimistic concurrency; stale writes return 409. No Draft endpoint. Content updates under PUBLISHED become immediately Student-visible.

**FR-04 Publish:** Validate nonempty document, JSON schema, Grade and required Quick Summary if Note is Primary on a Topic. Set PUBLISHED and published_at. No new revision created.

**FR-05 Unpublish/archive:** Hide current content from all Student entry points, keep Note and Topic links. Re-publish may expose edits made while unpublished. Hard delete not in MVP.

**FR-06 Linking:** Many-to-many, Primary optional; switch/clear Primary atomically; cross-Grade links prohibited; no auto-promotion. Unpublish Note does not remove links.

**FR-07 Student Library:** List only PUBLISHED within server-derived eligible Grade, including unlinked Notes; deduplicate. Paginate and search. Client grade filter must not grant access.

**FR-08 Student Detail:** Read current document/summary only when PUBLISHED and authorized; no revision number. Student Topic endpoint shows primary summary only when eligible, plus supplementary links; no primary means list-only.

**FR-09 Editor/UX:** Before saving an edited PUBLISHED Note, show explicit impact warning (the content becomes visible immediately). Recommend Unpublish → Edit → Publish for staged edits. Unsaved-change dialog and validation required.

**FR-10 Safety:** Allowlisted block JSON; no image/media content in MVP; server-side permission and grade checks; no raw HTML, cross-topic authorization bypass or misleading success.

## API contract (proposed; not implemented)
Teacher:
- GET/POST `/v1/content/knowledge-notes`
- GET/PATCH `/v1/content/knowledge-notes/{id}`
- GET/PUT `/v1/content/knowledge-notes/{id}/content` (replaces `/draft`)
- POST `/v1/content/knowledge-notes/{id}/publish`
- POST `/v1/content/knowledge-notes/{id}/unpublish`
- PATCH `/v1/content/knowledge-notes/{id}/archive`
- GET `/v1/content/knowledge-notes/{id}/topic-links`
Topic: GET/POST `/v1/content/topics/{topicId}/knowledge-notes`, DELETE `/.../{noteId}`, PUT `/.../primary`, PUT `/.../order`.
Student: GET `/v1/student/knowledge-notes`, GET `/.../{id}`, GET `/v1/student/topics/{topicId}/knowledge-notes`.

No `/{id}/revisions` endpoint. GET/PUT content payload: `{document, summary, schemaVersion, baseVersion}`; response: `{knowledgeNoteId, document, summary, schemaVersion, editVersion, updatedAt}`.

## Checks
Direct save persists without extra tables; status gates Student access; published changes are immediately visible; editVersion conflict rejected; Primary ≤1/Topic; optional links; wrong-Grade rejected; no image/category fields.

## Implementation state
Existing controller/service signatures reflect this contract but deliberately fail closed with HTTP 501 until phased implementation. This FRS does not claim running APIs.
