# E-Learning — Phase 5: Assignments
Status: ACTIVE CANONICAL SPEC
Last revised: 2026-10-07

Assignment is formal teacher-assigned work with a target, schedule, one attempt and an official score.
Assignment is independent from Activity and never references QuestionBank.

## Assignment
Fields include grade_level, academic_year, name, description, status, start_at, due_at, time_limit_seconds and show_answers_after_submit.
time_limit_seconds applies to the whole Attempt.
show_answers_after_submit defaults TRUE.

## AssignmentQuestion
Only assignment_id + question_id.
No position, topic_id, reorder endpoint or reorder UI.
All reads/snapshots use ORDER BY question_id ASC.
Do not rely on database insertion order.
AttemptQuestion.position, if used, is runtime snapshot order only.

## Targets
CLASS or GRADE, never mixed.
Late submissions are accepted and labeled Late without score penalty.
Completion = submitted.

## Readiness
Draft may be incomplete.
Publish requires valid metadata, complete owned Questions, valid target/schedule and valid time limit when present.

## Review
TRUE -> student sees score, correct answers and explanations.
FALSE -> student sees score/result state without correct answers/explanations.
No Release Answers timestamp, endpoint, button or workflow.

## Deferred
Excel import is deferred until its contract is finalized.
