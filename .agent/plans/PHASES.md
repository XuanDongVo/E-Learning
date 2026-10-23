# Implementation Phases

**Current branch:** `refactor/teacher-content-ui-routing`  
**Current implementation baseline:** `.agent/CURRENT_STATE.md`

## Phase 0–2
Foundation, authentication/users and classes. Implemented baseline.

## Phase 3 — Content
Grade → Unit → Section → Topic → QuestionBank → Question. Question CRUD, preview, completeness and one optional teacher-authored Question hint are implemented baseline. Topic formula/reference sheet remains deferred by ADR 0016.

## Phase 4 — Activities
Unit-scoped Activity, ActivityBank distribution, selection strategies, Learning/Try Hard/BOTH, Draft authoring, readiness, preview and lifecycle are implemented baseline contracts. Multiple strategies require student choice at run start. Try Hard timer is per question. GameTemplate is deferred.

## Phase 5 — Assignments
Independent Assignment, Grade ownership, explicit class recipient snapshots, schedule, whole-attempt time limit, `show_answers_after_submit`, `show_score_after_submit`, Composition ordering and Assignment-owned questions are implemented at the authoring/configuration level. AssignmentQuestion remains position-free; Composition positions define order. Formal AssessmentAttempt runtime is not implemented.

## Phase 6 — Student Management
DONE.

## Phase 7 — ActivitySession and AssessmentAttempt

### Scope A — ActivitySession
Implemented baseline: start/access validation, mode/strategy resolution, previous-session abandonment, per-question Try Hard timing/lives, Practice retry/hint behavior and persisted snapshot payloads.

Gate remains open until snapshot completeness, leakage, timer/retry/hint/lives/abandonment behavior and current backend/frontend validation are actually verified.

### Scope B — AssessmentAttempt
Not implemented. Remaining work is the separate formal Assignment runtime: one attempt per student, immutable attempt snapshot, autosave/idempotent submit, whole-attempt timeout, automatic scoring, score/answer visibility, hard lock after first attempt, clone workflow and persisted per-part results/analytics.

No shared polymorphic Attempt runtime is allowed.

## Phase 8
Analytics. Formal cross-assignment analytics/reporting remains future work after persisted AssessmentAttempt results exist.

## Phase 9
XP and ranking.

## Phase 10
Teacher dashboard using real data only.

## Phase 11
Reports and polish.

## Cross-cutting Question Engine

Question Engine implementation exists structurally for seven types with canonical specs/results, handlers and registry. It is not merely a proposal anymore, but integration is incomplete: ActivitySessionService still contains type-specific semantics, and MATCHING/CLOZE persistence/authoring/runtime parity is not fully verified.

Before new AssessmentAttempt work, read `.agent/CURRENT_STATE.md`, validate current Scope A and Question Engine behavior, and re-audit the actual Flyway maximum. The current migration baseline is **V42**; never edit applied migrations or assume old V31–V33 placeholders are available.
