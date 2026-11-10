# 0034 — Teacher Assignment portfolio summary

**Status:** Accepted  
**Date:** 2026-11-09  
**Scope:** Teacher Assignment list dashboard

## Context

Phase 8 analyzes one Assignment at a time. The Teacher Assignment list also needs
a compact operational summary across the current teacher's published Assignments.
The existing list response contains schedule and lifecycle metadata but cannot
authoritatively derive recipient- or Attempt-based counts on the client.

ADR 0006 reserves “completed” for a submitted Assignment. AssessmentAttempt
timeout finalization nevertheless produces a terminal, automatically graded result.
The dashboard therefore uses “result available” terminology instead of redefining
Assignment completion.

## Decision

- Add a server-owned Teacher summary endpoint; the frontend never aggregates the
  Assignment list or calls per-Assignment analytics in a loop.
- `openAssignmentCount` counts `PUBLISHED` Assignments whose start is reached and
  whose due time is still in the future.
- A finalized delivery has an AssessmentAttempt status of `SUBMITTED` or
  `TIMED_OUT`.
- An overdue incomplete delivery has reached its Assignment due time and has no
  finalized Attempt (no Attempt or `IN_PROGRESS`).
- Result rate is finalized due deliveries divided by all due deliveries. It is
  null when no delivery has reached its due time.
- One delivery is one distinct `Assignment × active Student` pair across the
  Assignment's target classes. This matches current Phase 8 live-roster behavior;
  no historical student-recipient snapshot is introduced.
- Summary and Assignment list reads are scoped to target classes owned by the
  authenticated Teacher. Drafts do not contribute to the summary.

## Consequences

- The summary is a lightweight operational dashboard, not general cross-Assignment
  analytics, score trends, ranking, or report building.
- Class membership changes can change historical delivery counts until a separate
  persisted student-recipient snapshot is approved and migrated.
- No database migration is required for this slice.
