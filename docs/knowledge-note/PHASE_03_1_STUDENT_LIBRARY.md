# Phase 03.1 — Student Knowledge Library and Full Reader

Status: Source implemented on `feature/guided-reasoning-v1` (2026-11-21). Runtime and CI checks pending.

## Scope
- Standalone Student Navbar item **Kiến thức** opens `/student/knowledge`.
- Search and browse published notes by current Grade (including notes not linked to Topics), filter to a published Unit then a published Topic, paginate 12 per page.
- `/student/knowledge/{noteId}` opens the full Teacher-authored document with H2/H3 outline and marked Learning Block/Table links. Student may not edit content.
- Student Topic Quick Summary / in-context Dialog are **not** implemented in 03.1; they remain Phase 03.2.
- No draft/revision/summary duplicate persisted, no new migration and no external art/icon dependency.

## Data and security
New authenticated endpoints:
- `GET /v1/student/knowledge-notes?search=&unitId=&topicId=&page=1&size=12` → `ApiResponse<PageResponse<StudentKnowledgeNoteSummary>>`.
- `GET /v1/student/knowledge-notes/{noteId}` → `ApiResponse<StudentKnowledgeNoteDetail>`.

The API derives the Grade from the authenticated student's ACTIVE membership via the existing Student Unit visibility logic. A Note is readable only if status `PUBLISHED` and Note Grade equals the current class Grade. A forbidden/draft/unpublished/archived/other-grade ID returns not found without revealing its content. Lists exclude such Notes entirely.

- Without filters, published same-grade Notes are included regardless of Topic association.
- Unit filter must resolve to a visible published Unit.
- Topic filter must resolve to a published Topic and published Section/Unit of the same Grade and must belong to the selected Unit if one was supplied.
- Unit chips on cards are derived only from links through published Topics, Sections and Units (never expose hidden syllabus names).
- Existing `/v1/student/**` access is restricted to STUDENT in `SecurityConfig`. Student identity is from JWT subject, not a client-supplied ID.
- Notes are returned as stored JSON and rendered through the existing allowlisted `KnowledgeDocumentRenderer` (never `dangerouslySetInnerHTML`).

## Student UX
- Uses existing Student Indie Illustrated Scrapbook tokens, `PaperSurface`, `StudentPageHeading`, back link, collection empty state and Student visual registry.
- Original vector assets added: `scene.knowledge-shelf`, `doodle.reading-trail` and `doodle.bookmark-note`; reused `scene.open-notebook` and existing empty-state illustrations.
- Hero: warm lined kraft paper, readable primary copy, visible mobile notebook artwork. Cards: paper-like irregular ink borders and shadow-pop, unique numbered stamp, clear title and CTA.
- Search: 300 ms debounce, Unit → Topic dependent filters, reset and true empty/error/loading states.
- Reader: centered article page, sticky table of contents on large screens, key-point anchors (not an auto-generated duplicate summary), responsive tables, accessible keyboard links, reduced-motion styles.
- No third-party illustration library was added, preserving a single consistent art direction and avoiding new package/license overhead.

## Regression and acceptance checklist
1. Log in as a Student assigned an ACTIVE Grade 7 class. Publish two Grade 7 Notes (one linked to a Topic and one unlinked) and a Grade 8 Note.
2. Library should show both Grade 7 Notes and never the Grade 8 Note. The unlinked Note remains visible when Unit filter is empty.
3. Filter Unit → Topic; verify only Notes linked through published Topic/Section/Unit appear. Clear filters and verify all published current-grade Notes return.
4. Search title and description; paginate; verify empty/error/loading views and mobile 360px, tablet 768px, desktop.
5. Open a Note; compare paragraphs, H2/H3, Learning Blocks, formatted text, merged Tables, and bookmark/highlight anchors with Teacher Preview.
6. Try directly opening a Draft, Unpublished, Archived or other-grade Note URL. Backend should return a not-found response without content.
7. Remove the Student from an active class or disable the account; student API must reject access.
8. Unpublish a previously listed Note. Refresh list/detail and confirm its content disappears from the Student APIs.
9. Verify Student Navbar mobile and desktop navigation works, while Teacher pages and Activity/Assignment flows are unaffected.
10. Run `cd server && ./mvnw test` and `cd client-e-learning && npx tsc --noEmit && npm run lint` (not executed via GitHub connector).

## Next
Phase 03.2 Student Topic Knowledge Dialog: published Primary/Supplementary resolution, summary derived from headings and marked key points, reader links; all server filtered/authorized.
