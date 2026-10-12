# E-Learning — Phase 5: Assignments
Status: ACTIVE CANONICAL SPEC — Composition amended by ADR 0024/0025
Last revised: 2026-10-12

Assignment is formal teacher-assigned work with target, schedule, one attempt and official score. It is independent from Activity and never references QuestionBank at runtime.

## Assignment
Fields include grade_level, academic_year, name, description, status, start_at, due_at, time_limit_seconds and show_answers_after_submit. Timer applies to whole AssessmentAttempt. show_answers_after_submit defaults TRUE. Targets are CLASS or GRADE, never mixed. Late submissions accepted and labeled Late without penalty. Completion = submitted.

## Composition
The Assignment Builder demo is the product prototype. Canonical model: .agent/architecture/assignment-composition-v1.md.
- Assignment -> ordered Sections -> ordered Items/ContentBlocks.
- Section/item/member order is persisted in Composition.
- Question items reference Assignment-owned Question copies and carry points, required and isExample.
- V1 blocks: INSTRUCTIONS, PASSAGE, image MEDIA and POOL. Audio/nested blocks deferred.
- Passage/CLOZE and pool/MATCHING retain stable grouping and ordered child parts.
- AssignmentQuestion remains position-free; do not restore a position column.
- There is no AUTO/MANUAL mode selector in Assignment v1. All submitted work receives teacher review; automatic correctness grading remains an Activity behavior.

## Scoring and readiness
- The teacher enters aggregate possible points for a CLOZE/MATCHING item. Part points default to an equal split; teacher may edit allocations, and part totals must equal aggregate item points exactly.
- Scored item/part has possible points; examples have zero and are excluded.
- Teachers award earned points during review; each part's earned points must be between zero and possible points.
- percentageScore = total teacher-awarded earned points / total possible scored points × 100; preserve raw points and percentage, round only for display.
- Official score remains PENDING_REVIEW until all required grading is complete.
- Publish requires valid metadata, complete Questions, target/schedule, valid optional timer, valid Composition and total possible scored points > 0.

## Review and analytics
TRUE show_answers_after_submit: after submit, student sees permitted score, correct answers and explanations.
FALSE: suppress correct/accepted answers and explanations. Normalized values are internal analytics data, never returned in-progress.
Teacher reports per-student status/score, class average, most-missed question/part and normalized wrong-answer distributions; unanswered and pending-review are reported separately. Export Excel/CSV remains required. Exclude examples and unreviewed parts from finalized outcome rates.

## Locking and cloning
After the first AssessmentAttempt starts, reject all authoring changes to that Assignment, including composition/order, question membership/content, points, target/schedule and review settings. To change the test, clone it into a new Assignment with independent questions and composition. Operationally archiving/closing it to new starts may remain possible, but never mutates historical attempts.

## Legacy backfill
Backfill existing Assignments to one default section with items in question_id ascending order, defaults of 1 point/required/not-example unless explicit values exist. Do not invent historical sections or blocks.

## Deferred
Excel import is deferred until its contract is finalized.
