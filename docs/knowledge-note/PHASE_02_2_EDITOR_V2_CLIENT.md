# Knowledge Note — Editor v2 Client Implementation

Date: 2026-11-20
Status: Client-only implementation. Backend content persistence remains deferred.

## What changed from v1

- Versioned portable JSON envelope is now `{format:"e-learning-knowledge-note",schemaVersion:2,document,summary}`.
- `learningBlock` now contains ordered `learningSection` children with editable paragraphs/lists/text marks; it is no longer an atomic textarea with `body` and `secondary` strings.
- Structured kinds: `formula` (expression/explanation/condition), `example` (example/explanation/translation), `callout` (body/explanation; note/tip/warning/important), `commonMistake` (incorrect/correct/explanation).
- The v1 two-column `comparison` block migrates to a `table` node with `purpose:"comparison"`. Both general and comparison tables use `tableRow`, `tableHeader`, `tableCell` and ProseMirror tables.
- Replaced the stand-alone Teacher renderer and the shared renderer placeholder with one allowlisted shared React JSON renderer; Teacher Preview and Template/Import previews all use it. Student content APIs/pages stay inactive.
- Editor toolbar provides dynamic table insert, row/column operations, header toggles and purpose toggle; templates and JSON import/export are dialogs.

## Client-only architecture

```text
Teacher Editor (TipTap 3)
   ├── Structured Learning Block extensions + Section NodeViews
   ├── Table extensions (from existing @tiptap/pm/tables)
   ├── Built-in Template Registry (static, v2 JSON)
   ├── JSON Import/Export (strict validation + v1 migration)
   └── Teacher-only live Student-styled Preview via BroadcastChannel
               ↓
    Shared KnowledgeDocumentRenderer
```

No new dependencies, backend API, database migration, Student authorization, or publication behavior were added. Save remains **disabled**. All imported content is only in TipTap memory. Browser reload, navigation, or tab close loses unsaved changes.

## Format contract

Full export:
```json
{"format":"e-learning-knowledge-note","schemaVersion":2,
 "document":{"type":"doc","content":[]},
 "summary":{"type":"doc","content":[]}}
```

Block export:
```json
{"format":"e-learning-knowledge-note-blocks","schemaVersion":2,"content":[]}
```

Export choices: all, article only, summary only, currently selected top-level Learning Block/table.

Import choices: JSON file (max 512 KB) or pasted JSON; target article, summary or both; insert, append, replace. Importing both is always a confirmed replacement. Changing metadata such as Grade, Topic links, ID, lifecycle and editVersion is not supported.

## Node allowlist

Article: paragraph, heading H2/H3, text, hardBreak, ordered/bullet lists, listItem, horizontalRule, table/row/header/cell, learningBlock and learningSection.

Summary: paragraph, text, hardBreak, ordered/bullet lists, listItem. No educational blocks, tables or headings.

Marks: bold, italic and safe link (http, https, mailto). No HTML, script, image/media, iframe or arbitrary nodes. Unknown nodes/attributes cause a user-visible rejection rather than data loss.

Technical limits (provisional, to be benchmarked): 512 KB file, depth 24, 2–12 columns, up to 100 rows, limited node counts. Editor disables add-row/add-column commands once these bounds are reached.

## v1 → v2 migration

Conversion happens **only at client Import time**, not automatically on the server or on metadata GET. The v1 schema never had content persistence APIs. The original v1 file is unchanged.

- Standard text nodes are preserved recursively.
- Formula maps `body → expression`, `secondary → explanation`.
- Example maps `body → example`, `secondary → explanation`.
- Callout maps `body → body`, `secondary → explanation`.
- CommonMistake maps `body → incorrect`, `secondary → correct`.
- Comparison maps its two column labels and texts into a two-column comparison table, and preserves a nonempty block title as a heading before the table.

Unexpected legacy attributes are rejected instead of silently discarded. Imported v1 content is validated again as v2 before applying to the Editor. No Flyway changes or automatic DB backfill have been added.

## Template Library

Built-in, versioned, frontend-only JSON templates: Grammar Formula; three-column Comparison; Example With Explanation; Common Mistake; Grammar Lesson Outline. A template inserts cloned v2 node JSON into the active Full Article editor. The registry is not editable or persisted; a future Teacher template-management service requires separate approval.

## Preview and persistence boundary

The dedicated `/teacher/knowledge-notes/{id}/preview` page uses Student Indie Illustrated Scrapbook styles, displaying Full Article or Quick Summary at desktop/mobile widths. Its data arrives only from the Editor's live in-memory document through a private same-origin per-tab BroadcastChannel. Direct access without an Editor session shows an unavailable state.

The backend entity still uses schemaVersion=1 for its initial placeholder and does not save v2 content. Phase 02.3 must explicitly approve the v2 server validator, reader compatibility, optimistic concurrency, and PUT/GET contracts.

## Validation

- Source-level import consistency and authored unit tests for schema v2, legacy migration, validation, templates and round-trip.
- **Frontend TypeScript, ESLint, Vitest and browser integration were not executed from the GitHub connector environment.** Do not assume runtime correctness until these run on a checked-out copy.
- Manual QA: insert every Learning Block; edit rich text; table add/delete row/column; Undo/Redo; import v1/v2; export-reimport; Full Article/Summary; Preview live update; leave-with-unsaved warning; mobile scroll.

## Known scope limits

- No merge/split cells or resizable column handles in this version; row/column manipulation is supported.
- Summary remains a separate editor; a replace-both import updates both editors, whose Undo histories are independent.
- No DOCX/PDF imports, image/video, AI generation, or global custom Template storage.
- Reading drafts from the server is still impossible until Phase 02.3.
