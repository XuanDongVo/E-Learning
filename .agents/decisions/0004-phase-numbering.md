# 0004 — Phase numbering
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

`plans/PHASES.md` defined Phase 6 as "Attempts and Answers". The work merged as "Phase 6" (PR #7,
`plans/E-LEARNING_PHASE_6_STUDENT_MANAGEMENT.md`) is Student Management, which `PHASES.md` did not list. Two things carried the label "Phase 6".

## Decision

Insert **Phase 6 — Student Management** (done) and shift the later phases by one:

| Old number | New number | Phase |
|---|---|---|
| 6 | 7 | Attempts and Answers |
| 7 | 8 | Analytics |
| 8 | 9 | XP and Ranking |
| 9 | 10 | Teacher Dashboard |
| 10 | 11 | Reports and Final Polish |

Phases 0–5 keep their numbers.

## Consequences

- `PHASES.md`, `business-rules.md` and `PROGRESS.md` use the new numbers.
- The long specs (`PHASE_4_ACTIVITIES_SPEC.md`, `PHASE_5_ASSIGNMENTS_SPEC_EN.md`) and ADR 0001 keep their original text. They carry a note
  that Phase numbers 6 and above refer to the **old** numbering and map through the table above.
