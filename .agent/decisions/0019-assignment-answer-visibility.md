# 0019 — Assignment post-submit answer visibility is boolean
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

The old Release Answers flow used assignments.answers_released_at and a teacher action. The owner wants a simple option to show or hide correct answers after submission.

## Decision

- Replace answers_released_at with show_answers_after_submit BOOLEAN NOT NULL DEFAULT TRUE.
- TRUE: after submission, the student sees the score, correct answers and explanations for the submitted attempt.
- FALSE: after submission, the student sees the score and submission/result state but not correct answers or explanations.
- The result must be computed server-side from the Assignment configuration stored for that attempt.
- There is no Release Answers endpoint, timestamp, button or workflow.

## Consequences

Assignment create/edit/read contracts expose show_answers_after_submit. Student review APIs must enforce the boolean. The default TRUE preserves the previous immediate-review behavior for existing Assignments.
