# 0024 — Assignment Composition is an ordered product document

**Status: Accepted**  
**Date:** 2026-10-12  
**Decided by:** project owner

## Context
The Assignment Builder demo is the product prototype, not a disposable UI experiment. It contains ordered Sections/Items, drag-and-drop, grouped questions, passage/media/instruction/pool blocks, per-question points/required/grading/example settings, validation and Student Preview. ADR 0018's no-reordering/question_id order conflicts with this model.

## Decision
1. Assignment Composition is first-class: Assignment -> ordered Sections -> ordered Items. Items are Question or ContentBlock. V1 blocks: INSTRUCTIONS, PASSAGE, MEDIA image, POOL. Supported blocks may own ordered member questions; nested blocks are deferred.
2. Demo is the product prototype, but localStorage/seed persistence is not production API/storage.
3. Ordering belongs to Composition sections/items/members, not AssignmentQuestion. ADR 0018 is superseded only for product-level no-reorder/order-by-ID. AssignmentQuestion remains position-free.
4. Question semantics use canonical QuestionSpec; Assignment points, required and isExample belong to Composition and do not mutate shared Question Bank content. Formal Assignment grading is teacher-reviewed only in v1 under ADR 0025; there is no AUTO/MANUAL mode selector.
5. MATCHING and CLOZE are compound QuestionSpec types. Map TEXT_INPUT -> TYPE_ANSWER; multi-text/passage blanks -> CLOZE; pool/matching rows -> MATCHING; TRUE_FALSE has its own discriminant.
6. Backfill existing Assignments into one default section in question_id ASC order, defaulting to 1 point, required and not-example unless explicit values exist.
7. AssessmentAttempt snapshots ordered Composition, QuestionSpecs and scoring configuration. Never recompute a historical attempt from live source rows.
8. Weighted scoring: part earned = possible × score fraction; percentage = total earned / total possible × 100. Examples are zero-point and excluded.
9. Teacher grading is mandatory for all Assignment submissions in v1. Submitted attempts stay pending review until the teacher finalizes part/item points. Readiness rejects zero possible points.
10. Assignment analytics persist per-part outcomes and normalized submitted values for correct/partial/incorrect/unanswered and wrong-answer distributions. Student exposure follows review policy.
11. Phase 7B must implement readiness, hard lock after the first attempt, attempt lifecycle/timeout, teacher review, weighted score, analytics and tests. Compound-part points default to equal split with teacher override preserving the item total (ADR 0025).

See .agent/architecture/assignment-composition-v1.md for the canonical model. ADR 0018 remains valid that AssignmentQuestion has no position; its product ordering rule is superseded here.

## Migration constraints
Audited baseline was V30. This ADR adds no migration. Never edit V1–V30. Re-audit current max version before selecting migration numbers and implement incremental forward-only changes with deterministic backfills.
