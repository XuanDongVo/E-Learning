# Phase 7: Attempts and Answers
Status: DRAFT — waiting for owner sign-off
Last revised: 2026-10-07

## Scope
Activity runs, Assignment Attempts, immutable snapshots, answer checking, scoring, Learning hint/retry, Try Hard per-question deadlines, Assignment whole-attempt expiry and student review.

Out of scope: Phase 8 weakness aggregates, Phase 9 XP amounts/ranking, GameTemplate, Topic formula/reference sheet, Assignment Excel import.

## Attempt
Exactly one parent: Activity or Assignment.
For Activity, store concrete mode and selection_strategy.
For Assignment, store whole-attempt expiry when configured.

AttemptQuestion stores runtime position and per-question deadline. position is not AssignmentQuestion.position.

## Activity start
Require PUBLISHED Activity and readiness.
If mode=BOTH, request concrete LEARNING/TRY_HARD.
If multiple strategies are configured, request concrete selection_strategy.
If one strategy is configured, server may auto-select.
Reject strategies not configured.
Create Attempt and snapshots transactionally.

## Activity selection
Use distribution quotas and the selected strategy.
Never reselect after Attempt creation.
Try Hard deadline is now + time_limit_seconds when a question is served; next question gets a new deadline.
Timeout costs no life; wrong answer costs one life.

## Learning
No timer.
At most 3 answers/question.
Optional Question hint; hint_used is recorded.
No current formula/reference sheet.

## Assignment
Assignment must be PUBLISHED and assigned to student.
Resume IN_PROGRESS; reject after submitted.
New Attempt snapshots AssignmentQuestions ordered by question_id ASC.
Assignment time_limit_seconds is whole Attempt.
At submit, enforce show_answers_after_submit.

## Student API draft
POST /v1/activities/{id}/attempts/start
GET /v1/attempts/{id}
POST /v1/attempts/{id}/answers
POST /v1/attempts/{id}/finish
POST /v1/attempts/{id}/questions/{attemptQuestionId}/hint
GET /v1/attempts/{id}/result

Exact payloads/error codes are finalized before implementation.

## Gate
Concrete mode and strategy persisted; immutable snapshot; per-question Try Hard deadline; deterministic Assignment order; whole-attempt Assignment timeout; answer visibility enforced server-side; server-side grading; own-attempt authorization.
