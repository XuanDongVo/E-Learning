# 0003 — Phase 5 assignment contract

**Ordering amendment:** ADR 0024 supersedes this document's legacy product-ordering rules. AssignmentQuestion remains position-free; canonical product order is Composition section/item/member position.
Status: Accepted
Date: 2026-10-04

## Context

Phase 5 introduces formal Assignments independent from Activities. The Assignment owns its assessment questions.

## Decision

- Assignment stores grade_level and academic_year for target resolution.
- Students may start after due_at; the submission is labeled Late without a score penalty.
- time_limit_seconds is per Assignment Attempt and is independent of due_at.
- Assignment questions are owned by the Assignment and do not reference Activity or QuestionBank.
- AssignmentQuestion contains only assignment_id and question_id. It has no position, no topic_id and no manual order field.
- There is no Assignment question reorder API or UI.
- Legacy flat AssignmentQuestion listings and Composition backfill use question_id ASC for deterministic compatibility. The Assignment Builder, Student Preview and AssessmentAttempt use persisted Composition section/item/member position.
- Assignment question creation accepts a list so the same endpoint supports one-question and bulk creation.
- Shared Question persistence is extracted into QuestionPersistenceService.
- Excel import is deferred until its contract is finalized.
- Assignment question editing/deletion is blocked for archived assignments. Additional Attempt-time structural locking is a Phase 7 rule.

## Consequences

The Assignment Builder renders questions according to the ordered Composition returned by the server. The frontend must not infer order from IDs or add position to AssignmentQuestion; persisted positions belong to Composition items/sections/members. The same canonical QuestionSpec semantics are reused for content and Assignment-owned questions.
