# 0003 — Phase 5 assignment contract
Status: Accepted
Date: 2026-10-04

## Context

Phase 5 introduces formal Assignments that are independent from Activities. The current milestone focuses on
Assignment configuration and teacher-owned question authoring through the real API. Excel import is intentionally
deferred.

## Decision

- An Assignment stores `grade_level` and `academic_year` for target resolution.
- Students may start after `due_at`; the submission is labeled `Late` without a score penalty.
- `time_limit_seconds` is per Attempt and independent of `due_at`.
- Assignment questions are owned by the Assignment and do not reference Activity or QuestionBank.
- `AssignmentQuestion` currently contains only `assignment_id` and `question_id`. Optional `topic_id` and
  manual `position` are deferred until there is a concrete product requirement.
- There is no Assignment question reorder API in this milestone.
- Assignment question creation accepts a list so the same endpoint supports one question and bulk creation.
- Shared question persistence is extracted into `QuestionPersistenceService`; Content and Assignment own only
  their domain-specific ownership and validation.
- Excel import is not implemented in this milestone. Do not add an import UI, parser, template endpoint or POI
  dependency until the Excel contract is finalized.
- Assignment question editing/deletion is blocked for archived assignments. Attempt-based locking remains a future
  rule when the Attempt model exists.

## Consequences

The Assignment detail page uses manual question authoring backed by the AssignmentQuestion API. Question count is
derived from AssignmentQuestion ownership. The shared Question Core remains the single implementation for options,
answers, media, normalization and completeness calculation.


## Subsequent amendments

The question-source portion of this decision was superseded by later accepted decisions recorded in ADR 0003 itself and subsequent ADRs where applicable. The current active contract is the combination of all later accepted ADRs, the active phase specification, and the current domain model. In particular, current Assignment answer visibility is defined by ADR 0011.
