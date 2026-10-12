# Implementation Phases

## Phase 0–2
Foundation, authentication/users, classes.

## Phase 3 — Content
Grade -> Unit -> Section -> Topic -> QuestionBank -> Question.
Include Question CRUD, preview, completeness and one optional teacher-authored Question hint.
Topic formula/reference sheet is deferred by ADR 0016.

## Phase 4 — Activities
Canonical spec: E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md.
Include Unit-scoped Activity, ActivityBank distribution, selection strategies, Learning/Try Hard/BOTH, Draft authoring, readiness, preview and lifecycle.
Multiple strategies require student choice at run start; Attempt stores selection_strategy.
Try Hard timer is per question.
GameTemplate is deferred and is not a dependency.

## Phase 5 — Assignments
Canonical spec: E-LEARNING_PHASE_5_ASSIGNMENTS_SPEC_EN.md.
Include independent Assignment, owned AssignmentQuestions, CLASS/GRADE targets, schedule, whole-attempt time limit, show_score_after_submit and show_answers_after_submit.
Assignment order is stored on ordered Composition sections/items/members; AssignmentQuestion remains position-free. Excel import remains deferred.

## Phase 6 — Student Management
DONE. See E-LEARNING_PHASE_6_STUDENT_MANAGEMENT.md.

## Phase 7 — Activity Sessions & Assessment Attempts
Canonical spec: E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md.
**Scope A first:** ActivitySession for Practice/Try Hard. **Scope B later:** AssessmentAttempt for formal Assignment/Assessment. No shared polymorphic Attempt runtime.

## Phase 8
Analytics.

## Phase 9
XP and ranking.

## Phase 10
Teacher dashboard using real data only.

## Phase 11
Reports and polish.


## Cross-cutting Question Engine proposal

ADR 0023 accepts Question Engine D1–D8, ADR 0024 accepts Assignment Composition, ADR 0025 sets the Assignment hard-lock and Activity snapshot-version behavior, and ADR 0026 sets automatic Assignment scoring and independent score/answer display. These are accepted contracts, not code already implemented. Before coding, read `.agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md`, validate Scope A, characterize current Question behavior and re-audit the Flyway baseline. Never edit V1–V30 or assume V31–V33 are the next migrations.
