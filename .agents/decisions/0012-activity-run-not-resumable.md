# 0012 — An unfinished Activity run is not saved or resumed
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

An Activity run draws a random subset of questions from large banks (`SelectionStrategy`). Resuming would force the server to keep a
half-finished random selection for every student and Activity.

## Decision

If a student leaves an Activity run before finishing, the run is **not resumable**. Opening the Activity again starts a **new run** with a new random selection.
This does **not** apply to Assignments, which resume and keep the server clock running (ADR 0009).

## Consequences

- No "continue where you stopped" screen for Activities.
- **Amended 2026-10-07 (owner):** an abandoned run is ignored entirely: its answers do not count for weak-topic analytics, XP or results.
