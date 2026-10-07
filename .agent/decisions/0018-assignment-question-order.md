# 0018 — AssignmentQuestion has no position; order is deterministic
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

The product does not need teacher-controlled question reordering in Assignments.

## Decision

- AssignmentQuestion has no position field.
- No reorder endpoint, drag-and-drop UI, Move Up/Move Down action or persisted manual order exists.
- Whenever AssignmentQuestions are listed or snapshotted, the server uses ORDER BY question_id ASC.
- AttemptQuestion.position may still exist because it records runtime snapshot order; it is not an AssignmentQuestion position and must not be exposed as Assignment authoring order.

## Consequences

Assignment numbering is stable without adding an artificial ordering column. The deterministic order is defined by the query/service contract, not by database row insertion order.
