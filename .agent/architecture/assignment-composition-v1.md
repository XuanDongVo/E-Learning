# Assignment Composition v1

**Status: Accepted product model; implementation deferred to Phase 7B**  
**Owner decision recorded:** 2026-10-12  
**Authority:** ADR 0024 supersedes ADR 0018 only for Assignment authoring/published composition order. AssignmentQuestion has no position column.

## Product model
The Assignment Builder demo is the product prototype. Ordered sections/items, drag/drop, grouping, passage/media/instruction/pool blocks, per-item points/required/grading/example flags, validation and Student Preview are product requirements. Current localStorage/seed persistence is prototype-only, not production API/storage.

## Separate models
QuestionSpec is the canonical union shared by Question Bank, Assignment, Activity and runtime: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING, CLOZE. FILL_IN_BLANK retains current single-answer-position/accepted-alternative semantics; CLOZE is multi-blank; MATCHING is compound. Map demo TEXT_INPUT to TYPE_ANSWER; passage/multi-text blanks to CLOZE; pool/matching rows to MATCHING; TRUE_FALSE has its own discriminant. Do not maintain a third demo-only semantic union.
Assignment Composition owns order and Assignment-specific scoring; it does not define grading semantics.

## Logical tree
```text
Assignment
└── Composition
    └── Sections (ordered)
        └── Items (ordered)
            ├── Question item -> Assignment-owned Question
            └── ContentBlock: INSTRUCTIONS | PASSAGE | MEDIA(image) | POOL
                └── ordered member question items where supported
```
Blocks cannot contain blocks in v1. Persist positions starting at one and return ordered arrays from APIs.

## Section/item contract
Section: stable ID, Assignment ID, position, bilingual title/instructions.
Item: stable ID, parent/container, position, kind and kind-specific data.
Question item: Assignment-owned Question reference, points, required, isExample and optional group/member relationship. These are not shared Question Bank attributes. Points are decimal; scored items > 0, examples = 0.
CLOZE/MATCHING part points live in compound spec or ordered child scoring config. Aggregate maximum is the sum of parts; never double-count aggregate and child points.
Blocks: INSTRUCTIONS text; PASSAGE title/template with stable blank placeholders; MEDIA validated image asset ref, meaningful alt text and optional caption; POOL ordered stable answer entries. Audio deferred.

## Ordering / ADR 0018
AssignmentQuestion remains position-free. ADR 0024 supersedes the old product-level no-reorder policy. Composition sections/items/members use persisted position. question_id ASC is deterministic legacy backfill/compatibility fallback only. AssessmentAttempt snapshots exact Composition order and never recomputes it from IDs.

## Logical persistence target
assignment_sections: ID, assignment ID, position, bilingual title/instructions.
assignment_items: ID, Assignment ID, section/container ID, position, item kind, optional Assignment question ID, scoring flags and validated block payload.
assignment_questions remains an ownership association without position. QuestionSpec/type children stay separate.
Prefer relational ordered-item tables; typed block payload may use versioned JSONB validated by block-type schema. This is a logical model, not a migration; re-audit current Flyway max before choosing numbers.

## Legacy backfill
Create one default section per existing Assignment without Composition; add questions in question_id ASC order; default points=1.0, required=true, isExample=false unless explicit values exist; preserve metadata, target, schedule and show_answers_after_submit; mark schema version 1 and provenance LEGACY_GENERATED. Never fabricate historical blocks.

## Weighted scoring

The teacher enters aggregate possible points for a CLOZE/MATCHING item. Split the total equally over independently scored parts by default; the teacher may change each part allocation. Enforce that the sum of part allocations equals the aggregate item total, and snapshot the final allocation for an attempt. The allocator does not grade answers.
earnedPoints = possiblePoints × scoreFraction.
totalPossiblePoints = sum possible points for scored non-example parts.
totalEarnedPoints = sum earned points for finalized graded parts.
percentageScore = totalEarnedPoints / totalPossiblePoints × 100.
Keep raw points and percentage; round only for display. All Assignment submissions are teacher-reviewed in v1; submitted attempts keep score PENDING_REVIEW until required review is finalized. There is no AUTO/MANUAL mode selector in v1. Readiness rejects zero possible points.

## Snapshot and analytics
AssessmentAttempt start snapshots composition schema version, ordered sections/items/members, QuestionSpecs/answer keys, normalization/grading contract, asset refs, item points/flags and settings affecting timing/access/review. Historical attempts never recompute from mutable live data.
Persist raw submitted answer for review. Capture optional normalized submitted value at answer intake with a type-aware normalizer (not a correctness grader). Persist teacher-reviewed per-part status/earned/possible points, stable part key and normalizer/snapshot provenance. Report correct/partial/incorrect/unanswered and normalized wrong-answer distribution. Unanswered is separate from incorrect submissions. Exclude examples and unreviewed parts from finalized outcome rates; report pending review separately.

## UI and acceptance
Preserve demo interactions. Production uses API persistence, not localStorage/seed. Acceptance: save/reload preserves order; Student Preview matches real attempt; points do not mutate reusable source questions; compound grouping/part scoring survives snapshots; legacy backfill is deterministic; student leakage rules hold; analytics uses persisted real attempts.
