# Student Design System v2 — Phase 0 UI Audit

**Date:** 2026-11-18  
**Branch:** feature/guided-reasoning-v1  
**Baseline HEAD:** 4024cbfbf7d1da26c31b6fbfdaa061fa04593c4d  
**Scope:** Student web design foundations, routes, components and assets; Teacher is regression-only.  
**Method:** Static source inspection of the GitHub branch (routes/tree, representative feature views, layout, design docs, CSS and assets). No authenticated browser, screenshots, device testing, Figma comparison, runtime performance measurements, lint, build or automated accessibility test was run for this audit. Findings are source-based risks/recommendations, not claims of a reproduced browser defect.

## Executive assessment

Keep **Indie Illustrated Scrapbook** as the only Student visual identity under accepted ADR 0032. The implementation already includes scoped tokens, paper surfaces, Pipo, Unit covers, vocabulary illustrations, an animated botanical progress experience, immersive Activity UI and a reusable DataList. The limiting factor is **uneven application and missing design governance**, not absence of a visual concept.

Define **one design language** with a restrained editorial hierarchy, contextual illustration and reusable layouts. Editorial clarity describes layout discipline, **not a second theme**. Do not give Hub, Collection, Activity or Game a new palette or font system.

## Route inventory (from the source tree)

23 Student page.tsx routes were enumerated; these are paths in source, not verified runtime reachability.

| Group | Routes | Archetype candidates / notes |
|---|---|---|
| Home | /student | Hub; Learning Hub currently uses Pipo + polaroid |
| Units | /student/units; /student/units/[unitId]; /student/units/[unitId]/activities; /student/units/[unitId]/activities/[activityId]; /student/units/[unitId]/activities/[activityId]/history; /student/units/[unitId]/vocabulary | Hub, Detail, Collection, Immersive Workspace; UnitCover and Activity history differ in visual density |
| Assignments | /student/assignments; /student/assignments/[assignmentId]; /student/assignments/[assignmentId]/intro; /student/assignments/[assignmentId]/result | Collection, Detail, Assessment, Result; preserve independent Assignment flow |
| Activity Review | /student/activity-sessions/[sessionId]/review | Review / Result |
| Vocabulary | /student/vocabulary; /student/vocabulary/words; /student/vocabulary/review; /student/vocabulary/progress; /student/vocabulary/units/[unitId] | Hub, Collection, Review, Insights, Workspace |
| Games | /student/game; /student/game/[unitId]/[gameType] | Hub, Immersive |
| Identity & ranking | /student/profile; /student/profile/[id]; /student/leaderboard; /student/progress | Profile, Detail, Ranking, placeholder progress page (must not invent live analytics) |

The table covers all 23 discovered Student page.tsx routes; counts refer to source paths, not verified runtime route availability.

## Existing design inventory

| Area | Existing implementation | Audit takeaway |
|---|---|---|
| Student isolation | app/[locale]/student/layout.tsx imports student theme, surfaces, typography and vocabulary styles; StudentShell provides navbar and content area | Keep scoped theme; test portals and Teacher isolation in Phase 6 |
| Foundations | styles/student/theme.css, typography.css, surfaces.css, vocabulary.css, vocabulary-progress.css | Consolidate roles and density contracts; do not introduce feature palettes without approval |
| Reusable visual primitives | components/student-ui/PaperSurface, PolaroidFrame, ScrapbookHeading, SketchProgress, StudentAvatar, leaderboard podium | Reuse, define when each is appropriate; avoid nesting decorative cards |
| Reusable list | components/student-ui/data-list/StudentDataList, Item, Pagination | Keep as a primitive; reusable page toolbar, filter and state composition remains future Phase 4 |
| Mascot | components/ui/mascot.tsx defines Pipo SVG, moods (idle/happy/cheer/oops/think/sleepy/wave/celebrate), stage and palette role | Define consistent placement, mood, copy, reduced-motion and optional appearance |
| Image assets | public/assets/practice-garden.jpg, practice-q-garden.jpg, practice-mascot.png; public/assets/vocabulary/*.svg | Asset reuse and naming are not yet governed by a Student illustration manifest |
| Additional visuals | UnitCover image/fallback; vocabulary-progress-botanicals.tsx; memory-mai-tree.tsx SVG; Pipo hero | Preserve meaningful data and illustration visuals; align colors and placement over time |
| Data states | RegionState, Skeleton and page-specific states in Home, Activity History, Vocabulary Word Library | Standardize empty/error visual strategy, but do not force a mascot into every state |

## Source-based findings / action register

Severity means design-system priority, not proven runtime severity.

| ID | Priority | Evidence (branch-relative file and lines) | Finding | Follow-up phase |
|---|---|---|---|---|
| DS-01 | P0 | styles/student/surfaces.css:14–26; components/student-ui/paper-surface.tsx:24–39 | All PaperSurface variants inherit a strong 2px ink border + offset shadow. Important content and secondary surfaces can compete. | Phase 2: semantic elevation/surface roles |
| DS-02 | P0 | components/features/student/game/game-hub.tsx:43–66, 77–96 | Game Hub uses purple/pink gradient utilities and ad hoc heading/button styles rather than scoped Student role recipes. This is a visible source-level design drift. | Phase 5: migrate Game Hub using same identity |
| DS-03 | P0 | components/features/student/assigment/assignment-hero.tsx:15–32; activities/history/activity-history-page.tsx:73–86 | Header visual choices are predominantly a large Lucide icon; no reusable Page Visual Brief or illustration strategy decides scene vs mascot vs meaningful data visual. | Phase 1 spec; Phase 3 asset library |
| DS-04 | P1 | .agent/ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md:62–90; styles/student/theme.css:90–110; typography.css:1–56; app/globals.css | Canonical text still references Nunito whereas implementation uses Plus Jakarta Sans. Current global body token is 14px; target readability requires browser testing before changing it. | Phase 1 documentation correction; Phase 2 typography QA |
| DS-05 | P1 | features/student/vocabulary/student-vocabulary-library.tsx:50–120; vocabulary/progress/student-vocabulary-progress-page.tsx:~328 onward | Frequent paper surfaces and decorative wrappers need a hierarchy review; nested/equal emphasis risk must be checked in rendered screens. | Phase 2/5 visual QA |
| DS-06 | P1 | styles/student/vocabulary-progress.css (feature-level hardcoded colors); vocabulary/memory-tree/memory-mai-tree.tsx (literal SVG fills); game-hub.tsx | Illustration and component color exceptions are not governed centrally. Some literal colors may be legitimate artwork palettes; assess each before migration. | Phase 3 color/artwork governance |
| DS-07 | P1 | components/features/student/vocabulary/library/student-vocabulary-word-library.tsx; activities/history/activity-history-page.tsx; student-ui/data-list/* | List primitives are reused, but headers, search/filter toolbars and empty/loading/error compositions remain feature-local. Do not introduce premature generic business logic. | Phase 4 collection patterns |
| DS-08 | P1 | components/ui/mascot.tsx:~110–205, ~215 onward | Pipo includes motion, pointer handling and per-use colors; reduced-motion behavior and animation/interaction ownership need explicit QA. Do not claim a demonstrated a11y defect without browser testing. | Phase 3/6 |
| DS-09 | P1 | styles/student/theme.css:8–9 and 117 onward; components/layout/student-navbar.tsx | The body:has(.student-theme) scope serves portal styling. Verify that coexistence with Teacher and portaled UI never causes leakage. | Phase 6 |
| DS-10 | P2 | .agent/ui/screens.md Student routes vs actual app/[locale]/student tree | The screen index mentions /student/rewards; the current route tree has /student/leaderboard. Treat as documentation drift, not an invitation to change routes in UI phase. | Documentation maintenance |
| DS-11 | P1 | components/features/student/assignment-attempt/student-assignment-paper-page.tsx; activities/runtime/shell/practice-shell.tsx | Immersive/assessment experiences appropriately diverge in composition; they need explicit focus-mode exceptions without a second visual design system. | Phase 1 archetype rules; Phase 5 |

## Visual coverage by representative page

| Reference page | Existing visual cue | Proposed role (not a change made in this phase) |
|---|---|---|
| Learning Hub | Pipo in Polaroid; washi and lined Unit list | Character welcome; do not repeat that exact hero in all pages |
| Units / Unit Detail | Pipo on index; UnitCover on detail/cards | Unit artwork or topic cover as contextual anchor |
| Assignments | NotebookPen icon in kraft hero | Small editorial illustration when useful; prioritize deadlines/actions |
| Vocabulary Library | Kraft header, UnitCover per Unit | Book/word collection illustration; no large illustration repeated per row |
| Activity History | History icon plus data list | Tiny contextual illustration or data-supported timeline; keep scan speed |
| Vocabulary Progress | Botanical SVG and Mai tree progression | Data-authored visualization is the anchor; never fabricate progress |
| Game Hub | Pipo plus non-canonical gradient | Retain character, align with Student ink/paper tokens |
| Assessment / Activity Runtime | Practice image background, focused question surface | Purpose-built immersive composition, but common state/contrast/typography semantics |
| Profile | Avatar, profile tabs and statistics | Identity/avatar is the anchor; do not add irrelevant mascot |

## Accepted scope and unknowns

- **Keep:** Student-only theme, existing APIs, domain constraints, real data, question/assessment behavior and Teacher appearance.
- **Do not assume:** Mistake Notebook or AI Tutor is implemented; they are future examples, not audit findings.
- **Not verified:** device screenshots, actual contrast ratios for every surface, CLS/LCP/asset size, keyboard navigation in browser, touch behavior, Teacher regression, lint/build, snapshot visual tests.
- **Avoid:** project-wide CSS rewrite, new route/business entity, fabricated illustrations as content or fake progress data.

## Phase 1 outputs / migration gates

1. Canonical Indie Illustrated Scrapbook spec amended with a single design language, surface hierarchy, page visual anchor contract and review gates.
2. STUDENT_VISUAL_STORYTELLING.md defines approved visual roles, Pipo, SVG/assets, responsive, accessibility and visual briefs.
3. STUDENT_PAGE_ARCHETYPES.md defines reusable page composition and extensibility without one hero/card template for all pages.
4. UI_ARCHITECTURE_GUIDELINES.md extended with a Student-specific brief and explicit Teacher separation.

**Exit for Phase 0/1:** Documents exist, reconcile with ADR 0032, link to one another, and distinguish current implementation from Phase 2–6 work. No page, CSS, API or asset migration is claimed. Next: approve docs, then Phase 2 component/token work and Phase 3 artwork exploration with representative screenshots.
