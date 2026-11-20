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

## 2026-11-20 — Teacher authoring dialogs: responsive layout + import UX fix

Following screenshot-based review, the Template Library and JSON Import/Export dialogs
share `knowledge-note-workspace-dialog.tsx`, an explicit desktop-wide popup overriding
the global dialog primitive's `sm:max-w-sm` constraint. The header and footer remain
fixed inside the popup; the left controls and right preview scroll independently.
On mobile, those two panes stack in a bounded-height dialog.

**Template Library**
- Search and category chips filter the built-in v2 templates.
- The selected item is visibly highlighted, with a full-width scrollable preview.
- The Insert action returns a boolean from the Editor, and the modal does not close
  if insertion fails. Built-in content is cloned before insertion.

**JSON Import/Export**
- Import supports file selection or JSON paste; pasted input is validated on explicit
  'Kiểm tra JSON' rather than reporting parse errors on every keystroke.
- A changed input invalidates its previous preview; invalid or oversized file choices
  clear stale input. v1 migration results are clearly labelled.
- Target (article/summary/both), mode (insert/append/replace) and replacement confirmation
  are separate. Both always requires an explicit confirmed replacement.
- Preview occupies a separate, scrollable pane with horizontal scrolling inside tables.
- Export lets the Teacher choose scope then preview the JSON with Copy and Download
  actions in the persistent footer. Long previews are shortened for display, not in the
  actual copied/downloaded JSON. Exporting only article or summary leaves the other
  document empty in the portable envelope; importers should not blindly choose Both.
- These changes do **not** modify the existing table editing extensions or data schema.

**Verification:** Inspected the shared `DialogContent` implementation and static
import paths. Browser/manual responsive checks, TypeScript, ESLint, Vitest and build
have not been executed in this connector session. Validate 390px, 768px and 1440px
viewport widths before approving release.

## 2026-11-20 — Official Tiptap TableKit migration (client only)

The original custom ProseMirror table nodes and tableEditing plugin have been replaced with
the maintained `@tiptap/extension-table@^3.34.0` TableKit. The package is declared in
`package.json` and `package-lock.json`. The Table extension is extended only for the
Knowledge Note `purpose: comparison | general` attribute, preserving existing schema-v2
JSON documents, templates and v1→v2 migrated comparison tables.

Changes:
- TableKit supplies official tableRow, tableCell, tableHeader schema, editing plugins,
  selection handling, row/column commands, table navigation, merge/split and resizable
  columns. The custom PM table schema/plugin and keyboard handler have been removed.
- The Teacher table toolbar exposes **+ Hàng**, **+ Cột** immediately inside tables, and
  a secondary menu for before/after, header rows/columns, merge/split, type toggle
  and deletion. Actions use official Tiptap chain commands with editor focus.
- Row/column growth is capped in the UI at the Knowledge Note policy
  (100 rows / 12 columns). The width check uses ProseMirror TableMap for span awareness.
- Editor-only CSS styles table borders, selected cells, column resize handles and
  horizontal scrolling without applying styles to Teacher's other pages.
- Import validator supports Tiptap's optional cell alignment/column width attrs and
  a rowspan/colspan-aware occupancy grid. It rejects malformed merged tables;
  existing unmerged v2 tables still validate as before.
- Added focused unit tests for merged table validation and Tiptap Editor tests for
  insertion, row/column editing and purpose preservation.

Scope: Client only. No backend API, database, lifecycle, Student endpoint or
knowledge-note schemaVersion change; the Save button stays disabled.

**Verification status:** Static code/import reviews only from the GitHub connector.
`npm ci`, TypeScript, ESLint, Vitest and authenticated browser QA have not been
executed in this environment. The added lock entry uses the public npm registry
package URL without an integrity hash (registry metadata could not be retrieved
here); regenerate/verify integrity via `npm install --package-lock-only` on
a networked development machine before release.

Recommended manual checks: create comparison table, click cell, add row/column,
convert table purpose, select cells and merge/split, resize columns, Export JSON,
Import JSON into a fresh Editor, inspect Teacher Preview, test horizontal scrolling
on mobile and confirm Teacher non-Knowledge pages are unaffected.
