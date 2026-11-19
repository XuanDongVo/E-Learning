# 0010 — Assignment recipients are class snapshots
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

The original Phase 5 model stored polymorphic `AssignmentTarget` rows for either a class or a whole Grade. That model made the recipient set implicit for Grade assignments and could change the meaning of an old Assignment when classes were added later.

## Decision

An Assignment has exactly one Grade and an explicit, non-empty list of class IDs stored as a JSONB snapshot. Selecting a Grade in the frontend is a convenience that initially selects all matching classes for the selected academic year; it is not a persisted Grade target. Teachers may remove classes before saving.

The backend validates every class before create or update. A single invalid, missing, duplicate, cross-Grade, cross-year, or out-of-scope class rejects the whole request. New classes do not receive existing Assignments automatically.

## Consequences

- `AssignmentTarget` and `AssignmentTargetType` are removed from runtime code.
- Giving work to a single student is not supported; reopening this needs a new ADR.
