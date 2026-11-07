# Project Progress

## Student profile fidelity restoration and avatar persistence (2026-11-07)

- Restored all four originally designed Profile tabs (`overview | learning | streak | personal`), polaroid avatar picker, KPI cards, calendar, activity history and private guardian editing.
- Replaced Profile `MOCK` statistics and identity with existing Student profile/gamification/streak/assignment APIs and a new student-owned session learning-overview API; no fabricated progress.
- Added `student_profiles.avatar_key` (V54) with migration backfill from existing gamification avatar key where available; added validated `PATCH /v1/student/profile/avatar` and profile response `avatarKey`.
- Avatar update synchronizes an existing gamification avatar record without resetting personal/guardian data. Student Navbar now displays the same stored avatar key.
- Guardian detail remains collapsed by default, shows only primary/first record, permits editing, and preserves the other records in full-collection PUT updates.
- Validation: source checks and GitHub commit consistency only. Authenticated browser, database migration and frontend/backend compile/runtime tests still needed before release.



## Student Profile + typography consistency (2026-11-07)

- Aligned Student Home display typography to the calmer visual scale used by the Student Profile reference (30–36px page headings; 22–26px section headings).
- Codified Student-specific typography roles in `.agent/ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md` and `styles/student/typography.css`; restored canonical Patrick Hand/Caveat/Nunito/Courier Prime roles while preserving the latest CSS material updates.
- Added a server-backed Student Profile at `/student/profile`. The old `/student/profile/[id]` demo route now renders the same real profile instead of mock data.
- Guardian details are hidden by default behind an accessible eye toggle. A single primary/first guardian is exposed for editing; all other stored guardians are preserved in the PUT payload because the backend performs collection replacement.
- Saving updates the existing student-profile endpoint; the view is refreshed from the server. Email and class data remain read-only.
- Authenticated browser and full frontend build/E2E checks remain pending.



## Indie Scrapbook Student theme + Home preview (2026-11-07)

- Introduced Student-only scoped semantic tokens, paper/ink texture, typography, visual primitives and reduced-motion rules; Teacher base palette/components remain unchanged.
- Reworked Student Home presentation (hand-drawn heading, paper hero, taped notebook list, polaroid mascot, paper Assignment note) without changing real Unit API queries, Streak/Level API rules or navigation contracts.
- Streak/Level visuals now use sketch meters; backend-authored XP/Streak values remain authoritative.
- Theme extends to root-mounted portals through CSS `body:has(.student-theme)` while the Student route is mounted (modern-browser requirement); Sonner remains semantically shared.
- Source-level review completed; frontend lint/build and authenticated browser comparison require execution in the project environment. No backend, Teacher UI or API change.



## Student visual governance (documentation only — 2026-11-07)

- Owner approved Indie Illustrated Scrapbook as the exclusive Student visual design; Teacher appearance stays unchanged (ADR 0032).
- Added canonical Student visual design document and aligned agent entry point, frontend-design skill, UI architecture, Student Learning Hub blueprint, frontend architecture, ADR index and documentation checklists.
- Superseded only legacy Student visual decisions; retained Streak/Level, Activity and Assignment business rules.
- **No CSS, component, UI runtime, backend or API implementation performed.** Scoped Student theme implementation and browser validation remain follow-up work.



**Updated:** 2026-11-06
**Branch:** `feature/student-gamification`
**Canonical state:** `.agent/CURRENT_STATE.md`

## UI correction (2026-11-06)

- Owner selected **border-ink + shadow-pop** (not shadow-ink) as the application-wide outlined visual pattern. Student Home now owns a compact real-data weekly Streak calendar and simple XP-based Level card; Rewards is Leaderboard-only preview. Week dates are delivered by the Streak API. Freeze and minute-based goals remain deferred. Verification pending.

## Current stage

- Student leaderboard read queries now use Spring Data JPA native-query projections; the previous JDBC template dependency was removed from this service. Backend compilation is pending a Java-enabled environment.
- Gamification backend code is organized by feature packages: `xp`, `streak`, `level`, `leaderboard`, and `profile`; profile, streak, level, and leaderboard endpoints now have separate controllers/services while preserving existing routes.
- **Student Streak/Level v1 source:** accepted milestone policy (3/7/14/30 → 10/20/40/80 XP), daily completion service, ledger/Level integration, authenticated read APIs, and live Rewards overview added. No Leaderboard live data or Streak Freeze. Validation pending.

- **Activity XP Engine Phases 1–4:** calculator, session audit, atomic terminal
  settlement, persisted result receipt and Activity Result UI implemented
  behind the default-off new-session rollout flag. Phase 5 deployment and
  release verification remain pending.

- **Student Learning Hub stages 1–3:** brief/nav contract, Home replacement,
  and Units/Unit Detail UI refinement on `feature/student-gamification`.
- Phase 7 Scope B AssessmentAttempt: on `main` (finalize path present).
- **Phase 8 Teacher Assignment Analysis: implementation code complete on this branch.**

## Streak/Level work log (2026-11-06)

- Added ADR 0030 and implementation plan; reused V49 Streak/ledger tables without schema changes.
- New `StudentStreakPolicy` and `StudentStreakService` attach `COMPLETED` transitions to one-per-day qualification and fixed STREAK_BONUS ledger. UI reads own profile and Streak from authenticated API; leaderboard remains mock and is visibly labeled.
- Added pure calendar/milestone unit tests and service tests for same-day idempotency, three-day bonus/Level advancement, and reset. PostgreSQL concurrency and authenticated E2E are outstanding.
- Maven test attempt blocked before compilation: Spring Boot 4.1.1 parent POM unavailable due Maven Central DNS/network restrictions. Frontend project dependencies are not installed in this shell; lint/type/build remain unverified.

## Activity XP work log (2026-11-06)

- Implemented the pure `ActivityXpCalculator` for the accepted v2.2 outcome
  matrix, strict resolved-outcome mapping, Level multiplier, per-award HALF_UP
  scaling, completion bonus and Level thresholds.
- Normalized the stored timeout outcome to `TIMEOUT`; legacy interaction-based
  timeout variants were never active and are superseded by ADR 0029.
- Added deterministic, database-free unit coverage for the complete matrix,
  Hint precedence, invalid outcome states, bonus/Level boundaries, overflow and
  per-question rounding.
- Validation: focused calculator suite passes (11/11). Full backend suite runs
  56 tests with 51 passing; five pre-existing
  `AssignmentServicePublishReadinessTest` cases fail because their test
  `service` fixture is null, outside this Phase 1 change.
- Phase 2 captures `ACTIVITY_XP_V2_2`, official Level and multiplier only for
  newly eligible sessions when `ACTIVITY_XP_ENABLED=true`; default remains off.
- New selected questions must have schema-v2 frozen Difficulty. Resolved
  questions persist outcome/base/final XP once; unresolved Learning retries and
  legacy sessions remain unaudited. Hint now shares the Session write lock used
  by Answer/Timeout.
- Profile first-create uses conflict-safe insert plus row lock; concurrent starts
  serialize on the Student and lock active Sessions before the profile to match
  the Phase 3 lock order.
- Phase 2 focused validation passes 30/30 across calculator, snapshot eligibility,
  profile/policy capture, question audit and ActivitySession wiring. Full suite
  was intentionally not run for this phase.
- Phase 3 now settles eligible `COMPLETED`/`GAME_OVER` sessions atomically under
  Session → profile locks, persists one positive PRACTICE ledger entry, updates
  Lifetime XP/Level, and durably finalizes zero/ABANDONED receipts without a
  reward row. V52 stores immutable Lifetime XP/Level-after receipt snapshots.
- Phase 4 extends the existing read-only Activity Result response with the
  persisted reward receipt and optional question audit. The student result UI
  displays committed question XP, completion bonus, total XP and Level change;
  loading, network error, abandoned and legacy/no-reward states are explicit.
- Restored the complete Practice runtime palette by replacing orphaned
  `practice-*` utilities in the runner and its directly rendered components
  with shared global semantic tokens (`learning`, `accent`, status, surface,
  border and elevation tokens). Layout and behavior are unchanged.
- The rollout remains disabled by default, so only sessions started with
  `ACTIVITY_XP_ENABLED=true` become eligible; historical sessions are not
  backfilled. Phase 5 migration preflight, rollout and operational checks remain.
- Per explicit request, no Phase 3/4 tests, build or lint were run. These phases
  are implemented but require the Phase 5 validation matrix before release.

## Teacher Analysis work log

- Spec + decisions locked (roster, duration, bands, accuracy).
- Backend overview / students / questions / attempt review.
- FE modular analysis UI + review sheet + Results entry from list.
- Removed sample result view; cleaned legacy DTO names.
- Docs synced (`CURRENT_STATE`, this file, `PHASES`, plan 11).

## Student Learning Hub work log (2026-11-05)

- Added `ui/STUDENT_LEARNING_HUB_BLUEPRINT.md` with Screen Briefs and real-API boundaries.
- Replaced `/student` DashboardView entry with a Learning Hub driven by
  `/v1/student/units`. No fictitious progress, recommendations or resume.
- Updated Student `Units` navigation label to `Learning` without changing URL.
- Simplified Unit explorer and Unit Detail hierarchy; preserved Section/Topic
  filtering and Activity routes; removed index-based Unit accent rotation.
- No backend endpoint, DTO, auth, Assignment runtime or Rewards contract changed.
- Validation in the local branch snapshot: `npm run build` passed;
  `npm run lint` passed with 53 pre-existing warnings (0 errors); focused
  changed-file lint had 0 errors (Navbar retains its existing effect warning);
  `git diff --check` passed. Standalone `npx tsc --noEmit` is blocked by
  missing Practice illustration imports (`practice-garden.jpg`,
  `practice-mascot.png`) outside this change. Authenticated browser/API E2E
  and viewport screenshot review remain open.

## Verification

- Frontend global page layout refactor completed on this branch: TeacherLayout and StudentShell now own the standard `1440px` page container; only the two Student runtime routes use immersive `h-dvh` rendering.
- Student rewards leaderboard presentation was refined with a clearer streak-first hierarchy, responsive current-student summary, accessible disabled states for unavailable ranking criteria, and token-only feature styling. It remains explicitly backed by presentation-only mock gamification data.
- Leaderboard UI static checks and `git diff --check` pass; focused ESLint, TypeScript, build, and browser-width verification could not be run because this shell has no Node.js runtime in `PATH`.
- `client-e-learning`: TypeScript and production build pass. Full ESLint remains blocked by pre-existing errors in the assignment result page and autosave hook; focused changed-file lint has no errors.
- Owner should run local E2E against graded attempts and visually verify 375px, 768px, and 1440px layouts.
- Teacher DataTable refactor added a generic React/TypeScript core at `client-e-learning/src/components/ui/data-table/data-table.tsx`.
- Student result view now consumes the expanded server result DTO, has no mock/demo fallback, and uses localized, split review components.
- Frontend state audit and migration started: page-level loading uses `FullPageState`, list/table regions use matching skeletons, and region error/empty states use `RegionState`. The migration matrix is in `.agent/frontend-state-audit.md`.
- Shared frontend formatting utilities now live under `client-e-learning/src/utils/format/`; date/time, score, duration, and initials consumers use the barrel exports instead of local/type/mock helpers.
- StudentTable, ActivityWorkspace, Assignment Analysis class comparison/classes/sections/students tables now use the shared column/pagination presentation while retaining feature-owned renderers and behavior.
- Expandable question analysis rows and content import preview remain specialized tables because their nested row interaction is not representable by the minimal DataTable column contract without changing behavior.
- Teacher class student management is now split into a query/mutation hook, roster table, and add/transfer/remove dialogs. The add-student query uses `noClass=true` with a fixed fetch size and intentionally has no pagination UI.

## Leaderboard work (2026-11-06)

- Connected Student Rewards UI to real read-only XP/Streak ranking endpoints with 50 displayed students, deterministic self rank including out-of-top-50 card; time filters on XP only.
- Replaced mock Honors with 2 server-backed honors (lifetime XP, longest Streak), and recent activity with terminal ActivitySessions.
- No ranking table migration. Runtime PostgreSQL verification, backend Maven, frontend lint/build, and authenticated E2E not yet run.
