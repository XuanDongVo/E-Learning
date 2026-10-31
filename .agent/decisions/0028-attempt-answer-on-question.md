# 0028 — AssessmentAttempt draft answer lives on AssessmentAttemptQuestion

**Status: Accepted**  
**Date:** 2026-10-31  
**Decided by:** project owner  
**Branch:** `feature/student-assignment-attempt`

## Context

V43 introduced `assessment_attempt_answers` as a 1–1 table beside `assessment_attempt_questions`. Autosave, optimistic locking (`revision`), and runtime projection all treated the answer as a separate entity even though each question instance has at most one draft answer. `normalized_value` on the answer row was never written by autosave and belongs to post-grade analytics (PartResult), not the draft path.

## Decision

1. **Remove** the `AssessmentAttemptAnswer` entity and `assessment_attempt_answers` table.
2. **Persist** draft state on `AssessmentAttemptQuestion`:
   - `answer_payload` (JSONB, nullable until first save)
   - `revision` (BIGINT, JPA `@Version`, default 0)
   - `saved_at` (nullable until first save)
3. **Keep** `AssessmentAttemptAnswerMutation` (V46) for `(attempt_id, request_id)` idempotency; it continues to reference `attempt_question_id`.
4. **Do not** store normalized submitted values on the draft row. Normalize only on submit/timeout grading; optional persistence belongs on `AssessmentAttemptPartResult` in a later slice.
5. **API wire shape unchanged:** `PUT .../questions/{attemptQuestionId}/answer` and runtime fields `answerPayload` / `answerRevision` on each question.
6. **Schema change** is forward-only **V47**. Do not edit V43–V46.

## Consequences

- Fewer joins for runtime projection and autosave.
- Domain model matches “one question instance = snapshot + current draft”.
- Submit/grade services (not yet implemented) must read `answer_payload` from the question row.
- Student APIs must continue to project only `student.spec` from `question_snapshot` and never expose `grading`.
