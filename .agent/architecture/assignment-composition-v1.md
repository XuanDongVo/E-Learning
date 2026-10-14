# Assignment Composition v1

**Status: Accepted product model; implementation in progress on `feature/phase-7-assigment`**  
**Authority:** ADR 0024 defines product Composition. ADR 0026 defines automatic Assignment scoring. AssignmentQuestion remains position-free.

## 1. Product model
The Assignment Builder at `/teacher/assignments/demo` is the canonical authoring UI. Ordered sections/items, drag/drop, grouping, passage/instruction/image/pool blocks, per-item points/required/example flags, validation and Student Preview are product requirements. The frontend has been wired to backend Assignment/Question/Composition APIs and the localStorage repository removed; build and end-to-end verification are still outstanding.

## 2. Separate semantic and composition models
QuestionSpec is the canonical union shared by Question Bank, Assignment, Activity and runtime: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING, CLOZE. FILL_IN_BLANK retains current single-answer-position/accepted-alternative semantics; CLOZE is multi-blank; MATCHING is compound. Map demo TEXT_INPUT to TYPE_ANSWER; passage/multi-text blanks to CLOZE; pool/matching rows to MATCHING; TRUE_FALSE has its own discriminant. Do not maintain a third demo-only semantic union.

Assignment Composition owns section/item/member ordering and Assignment-specific points/required/example settings. It does not define QuestionSpec grading semantics.

## 3. Logical tree
```text
Assignment
└── Composition
    └── Sections (ordered by position)
        └── Items (ordered by position)
            ├── Question item -> Assignment-owned Question
            └── ContentBlock: INSTRUCTIONS | PASSAGE | MEDIA(image) | POOL
                └── ordered member question items where supported
```
Blocks cannot contain other blocks in v1. Persist positions starting at one. APIs return ordered arrays in canonical section/item/member order.

## 4. Section and item contracts
Section: stable ID, Assignment ID, position, bilingual title/instructions.
Item: stable ID, parent/container ID, position, kind and kind-specific data.
Question item: Assignment-owned Question reference, `possiblePoints`, `required`, `isExample`, and optional group/member relationship. These fields are Assignment-specific and do not mutate Question Bank content.
- Each scored question defaults to **1 point**. Teachers may customize possible points per Assignment item.
- Example/instruction-only items have zero points and are excluded from score denominator and most-missed statistics.
- CLOZE/MATCHING part points default to an equal split of the aggregate question points. Teachers may customize each part; the sum of the part points must exactly equal the aggregate question points. No double-counting aggregate and part totals.
Content blocks:
- INSTRUCTIONS: instruction text.
- PASSAGE: title and text/template with stable blank placeholders for CLOZE.
- MEDIA: validated image asset reference, meaningful alt text and optional caption. Image in v1; audio deferred.
- POOL: ordered stable answer entries used by MATCHING.

## 5. Authoritative ordering and ADR 0018
AssignmentQuestion remains an ownership association without a position column. ADR 0024 supersedes ADR 0018's product-level no-reorder/order-by-ID rule.
- Canonical Assignment order is Composition's persisted section/item/member `position`, not `question_id`, insertion order or database default order.
- `question_id ASC` is only the deterministic legacy backfill order for Assignments that do not yet have Composition.
- The Builder, API composition projection, Student Preview, published Assignment and AssessmentAttempt must all use the same Composition order.
- AssessmentAttempt snapshots exact Composition positions/order and never recomputes them from live Composition or Question IDs.
- Legacy flat AssignmentQuestion endpoints, if retained, must be explicitly labelled as compatibility APIs; they cannot be the source of order for the Builder or student runtime.

## 6. Logical persistence target
- `assignment_sections`: ID, Assignment ID, position, bilingual title/instructions.
- `assignment_items`: ID, Assignment ID, section/container ID, position, item kind, optional Assignment question ID, Assignment-specific points/required/example fields and validated block payload.
- `assignment_questions` remains the ownership association; no position column.
- QuestionSpec/type-specific persistence remains separate from Composition.
Prefer relational ordered-item tables for constraints and stable IDs. Typed block payload may use versioned JSONB validated by block type. This is a logical model, not a migration; re-audit actual Flyway max before assigning version numbers.

## 7. Deterministic legacy backfill
For each existing Assignment without Composition:
1. Create one default section.
2. Add owned questions ordered by `question_id ASC`.
3. Create one question item per question.
4. Default `possiblePoints=1`, `required=true`, `isExample=false` unless an explicit existing value is found.
5. Preserve Assignment metadata, target, schedule, timer, `show_answers_after_submit`, and other existing settings.
6. Set new `show_score_after_submit=true` unless explicit existing data dictates otherwise.
7. Mark Composition schema version 1 and provenance `LEGACY_GENERATED`.
Never fabricate historical sections, passages, media, pools or grouping.

## 8. Automatic scoring and display settings (ADR 0026)
- Assignment answers are graded automatically by server-side Question Engine handlers against the immutable attempt snapshot. There is no manual-grading workflow or AUTO/MANUAL selector in v1.
- Every scored question has possible points, default 1 point; teachers can customize points per Assignment item.
- `earnedPoints = possiblePoints × scoreFraction`.
- `totalPossibleScoredPoints = sum(possiblePoints for scored non-example items/parts)`.
- `totalEarnedPoints = sum(earnedPoints for scored non-example items/parts)`.
- `percentageScore = totalEarnedPoints / totalPossibleScoredPoints × 100`.
Preserve raw earned/possible points and percentage; round only for display. Readiness rejects zero possible scored points.
- `show_score_after_submit` is a boolean (default TRUE) controlling whether the student sees the calculated score immediately after submission. The server calculates and persists the score regardless.
- `show_answers_after_submit` is independent and controls correct-answer/explanation visibility. Hiding the score does not hide or enable answers; the two settings must be enforced independently.
- In-progress student DTOs never expose answer keys, correctness flags, normalized answers or hidden explanations.

## 9. Compound question part points
For CLOZE/MATCHING, split aggregate points evenly among independently scored parts by default. Let the teacher customize individual part values; validate sum(part possible points) equals aggregate item possible points exactly. Persist part allocation in Composition and freeze it in AssessmentAttempt. Part allocation is not grading.

## 10. Snapshot and analytics
At AssessmentAttempt start, snapshot Composition schema version, ordered sections/items/members, QuestionSpecs/answer keys, normalization/grading contract, asset refs, per-item/part possible points, required/example flags, and settings affecting timing/access/score/answer visibility. Historical attempts never recompute from mutable live data.
Persist raw submitted answers required for permitted review, normalized submitted values (optional where normalization is not meaningful), per-part status/earned/possible points, stable part keys and grading/normalizer/snapshot version. Report correct/partial/incorrect/unanswered outcomes and normalized submitted-answer distributions. Unanswered is separate from incorrect submitted answers. Exclude examples from scored denominator/most-missed stats.

## 11. Product acceptance
1. Saving/reloading preserves exact section/item/member order.
2. Student Preview and actual student attempt render the same order/grouping.
3. Changing points in one Assignment does not mutate a source Question Bank Question or another Assignment's copy.
4. CLOZE/MATCHING grouping and part points survive snapshots.
5. Legacy backfill is deterministic.
6. Score visibility and answer visibility settings are independent.
7. Analytics use persisted real attempts and per-part results.
8. No student payload leaks answer/normalized data before the permitted reveal point.


## 9. Implementation status (2026-10-14)
- V33 creates ordered section/item tables and backfills existing Assignments deterministically. V34 persists `show_points_per_question` separately from `show_score_after_submit`.
- GET/PUT `/v1/assignments/{id}/composition` are implemented with server validation. Legacy AssignmentQuestion create adds default root items for compatibility; Composition remains the canonical order.
- `/teacher/assignments` create/list flows open `/teacher/assignments/demo?id={id}`. Legacy `/teacher/assignments/[id]` and `/teacher/assignments/[id]/questions/create` redirect to the canonical Builder.
- The current Builder supports persistence adapters for SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK and TYPE_ANSWER. MATCHING/CLOZE authoring remains blocked because the current question write DTO/factory does not carry type-specific fields; those creation tools are hidden. Do not silently map these types to another semantic type.
- MEDIA blocks upload an image and persist its media asset ID, alt text, optional caption and preview URL. Image/audio parity beyond images is not part of v1.
- Verification gates still open: run Flyway validation against both fresh and existing databases, frontend typecheck/lint/build, backend tests, and browser end-to-end tests for create/edit/reorder/group/delete/reload and failed-save recovery. No test/build success is claimed.
