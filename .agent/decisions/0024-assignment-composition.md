# 0024 — Assignment Composition is an ordered product document

**Status: Accepted; scoring/display details refined by ADR 0026**  
**Date:** 2026-10-12  
**Decided by:** project owner

## Decision
1. Assignment Composition is first-class: Assignment -> ordered Sections -> ordered Items. Items are Question or ContentBlock. V1 blocks: INSTRUCTIONS, PASSAGE, MEDIA image, POOL. Supported blocks may own ordered member questions; nested blocks are deferred.
2. The Assignment Builder demo is the product prototype. Current localStorage/seed persistence is prototype-only, not production API/storage.
3. Ordering belongs to Composition sections/items/members, not AssignmentQuestion. ADR 0018 is superseded for the product-level no-reorder/order-by-ID policy. AssignmentQuestion remains position-free. The Builder, Student Preview, published Assignment and AssessmentAttempt must use stored Composition positions; question_id ASC is only the deterministic legacy backfill order.
4. Question semantics use canonical QuestionSpec. Assignment-specific possible points, required and isExample belong to Composition and do not mutate Question Bank content.
5. MATCHING and CLOZE are compound QuestionSpec types. Map TEXT_INPUT -> TYPE_ANSWER; multi-text/passage blanks -> CLOZE; pool/matching rows -> MATCHING; TRUE_FALSE has its own discriminant.
6. Backfill existing Assignments into one default section in question_id ASC order, defaulting each question to 1 point, required and not-example unless explicit values exist.
7. AssessmentAttempt snapshots ordered Composition, QuestionSpecs and scoring configuration. Never recompute a historical attempt from live source rows.
8. ADR 0026 defines the scoring contract: each scored question defaults to one point; teachers may customize points per Assignment item; compound part points default to equal split with teacher override that preserves the aggregate total; server automatically grades and calculates percentage.
9. `show_score_after_submit` defaults TRUE and controls immediate score visibility; `show_answers_after_submit` independently controls answer/explanation visibility.
10. Phase 7B must implement readiness, hard lock after first attempt, attempt lifecycle/timeout, automatic scoring, analytics and tests. Assignment editing after an attempt requires cloning; Activity updates are handled by ADR 0025.

## Composition model
See .agent/architecture/assignment-composition-v1.md. AssignmentQuestion remains position-free.

## Migration constraints
The audited baseline was V30. This ADR adds no migration. Never edit V1–V30. Re-audit the current max before selecting migration numbers; add a new migration for ordered Composition/points and `show_score_after_submit` as needed.
