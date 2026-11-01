# Current Implementation State

**Audit date:** 2026-11-01  
**Branch:** `feature/teacher-assignment-analysis`  
**Baseline:** `main` after merge of `feature/student-assignment-attempt` (PR #30)  
**Scope:** documentation rebaseline for Teacher Assignment Analysis; AssessmentAttempt pipeline re-checked against `main` code.

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
- Assignment Attempt runtime was merged to `main` through PR #30.
- V43–V47 are the current AssessmentAttempt migration sequence on the merged baseline.
- ADR 0028 (attempt-answer-on-question) is authoritative for draft-answer storage on `assessment_attempt_questions`.

### AssessmentAttempt pipeline on `main` (code evidence)

| Capability | Code | Notes |
|---|---|---|
| Start / resume + snapshot | Implemented | `AssessmentAttemptCreationService` |
| Autosave | Implemented | answer payload on `AssessmentAttemptQuestion` |
| Manual submit | Implemented | `AssessmentAttemptSubmitService.submit` |
| Auto-grade from snapshot | Implemented | `AssessmentAttemptGradingService.gradeAndPersist` |
| PartResults + attempt totals | Implemented | entity `AssessmentAttemptPartResult`; totals on attempt |
| Student result | Implemented | `GET .../assessment-attempt/result` |
| Timeout finalization | Implemented | `finalizeTimeoutIfDue` + `AssessmentAttemptTimeoutJob` (`@Scheduled`) |
| Assignment hard-lock after first attempt | **Not verified / likely remaining** | Follow-up |
| Full compile/test/browser verification | **Not claimed** | Exact-HEAD E2E still open |

Package README under `assessmentattempt` is partially stale (still lists timeout job as remaining); prefer this table and the service classes as truth.

## 3. Feature status

| Area | Current state | Classification |
|---|---|---|
| Phase 0–2 | Foundation, auth/users and classes | Implemented baseline |
| Phase 3 Content | Grade → Unit → Section → Topic → QuestionBank → Question | Implemented baseline; QE integration still partial in places |
| Phase 4 Activity | Unit-scoped Activity runtime authoring | Implemented baseline |
| Phase 5 Assignment | Authoring, `class_ids` targets, schedule, Composition, settings | Implemented authoring baseline |
| Phase 6 Student Management | Done | Done |
| Phase 7 Scope A | ActivitySession | Implemented; E2E verification open |
| Phase 7 Scope B | AssessmentAttempt full finalize path on `main` | **Implemented in code**; E2E + hard-lock remain |
| Teacher Assignment Analysis | Spec active; UI sample exists; production analytics not started | **ACTIVE FEATURE** |

## 4. Closed Student Assignment Attempt feature

`feature/student-assignment-attempt` was merged via PR #30. Do not reopen that branch for new work.

Remaining **follow-ups** (not blockers to starting Teacher Analysis design, but affect data quality claims):

- Assignment hard-lock after first Attempt starts
- Exact-HEAD backend/frontend/browser verification of submit/timeout/grade
- Optional: student-membership snapshot at publish time (see Teacher Analysis roster decision)

## 5. Teacher Assignment Analysis contract

Canonical specification:

`.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`

Sample/prototype UI (not production contract):

`client-e-learning/src/components/features/teacher/assignments/result/teacher-assignment-result-view.tsx`

- Client-side aggregation over a sample dataset (`isSample`)
- Must not be copied as the production architecture; replace with backend aggregate APIs

### Product decisions adopted for MVP (2026-11-01)

| Topic | Decision |
|---|---|
| Roster ("sĩ số giao") | **Live enrollment** in `Assignment.classIds` at query time; no student-ID snapshot in MVP |
| Class context for Attempt | Always `classIdAtStart` / `classNameAtStart` when Attempt exists |
| Duration | `submittedAt - startedAt` (or `timedOutAt - startedAt`); null while IN_PROGRESS |
| Class Comparison with 1 class | **Still show one row** |
| Accuracy vs scoreRate | Both exposed; different labels (see spec) |
| Kết quả chung | Optional compact band labels from backend using fixed % thresholds |
| Score range filter | **Defer** from Students MVP |
| Score distribution | Fixed 10-point buckets 0–10 … 90–100 |
| Auth | Single-teacher deployment; authorize by authenticated TEACHER role + Assignment exists |
| Export | None in MVP |

## 6. Dependency gate (updated)

**Code path for finalized results exists on `main`.** Teacher Analysis may implement backend aggregates against real Attempt rows.

Still required before calling analytics "production-verified":

1. Confirm example-question exclusion in grading totals matches ADR 0026
2. Smoke-test submit + timeout job + result against a real Assignment
3. IDOR tests on teacher analytics endpoints when they land
4. Hard-lock policy if authoring still mutates live Assignments with Attempts

## 7. Verification status

This update re-read AssessmentAttempt services/controllers on `main`. It did **not** run backend compile/tests, Flyway, frontend build, or browser/E2E.
