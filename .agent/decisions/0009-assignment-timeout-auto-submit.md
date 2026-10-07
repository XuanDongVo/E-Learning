# 0009 — Assignment time-out auto-submits
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Assignments have an optional per-attempt time limit (ADR 0003, Phase 5 §6.4). Not decided: what happens at expiry, or when the student leaves.

## Decision

- The **server clock is authoritative**: `expires_at = started_at + time_limit_seconds`. The timer keeps running if the student closes the page or loses the connection.
- At expiry the server **auto-submits the answers saved so far** and flags the attempt **Timed out**.
- A timed-out attempt **counts as Submitted** (completion = submitted, ADR 0006). It is also labelled Late if `submitted_at > due_at` (ADR 0003).

## Consequences

- Teacher tracking shows a "Timed out" flag next to Submitted / Submitted late.
- Answers must be saved as the student goes (autosave), otherwise a time-out loses work. To be specified in the Attempts spec.
