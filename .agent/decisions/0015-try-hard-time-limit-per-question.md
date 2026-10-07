# 0015 — Try Hard time limit is per question
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

`activities.time_limit_seconds` is required for Try Hard (Phase 4 §6.2) but the spec never says what it measures: the whole run or each question.

## Decision

1. For Try Hard, `time_limit_seconds` is the **time allowed for each question** (for example 30 seconds per question). There is no clock for the whole run.
2. The server gives each question a `deadline_at` when it is **served**: the first question when the run starts, the next one when the previous is resolved.
3. A question not answered by `deadline_at` (plus a 5 s network grace) is a **timeout**: it counts as a wrong answer but **costs no life** (owner, 2026-10-07). Only a wrong answer costs a life.
4. Activities in Learning mode keep no timer. **Assignments keep a whole-attempt limit** (`assignments.time_limit_seconds`, ADR 0009). The same column name therefore means different things on the two tables; the teacher screens must say "seconds per question" for Try Hard and "minutes for the whole attempt" for Assignments.

## Consequences

- A Try Hard run no longer has a `TIMED_OUT` status; it ends as `COMPLETED`, `GAME_OVER` or `ABANDONED`.
- `attempt_questions.deadline_at` is added; `answers` can record a timeout.
- The Activity editor label changes to "seconds per question".
