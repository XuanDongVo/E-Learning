# 0003 — Phase 5 assignment contract

**Ordering amendment:** ADR 0024 supersedes this document's legacy product-ordering rules. AssignmentQuestion remains position-free; canonical product order is Composition section/item/member position.
Status: Accepted
Date: 2026-10-04

## Context
Phase 5 introduces formal Assignments independent from Activities. The Assignment owns its assessment questions.

## Decision
- Assignment stores grade_id, academic_year and a class_ids JSONB recipient snapshot.
- class_ids is validated server-side: non-empty, unique, teacher-scoped, and every class belongs to the selected Grade and academic year.
- Grade selection in the UI is a convenience; it is not itself a persisted recipient target.
- Students may start after due_at; submission is labeled Late without a score penalty.
- Assignment uses time_limit_minutes for the whole Attempt, independently from due_at. This unit was clarified by ADR 0028; Activity continues to use time_limit_seconds per question.
- Assignment questions are owned by the Assignment and do not reference Activity or QuestionBank.
- AssignmentQuestion contains assignment_id and question_id only. It has no position, topic_id or manual order field.
- There is no Assignment question reorder API or UI.
- Legacy flat AssignmentQuestion listings and Composition backfill use question_id ASC for deterministic compatibility. The Assignment Builder, Student Preview and AssessmentAttempt use persisted Composition section/item/member position.
- Assignment question creation accepts a list so the same endpoint supports one-question and bulk creation.
- Shared Question persistence is extracted into QuestionPersistenceService.
- Excel import is deferred until its contract is finalized.
- Assignment question editing/deletion is blocked for archived assignments. Additional Attempt-time structural locking remains a Phase 7 rule and is not implemented in the current runtime slice.

## Consequences
The Assignment Builder renders questions according to ordered Composition returned by the server. The frontend must not infer order from IDs or add position to AssignmentQuestion; persisted positions belong to Composition items/sections/members. The same canonical QuestionSpec semantics are reused for content and Assignment-owned questions.
