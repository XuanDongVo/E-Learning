# 0001 — Activity and Assignment are independent

Status: Accepted  
Date: 2026-10-01  
Decided by: project owner

## Context

Two documents described Assignment differently:

- The old `AGENTS.md`: `Activity → Assignment → AssignmentTarget`, "an Assignment is an Activity assigned by a
  teacher", multiple attempts, best score counts, retry after reaching a completion threshold (default 80%).
- `plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md` (revised 2026-09-30): Activity and Assignment are independent
  concepts; an Assignment has **one** allowed attempt.

## Decision

The Phase 4 spec is correct. **Activity and Assignment are independent.**

- `Activity` = a repeatable learning/practice/game experience (no deadline, no official grade).
- `Assignment` = a teacher-assigned task or formal assessment: target, schedule, **one attempt**, official score.
- Both may read the same QuestionBanks; neither references the other.
- Never add `Assignment.activity_id`, `Activity.assignment_id`, or an `ActivityAssignment` table.

## Consequences

- Rewritten: Assignment architecture (`domain/domain-model.md`), Phase 5 and Phase 6 scope (`plans/PHASES.md`),
  assignment attempt rules (`domain/business-rules.md`).
- Removed as unconfirmed for the single-attempt model: retry after threshold, "best score counts" for Assignments.
  Late-submission policy and completion threshold are **open questions** for the Phase 5 spec.
- Phase 5 needs its own spec before implementation (assessment/question-source configuration, targets, schedule).
- Phase 4 is unaffected: it never referenced Assignment.
- Activity runs remain repeatable and may contribute XP; Assignment official score and XP stay separate concepts.
