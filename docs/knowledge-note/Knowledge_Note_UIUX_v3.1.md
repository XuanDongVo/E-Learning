# Knowledge Note — UI/UX Specification v3.1
Status: Approved direction, not implemented
Date: 2026-11-19
References: [SRS](./Knowledge_Note_SRS_v3.1.md) · [FRS](./Knowledge_Note_FRS_v3.1.md) · [ADR 0038](../../.agents/decisions/0038-independent-knowledge-notes.md)

## Information architecture
Four standalone pages: Student Knowledge Library (S01), Student Knowledge Note Detail (S03), Teacher Knowledge Note Management (T01), Teacher Word-like Editor (T02).
Two embedded sections: Topic Quick Summary (S02) within current Student UnitDetailView filters, Topic Knowledge section (T04) within Teacher Topic Detail.
One mode: Student Preview & Publish (T03) inside T02, not an independent route.

Student theme: Indie Illustrated Scrapbook, using existing PaperSurface, border-ink, shadow-pop and semantic tokens; Teacher keeps existing neutral administrative design. Do not create a second Student dashboard. No category filter, cover art, image upload or mediaId UI in MVP.

## S01 — Student Knowledge Library
- Dedicated Navbar item "Sổ tay kiến thức" near Learning/Vocabulary; verify desktop nav overflow and mobile menu.
- Breadcrumb, restrained hero, search, Grade scope (server-authorized), optional Unit-related filter, published Note cards and pagination.
- Card: title, description, Grade, optional related Unit names; no cover/category. Notes with zero Topic links remain visible and can be labeled "Học liệu chung".
- De-duplicate notes linked to multiple Topics; one card per Note.
- Loading skeleton, empty Library, no search results, API error/retry.
- Desktop 3 columns when space allows; tablet 2; mobile 1 (or 2 only with readable text).
- Click card → S03; preserve search/filter on back navigation.

## S02 — Topic Quick Summary (embedded Student Unit Detail)
- Existing Unit → Section filter → Topic filter remains; no new Student Topic route.
- Only render when a specific Topic is selected. Place after Topic filter, before Activity list.
- If published Primary Note has summary: compact 2–4-point summary and "Đọc lý thuyết đầy đủ".
- Supplementary published Notes appear as concise "Tài liệu đọc thêm" links; never render multiple full summaries.
- If no Primary but Supplementary exist: only reading list. If no eligible notes: omit entire section.
- Unpublished Primary never automatically replaced by first supplementary.
- Returning from S03 restores selected Section/Topic and does not reset Activity list.

## S03 — Student Knowledge Note Detail
- Reading experience: paper-like article, title/description, Grade, Quick Summary, body sections, TOC desktop sticky / mobile collapsible, optional related Topic links.
- Content column max approximately 720–760px; body 15–16px, line height ~1.7, clear H2/H3 hierarchy.
- Examples, formulas, mistakes, callouts and comparison tables have consistent semantic styling; normal paragraphs share a continuous reading surface.
- Tables scroll horizontally on small screens; links have safe targets; keyboard and screen reader navigation supported.
- Entry from Library → return Library; entry from Topic → return selected Unit/Topic; do not infer access from URL origin.
- Standalone Note has no mandatory Activity CTA; show contextual CTA only when a valid learning context exists.
- Loading, inaccessible/unpublished, error and empty-body safeguards.

## T01 — Teacher Knowledge Note Management
- Header/breadcrumb and one main "Tạo bài mới" CTA; table with Note title, Grade, lifecycle, linked Topic count, updated time, action menu.
- Search title/description; filters Grade, status and linked/unlinked; no Category or Cover controls.
- Create modal collects Grade, title and optional description; Topic is optional and not requested as required input.
- Row actions: edit, preview, manage links, publish/unpublish/archive as allowed.
- Explicit "Published · Có thay đổi chưa công bố" state; empty/loading/error/pagination.
- Reuse existing Teacher table/dialog patterns rather than Student scrapbook styling.

## T02 — Teacher Word-like Editor
- Document-style editing canvas, not a field-per-paragraph form; direct typing, selection toolbar, slash menu, block handles, undo/redo, paste from Word with safe formatting.
- Header: breadcrumb, Note title, save status, Save Draft, Preview and publish action.
- Optional side panel: Grade and metadata, Topic links count and "Quản lý liên kết"; linking is separate from content editing.
- Basic blocks: paragraph, heading, list, safe link, divider; learning blocks: Formula, Example, Comparison, Callout, Common Mistake; a dedicated compact Quick Summary editor.
- No Image block, upload button, cover or category field.
- One Quick Summary per Note, authored directly, not truncated from full article. May be absent for standalone/supplementary Note; required when a Note is Primary at publish time.
- Draft save/auto-save feedback: saving, saved, unsaved, failed, conflict; AlertDialog before leaving unsaved changes.
- Keyboard alternatives for block reorder; toolbar must not obscure text on mobile.
- Full page editor canvas ~760–820px; no simulated A4 page breaks.

## T03 — Student Preview & Publish mode
- Open from T02, preview full Student Reader and compact Topic Summary separately.
- Desktop/mobile viewport toggle; preview reflects Draft and displays "Chưa công bố" where appropriate.
- If linked as Primary and Summary absent/invalid, show precise validation and jump to Summary editor.
- Publish update is explicit; Student continues seeing previous published revision until server confirms success.
- Close Preview returns to Editor preserving unsaved work.

## T04 — Teacher Topic Knowledge integration
- Embed in existing Teacher Topic Detail after Topic metadata and before Question Banks; avoid duplicate full Activity lists.
- Show all linked Notes with title, Grade, Draft/Published, Primary badge and order; Primary optional.
- "Gắn học liệu" opens searchable picker of existing Notes filtered to compatible Grade; allow attach as supplementary by default.
- Explicit actions: set Primary, clear Primary, reorder, unlink. Unlink confirmation states Note itself will not be deleted.
- Primary may be absent; do not auto-select first Note. Unpublished Note remains visible to Teacher but not Student.
- Empty state: no Note linked, buttons "Gắn học liệu" and "Tạo Knowledge Note".

## Shared states and accessibility
Every data screen: loading, empty, error, success, disabled; editor: saving/conflict/offline; publication: Draft/Published/Unpublished/Archived and unpublished edits.
Visible focus, accessible toolbar names, meaningful headings, ~44px touch targets where possible, sufficient contrast, no hover-only essential actions. Student-specific CSS must not leak into Teacher.

## Acceptance UX journeys
A. Student Navbar → Library → unlinked published Note → reader → back, with filters preserved.
B. Student Unit → choose Section/Topic → Primary Summary + supplementary links → reader → return to same Topic → Activity.
C. Teacher create standalone Note → edit Summary/body → save → preview → publish → visible in Library.
D. Teacher Topic → attach existing Note → optional Primary → reorder/unlink without deleting source.
E. Teacher edits Published Note → preview Draft → publish update; Student content unchanged until publish.
F. Topic with supplementary-only Notes shows no Quick Summary and no empty placeholder.
