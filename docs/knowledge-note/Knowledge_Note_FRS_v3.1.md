# Knowledge Note — Functional Requirements Specification (FRS) v3.1
Status: Target contract, not implemented
Date: 2026-11-19
References: [SRS](./Knowledge_Note_SRS_v3.1.md) · [UI/UX](./Knowledge_Note_UIUX_v3.1.md) · [ADR 0038](../../.agents/decisions/0038-independent-knowledge-notes.md)

## Data contract (proposed)
### knowledge_notes
id PK, grade_id FK NOT NULL, title VARCHAR(200) NOT NULL, description VARCHAR(1000) NULL, lifecycle_status, published_revision_id NULL, created_by, updated_by, created_at, updated_at, published_at. No topic_id, category or cover_media_id.

### knowledge_note_drafts
knowledge_note_id UNIQUE FK, title, description, summary_json JSONB nullable, document_json JSONB, schema_version, edit_version, updated_by, updated_at. Draft mutable with optimistic concurrency; metadata is staged for publish to avoid leaking unreviewed title/description to Student.

### knowledge_note_revisions
id PK, knowledge_note_id FK, revision_number, title, description, summary_json JSONB nullable, document_json JSONB, schema_version, published_by, published_at. Unique(note_id, revision_number). Published revisions immutable. Published revision must belong to its Note. Retain snapshot for rollback/history (rollback UI deferred).

### knowledge_note_topic_links
id PK, knowledge_note_id FK, topic_id FK, is_primary BOOLEAN NOT NULL DEFAULT FALSE, display_order INTEGER NOT NULL CHECK >=0, created_at. UNIQUE(note_id, topic_id); PostgreSQL partial unique index on topic_id WHERE is_primary; index(note_id), index(topic_id, display_order). Topic FK uses actual existing content_topics mapping. No cascade from link deletion to Note deletion.

Lifecycle DRAFT/PUBLISHED/UNPUBLISHED/ARCHIVED; editing state derived from draft version vs published revision. Published Notes may have unpublished draft edits. Archive is non-public. Grade must be compatible with Topic's Unit Grade.

## FR-01 Create independent Note
Teacher chooses valid Grade, title and optional description; topicId not required. Server creates Note and Draft atomically. Default DRAFT. Duplicate titles permitted (unique ID). Return Note ID. No category/cover fields.

## FR-02 Teacher list and detail
Paginated search by title, Grade, lifecycle, linked/unlinked status; show linked Topic count, updated date and unpublished draft indicator. Do not filter by category. Teacher detail includes draft metadata and link information according to permissions.

## FR-03 Word-like authoring
Editor uses versioned JSON with allowlisted nodes/marks. MVP nodes: paragraph, H2/H3, ordered/bullet list, text marks, safe link, formula, example, callout, commonMistake, comparison table, divider. Quick Summary is a separately edited compact structured document. One logical Summary per Note; do not derive it by truncating body. No image/media nodes in MVP. Keyboard undo/redo, slash menu, paste sanitization and accessible block actions required.

## FR-04 Draft save
PUT draft with baseVersion and validated content. Server rejects stale version with 409; does not overwrite published revision. Auto-save optional UX with explicit saved/unsaved/error indicators. Save Draft may accept incomplete content; Publish has stricter validation.

## FR-05 Preview and publish
Teacher preview uses draft, offering Full Article and Topic Summary previews. Publish validates title, Grade, supported document schema, non-empty full content and summary when any Primary Topic link exists or the Note is being set as Primary. Transaction creates immutable revision, sets published_revision_id, status PUBLISHED, published_at. Updating an existing published Note follows same process without changing previously published snapshot until commit.

## FR-06 Unpublish and archive
Unpublish hides Student access without deleting Note or links; Teacher may re-publish after validation. Archive hides from Student and standard active Teacher list. Hard delete not in MVP. Unpublish a Primary does not promote supplementary notes.

## FR-07 Topic linking
Teacher may attach existing Note to Topic with isPrimary false by default, remove it, reorder links, set/change Primary or clear Primary. Validate teacher permission on Topic and Note, same Grade, uniqueness and existence. If Primary already exists, attach with isPrimary true is rejected; use explicit set-primary endpoint. Switching Primary is atomic and serialized per Topic. Clearing Primary uses noteId:null. Unlinking Primary leaves none. Links to unpublished Notes remain in Teacher UI, not Student.

## FR-08 Student Library
GET paginated published Notes within server-derived eligible Grade(s). Includes zero-link Notes; each Note appears once. Search title/description, optional Grade and linked Unit filters; no category/media filters. Note's Grade is authoritative; query gradeId cannot expand permission. Empty/loading/error states supported.

## FR-09 Student reader
GET Note ID returns only published revision metadata and structured content; 404/403 per existing security convention for inaccessible/unpublished resources. Safe renderer; no edit controls. Entry context is navigation state only, not authorization. A standalone Note must not force Activity CTA.

## FR-10 Student Topic summary
GET Topic links returns at most one eligible Primary with its published Quick Summary and a compact list of eligible Supplementary Notes. If Primary is unpublished, absent or summary invalid, no Summary; never auto-promote Supplementary. If Topic has no links, no Knowledge section is rendered. Return only published data.

## FR-11 Grade and Topic lifecycle
Prevent cross-grade linking. If Grade change would invalidate links, reject with actionable error until links are reconciled. Archiving Topic hides its contextual links but does not archive Note. Published unlinked Note remains eligible for Library. Grade authorization must be derived from principal and server state.

## FR-12 Security, concurrency, errors
Use server-side principal, validate all mutations, reject duplicate links with 409, invalid content with 400/422 following existing AppException conventions, stale drafts with 409, unauthorized access with existing auth conventions. Restrict links/protocols, block unsafe HTML and unsupported nodes. Use DB unique constraints and transactions as last-line enforcement.

## API proposal (not implemented)
Teacher:
- GET/POST /v1/content/knowledge-notes
- GET/PATCH /v1/content/knowledge-notes/{id}
- GET/PUT /v1/content/knowledge-notes/{id}/draft
- POST /v1/content/knowledge-notes/{id}/publish
- POST /v1/content/knowledge-notes/{id}/unpublish
- PATCH /v1/content/knowledge-notes/{id}/archive
- GET /v1/content/knowledge-notes/{id}/revisions
- GET /v1/content/knowledge-notes/{id}/topic-links

Topic management:
- GET/POST /v1/content/topics/{topicId}/knowledge-notes
- DELETE /v1/content/topics/{topicId}/knowledge-notes/{noteId}
- PUT /v1/content/topics/{topicId}/knowledge-notes/primary (knowledgeNoteId: integer|null)
- PUT /v1/content/topics/{topicId}/knowledge-notes/order

Student:
- GET /v1/student/knowledge-notes
- GET /v1/student/knowledge-notes/{id}
- GET /v1/student/topics/{topicId}/knowledge-notes

## Key acceptance tests
1. Create/publish standalone Grade 7 Note; eligible Student sees it in Library.
2. Link same Note to multiple Grade 7 Topics; no duplicate Library cards.
3. Topic with supplementary-only links renders reading list, no Summary.
4. Two Primary assignments fail safely; switch Primary is atomic.
5. Unlink Primary does not delete Note, promote another, or alter other Topic links.
6. Student cannot access Draft, unpublished Note, wrong Grade or archived Topic context.
7. Teacher edits published Note; Student continues seeing prior immutable revision until publish.
8. Concurrent stale Draft save yields 409 without data loss.
9. Image/media and category fields are not accepted or rendered in MVP.
10. No Note leaves existing Unit/Activity behavior unchanged.

## Phase plan
P1 domain/schema/permissions/API; P2 editor/schema/renderers; P3 Teacher management/linking/preview; P4 Student Library/Reader/Topic integration; P5 regression/security/mobile. No code implemented by this specification.
