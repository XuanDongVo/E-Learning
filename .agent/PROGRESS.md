# Project Progress

**Current source audit:** 2026-11-01  
**Branch:** `feature/teacher-assignment-analysis`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

## Current stage

- Phase 6 Student Management: **DONE**.
- Phase 7 Scope A ActivitySession: **IMPLEMENTED, NOT FULLY VERIFIED**.
- Phase 7 Scope B AssessmentAttempt: **MERGED + finalize path present on `main`**.
  - Code: submit, auto-grade, PartResults, attempt totals, result endpoint, scheduled timeout job.
  - Remaining: hard-lock, exact-HEAD E2E verification, package README freshness.
- Teacher Assignment Analysis: **SPEC ACTIVE; sample UI only; production analytics not started**.

## AssessmentAttempt code check (2026-11-01)

Verified by reading `main` sources (not by running tests):

- `AssessmentAttemptSubmitService` — manual submit + `finalizeTimeoutIfDue`
- `AssessmentAttemptGradingService` — grade from snapshot, persist PartResults/totals
- `AssessmentAttemptTimeoutJob` — `@Scheduled` scan with grace minutes
- `AssessmentAttemptController` — intro, start/resume, submit, result
- Entities: `AssessmentAttempt`, `AssessmentAttemptQuestion`, `AssessmentAttemptPartResult`

## Teacher Analysis owner decisions (proposed → adopted in CURRENT_STATE)

See `.agent/CURRENT_STATE.md` §5 and updates in `10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md` §25.

## Verification

No compile/test/browser run claimed for this documentation pass.
