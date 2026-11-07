# Current Implementation State

**Audit date:** 2026-11-06
**Branch:** `feature/student-gamification`
**Baseline:** `main` after merge of `feature/student-assignment-attempt` (PR #30)

## 1. Authority model

1. Accepted ADRs = approved product/architecture decisions.
2. `.agent/CURRENT_STATE.md` = current implementation state.
3. Active phase/spec/architecture documents = intended implementation contract.
4. `.agent/PROGRESS.md` = concise work log and verification evidence.
5. Historical audits/plans = traceability only.
6. Code and migrations = final evidence of what is actually implemented.

## 2. Repository baseline

- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: Spring Boot + Java 21 + JPA + Flyway + PostgreSQL.
- AssessmentAttempt finalize path is on `main` (submit, grade, PartResults, timeout job).

## 3. Feature status

| Area | State |
|---|---|
| Phase 0–6 | Baseline / DONE |
| Phase 7 Scope A ActivitySession | Implemented; E2E open |
| Phase 7 Scope B AssessmentAttempt | Code on `main`; E2E + hard-lock open |
| **Phase 8 Teacher Assignment Analysis** | **Code complete on this branch; local E2E not claimed** |
| **Activity XP Engine Phases 1–4** | **Implemented behind default-off rollout; Phase 5 validation/enablement open** |
| **Student Streak / Level v1** | **Service/API and Rewards UI source added; tests/build/E2E pending verification** |

### Student Streak / Level v1

- `COMPLETED` ActivitySession invokes one-per-day qualification in `Asia/Ho_Chi_Minh`; replays in the same day do not advance the run. Milestones 3/7/14/30 award separate STREAK_BONUS ledger amounts 10/20/40/80, updating Lifetime XP and derived Level.
- Existing V49 profile/day/ledger schema reused; no migration required for the accepted no-Freeze/no-backfill policy. Session → profile lock order is preserved. No historical Streak backfill.
- Authenticated read-only gamification profile, Streak and leaderboard endpoints are implemented. Student Home owns Streak/Level; Student Rewards uses live XP/Streak Top 50, personal standing, Hall of Fame and terminal ActivitySession feed with no mock fallback.
- PostgreSQL concurrency and authenticated E2E not yet verified. See `.agent/plans/STUDENT_STREAK_LEVEL_IMPLEMENTATION.md`.

### Activity XP Engine

- New eligible ActivitySessions freeze policy/Level/multiplier and persist a
  validated per-question XP audit.
- COMPLETED/GAME_OVER settlement atomically writes the immutable session
  receipt, one positive PRACTICE ledger row when applicable, and profile
  Lifetime XP/Level; ABANDONED and zero awards finalize without a reward row.
- `GET /v1/activity-sessions/{sessionId}/result` is read-only and exposes the
  committed receipt plus optional question audit. The Activity Result UI shows
  XP totals and Level change and handles loading/error/legacy states.
- V52 adds immutable `xp_lifetime_after` and `xp_level_after` receipt fields.
  `ACTIVITY_XP_ENABLED` remains false by default. Phase 3/4 validation was
  explicitly skipped for this task and remains required before rollout.

## 4. Teacher Assignment Analysis (this branch)

**Route:** `/teacher/assignments/{id}/results`  
**Spec:** `.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`  
**Impl log:** `.agent/plans/11-TEACHER_ASSIGNMENT_ANALYSIS_IMPLEMENTATION.md`

### Backend (`assignmentanalysis`)

- `GET .../analytics/overview` — progress, score (10 buckets), class comparison + accuracy + overall band
- `GET .../analytics/students` — filters + `PageResponse` (1-indexed)
- `GET .../analytics/questions` — aggregate by position (skip example)
- `GET .../students/{studentId}/attempt` — review; answer key always for teacher
- DTOs under `dto/response/` (no `Dto` suffix); students use `common.dto.PageResponse`
- Roster: live enrollment via `Assignment.classIds` + `ClassMember`
- Security: covered by existing `/v1/teacher/**` → `ROLE_TEACHER`

### Frontend

- Modular UI under `components/features/teacher/assignments/analysis/`
- Entry: list **Results** link (non-DRAFT) + results page route
- Attempt review sheet; i18n `teacher.analytics.*`
- Always `response.data` (ApiResponse wrap)
- Sample `result/teacher-assignment-result-view.tsx` **removed**

### Product decisions (locked)

| Topic | Decision |
|---|---|
| Roster | Live `classIds` enrollment |
| Duration | finishedAt − startedAt |
| Overall band | HIGH ≥80 / MID ≥50 / LOW &lt;50 (median %) |
| Accuracy | CORRECT / all non-example outcomes on terminal attempts |
| Class comparison | Always show rows (including single class) |
| Score range filter | Deferred |
| Export | None |

### Explicitly deferred (spec ok, not in MVP code)

- Answer distribution by question type (option/blank charts)
- Per-question detail endpoint
- Score range filter on Students
- IDOR tests / ownership beyond role + assignment exists
- Hard-lock on Assignment after first attempt (runtime follow-up)

## 5. Verification status

No compile/test/browser run claimed for this pass. Local E2E checklist lives in `11-...IMPLEMENTATION.md`.
