# Teacher Knowledge Note Management — UI slice 02.1

**Branch:** `feature/guided-reasoning-v1`  
**Scope:** Real Teacher management, create, metadata detail using only ADR 0039's approved endpoints.  
**Code status:** Implemented in source; runtime/build/e2e not verified from this environment.

## Reuse and architecture
- Reuses Teacher `ContentBreadcrumb`, shared `DataTable` and built-in 1-based pagination, `StatusBadge`, `RegionState`, `PageBanner`, `Button` and `Input`.
- Reuses `gradeService.list` and `PageResponse<T>` from `types/content` (no feature-specific paging type).
- Uses `teacherKnowledgeNoteService` and `KNOWLEDGE_NOTE_KEYS`; React Query hooks are now enabled for the approved list and detail endpoints.
- UI remains on the existing Teacher theme; Student-only components are not imported.
- Teacher sidebar `Content` section now includes "Sổ tay kiến thức", with active navigation handling.

## Screen contract
**Management** `/teacher/content/knowledge-notes`:
- Primary CTA "Tạo bài lý thuyết".
- Debounced server-side search by title/description; Grade, status and linked/unlinked filters, 1-based pagination (10/20/50 per page).
- Table: title/description, Grade, status, linked Topics count, updated date, detail link.
- Loading, empty, filtered empty, error/retry and pagination states.
- No edit/publish/archive/Topic-link action in this slice.

**Create** `/teacher/content/knowledge-notes/new`:
- Grade loaded from existing active-grade API; title (required, max 200), description (optional, max 1000).
- Submit POST only after client validation; display server errors without losing typed form.
- On confirmed response, invalidate Teacher note queries, toast success, redirect to metadata detail.
- No content editor or category/media fields.

**Detail** `/teacher/content/knowledge-notes/{noteId}`:
- Real GET metadata only: title, Grade, description, status, Topic-link count and timestamps.
- Loading, invalid ID, missing Note/error and retry. Shows a clear "Editor to be implemented" notice, not a fake editable document.
- Avoid guessing Grade name from database ID.

## Approved API usage
```text
POST /v1/teacher/knowledge-notes
GET  /v1/teacher/knowledge-notes
GET  /v1/teacher/knowledge-notes/{id}
GET  /v1/grades   (existing Grade source)
```
No other Knowledge Note backend endpoint is called.

## Manual QA checklist (not yet executed)
1. Teacher opens sidebar `Content > Sổ tay kiến thức`; active state is correct and other submenu items still work.
2. On empty database, the table shows true empty state and a real Create CTA.
3. Search/Grade/status/linked filters each produce backend requests with correct query strings; clearing restores all items.
4. Changing page size resets to page 1; previous/next match `PageResponse` (1-based).
5. Loading state and network/auth failures show retry without fabricated data.
6. Create requires Grade and nonblank title; description optional. Length limits enforce 200/1000.
7. Grade API failure blocks submit and displays retry; zero available Grades shows explanatory state.
8. Failed create shows server error and preserves all inputs; no success toast or redirect.
9. Successful create displays success, invalidates cached list and routes to `/{id}`.
10. Detail renders actual metadata, correct status and Topic-link count; nonexistent id shows server 404 message; invalid id never fetches.
11. Create/Detail do not expose a working content save, Publish or Topic-linking button.
12. Keyboard navigation, screen readers, 360px mobile, tablet, desktop, and Teacher/Student CSS separation are visually verified.

## Verification constraints
No local running checkout was available; the GitHub connection permits repository source edits but does not execute `npm run lint`, `npm run build`, API integration or browser tests. Static source/tree review was completed only. Execute frontend build and manual browser QA against a live backend before marking runtime accepted.
