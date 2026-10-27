# 0009 — Assignment time-out auto-submits
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Assignments have an optional per-attempt time limit (ADR 0003, Phase 5 §6.4). Not decided: what happens at expiry, or when the student leaves.

## Decision

- The **server clock is authoritative**: `deadline_at = started_at + time_limit_minutes` minutes. The timer keeps running if the student closes the page or loses the connection.
- At expiry the server **auto-submits the answers saved so far** and flags the attempt **Timed out**.
- A timed-out attempt **counts as Submitted** (completion = submitted, ADR 0006). It is also labelled Late if `submitted_at > due_at` (ADR 0003).

## Consequences

- Teacher tracking shows a "Timed out" flag next to Submitted / Submitted late.
- Answers must be saved as the student goes (autosave), otherwise a time-out loses work. Autosave remains to be implemented. ADR 0028 supersedes the old seconds unit for Assignment Attempts; Activity per-question timers remain in seconds.


## Implementation status — 2026-10-27

The start/resume slice currently returns `ASSESSMENT_ATTEMPT_TIME_UP` when an existing Attempt has expired. Server-side timeout finalization and auto-submit are still pending; this ADR remains the target behavior.
