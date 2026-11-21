# Phase 03.4 — Student Knowledge Library UX

**Source implemented:** 2026-11-21, branch `feature/guided-reasoning-v1`.

## Role filters backed by real data

`GET /v1/student/knowledge-notes` retains existing `search`, `unitId`, `topicId`, `page`, `size` and supports optional `role`:

| Query | Meaning |
|---|---|
| omitted or `ALL` | All published Notes in current Student's Grade |
| `PRIMARY` | At least one published, visible Topic links Note as Primary |
| `SUPPLEMENTARY` | At least one published, visible Topic links Note as Supplementary |
| `UNLINKED` | No published, visible Topic links the Note (free reading) |

Filters are implemented as **database Specifications before pagination**, never by removing results from one current page. An invalid role yields `INVALID_REQUEST`. `UNLINKED` cannot be combined with `unitId` or `topicId`; the Student UI clears those filters when selected.

Each Student Note summary now includes `roles: ["PRIMARY" | "SUPPLEMENTARY" | "UNLINKED"]`. Roles are relative to **visible published Topics** and computed from Topic link rows (not duplicated fields). A Note can be Primary for Topic A and Supplementary for Topic B; both badges can appear and it appears in both corresponding filters. The filter is independent of reading progress and is not a Teacher editing status.

## Student Collection changes

- `StudentKnowledgeLibrary` keeps the same available Student Index page route and rich scrapbook illustration, plus clear role filter controls.
- Search remains debounced; Unit/Topic filtering remains dependent, server-backed and permission guarded.
- Selected PRIMARY/SUPPLEMENTARY role is preserved when narrowing by Unit.
- Card badges reflect server roles, and multiple linked Units are indicated.
- Pagination uses shared `StudentListPagination` with focus management on page changes.
- Distinguishes loading/error/empty/filtered-empty, with reset/retry and mobile-size controls.
- Legacy/rolling API response without `roles` does not crash card rendering; once new backend is deployed, role chips appear.

## Manual acceptance cases

1. Grade 7 PUBLISHED Note linked as Primary to Topic 3 and Supplementary to Topic 4: appears in both tabs with both roles.
2. Note linked only to an unpublished Topic: appears as free-reading (from Student view) until published; never leaks hidden Topic names.
3. Free-reading Note with no links: appears under `UNLINKED`, even though it is not associated with a Unit.
4. PUBLISHED Note in Grade 8: never visible to Grade 7 Student.
5. `PRIMARY + Unit + Topic` filters return exact matching links, not Note associations to unrelated Topics.
6. Type a search term and reset; verify debounce, total count and pagination before/after filter changes.
7. Invalid `role` and conflicting `UNLINKED+unitId` are rejected by API.
8. Verify page width 360/390, 768, desktop; no overlapping controls or card text clipping.
9. Confirm Teacher Knowledge Note Editor/Topic Linking workflows remain unchanged.

The changes were written via GitHub connector; build, Vitest, Maven and browser runs were not executed here.
