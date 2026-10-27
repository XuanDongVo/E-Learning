# 0015 — Try Hard time limit is per question
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context
activities.time_limit_seconds is required for Try Hard and means the time allowed for each question.

## Decision
1. For Try Hard, time_limit_seconds is the time allowed for each question (for example 30 seconds per question). There is no clock for the whole run.
2. The server gives each question a deadline_at when it is served.
3. A question not answered by deadline_at (plus a 5 s network grace) is a timeout: it counts as wrong but costs no life. Only a wrong answer costs a life.
4. Activities in Learning mode keep no timer. Assignment Attempts use time_limit_minutes for the whole attempt. This ADR's original Assignment wording is superseded by ADR 0028; Activity remains unchanged.

## Consequences
- A Try Hard run ends as COMPLETED, GAME_OVER or ABANDONED.
- attempt_questions.deadline_at is added; answers can record a timeout.
- The Activity editor label is seconds per question.

See ADR 0028 for Assignment Attempt timer storage and API semantics.
