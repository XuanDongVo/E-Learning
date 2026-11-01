# Project Progress

**Current source audit:** 2026-11-01  
**Branch:** `feature/teacher-assignment-analysis`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

## Current stage

- Phase 6 Student Management: **DONE**.
- Phase 7 Scope A ActivitySession: **IMPLEMENTED, NOT FULLY VERIFIED**. ActivitySession supports mode/strategy selection, abandonment of the previous open run, Practice retry/hint behavior, Try Hard per-question timing/lives, and persisted snapshot payload metadata.
- Phase 7 Scope B AssessmentAttempt: **FEATURE CLOSED / MERGED** through PR #30. Start/resume, snapshot and autosave baseline are merged. Submit, timeout finalization, grading, PartResults, result/review access and hard-lock remain follow-up runtime work.
- Question Engine: **CORE IMPLEMENTED, END-TO-END INTEGRATION INCOMPLETE**. New analytics work must consume persisted grading results and must not introduce a second grading implementation.
- Teacher Content UI routing/bank work: **IMPLEMENTED IN SLICES, NOT FULLY VERIFIED**. Canonical routes remain under `/teacher/content/...`.
- Teacher Assignment Analysis: **SPECIFICATION CREATED; IMPLEMENTATION NOT STARTED**.

## Closed feature: Student Assignment Attempt

The historical feature branch `feature/student-assignment-attempt` was merged to `main` in PR #30. Its active branch is no longer the place for new work.

Remaining follow-up runtime gates:

1. Submit finalization.
2. Timeout finalization using the same grading path.
3. Automatic grading from immutable Attempt snapshot.
4. Persisted PartResults and Attempt totals.
5. Result/review access with score/answer visibility rules.
6. Assignment hard-lock after first Attempt.
7. Exact-HEAD backend/frontend/browser verification.

These are follow-up implementation tasks and must not be retroactively presented as verified by the Student Attempt feature closure.

## New active feature: Teacher Assignment Analysis

Canonical specification:

`.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`

Scope:

```text
Assignment
├── Overview
│   ├── Progress
│   ├── Score
│   └── Class Comparison
├── Students
│   └── Attempt Review
└── Questions
    ├── Assignment Section grouping
    └── Question Analysis
```

The feature is intentionally basic analytics for one Assignment. Class Comparison is a compact table, not a Class Analytics dashboard. Assignment Section is Composition grouping/context, not Content Section analytics.

## Teacher Analysis dependency gate

Production analytics require reliable persisted finalized Attempt results:

- submit
- timeout finalization
- automatic grading
- PartResults
- Attempt totals
- example-question exclusion
- immutable snapshot integrity

UI/prototype work may proceed against explicit API contracts/mock data before these backend dependencies are complete, but real-data analytics must wait for verified persisted results.

## Current database baseline

AssessmentAttempt migrations on the merged baseline are V43–V47. ADR 0028 is authoritative for draft-answer storage on `AssessmentAttemptQuestion`.

## Verification

The 2026-11-01 documentation rebaseline did not run backend compile/tests, Flyway validation, frontend lint/typecheck/build or browser/E2E. No such validation is claimed.
