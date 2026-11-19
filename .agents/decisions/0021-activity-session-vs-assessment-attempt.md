# 0021 — Separate ActivitySession from AssessmentAttempt
Status: Accepted
Date: 2026-10-08
Decided by: project owner

## Context

Activity practice and formal Assignments have different runtime semantics.

- Activity is repeatable practice. It has no official grade and may create a new random run every time.
- Assignment is formal work with a target, schedule, one attempt and an official score.
- A single polymorphic Attempt model would mix two different lifecycles, persistence requirements and review semantics.

## Decision

Use two separate runtime concepts:

- `ActivitySession`: one runtime practice session for an Activity.
- `AssessmentAttempt`: one official attempt for an Assignment/assessment.

Do not create a shared polymorphic `Attempt` table with nullable `activity_id` / `assignment_id`.

### ActivitySession

An ActivitySession stores the runtime configuration and aggregate result of one Activity run:

- student
- activity
- concrete mode
- concrete selection strategy
- lifecycle status
- timestamps
- question count
- first-correct count
- final-correct count
- hint usage count
- practice result score

An ActivitySession may have `activity_session_questions` to freeze the selected question set and runtime state, but it does not persist the student's response payload/history.

### AssessmentAttempt

AssessmentAttempt is deferred to the separate Phase 7B scope. It owns immutable question snapshots and persisted answers because official assessment history and review require them.

## Consequences

- Activity and Assignment runtime APIs are separate.
- Activity code never needs `assignment_id`, and Assignment code never needs `activity_id`.
- Analytics/XP can consume completed ActivitySession aggregates without treating practice as an official grade.
- Historical `Attempt` references in lower-level documents must be replaced by the appropriate runtime concept.