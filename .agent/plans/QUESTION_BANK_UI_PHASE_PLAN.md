# Question Bank UI — Phased Implementation Plan

**Status:** Planned; not an implementation-complete claim.  
**Branch:** `refactor/teacher-content-ui-routing`  
**Companion blueprint:** [Teacher Content UI Blueprint](../ui/QUESTION_BANK_QUESTION_MANAGEMENT_BLUEPRINT.md)

## Rules for execution

- One phase at a time; each phase is a reviewable vertical slice.
- Before coding, read root `AGENTS.md`, `.agent/PROGRESS.md`, UI guidelines, frontend architecture, API contract, domain question model and current components/services.
- Preserve current domain and endpoint contracts. No speculative API or schema changes.
- Do not redesign or refactor Question Editor in these phases.
- After each phase: inspect diff, run available lint/typecheck/build/tests, update this plan and `.agent/PROGRESS.md` with exact results. If validation cannot run, state that plainly.

## Phase UI-1 — Content Explorer hierarchy

**Goal:** Make Grade → Unit → Section → Topic navigation predictable and robust.

**Scope**
- Audit and refine the existing Content Overview split-pane/hierarchy.
- Ensure grade/unit selection cannot become stale.
- Make section expansion and topic navigation explicit.
- Add/verify loading, empty, error and retry states.
- Keep query fetching scoped and lazy; no Question list in Explorer.

**Likely files**
- `client-e-learning/src/components/features/teacher/content/content-overview.tsx`
- Existing content hierarchy components and service/query keys only as needed.

**Exit criteria**
- Selection remains valid after Grade changes.
- No unrelated hierarchy requests on expansion.
- Topic navigation and browser navigation behave consistently.
- UI states and responsive layout are covered.
- Validation outcome recorded.

## Phase UI-2 — Question Bank Manager

**Goal:** Align Topic detail with the bank lifecycle and server data.

**Scope**
- Review Topic detail bank list/create/edit/status/archive interactions.
- Display bank status and server-owned total/ready counts distinctly.
- Improve loading/error/empty states and mutation feedback.
- Add Include archived only after exposing and verifying the existing backend option through the service.
- Preserve current Topic and Bank route contracts.

**Likely files**
- `client-e-learning/src/components/features/teacher/content/topic-detail.tsx`
- `client-e-learning/src/services/content/content.questionBank.service.ts`
- `client-e-learning/src/types/content.ts` only if a contract-alignment change is required.

**Exit criteria**
- Bank lifecycle actions match confirmed API contracts.
- Errors do not masquerade as empty results.
- Query invalidation works after create/update/archive/status changes.
- No global bank search or invented endpoints.
- Validation outcome recorded.

## Phase UI-3 — Question Manager filters and pagination

**Goal:** Make Question lists fully use the existing server list contract.

**Scope**
- Add All / Complete / Incomplete filter wired to `isComplete`.
- Verify type/difficulty option values against server enums.
- Ensure search/filter changes reset page and debounce works.
- Preserve server-side pagination and selection behavior.
- Keep bulk delete; do not add single delete or drag-reorder.
- Review import action and hide/label it appropriately unless a real workflow is confirmed.
- Preserve existing preview/edit navigation; do not change editor internals.

**Likely files**
- `client-e-learning/src/components/features/teacher/content/question-bank-detail.tsx`
- `client-e-learning/src/services/content/content.question.service.ts` only if the existing contract needs a narrowly scoped correction.
- `client-e-learning/src/types/content.ts` or question option definitions only for verified enum alignment.

**Exit criteria**
- Completeness filter is included in API request and query key.
- Page resets when search/filter changes.
- Pagination metadata and total are server-driven.
- Destructive action is guarded and errors are visible.
- Validation outcome recorded.

## Phase UI-4 — Navigation, preview and consistency audit

**Goal:** Verify the teacher journey end-to-end without expanding into editor refactoring.

**Scope**
- Verify breadcrumbs and parent context where metadata is available.
- Ensure preview closes back to the same bank/list state.
- Verify route IDs are stable across refresh and Back/Forward where current router supports it.
- Audit shared tokens/components, keyboard use and responsive behavior.
- Confirm current server type values are displayed accurately.
- Run regression review to confirm Question Editor was not changed.

**Exit criteria**
- Content Explorer → Topic → Bank → preview/edit navigation is coherent.
- No lost filters/page on return where route design can preserve them.
- No unsupported action is presented as API-backed.
- Validation outcome and residual gaps recorded.

## Phase UI-5 — Separate Question Editor plan (not part of this delivery)

This is a future planning gate, not authorization to modify the editor now. Create a separate editor blueprint before touching autosave, incremental save, composition, draft state or editor components. Review backend request/response contracts and the existing refactor plan first.

## Dependencies and explicit exclusions

- No backend migration is expected for UI-1 through UI-4.
- If an API mismatch is discovered, stop and document it; do not silently expand the phase into backend work.
- Question Editor, Assignment Builder, student runtime, Question Engine, Activity/Attempt flows and global search are out of scope.
- UI implementation completion must not be confused with successful production validation.
