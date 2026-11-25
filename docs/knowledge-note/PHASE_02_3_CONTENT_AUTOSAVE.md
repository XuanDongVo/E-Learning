# Knowledge Note — Phase 02.3 Content Persistence and Auto-save

Date: 2026-11-20
Scope: One Teacher, client + backend. Publication, Topic links and Student APIs are later phases.

## Server contract

- GET `/v1/teacher/knowledge-notes/{id}/content` returns `{knowledgeNoteId,schemaVersion,document,summary,updatedAt}`.
- PUT to the same URL with `{schemaVersion:2,document,summary}` atomically replaces both JSON values.
- Both routes use the existing teacher authentication policy.
- PUT accepts only DRAFT/UNPUBLISHED; PUBLISHED/ARCHIVED returns 409 (no changes persisted).
- Server validates Tiptap JSON v2 node/mark/attribute allowlists; rejects untrusted HTML/unknown nodes/unsafe link schemes, oversized content, invalid merged cells and excessive nesting.
- No baseVersion or multi-editor conflict protocol.
- Migration V68 drops `updated_by` and `edit_version`, upgrades empty schema-v1 scaffold rows to version 2. V66/V67 remain unchanged.

## Client

- Teacher Editor loads content from the server before enabling authoring; invalid/legacy data is not overwritten.
- Initial Tiptap hydration uses `setContent(..., {emitUpdate:false})` for both article and summary.
- Auto-save uses 2-second debounce plus manual Save Now.
- Exactly one PUT at a time per Editor, draining newer updates after the preceding PUT completes.
- States: dirty, saving, saved, save failed; a failed PUT never reports success.
- Unacknowledged changes produce an unload/leave warning.
- PUBLISHED and ARCHIVED Editor views are read-only.
- Import/export and live Teacher Preview remain client-only utilities over the current in-memory document.

## Verification

1. Create Draft; edit article and summary; wait for save; reload; confirm both restored.
2. Type while PUT is still running; confirm latest snapshot persists, and only one PUT is active.
3. Simulate network failure; confirm error, unsaved state and manual retry.
4. Save a merged table and Learning Block; reload; export/import v2 JSON; ensure no changes.
5. Server rejects unsafe links, unknown nodes, malformed tables, payload >512 KB.
6. Server rejects PUBLISHED/ARCHIVED writes (409); GET is still allowed for Teacher.
7. Run Flyway V68 after V67; confirm existing Note metadata and Topic links survive.
8. Regression: Teacher Assignments and Student pages are unaffected.

No Maven/npm build was executed in the connector environment. CI or local checkout must run Java tests, TypeScript, ESLint, and browser QA before deployment.
