# 0022 — Activity Practice interaction and one retry
Status: Accepted
Date: 2026-10-08
Decided by: project owner

## Context

The previous Learning-mode contract allowed up to three answers per question. The product direction is now a lighter practice flow with immediate feedback and one retry.

## Decision

User-facing Activity Learning mode is called **Practice** in the UI. The existing backend enum value `LEARNING` remains the wire/domain value in this phase to avoid an unnecessary enum/database migration.

For Practice:

1. No timer.
2. The ActivitySession start response returns the complete selected question set so the frontend does not fetch one question at a time.
3. The payload never contains the correct answer, accepted answer, or explanation before the runtime rules allow it.
4. Each answer is checked by the server immediately.
5. A question accepts at most two submissions total: the first answer plus one retry.
6. First wrong answer returns `INCORRECT` with one retry available; the correct answer is not revealed yet.
7. A correct retry sets `final_correct = true`.
8. If the retry is also wrong, the server returns the correct answer and explanation and resolves the question.
9. `TRUE_FALSE` follows the same generic retry rule. If the second submission matches the stored boolean answer, it is correct.
10. Hint is available only in Practice. Requesting it marks `hint_used`; the XP deduction amount is deferred to Phase 9.
11. Try Hard has no hint and no retry. Its timer is per question.
12. A completed Practice result is a learning/practice result, not an official grade.
13. Student-facing Practice score uses final correctness. First-try correctness is retained separately for learning analytics.
14. Detailed answer history is not persisted for Activity. The frontend owns the current session's selected responses for immediate review.

## Server authority

The frontend receives question content in bulk for the current session, but the server remains authoritative for:

- whether the question belongs to the session
- correctness
- retry availability
- hint availability and usage
- score aggregates
- Try Hard deadlines and lives

## Consequences

The old three-answer Learning rule is superseded for Activity by this decision. Assignment retry/answer behavior is unaffected and remains in Phase 7B.