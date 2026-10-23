# E-Learning — Phase 5: Assignments
Status: ACTIVE CANONICAL SPEC — Composition/scoring amended by ADR 0024/0026
Last revised: 2026-10-12

Assignment is formal teacher-assigned work with target, schedule, one attempt and an official automatically calculated score. It is independent from Activity and owns its question copies.

## Assignment
Fields include grade_id, academic_year, class_ids, name, description, status, start_at, due_at, time_limit_seconds, show_score_after_submit and show_answers_after_submit. `class_ids` is a server-validated JSONB snapshot of one or more concrete class recipients; selecting a whole Grade is a frontend convenience and is not persisted as a target.
- time_limit_seconds is the whole-attempt timer.
- show_score_after_submit defaults TRUE and controls whether the automatically calculated score is displayed immediately after submission.
- show_answers_after_submit defaults TRUE and independently controls correct-answer/explanation visibility.
- Targets are CLASS or GRADE, never mixed. Late submissions are accepted and labeled Late without penalty. Completion = submitted.

## Composition
The Assignment Builder demo is the product prototype. Canonical model: .agent/architecture/assignment-composition-v1.md.
- Assignment -> ordered Sections -> ordered Items/ContentBlocks.
- Section/item/member order is persisted in Composition and authoritative for Builder, Student Preview, published Assignment and AssessmentAttempt.
- AssignmentQuestion remains position-free. question_id ASC is only the deterministic legacy backfill/compatibility order.
- Question items reference Assignment-owned Question copies and carry possiblePoints, required and isExample.
- Each scored question defaults to 1 point; teachers may customize per Assignment item.
- V1 blocks: INSTRUCTIONS, PASSAGE, image MEDIA and POOL. Audio/nested blocks deferred.
- Passage/CLOZE and pool/MATCHING retain stable grouping and ordered child parts.

## Automatic scoring and scoring model (ADR 0026)
- Assignment answers are automatically graded by server-side Question Engine handlers against the immutable AssessmentAttempt snapshot. No manual grading workflow or AUTO/MANUAL selector exists in v1.
- earnedPoints = possiblePoints × scoreFraction.
- For CLOZE/MATCHING, aggregate possible points default to an equal split across independently scored parts; the teacher may customize part allocations, but their sum must equal the aggregate question points.
- percentageScore = totalEarnedPoints / totalPossibleScoredPoints × 100. Preserve raw points and percentage; round only for display.
- Examples have zero points and are excluded from score denominator and most-missed statistics.
- Publish readiness requires valid metadata, complete Questions, target/schedule, valid timer, valid Composition and total possible scored points > 0.

## Review and analytics
- show_score_after_submit and show_answers_after_submit are independent. The server calculates/persists score regardless of whether it is shown.
- In-progress student payloads never expose correctness/answer keys, normalized submitted values or hidden explanations.
- Teacher reports per-student status/score, class average, most-missed question/part and normalized submitted-answer distributions; unanswered is separate. Export CSV/Excel remains required.
- Analytics use persisted AssessmentAttempt results, exclude examples, and respect ownership/target scope.

## Locking and cloning
After the first AssessmentAttempt starts, reject all authoring changes to the Assignment, including composition/order, question membership/content, points, target/schedule and score/answer display settings. To change the test, clone it into a new Assignment with independent Questions and Composition. Operational archive/close-to-new-starts may remain possible without mutating historical attempts.

## Legacy backfill
Backfill existing Assignments into one default section with items in question_id ascending order; default possiblePoints=1, required=true and isExample=false unless explicit values exist. Set show_score_after_submit=true unless explicit data dictates otherwise. Do not invent historical sections or blocks.

## Deferred
Excel import is deferred until its contract is finalized.
