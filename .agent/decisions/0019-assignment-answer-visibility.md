# 0019 — Assignment post-submit answer visibility is boolean
Status: Accepted; reveal timing refined by ADR 0025
Date: 2026-10-07
Decided by: project owner

## Context

The old Release Answers flow used assignments.answers_released_at and a teacher action. The owner wants a simple option to show or hide correct answers after submission.

## Decision

- Replace answers_released_at with show_answers_after_submit BOOLEAN NOT NULL DEFAULT TRUE.
- TRUE: after submission **and after required teacher review is finalized** (ADR 0025), the student sees the final score, correct answers and explanations for the submitted attempt. While review is pending, show Submitted / Pending review without a final score or answer review.
- FALSE: after submission, show submission/review state; after grading is finalized, show the final score/result but not correct answers or explanations.
- The final score is computed server-side from teacher-awarded earned points and the Assignment snapshot stored for that attempt. No automatic correctness grading is performed for formal Assignments in v1.
- There is no Release Answers endpoint, timestamp, button or workflow.

## Consequences

Assignment create/edit/read contracts expose show_answers_after_submit. Student review APIs must enforce the boolean. The default TRUE means reveal the reviewed result immediately after teacher grading is finalized; it does not bypass pending review.
