# Implementation Phases

**Current branch:** `feature/teacher-assignment-analysis`  
**Current implementation baseline:** `.agent/CURRENT_STATE.md`

## Phase 0–2
Foundation, authentication/users and classes. Implemented baseline.

## Phase 3 — Content
Grade → Unit → Section → Topic → QuestionBank → Question. Question CRUD, preview, completeness and one optional teacher-authored Question hint are implemented baseline. Topic formula/reference sheet remains deferred by ADR 0016.

## Phase 4 — Activities
Unit-scoped Activity, ActivityBank distribution, selection strategies, Learning/Try Hard/BOTH, Draft authoring, readiness, preview and lifecycle are implemented baseline contracts. Multiple strategies require student choice at run start. Try Hard timer is per question. GameTemplate is deferred.

## Phase 5 — Assignments
Independent Assignment, Grade ownership, explicit class recipient snapshots, schedule, whole-attempt time limit, `show_answers_after_submit`, `show_score_after_submit`, Composition ordering and Assignment-owned questions are implemented at the authoring/configuration level. AssignmentQuestion remains position-free; Composition positions define order.

## Phase 6 — Student Management
DONE.

## Phase 7 — Student Runtime

### Scope A — ActivitySession
Implemented baseline: start/access validation, mode/strategy resolution, previous-session abandonment, per-question Try Hard timing/lives, Practice retry/hint behavior and persisted snapshot payloads.

End-to-end Question Engine/snapshot/browser verification remains a separate validation gate.

### Scope B — AssessmentAttempt
**FEATURE CLOSED / MERGED.** `feature/student-assignment-attempt` was merged to `main` through PR #30.

Implemented baseline includes AssessmentAttempt schema evolution, start/resume, immutable runtime snapshot and answer autosave. ADR 0028 is authoritative for draft-answer storage on `AssessmentAttemptQuestion`.

Follow-up runtime work remains: submit, timeout finalization, automatic grading, PartResults, result/review access, hard-lock after first Attempt and exact-HEAD verification. These follow-ups do not reopen the historical feature branch.

## Phase 8 — Teacher Assignment Analysis
**NEXT FEATURE — ACTIVE SPECIFICATION**

Canonical specification:

`.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`

Scope is analysis of one Assignment:

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

Production analytics depend on persisted finalized AssessmentAttempt grading results. The feature must use backend-derived aggregates and immutable historical snapshots; the frontend must not re-grade or calculate authoritative metrics.

No Content Section / Unit / Topic analytics, cross-assignment analytics, XP/ranking, manual grading, per-question active time or advanced AI analytics are part of this phase.

## Phase 9
XP and ranking.

## Phase 10
Teacher dashboard using real data only.

## Phase 11
Reports and polish.

## Cross-cutting Question Engine

Question Engine implementation exists structurally for seven types with canonical specs, handlers and registry. Integration and runtime parity remain incomplete in places. New Teacher Analysis work must use the persisted grading contract rather than introducing a second grading implementation.
