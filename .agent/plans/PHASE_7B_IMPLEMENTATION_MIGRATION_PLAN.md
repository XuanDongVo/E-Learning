# Phase 7B — Implementation and Migration Plan

**Status:** Accepted execution plan; no code/migrations implemented by this document.  
**Branch:** feature/phase-7-assigment  
**Baseline observed during 2026-10-12 audit:** V30. Re-check immediately before writing migrations.

## 1. Product contracts

Read first:
- ADR 0021/0022 — ActivitySession and Practice rules.
- ADR 0023 — Question Engine and D1–D8, as amended by ADR 0025.
- ADR 0024 — Assignment Composition.
- ADR 0025 — Assignment teacher grading, post-attempt lock and Activity edit/version behavior.
- `.agent/architecture/question-engine-v1.md`
- `.agent/architecture/assignment-composition-v1.md`
- `.agent/plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md`

Do not implement against stale statements that ADR 0023 is Proposed. Its target architecture is Accepted; its implementation is still outstanding.

## 2. Non-negotiable rules

- No polymorphic Attempt table. ActivitySession and AssessmentAttempt are separate aggregates.
- Do not modify or delete Flyway V1–V30. Re-list migrations and verify the current maximum immediately before adding a migration; choose the actual next unused version.
- Assignment Composition is ordered; AssignmentQuestion remains position-free. Legacy Assignment order backfills as question_id ASC.
- QuestionSpec is the one canonical type union. Composition is a separate model.
- Activity uses automatic correctness feedback under its Practice/Try Hard rules. Formal Assignment submissions are also automatically graded by Question Engine in v1. No manual grading UI/API or AUTO/MANUAL selector is allowed.
- After any AssessmentAttempt starts, freeze the entire Assignment for authoring. Any change requires a clone/new Assignment. Archiving/closing future starts may remain possible without changing past snapshots.
- Activity updates are allowed. Existing ActivitySessions keep their immutable started snapshot; sessions started after an update use the latest saved Activity/configuration/question content.
- Compound CLOZE/MATCHING aggregate points default to equal split across independently scored parts; teachers may edit allocations, but the parts must sum to the item's total.
- Teacher, Student and analytics response DTOs are separate. Never expose normalized values, correctness or answer keys to an in-progress student.

## 3. Implementation gates and sequence

### Gate 0 — verify environment and current baseline
1. Inspect branch HEAD and working tree; do not overwrite unrelated changes.
2. Verify current max migration version and schema, Assignment status transitions, all AssignmentQuestion editing endpoints, media contract and current demo types/persistence.
3. Run existing server/frontend validation in a configured environment and record commands/results. Prior audit could not prove a clean full test/build.
4. Do not begin Scope B unless Scope A ActivitySession gate is explicitly recorded as passing. If the Owner later asks to proceed despite a failing environment check, record that as a blocker/exception rather than claiming pass.

### Slice 1 — Question Engine characterization and domain contracts
1. Add backend characterization tests for the five existing types and their current Activity grading/normalization semantics.
2. Define immutable QuestionSpec records, RawAnswer, ValidatedAnswer, NormalizedAnswerValue, GradeResult and distinct four-value PartStatus (CORRECT, PARTIALLY_CORRECT, INCORRECT, UNANSWERED).
3. Keep PartStatus to CORRECT, PARTIALLY_CORRECT, INCORRECT and UNANSWERED. There is no Assignment manual-review lifecycle in v1.
4. Add QuestionTypeHandler implementations/registry/capability policy and ensure handlers do not depend on repositories/JPA/JsonNode.
5. GradeResult may carry optional normalizedSubmittedValue for engine-graded Activity outcomes. Independently, the Assignment answer intake normalizer captures a normalized submitted value when accepting/saving an answer; Assignment official score is not produced by QuestionEngine.grade.
6. Add contract tests, registry startup checks, persistence round-trip tests and student-answer leakage tests.

### Slice 2 — Option order and question revision
1. Re-audit existing option rows/key order and frontend assumptions.
2. Add a migration for explicit option display order with deterministic backfill and constraints.
3. Add content revision/provenance required for reproducible snapshots.
4. Fix hint round-trip on every Question Bank/Assignment create/edit/bulk path.
5. Align demo `types.ts`, Question Bank drafts and Assignment editors to the canonical QuestionSpec. Remove demo-only semantic aliases by adapter mapping: TEXT_INPUT→TYPE_ANSWER, multi-text/passages→CLOZE, pool/matching→MATCHING, dedicated TRUE_FALSE discriminant.
6. Do not move Assignment order or points into Question Bank Question data.

### Slice 3 — Durable Activity snapshots and update semantics
1. Add Activity revision/provenance and full immutable QuestionSnapshot storage for each selected ActivitySession question.
2. Before enforcing snapshots, abandon every legacy IN_PROGRESS ActivitySession. Do not snapshot current mutable Question rows as though they were historical.
3. At session start, capture current Activity revision/configuration, selected order and full question specs. All display, answer normalization, feedback/reveal and scoring for that session use the snapshot.
4. Activity edits are allowed while sessions exist. Existing sessions stay on their original snapshot; sessions started after the save use the newest revision/content.
5. Add integration tests proving source Activity/Question edits affect future sessions only, plus existing session correctness/reveal remain stable.

### Slice 4 — Assignment Composition persistence and API
1. Design ordered relational Composition tables after schema re-audit: sections, ordered items/container membership, block payload/version and Assignment-specific scoring fields.
2. Keep AssignmentQuestion free of a position column.
3. Backfill existing Assignments into one default section and items ordered question_id ASC. Default each item to 1 possible point, required, not-example unless real explicit existing data exists.
4. Add Composition read/write/validation APIs, stable section/item validation errors, server-side readiness and publish guard.
5. Keep demo interaction model; replace localStorage/seed persistence with real APIs. Align canonical QuestionSpec union; Composition types remain separate.
6. Add equal-split default for CLOZE/MATCHING points. Teachers can override part allocation; backend validates sum(parts)=item total and snapshots each part allocation.
7. Add ordering/backfill, readiness, ownership, and round-trip tests.

### Slice 5 — AssessmentAttempt and hard lock policy
1. Create AssessmentAttempt and immutable ordered attempt snapshot. Snapshot includes Composition, QuestionSpecs/answer keys for teacher review, media refs, possible points per item/part, required/example flags, timing/target/review settings and schema/grading/normalization versions.
2. Enforce one official attempt per student per Assignment and server-authoritative whole-attempt timer.
3. Persist raw answers throughout attempt, support idempotent autosave/submit, auto-submit saved answers on timeout, mark late/timed-out without score penalty.
4. Enforce hard authoring lock as soon as the first attempt starts: reject changes to Assignment metadata affecting work, target/schedule, Composition/order, question contents/membership, points and answer policy. Do not allow edits merely because status is not ARCHIVED.
5. Any desired amendment is performed by cloning Assignment to a new independent assignment with independent owned Questions and composition. Ensure cloning does not mutate original or existing attempt snapshots.
6. Operational archive/close to prevent future starts may be allowed; it does not alter historical snapshots. Add transaction/concurrency tests for start-vs-edit, start-vs-publish/close and clone/source mutation.

### Slice 6 — Automatic scoring and score-display settings

The Assignment Builder has no manual grading or AUTO/MANUAL selector. Teacher configuration is possible points per item (default 1) and optional compound part allocations. Every submit/timeout automatically calculates the result.
1. On submit/timeout, run Question Engine grading deterministically from the immutable AssessmentAttempt snapshot and persist score/part results immediately.
2. Use QuestionEngine.grade for official Assignment points as well as its existing Activity behavior. Preserve type semantics; do not introduce manual grading.
3. Persist per-part status and earned/possible points returned from the Question Engine, plus optional normalized submitted values captured at answer intake. Student in-progress DTOs must not expose these internals.
4. Assignment possible points are stored on Composition, default 1 point per scored question. For compound items, initialize equal point allocations across parts; teacher may edit. Validate the sum equals aggregate question points.
5. Calculate score = total engine-awarded earned points / total possible scored points × 100. Preserve raw earned points, possible points and percentage; round only for display.
6. Do not implement a manual grading UI or AUTO/MANUAL mode selector. Add Assignment-level `show_score_after_submit` (default true) for immediate score display; keep `show_answers_after_submit` independent for answer/explanation reveal.
7. Readiness rejects zero total possible scored points. Examples have zero points and are excluded from denominator.

### Slice 7 — Assignment analytics and export
1. Derive per-student status/score and class average from persisted AssessmentAttempt/grade records.
2. Provide per-question/part reviewed outcomes and most-missed counts; clearly define denominator and report unanswered and pending-review separately.
3. Capture normalizedSubmittedValue with a type-aware normalizer at answer intake (not by the grader). Store optional normalization version.
4. Report common normalized submissions/distractors from automatically graded outcomes.
5. Examples and pending-review parts are excluded from finalized accuracy rates. Enforce teacher ownership/target scope/privacy in query and export.
6. Implement CSV/Excel export and tests against known fixtures.

## 4. Migration planning boundaries (not version assignments)

The 2026-10-12 audited baseline included V30. These are migration groups, not a declaration that the next versions are V31/V32/etc. Re-check the real current max before allocating versions. Re-inspect Flyway immediately before coding:
1. Question option display order and Question content revision/provenance.
2. Assignment `show_score_after_submit` boolean with default TRUE; keep separate from `show_answers_after_submit`.
2. Activity revision metadata and durable ActivitySessionQuestion snapshot payload/schema version; legacy IN_PROGRESS abandonment rollout.
3. Assignment Composition tables and deterministic legacy backfill.
5. Assignment-specific points per composition item/part (default 1 point per scored question) and compound-part allocation.
6. AssessmentAttempt, ordered snapshot, saved raw answers, auto-graded per-part outcomes, earned/possible points and normalized submitted values/version.
6. Needed indexes and uniqueness constraints for one attempt per student/Assignment, ordered children and idempotency.
7. Any new QuestionSpec type-specific child tables/constraints (MATCHING/CLOZE) in the same vertical slice as support.

Migrations must be forward-only and incremental. Do not edit V1–V30 or invent historical section/media/group data. Rollout needs backup/transaction/validation strategy for backfills and a documented migration test.

## 5. Definition of done

- Question Engine type contracts and parity tests are in place; Activity behavior is preserved.
- Existing Activity sessions are abandoned before snapshot rollout; new sessions are immutable and Activity edits affect future sessions only.
- Assignment Builder persists and reloads Composition through APIs, preserving order/grouping.
- Assignment cannot be edited after first attempt; clone yields an independent new Assignment.
- Assignment is automatically graded on submit/timeout; `show_score_after_submit` controls immediate score display and `show_answers_after_submit` independently controls answer reveal.
- Composite point split defaults equal and teacher edits are validated/snapshotted.
- Readiness, timeout, scoring, review visibility, normalized-value analytics, most-missed reports and exports pass tests.
- Frontend lint/typecheck/tests/build and backend tests are run and exact results written to PROGRESS. Never claim checks that were not run.
