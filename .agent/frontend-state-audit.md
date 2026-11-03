# Frontend Feedback and Skeleton Audit

**Scope:** `client-e-learning/src`  
**Audit date:** 2026-11-03

## Standard inventory

### Feedback (`src/components/feedback`)

| Component | Responsibility | Contract |
|---|---|---|
| `full-page-state.tsx` | Whole-page loading, error, or empty state | `variant`, optional `title`, `description`, `action`, `showMascot`, `className`; localized defaults from `feedback` |
| `region-state.tsx` | Loading, error, or empty state inside an existing page region | `variant`, optional copy/action, `minHeight`, `className`; localized defaults |
| `page-banner.tsx` | Persistent page/feature information, warning, or error banner | `tone`, message, optional title/action/dismiss |
| `inline-status.tsx` | Compact operation status | `neutral`, `progress`, `success`, `error`; caller supplies localized message |
| `busy-button.tsx` | Action button with pending state | Existing `Button` props plus `pending` and `pendingLabel` |

There is no separate `ErrorState`, `EmptyState`, or `SuccessState`; `FullPageState` and
`RegionState` are the current standardized state surfaces. Success feedback is handled by
`InlineStatus` or the existing notification mechanism.

### Skeleton (`src/components/ui/skeleton`)

| Component | Responsibility | Contract |
|---|---|---|
| `skeleton-card.tsx` | Card-shaped content loading | `showHeader`, `showFooter`, `lines`, HTML attributes |
| `skeleton-grid.tsx` | Card/image-card collection loading | `count`, `variant`, `itemClassName`, HTML attributes |
| `skeleton-list.tsx` | Row/list collection loading | `count`, `itemClassName`, HTML attributes |
| `skeleton-table.tsx` | Table loading with header and rows | `rows`, `columns`, `showHeader`, `rowClassName`, HTML attributes |
| `ui/skeleton.tsx` | Primitive animated block | `className` and div attributes |

There is no dedicated form, detail, page, or dashboard skeleton. Whole-page loading remains
the responsibility of `FullPageState`; list/table regions use the closest existing skeleton.

## State contract

1. Whole page is unavailable/loading: `FullPageState`.
2. Existing page has a loading data region: matching `Skeleton*`.
3. Region request failed: `RegionState` with a retry action where possible.
4. Request succeeded with no data: `RegionState` empty, or feature-specific empty content only
   where the content is materially different and preserves a real action.
5. Operation progress/success/failure: `BusyButton`, `InlineStatus`, or `PageBanner`.
6. Feature copy remains in feature translations; generic primitives use `feedback`.

## Migration matrix

| Area/file | Current state | Current implementation | Target | Priority |
|---|---|---|---|---|
| `student/assigment/student-assignments.tsx` | list loading/error/empty | `SkeletonGrid`, `RegionState`, feature empty | Keep as reference; migrate empty copy only if a shared action is not needed | P0 |
| `student/units/units-view.tsx` | list loading/error/empty | `SkeletonGrid`, custom error/empty | `SkeletonGrid` + `RegionState` | P0 — migrated |
| `student/activities/activity-hub.tsx` | list loading/error | raw blocks | `SkeletonGrid` + `RegionState` | P0 — migrated |
| `student/assignment-attempt/**` route states | whole page loading/error/empty | mixed custom/full-page | `FullPageState`; preserve fullscreen runtime overlays | P0 |
| `student/dashboard/dashboard-view.tsx` | whole page loading/error | custom pulse/raw action | `FullPageState` | P0 — migrated |
| `student/profile/student-profile-form.tsx` | whole page loading/error | raw text/alert | `FullPageState` | P0 — migrated |
| `teacher/activities/activity-workspace.tsx` | list loading/error/empty | raw text/custom blocks | `SkeletonList`/`SkeletonGrid` + `RegionState` | P1 — migrated |
| `teacher/activities/activity-detail.tsx` | whole page loading/error | raw text/custom fallback | `FullPageState` | P1 — migrated |
| `teacher/activities/activity-editor.tsx` | detail loading + source list states | raw text/custom empty | `FullPageState` + `SkeletonList`/`RegionState` | P1 — migrated |
| `teacher/content/content-overview.tsx` | nested region loading/error/empty | raw paragraphs/custom empty | `SkeletonList`/`RegionState` | P1 — migrated |
| `teacher/content/global-question-bank-list.tsx` | list loading/error/empty | raw block/custom state | `SkeletonList`/`RegionState` | P1 — migrated |
| `teacher/content/question-bank-detail.tsx` | page/questions loading/error/empty | raw text/custom state | `FullPageState` + `SkeletonTable`/`RegionState` | P1 — question region migrated |
| `teacher/content/{unit,section,topic}-detail.tsx` | detail loading/error/empty | raw text/custom state | `FullPageState`/`RegionState` | P1 — migrated |
| `teacher/classes/{classes-grid,class-students-view}.tsx` | list loading/error/empty | raw text/custom alert | `SkeletonGrid`/`SkeletonTable` + `RegionState` | P1 — migrated |
| `teacher/grades/page.tsx` | table loading/error/empty | raw text/custom state | `SkeletonTable` + `RegionState` | P1 — migrated |
| `teacher/assignments/main/AssignmentList.tsx` | list loading/empty | feature-specific state | `SkeletonList` + `RegionState` where applicable | P1 — migrated |
| `teacher/students/*` | detail/list/form loading/error/empty | mixed raw text and DataTable slots | shared skeletons + feedback primitives | P1 — core views migrated |
| `components/ui/data-table/data-table.tsx` | table state contract | accepts state slots but ignores `loadingState` | honor `loadingState`, default to `SkeletonTable` | P0 — migrated |
| DataTable feature consumers | table loading/error/empty | raw `<p>`/`<div>` slots | `SkeletonTable` + `RegionState` slots | P0 — migrated |
| Student activities practice runtime | operation/overlay states | intentional runtime-specific UI | retain only interaction-specific overlays; replace generic loading/error copy | P2 |

## Deliberate exceptions

- Fullscreen/away overlays in student assignment runtime are not data states; they enforce
  runtime rules and remain feature-specific.
- Question editor validation and save errors are form-level operation feedback, not page
  loading or collection empty states.
- Content-first cards and expandable analysis rows may keep feature-specific empty copy when
  the state includes a meaningful domain action; the container and semantics should still use
  the shared primitives where compatible.

## Remaining migration work

The following areas still contain state UI that requires a focused follow-up because it is
interleaved with form validation, editor mutations, or runtime interaction:

- `teacher/content/topic-detail.tsx`: create/update mutation copy remains feature-specific;
  question-bank loading/error now uses shared skeleton/region state.
- `teacher/activities/activity-editor.tsx`: question availability and save validation states.
- `teacher/students/student-detail-modal.tsx`: modal-specific loading and operation errors.
- `student/activities/practice-runner.tsx` and `practice-start.tsx`: answer/hint/finish
  operation feedback and runtime-specific overlays.
- `student/assignment-attempt/student-assignment-paper-page.tsx`: autosave, submit, fullscreen,
  and session-conflict states are intentional runtime feedback, not generic collection states.

These are not silently classified as complete; each remaining custom state should be reviewed
against the contract before removal.
