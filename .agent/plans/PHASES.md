# Implementation Phases

**Current branch:** `feature/student-gamification`
**Current implementation baseline:** `.agent/CURRENT_STATE.md`

## Phase 0–6
Baseline / DONE (see CURRENT_STATE).

## Phase 7 — Student Runtime

### Scope A — ActivitySession
Implemented baseline; E2E verification open.

### Scope B — AssessmentAttempt
FEATURE MERGED (PR #30). Finalize path on `main`. Remaining: hard-lock, exact-HEAD E2E.

## Phase 8 — Teacher Assignment Analysis

**Status: CODE COMPLETE on `feature/teacher-assignment-analysis` (pending local E2E).**

- Spec: `10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`
- Impl notes: `11-TEACHER_ASSIGNMENT_ANALYSIS_IMPLEMENTATION.md`
- Production UI: `client-e-learning/.../assignments/analysis/`
- APIs: `/v1/teacher/assignments/{id}/analytics/*` + attempt review

Deferred vs full spec: answer-option distributions, question detail endpoint, score-range filter, export.

## Student Gamification — current branch

- Activity XP Engine v2.2 Phases 1–4: source implemented behind default-off rollout, Phase 5 verification/open.
- Streak/Level v1: source service, read APIs and Rewards UI added; backend/FE checks, PostgreSQL concurrency and authenticated E2E remain open. See `STUDENT_STREAK_LEVEL_IMPLEMENTATION.md`.
- Leaderboard live data: **deferred**; existing UI uses explicitly labeled sample data.

## Remaining Phase 9–11 work
Live ranking, teacher dashboard and reports are not implemented under this Streak slice.
