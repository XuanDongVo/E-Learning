# Student Design System v2 — Phase 5 Reference Pages & Migration

**Date:** 2026-11-19  
**Branch:** `feature/guided-reasoning-v1`  
**Baseline before Phase 5:** `3411dfd285eeae9b176f889eb294f6fdbb725bbc`  
**Scope:** Source-level UI/UX refinement of Learning Hub, Units, Vocabulary overview/Word Library and Activity History. No new application routes, API contracts, data models, assessment behavior or Teacher theme.

## Design direction

One Student identity: Indie Illustrated Scrapbook (ADR 0032). Phase 5 applies the existing foundations, reusable patterns and original illustrative assets to real pages; no replacement style, no universal hero template and no new asset packs.

Layout choices follow the primary user goal: **Hub = choose the next learning activity**, **Collection = scan/filter/act**, **History = understand prior work and recover filters**. Important data remains truthful and server-authored; artwork is decorative unless educational content is itself the visual.

## Implemented source changes

| Reference / route | Before | Source change | UX intention |
|---|---|---|---|
| Learning Hub `/student` | Heavy decorated hero and equally emphasized kraft/taped assignment panel; fixed label “Chương 01” above dynamic Unit list | Keep one expressive welcome hero with Pipo desktop / original study-desk scene mobile; remove tape and heavy material from secondary assignment block; lighter lined Unit collection; replace misleading chapter label with `LỘ TRÌNH HỌC TẬP`; share empty state and StudentButton retry; improve mobile spacing and full-width secondary action | Clear first action and progression; reduce decoration competition and false chapter implication |
| Units `/student/units` | Feature shadow/tape in collection header, many strong card CTAs; no visible list count | Accent-level header with existing Pipo, quiet per-card action, count reflecting actual filtered Unit array, one/two/three columns depending on width | Prioritize items and search over banner, make count and search results explicit |
| Vocabulary overview `/student/vocabulary` | Three-column grid starting at >=700px can squeeze cards; redundant CTA emphasis; duplicated invalid/unused classes; flat no-results message | Keep one primary learning action per card, demote `Xem từ`, preserve conditional `Ôn ngay`; make cover cards vertical; grid 1 col base, 2 col >=640px, 3 col >=1180px; shared page heading, StudentTextField and filtered empty state with reset; show actual overview-derived word/new/due totals | Reliable tablet density, scannable card actions, helpful zero-match recovery, no invented analytics |
| Vocabulary Word Library `/student/vocabulary/words` | Filter buttons represented as ARIA tabs without required tab keyboard behavior/panels; broad live announcements | Use grouped toggle buttons with `aria-pressed` and existing selected styling; result-count status separate from list, collection panel live region off | Accessible control semantics, lower screen-reader noise; preserve status/query/FSRS logic |
| Activity History `/student/units/{unitId}/activities/{activityId}/history` | Heavy feature/tape header, oversized icon and no easy reset until filtered-empty; small row metadata | Calm content header and purposeful small icon, reset filters whenever active, 2-column mobile period controls with wrapping, readable 16px row title and Student metadata styles; announce count only | More visible results, clearer filter recovery, easier scanning and keyboard/touch use |

The baseline and result are **source comparisons**, not visual before/after screenshots. Browser validation is needed before claiming design quality.

## What remains untouched

- Activity History endpoint, filtering (period/mode/status), query key, page reset, session score/XP labels and review routing.
- Unit list endpoint, display ordering, UnitCover, individual Unit ids and labels.
- Vocabulary overview API, Word Library query semantics, review due logic, search behavior, navigation URLs and real counts.
- Independent Assignment and Activity runtimes, scoring, question timings, accessibility of their grading flow.
- Teacher CSS/routes, data schema, backend, Student authorization and SSR behavior.
- Visual asset registry, Pipo identity and all third-party image rights decisions.

## Source evidence and component boundaries

- `components/features/student/learning-hub/learning-hub-home.tsx`: hero and secondary-paper hierarchy.
- `components/features/student/units/{units-view,unit-card}.tsx`: index card prominence and count.
- `components/features/student/vocabulary/student-vocabulary-library.tsx` + `styles/student/vocabulary.css`: grid and CTA hierarchy.
- `components/features/student/vocabulary/library/student-vocabulary-word-library.tsx`: selected status controls.
- `components/features/student/activities/history/{activity-history-page,activity-history-filters,activity-history-list}.tsx`: filters and list density.
- Shared `components/student-ui/patterns/` remain composition-only; no new speculative abstractions.

## Manual QA matrix — **pending**, not executed in this source-only workflow

| Surface | Test | Acceptance |
|---|---|---|
| Mobile 360/390 | Learning Hub hero, mobile study scene, Unit rows and assignment CTA; disable Pipo | No horizontal scroll, obscured CTA or blank required content |
| Tablet 640/768 | Units and Vocabulary collections; cards with long titles and three actions; filters and keyboard focus | 2-column layouts remain scannable, no clipped buttons, touch targets >=44px |
| Desktop 1024/1280/1440 | Vocabulary cards switch to 3 columns only at >=1180px; Learning Hub and History density | Hierarchy intentional, one dominant focal area, no cramped multi-CTA card |
| States | API pending/loading/error, no units, no vocabulary, filtered-empty, history zero results, retry | Correct message and recovery; no fabricated scores/streaks/chapters |
| Behavior | Units search clear, Vocabulary search+due filter, Word Library status+debounce+pagination, History period/mode/status+reset+review link | No change to API/query semantics; page reset correctly |
| Accessibility | One H1, heading order, focus outlines, button semantics, result-status live regions, reduced motion | No tab-role misuse or noisy repeated announcements |
| Assets | Broken image, UnitCover fallback, mascot toggled off, mobile alt and decorative semantics | Meaningful content preserved; no layout collapse |
| Regression | Teacher dashboards/forms/modals/portals; Student Activity/Assignment assessment | Teacher unaffected and grading/runtime unaffected |
| Toolchain | `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` | Must pass or failures triaged before release |

**Important:** The 390px Design Lab simulation is an inner-width preview, not an actual viewport. Use browser DevTools/device emulation for CSS breakpoint, touch and screen-reader verification. Screenshots were **not** captured in this GitHub connector environment. Treat Phase 5 as **implemented in source, visual acceptance pending**.

## Release gate & next work

When the QA matrix passes, Phase 5 can be called closed. For additional Student pages, choose a Page Archetype and write a Screen/Visual Brief; reuse existing components rather than applying the same hero to Profile, Assessment, Game or Results. Further theme refinements should follow screenshot-based review and avoid global redesign.
