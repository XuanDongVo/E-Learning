# 0011 — Student sees score and correct answers right after submitting
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Phase 5 spec (O4, §3.4, §10) hid correct answers and explanations until the teacher pressed **Release answers**
(`PATCH /v1/assignments/{id}/release-answers`, column `assignments.answers_released_at`).

## Decision

After a student **submits** an Assignment attempt (including auto-submit on time-out, ADR 0009) they see their **score and the correct answers with explanations immediately**.
There is no teacher "Release answers" step.

## Consequences

- Remove "Release answers" from Phase 5 scope; do not build the endpoint or the `ANSWERS_NOT_RELEASED` error. The column `answers_released_at` is unused and may be dropped by a later migration.
- **Known risk (accepted by the owner):** an Assignment is open for days, so a student who finished early can pass the answers to classmates who have not started. The teacher's tracking (score, most-missed questions) will not detect this.
- Reviewing is allowed only for the student's own submitted attempt; the teacher sees every student's review.
