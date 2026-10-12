# 0025 — Assignment teacher grading, immutable after first attempt; Activity updates apply to future sessions

**Status: Accepted**  
**Date:** 2026-10-12  
**Decided by:** project owner  
**Supersedes:** the Assignment edit/regrading assumptions in ADR 0023 D7/D8 and ADR 0024 where they conflict with this ADR.

## Context

The Owner has finalized the Composition model and clarified two lifecycle requirements:
- Assignment questions/structure must not be changed once any student has started an attempt; make a copy to author a revised test.
- Activity remains editable. A session already started keeps the question/content version it started with; students who start sessions after an Activity or source-question update receive the updated content.
- Assignment v1 must not automatically grade student submissions.

## Decision

### 1. Assignment grading is teacher-reviewed in v1

- Remove automatic grading as an Assignment product capability in v1. Do not show an AUTO/MANUAL grading-mode selector in the Assignment Builder.
- Every submitted Assignment is scored by a teacher through a teacher-review workflow. The review workflow is part of Phase 7B, not a deferred optional screen.
- The Question Engine may still parse and normalize submitted values and may grade Activity practice responses according to Activity's established immediate-feedback rules. AssessmentAttempt must not invoke Question Engine's automatic correctness result to award official Assignment points.
- On submission, Assignment score is PENDING_REVIEW until required teacher grading is complete. Preserve the server timer, autosave, one-attempt rule and timeout auto-submit. Timeout/submit is not equivalent to graded/final.
- Teacher assigns an outcome and earned points for each scored question/part: correct, partially correct, incorrect or unanswered as applicable. Earned points must be between 0 and possible points. The final Assignment percentage is total teacher-awarded earned points / total possible scored points × 100.
- Store submitted raw answer for teacher review. Capture normalized submitted values at answer intake through a type-aware normalizer; this is a normalization operation, not an automatic correctness judgment.
- Per-question/part analytics use finalized teacher-reviewed outcomes. Common submitted-answer distributions can be computed from normalized values. Exclude examples and unreviewed items from finalized outcome rates, and report pending-review counts separately.
- Do not delete Question Engine's grading strategy because Activity needs automated correctness feedback; the no-auto-grading decision is specifically for formal Assignment submissions.

### 2. Assignment lock after first attempt starts

- Once any student AssessmentAttempt is created/started for an Assignment, the Assignment is frozen for future authoring changes.
- Reject changes to metadata that affects the assigned work, targets/schedule/eligibility, Composition sections/items/order, Question membership/content, points, required flags, media, and answer/review settings. Operational archive/disable-to-prevent-new-starts may remain available, but cannot change existing snapshots/results.
- Existing attempts are immutable and always retain the exact snapshot they started with.
- If a teacher wants any change to an Assignment after the first attempt starts, they must duplicate/clone the Assignment. The copy receives independent Assignment-owned Questions and a new Composition; edits to it do not mutate the original or its attempts.
- Enforce this rule in backend services/transactions, not only through disabled controls in the UI. Add concurrency tests for start-vs-edit and duplicate-vs-source mutation.

### 3. Activity updates are allowed and apply to future sessions

- A teacher may update an Activity and its configuration/content while other students have active or completed sessions.
- Each ActivitySession captures an immutable, durable snapshot at session start, including the Activity/content revision/provenance and every selected QuestionSpec.
- Updating an Activity or a source Question never mutates existing ActivitySession snapshots. Current sessions continue with the version they started with; their score/reveal uses that snapshot.
- New sessions started after the update use the latest saved Activity configuration and latest Question content selected for that run.
- Maintain an Activity revision/version counter or equivalent provenance for diagnostics/analytics. It is not a reason to force teachers to clone Activities.
- Before full snapshots are enabled, abandon legacy IN_PROGRESS sessions as required by ADR 0012; never reconstruct historical snapshots from mutable current content.

### 4. Points for compound question parts

- The teacher enters the aggregate possible points for a CLOZE/MATCHING question item.
- By default, split that total equally among its independently scored parts.
- The teacher may adjust individual part possible points. The sum of part possible points must always equal the aggregate item points; enforce this in the editor and backend validation.
- For example, a 4-point four-blank CLOZE defaults to 1 point per blank; a teacher may adjust to 2, 1, 0.5, 0.5, while the total remains 4.
- Each part's allocated possible points are frozen into the AssessmentAttempt snapshot. Never count both the aggregate item total and its parts in the Assignment denominator.

## Consequences

- The AUTO/MANUAL selector in the prototype is not part of the v1 production contract and must be removed/disabled as part of Builder integration.
- A real teacher grading/review UI and API are mandatory in Phase 7B.
- AssessmentAttempt needs distinct submission and grading/review states; a submitted attempt can remain awaiting review.
- Assignment Composition needs per-part point allocation with equal-split default and explicit override.
- Activity snapshot support must preserve old session content while allowing the Activity/source Questions to change for new sessions.

## Migration and implementation rules

The audited baseline was V30 before this documentation update. No migration is created here. Never edit V1–V30. Re-audit the actual latest Flyway version before implementation. Add incremental migrations for Assignment Composition/points, immutable AssessmentAttempt snapshots and teacher review results, and Activity revision/full snapshots.
