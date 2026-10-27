# ADR 0028 — Assignment Attempt duration uses minutes

**Status:** Accepted  
**Date:** 2026-10-27  
**Scope:** Phase 7B Assignment Attempt duration unit and persistence naming.

## Decision

- Assignment authoring and AssessmentAttempt snapshots use time_limit_minutes.
- started_at is server-authoritative. deadline_at is calculated as started_at + time_limit_minutes and persisted once. Resume never recalculates or resets the deadline.
- assignments.due_at remains a separate due-policy timestamp. Students may start after due_at; lateness does not impose a score penalty.
- Activity remains unchanged: activities.time_limit_seconds is the per-question Try Hard timer.
- V43 was already applied and must not be edited. V45 renames the Attempt column and converts stored seconds to minutes.
- This decision changes only the Assignment Attempt storage/contract unit; it does not introduce per-question timing or change whole-attempt timer semantics.

## Consequences

- Java entity and runtime DTO use timeLimitMinutes; JSONB settings use time_limit_minutes.
- Existing deadline_at values are preserved by the migration.
- Applied Flyway migrations stay immutable.
