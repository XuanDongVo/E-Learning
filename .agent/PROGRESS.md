# PROGRESS

Last verified: 2026-10-07 on commit `0905da0` (merge of PR #7, Student Management). Update at the end of every task.
Phase numbers follow `plans/PHASES.md` ([ADR 0004](./decisions/0004-phase-numbering.md)).

## 1. Where we are

**Stage: Plan closed, Design in progress.** The Phase 7 Attempts spec is drafted; the next gate is the owner's sign-off, then the tracking spec.

Teacher-side authoring is largely built (content, activities, assignments, classes, students). **Nothing a student can actually do exists yet:**
no Attempt/Answer tables, no student read APIs, student pages are placeholders or mock. That is the critical gap.

## 2. Done

| Phase | What exists | Evidence |
|---|---|---|
| 0 Foundation | Design system, layouts, shared states | `client-e-learning/src/components`, ADR 0002 |
| 1 Auth | Login, refresh, logout, `/me`, JWT cookie, roles `TEACHER` / `STUDENT`, revoked tokens | `AuthController`, V1 |
| 2 Classes | Class CRUD, archive, members (add / remove / reactivate) | `ClassController`, `ClassMemberController`, V3, V25 |
| 3 Content | Grade, Unit, Section, Topic, QuestionBank, Question, media (Cloudinary), reorder, publish/archive | `/v1/content/**`, V5–V10, V21–V23 |
| 6 Student Management | StudentProfile, guardians, transactional create, lock/unlock, class lifecycle, teacher screens | PR #7, V24; 4 server test methods, 12 client tests pass |

## 3. In progress (not yet at its completion gate)

| Phase | Done so far | Missing for the gate |
|---|---|---|
| 4 Activities | CRUD, publish/archive, sources, distribution calculator, mode validation, readiness (`GET /{id}/readiness`), teacher screens | Preview endpoint (DTOs exist, no endpoint; D-10), `GameTemplate` (no table/entity; OQ-9), tests for validation/distribution/readiness |
| 5 Assignments | CRUD, status, own questions (list, create many, update, bulk delete), `AssignmentTarget` (`CLASS`/`GRADE`), schedule and time limit fields, teacher screens | Readiness and "publish only when READY" (no `ASSIGNMENT_NOT_READY`), recipients preview, progress shell, tests. The release-answers action is **dropped** (ADR 0011); the `answers_released_at` column is now unused. Excel import and reorder are deferred (ADR 0003); question locking waits for Attempts |

## 4. Not started

| Phase | Notes |
|---|---|
| 7 Attempts and Answers | Unblocked by ADR 0006–0009. Needs its own spec before code (N4) |
| 8 Analytics | Needs Answer history |
| 9 XP and ranking | Needs Attempts |
| 10 Teacher dashboard | Currently static numbers (D-09) |
| 11 Reports and polish | |

## 5. Quality gate (measured 2026-10-07)

| Check | Result |
|---|---|
| Client `npm test` (vitest) | 3 files, 12 tests, pass |
| Client `eslint` | **Fail: 21 errors**, 26 warnings in 16 files (11 × `react-hooks/set-state-in-effect`, 5 × `no-explicit-any`, 3 × `no-unescaped-entities`, 1 × `prefer-const`, 1 × `no-empty-object-type`) |
| Client `tsc --noEmit` | **Fail: 1 error** (`QuestionPreviewModal.tsx` uses `draftId`, which is not on `QuestionPreviewData`) |
| Client `npm ci` | **Fails** (lockfile out of sync with `package.json`); `npm install` works but rewrites ~2800 lock lines |
| Client `next build` | Not run |
| Server `./mvnw test` | Not run (the verification sandbox cannot reach Maven Central). Run it locally and record the result here |
| CI | None (`.github/` missing) |

## 6. Next, in order

| # | Task | Output | Gate |
|---|---|---|---|
| N0 | ~~Intent sign-off~~ **Done 2026-10-07** (intent v1.1 accepted; ADR 0004–0010) | Intent accepted | Owner |
| N1 | **Quality gate**: regenerate lockfile so `npm ci` works; fix the 21 lint errors and the `tsc` error; add GitHub Actions (client lint + test + build, server `./mvnw test`); record the first server test run | CI green | CI |
| N2 | **Close Phase 4**: preview endpoint per spec §11; tests for `ActivityValidationService`, `ActivityDistributionCalculator`, `ActivityReadinessService`; relabel the Try Hard time limit as "seconds per question" in the Activity editor (ADR 0015) | Phase 4 gate met | Tests |
| N3 | **Close Phase 5 (current milestone)**: `AssignmentReadinessService` + `ASSIGNMENT_NOT_READY`, recipients preview, progress shell; tests (no release-answers, ADR 0011) | Phase 5 gate met | Tests |
| N3b | **Hint data and authoring** (ADR 0014): `questions.hint` and `topics.reference_sheet`, migration, content-authoring UI, content API fields | Hints can be authored | Tests |
| N4 | **Attempts spec**: [`plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md`](./plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md) **drafted 2026-10-07**, waiting for owner sign-off (all §17 assumptions confirmed). Then write the Assignment tracking spec | Spec signed off | Owner |
| N5 | **Build Attempts**, migration `V26+`. Functions, in order: `startAttempt` (Activity run / Assignment) → `selectQuestions` (reuse distribution calculator and strategy) → persist `AttemptQuestion` snapshot → `getAttempt` / resume → `submitAnswer` → `finishAttempt` (score, lives, Game Over, timeout) → Late label → student read APIs (OQ-5) | Test per rule; A3 and A4 of the intent pass | Tests |
| N6 | Student screens (student sees own grade only, ADR 0007): Units, Activity runner, Assignments, result; remove `src/mock` | A3, A4 | Review |
| N7 | **Assignment tracking (priority #1)**: status per student (Not started / In progress / Submitted / Submitted late), score per student and class average, most-missed questions, Excel/CSV export (pulled forward from Phase 5 M6) | A4 | Review |
| N8 | Analytics → XP and ranking → real Teacher dashboard | A5 | Review |

## 7. Known issues and risks

- No Attempt data yet, so `WEAKNESS_PRIORITY` cannot work until N5 is done.
- Assignment questions cannot be locked after the first Attempt until Attempts exist (ADR 0003).
- `ErrorCode.java` keeps its constants on one line; split it when next touched (readability only).
- Drift items D-08–D-11 in [`design/spec-status.md`](./design/spec-status.md) are still open.
