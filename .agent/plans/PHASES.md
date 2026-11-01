# Implementation Phases

**Current branch:** `feature/teacher-assignment-analysis`  
**Current implementation baseline:** `.agent/CURRENT_STATE.md`

## Phase 0–2
Foundation, authentication/users and classes. Implemented baseline.

## Phase 3 — Content
Grade → Unit → Section → Topic → QuestionBank → Question. Implemented baseline. Topic formula sheet deferred (ADR 0016).

## Phase 4 — Activities
Unit-scoped Activity baseline implemented.

## Phase 5 — Assignments
Independent Assignment with Grade ownership, `class_ids` recipient list, schedule, whole-attempt time limit, visibility settings, Composition. Authoring baseline implemented. **No per-student recipient snapshot** in MVP schema.

## Phase 6 — Student Management
DONE.

## Phase 7 — Student Runtime

### Scope A — ActivitySession
Implemented baseline; E2E verification open.

### Scope B — AssessmentAttempt
**FEATURE MERGED (PR #30).** On `main` the finalize path is present in code:

- submit + auto-grade from immutable snapshot
- PartResults and attempt totals
- result endpoint
- scheduled timeout job (`AssessmentAttemptTimeoutJob`)

Still open: Assignment hard-lock after first attempt, exact-HEAD E2E verification, package README sync.

## Phase 8 — Teacher Assignment Analysis
**ACTIVE FEATURE**

Canonical specification: `.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`

Sample UI only: `client-e-learning/src/components/features/teacher/assignments/result/teacher-assignment-result-view.tsx`

MVP decisions (roster, duration, metrics, class comparison, filters) are recorded in `.agent/CURRENT_STATE.md` §5.

Production analytics use backend aggregates over persisted Attempt/PartResult data. Frontend must not re-grade.

## Phase 9
XP and ranking.

## Phase 10
Teacher dashboard using real data only.

## Phase 11
Reports and polish.
