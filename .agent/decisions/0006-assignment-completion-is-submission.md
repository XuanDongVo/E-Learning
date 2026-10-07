# 0006 — Assignment completion means submitted
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Assignments have one attempt (ADR 0001). The old 80% completion threshold belonged to the multi-attempt model and was left as an open
question in `domain/business-rules.md`.

## Decision

A student has **completed** an Assignment when the attempt is **submitted**. There is no score threshold.
The score is shown separately. Submitting after `due_at` is still completion, labelled **Late** (ADR 0003).

## Consequences

- Teacher tracking statuses: Not started, In progress, Submitted, Submitted late. "Overdue" (past due, not submitted) is derived.
- No threshold setting on Assignment. Reopening this needs a new ADR.
