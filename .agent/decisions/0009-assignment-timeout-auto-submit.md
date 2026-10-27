# 0009 — Assignment time-out auto-submits
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context
Assignments have an optional whole-attempt time limit (ADR 0003, Phase 5 §6.4).

## Decision
- The server clock is authoritative: deadline_at = started_at + time_limit_minutes minutes. The timer continues if the student closes the page or loses the connection.
- At expiry the server auto-submits the server-confirmed answers saved so far and flags the attempt Timed out.
- A timed-out attempt counts as Submitted for completion. It is also labelled Late if submitted_at > due_at.
- The runtime start/resume slice currently returns TIME_UP after expiry; timeout finalization/auto-submit remains to be implemented.

## Consequences
- Teacher tracking shows a Timed out flag next to Submitted / Submitted late.
- Answers must be saved as the student goes; otherwise a timeout loses work. Autosave belongs to the next implementation slice.
- ADR 0028 supersedes the old time_limit_seconds unit for Assignment Attempts. Activity per-question timers remain in seconds.
