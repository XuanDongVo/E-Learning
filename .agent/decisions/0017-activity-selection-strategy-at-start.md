# 0017 — Activity selection strategy is chosen at run start
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

An Activity may expose more than one question-selection strategy.

## Decision

- If an Activity has exactly one configured selection strategy, the server may select it automatically.
- If an Activity has multiple configured strategies, the student must choose one when starting the run.
- The chosen concrete strategy is stored on Attempt.selection_strategy.
- A strategy not configured for the Activity must be rejected.
- WEAKNESS_PRIORITY may temporarily behave like RANDOM until Phase 8 provides weakness data, but the selected strategy value is still preserved on the Attempt.

## Consequences

The Activity definition stores available strategies; it does not store a per-student choice. Selection choice is runtime state and belongs to the Attempt snapshot.
