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
- AssignmentQuestion has assignment_id and question_id only. No position, topic_id or reorder.
- AssignmentQuestion order is deterministic by question_id ascending.
- One Attempt per student.
- Assignment time_limit_seconds is for the whole Attempt.
- Expiry auto-submits saved answers and marks Timed out.
- Submission after due_at is Late without score penalty.
- Completion means submitted.
- show_answers_after_submit controls post-submit correct-answer visibility; default TRUE.
- Official score is separate from XP.

## Snapshot
- ActivitySession freezes the selected Activity question set/order. AssessmentAttempt will snapshot formal Assignment questions and answers separately.
- AttemptQuestion.position is runtime snapshot order, not AssignmentQuestion authoring order.
- Server is authoritative for correctness and scoring.
