# Teacher Content UI Blueprint — Question Banks & Questions

**Status:** UI planning baseline; implementation must follow the phased plan.  
**Branch:** `refactor/teacher-content-ui-routing`  
**Scope:** Content Explorer, Topic/Question Bank management, Question list management.  
**Out of scope:** Question Editor redesign, Question Engine domain changes, new backend entities, speculative endpoints.

## 1. Goals and non-goals

Provide a clear teacher workflow through the existing content hierarchy:

`Grade → Unit → Section → Topic → Question Bank → Question`

The UI must mirror current backend ownership and API contracts. Do not introduce new lesson/article/video entities. Keep Assignment Builder separate from Question Bank authoring. Keep the current Question Editor and its payload/navigation behavior unchanged until a separate editor plan is approved.

## 2. Contract constraints

- A Question Bank belongs to a Topic; Questions are associated to a bank through the content-question relation.
- Current question types from the server contract: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `FILL_IN_BLANK`, `TYPE_ANSWER`. Do not expose types unsupported by the current authoring/persistence path as production-ready.
- Difficulty values: `EASY`, `MEDIUM`, `HARD`.
- Bank status (`DRAFT`, `PUBLISHED`, `ARCHIVED`) is not the same as Question completeness/readiness.
- Use server-side Question pagination/filtering; do not load every Question into the Explorer.
- Existing Question list contract supports `bankId`, `search`, `type`, `difficulty`, `isComplete`, `page`, and `size`.
- Bank listing is Topic-scoped. There is no confirmed global bank-search API.
- Bank ordering API exists; a Question ordering API was not confirmed. Do not implement Question drag-reordering.
- Bulk Question deletion exists; do not add a single-delete action without a backend contract.
- The frontend bank service currently does not expose the backend's `includeArchived` option. Add it only as a service-contract alignment task, with tests/verification.
- Import UI exists, but a server import API was not confirmed. Do not represent import as a completed server-backed workflow.
- URL is the source of truth for navigable identity where current routing supports it. Transient expanded nodes and dialog state remain local. Query/filter state should be URL-backed only where it fits the existing route architecture.

## 3. Screen blueprint

### Screen A — Content Explorer

**Actor:** Teacher  
**Route:** Existing teacher Content route / overview; preserve current route contract.

**Layout**
- Page header and short description; primary Create Unit action.
- Grade selector.
- Two-pane desktop layout: Unit list on the left; selected Unit workspace on the right.
- Workspace presents Sections and their Topics as a collapsible hierarchy.
- Each node shows its name and relevant status/count metadata only when supplied by the API.
- Mobile/narrow layout stacks panes.
- Explicit loading, empty, error and retry states for every hierarchy level.

**Data/API**
- Existing grade service.
- Existing Unit, Section and Topic APIs and query keys.
- Lazy-load Topics when a Section expands; do not query unrelated Sections.
- Do not fetch Question rows from the Explorer.

**State**
- Route-backed selected entity/view where supported.
- Local expanded Section IDs and transient search/dialog state.
- React Query owns server data/loading/error state.

**Acceptance**
- Changing Grade cannot leave a stale Unit selected.
- Empty results and request failures are visibly different.
- Expanding one Section does not fetch Topics for every Section.
- Topic navigation leads to Topic detail / Question Bank Manager.

### Screen B — Topic detail / Question Bank Manager

**Actor:** Teacher  
**Route:** Existing Topic detail keyed by Topic ID.

**Layout**
- Breadcrumb: Content → Unit → Section → Topic.
- Topic summary and current status.
- Bank cards or table (choose one pattern and use it consistently).
- Each bank shows name, description when present, status, total Question count and ready Question count.
- Primary Create Question Bank action.
- Supported actions: open bank, edit metadata, status transition, archive.
- When archived visibility is supported end-to-end, provide an explicit Include archived toggle.
- Provide loading, error, no-bank and no-match states.

**Data/API**
- List: `GET /v1/content/question-banks?topicId=...`.
- Detail: `GET /v1/content/question-banks/{id}`.
- Existing create/update and status/archive endpoints.
- Existing bank ordering endpoint only if ordering is intentionally presented in the UI.
- Bank counts and readiness are server-owned; never calculate authoritative counts from currently loaded rows.

**State**
- Server state: Topic, bank list/detail, mutation status.
- Local: create/edit dialog and form fields.
- Route: selected Topic/Bank IDs.

**Acceptance**
- Mutations invalidate relevant list/detail queries.
- Failed saves preserve user input and display actionable errors.
- Archived banks are not silently hidden if the user has explicitly chosen to include them.
- No global bank search is presented as if it were supported.

### Screen C — Question Bank detail / Question Manager

**Actor:** Teacher  
**Route:** Existing Bank detail keyed by Bank ID.

**Layout**
- Breadcrumb: Content → Unit → Section → Topic → Question Bank, using available parent metadata.
- Bank header: name, description, status, total count and ready count.
- Toolbar:
  - Debounced search.
  - Question type filter.
  - Difficulty filter.
  - Completeness filter: All / Complete / Incomplete.
  - Clear filters.
  - Existing Add Question action.
  - Import affordance only if clearly labeled as a not-yet-server-backed or separately verified workflow; otherwise hide/disable it.
- Paginated Question table/list:
  - Selection checkbox.
  - Readable content preview.
  - Type and difficulty.
  - Completeness/readiness indicator.
  - Available media indicators only when response data supports them.
  - Row preview and existing edit navigation.
- Bulk delete uses the existing confirmation dialog and endpoint.
- Distinguish loading, no Questions, no filter matches, API error and mutation error.

**Data/API**
- Use `GET /v1/content/questions?bankId=...&search=...&type=...&difficulty=...&isComplete=...&page=...&size=...`.
- Use the existing query key and include all request-affecting parameters in it.
- Server pagination/count is authoritative.
- Preserve the existing Question Editor route and request semantics.

**State**
- Server state: paginated result, bank detail and mutation state.
- Local or URL-backed state, following existing routing conventions: search, type, difficulty, completeness, page and page size.
- Reset page to the first page when any filter/search changes.
- Debounced search must not issue a request per keystroke.
- Selection is scoped to the current result/page unless cross-page selection is explicitly designed and supported.

**Acceptance**
- All five current server question types map to the correct labels.
- Completeness filter reaches the API as `isComplete`.
- Search/filter changes reset pagination.
- Bulk delete cannot run with no selected IDs and confirms the destructive action.
- No single-delete or drag-reorder controls appear without APIs.
- Editor behavior is unchanged.

### Screen D — Question preview

**Actor:** Teacher  
**Route:** Existing preview state/route within Bank detail.

**Layout**
- Read-only question content, options/answers appropriate to teacher preview, explanation/hint and media where returned.
- Clear close/back action returns to the same bank and preserves list filters/page where routing allows.
- Preview is not an alternate editor.

**Acceptance**
- Preview data is not confused with the paginated list projection.
- Missing optional media/hint/explanation does not break the layout.
- No changes to Question Editor are bundled into this phase.

## 4. Shared UI behavior

- Reuse existing design tokens, shared EntityHeader, Badge, ContentEditor and dialogs where appropriate.
- Every data-driven screen has loading, empty, error, disabled and success feedback.
- Preserve accessibility: labeled filters, keyboard-operable tree controls, visible focus, and confirmation for destructive actions.
- Use consistent names: Question Bank (not mixed with unrelated “lesson” terminology).
- Avoid adding a new visual system or unrelated refactors.
- Use existing React Query invalidation patterns and query keys.

## 5. Known API/UI gaps to handle explicitly

1. Expose `includeArchived` in the bank service only after confirming backend parameter semantics and response behavior.
2. Add completeness filtering to the Question Manager because the question service already accepts `isComplete` but the current UI does not expose it.
3. Audit `questionTypeOptions` against the current server enum and remove/mapping-fix any stale type aliases in the list UI only; do not change editor internals here.
4. Verify whether the import affordance has a real workflow. Do not claim server import support without a confirmed endpoint.
5. Do not add Question ordering or single deletion until the backend contract exists.

## 6. Non-goals / separate decisions

- Question Editor redesign, autosave, incremental save or form-state refactor.
- Assignment Builder and Assignment Composition.
- Question Engine type additions (e.g. CLOZE/MATCHING authoring).
- New endpoints, migrations, global search, drag-and-drop Question ordering, or manual grading.
- Changes to student runtime or Activity/Assignment attempts.

## 7. UI implementation definition of done

- Routes/deep links preserve the current selected entity where supported.
- All API-backed screens show loading, empty, error and success states.
- Search and filters match the server contract; pagination remains server-side.
- Bank counts/status are server-authoritative.
- Existing Question Editor navigation and behavior are unchanged.
- No invented API behavior or permanent mock data.
- Run frontend lint/typecheck/build available in the environment and record exact outcomes; if not run, mark validation as outstanding.
