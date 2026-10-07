# 0010 — Assignment targets are CLASS or GRADE
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

`PHASES.md` and `domain-model.md` listed `CLASS`, `STUDENT`, `GRADE`, `ALL`. Phase 5 spec v2 and the code (`AssignmentTargetType`) only have `CLASS` and `GRADE`.

## Decision

An Assignment is given to **one or more classes**, or to **a whole grade**, never mixed. No per-student and no "all students" target.

## Consequences

- `PHASES.md` and `domain-model.md` corrected. Phase 5 spec §5.4 and the code already match.
- Giving work to a single student is not supported; reopening this needs a new ADR.
