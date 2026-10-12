# Business Rules

## Student Class Membership
- A Student can have zero or one ACTIVE class membership at a time.
- A Student with no ACTIVE class has no current Grade-based content access.
- Adding a Student with an ACTIVE membership is rejected; moving the Student uses the explicit transfer operation.
- Transfer is atomic: deactivate the source membership, then reactivate an existing target history row or create a target row.
- A teacher can transfer a Student only when they own both source and target classes.
- INACTIVE memberships remain history and do not grant access to the old class or Grade.
- PostgreSQL enforces one ACTIVE membership per user; services lock the Student row during membership changes.

## Activity
- Activity belongs to one Unit.
- Activity and Assignment are independent.
- Activity may be DRAFT, PUBLISHED or ARCHIVED.
- Draft may be incomplete; PUBLISHED requires READY.
- Mode is LEARNING, TRY_HARD or BOTH. If BOTH, the student chooses the concrete mode at start.
- If multiple selection strategies are configured, the student chooses one at start; ActivitySession stores the concrete selection_strategy.
- Try Hard time_limit_seconds is per question. Practice (backend LEARNING) has no timer.
- Try Hard wrong answers cost lives; question timeout costs no life.
- No whole-Activity countdown.
- Unfinished ActivitySession runs are not resumed; abandoned sessions are ignored for finalized analytics/XP.
- Activity options/start and operations on an IN_PROGRESS session require the Student's current Grade to match the Activity Grade.

## Learning Mode
- One optional teacher-authored hint per Question.
- Maximum 2 answers per question: first answer + 1 retry.
- Hint usage is recorded and may affect future XP.
- No hint in Try Hard.
- Topic formula/reference sheet is deferred.

## Assignment
- Assignment owns AssignmentQuestion records.
- AssignmentQuestion has assignment_id and question_id only. No position or topic_id. Product ordering is Composition section/item/member position (ADR 0024).
- Composition order is authoritative and comes from persisted section/item/member position. question_id ASC is only deterministic legacy backfill/compatibility order.
- One Attempt per student.
- Assignment time_limit_seconds is for the whole Attempt.
- Expiry auto-submits saved answers and marks Timed out.
- Submission after due_at is Late without score penalty.
- Completion means submitted.
- show_score_after_submit (default TRUE) independently controls immediate score display. show_answers_after_submit (default TRUE) independently controls correct-answer/explanation reveal. The server always calculates the score on submit/timeout; hiding it affects student display only.
- Official score is separate from XP.

## Snapshot
- ActivitySession freezes the selected Activity question set/order. AssessmentAttempt will snapshot formal Assignment questions and answers separately.
- AttemptQuestion.position is runtime snapshot order, not AssignmentQuestion authoring order.
- Server is authoritative for correctness and scoring.


## Assignment Composition (ADR 0024)
- Assignment is an ordered document: sections, items and grouped members have persisted order; AssignmentQuestion has no position.
- The Assignment Builder demo is the product prototype; localStorage/seed is not production storage.
- V1 blocks: instructions, passage, image/media and answer pool; audio/nested blocks deferred.
- Points, required and isExample are Assignment-specific; examples have zero points and are excluded from denominator/most-missed analytics. Assignment v1 uses teacher review for every submission, with no automatic grading selector.
- Assignment percentage = total earned points / total possible scored points × 100; round only for display.
- All Assignment submissions are automatically graded on submit/timeout by Question Engine; no pending-review state or manual grading workflow exists in v1. Readiness blocks zero possible scored points.
- AssessmentAttempt snapshots ordered composition, QuestionSpecs, scoring flags, media refs and normalization/review provenance.
- Persist per-part outcomes and normalized submitted values for Assignment analytics; report unanswered separately from incorrect.
- In-progress student payloads never leak correctness/answer keys/normalized values. After submission, show_score_after_submit controls score display; show_answers_after_submit independently controls answers/explanations.
- Publishing readiness is server-enforced; once any AssessmentAttempt starts, reject Assignment edits and require cloning to change it. Activity edits remain allowed: existing sessions keep their snapshots and future sessions use the latest saved version.


## Assignment score display (ADR 0026)
- Every submission/timeout is graded server-side from the immutable AssessmentAttempt snapshot.
- `show_score_after_submit` controls whether students see the calculated score immediately; the score is calculated and persisted either way.
- `show_answers_after_submit` independently controls whether correct answers and explanations are revealed.
- Composition position, not question ID, determines rendered item order. question_id ASC is only the legacy backfill order.
