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
Include independent Assignment, owned AssignmentQuestions, CLASS/GRADE targets, schedule, whole-attempt time limit and show_answers_after_submit.
No AssignmentQuestion position/reorder. Excel import remains deferred.

## Phase 6 — Student Management
DONE. See E-LEARNING_PHASE_6_STUDENT_MANAGEMENT.md.

## Phase 7 — Attempts and Answers
Canonical spec: E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md.
DRAFT awaiting owner sign-off.
Include concrete Activity mode/selection_strategy, immutable snapshots, Learning hint/retry, Try Hard per-question deadlines, Assignment one-attempt/whole-attempt timeout and post-submit answer visibility.

## Phase 8
Analytics.

## Phase 9
XP and ranking.

## Phase 10
Teacher dashboard using real data only.

## Phase 11
Reports and polish.
