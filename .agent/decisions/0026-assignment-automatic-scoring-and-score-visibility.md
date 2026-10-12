# 0026 — Assignment automatic scoring and score visibility

**Status: Accepted**  
**Date:** 2026-10-12  
**Decided by:** project owner  
**Supersedes:** ADR 0025's teacher-review/no-auto-grading requirement; ADR 0025 remains authoritative for hard-lock and Activity update semantics.

## Context

The Owner confirms the production Assignment model must calculate scores automatically. Manual grading is not supported. Each scored question has its own possible-point value, defaults to one point, and may be customized by the teacher. The student needs a separate option to show the calculated score immediately after submitting.

## Decision

### 1. Automatic scoring only
- The server automatically grades submitted Assignment answers using the canonical Question Engine handler and the immutable AssessmentAttempt snapshot.
- Do not implement teacher manual grading, a teacher-earned-points editor, a review queue, a PENDING_REVIEW grading state, or an AUTO/MANUAL selector.
- Keep the Question Engine's existing type semantics. The existing five types retain their current scoring behavior; Multiple Choice remains exact-set/all-or-nothing. MATCHING/CLOZE can award partial credit only according to their explicit type-level part rules.
- Submit and timeout both run the same deterministic grading pipeline against the stored snapshot and saved answers. A timed-out attempt is automatically submitted and scored.
- Persist raw submitted values as needed for permitted post-submit review, per-part outcomes, earned/possible points, stable part keys, and optional normalized submitted values for analytics. The type-aware normalizer records normalized input; the Question Engine separately determines correctness.

### 2. Score display and answer reveal are independent settings
- Add Assignment-level boolean `show_score_after_submit`, default `true`. The server calculates and persists the score regardless of this setting. The setting determines whether the student response reveals that calculated score immediately after submit/timeout.
- Keep `show_answers_after_submit` as a separate setting. It controls whether correct answers and explanations are shown after submission; it does not control whether a score is calculated.
- If `show_score_after_submit=false`, hide the score from that student's post-submit response while retaining it for teacher reporting and analytics.
- If `show_answers_after_submit=false`, suppress correct answers and explanations even if `show_score_after_submit=true`.
- In-progress student payloads never expose correctness flags, accepted/correct answers, answer keys, normalized submitted values or hidden explanations.

### 3. Points and compound parts
- Each scored Assignment question item has `possiblePoints`, defaulting to 1 point. The teacher may customize it for that Assignment item; never mutate a shared Question Bank question to store Assignment-specific points.
- For CLOZE/MATCHING, split the aggregate question points evenly across independently scored parts by default. The teacher may customize the per-part allocation. The parts must sum exactly to the aggregate item points.
- Persist the selected item/part points in Composition and snapshot them into AssessmentAttempt.
- Calculate earned points using the Question Engine's score fraction for the item/part. Assignment percentage is `totalEarnedPoints / totalPossibleScoredPoints * 100`.
- Preserve raw earned points, possible points and percentage; round only for presentation. Examples have zero points and are excluded from the denominator and most-missed statistics. Readiness rejects an Assignment with zero total possible scored points.

### 4. Analytics and runtime
- Assignment analytics use persisted auto-graded results: correct, partially correct, incorrect and unanswered counts by question/part, plus distributions of normalized submitted values. Report unanswered separately from wrong submitted answers and exclude examples from the scored denominator.
- Activity keeps its own established automatic Practice/Try Hard grading and remains a distinct aggregate. Assignment scoring decisions do not change Activity behavior.
- AssessmentAttempt uses the immutable ordered Composition/Question snapshot and is never regraded against mutable live content after start.

## Consequences
- Production Assignment Builder has per-item points, default 1, and no manual-grading controls.
- `show_score_after_submit` is a new Assignment contract and requires a forward-only migration after a fresh Flyway baseline audit. No migration is created in this ADR update.
- `show_answers_after_submit` remains independent and continues to control answer/explanation visibility.
- ADR 0025 still requires hard-locking an Assignment after its first attempt starts; changing it requires cloning. Activity edits remain allowed and affect sessions started after the update, while existing sessions keep their starting snapshots.

## Migration rules
The last audited baseline was V30, but it must be rechecked immediately before implementation. Never edit V1–V30. Add a new forward-only migration for `show_score_after_submit` and any other newly required fields after choosing the actual next unused version.
