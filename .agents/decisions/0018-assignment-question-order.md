# 0018 — AssignmentQuestion has no position; order is deterministic
Status: Partially superseded by ADR 0024
Date: 2026-10-07
Decided by: project owner

## Context

The product does not need teacher-controlled question reordering in Assignments.

## Original decision (historical; partly superseded)

- AssignmentQuestion has no position field. Still accepted.
- No reorder endpoint/UI or persisted manual order exists. Superseded for product composition by ADR 0024.
- ORDER BY question_id ASC is retained only as deterministic legacy backfill/compatibility fallback; canonical Composition uses persisted section/item/member order.
- AttemptQuestion.position records runtime snapshot order; it is not an AssignmentQuestion position.

## Current authority

ADR 0024 supersedes this ADR only for the product-level no-reordering/order-by-ID policy. AssignmentQuestion remains an ownership association without a position column.

## Consequences

Assignment numbering is stable without adding an artificial ordering column. The deterministic order is defined by the query/service contract, not by database row insertion order.
