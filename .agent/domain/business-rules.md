# Business Rules

## Activity
- Activity belongs to one Unit.
- Activity and Assignment are independent.
- Activity may be DRAFT, PUBLISHED or ARCHIVED.
- Draft may be incomplete; PUBLISHED requires READY.
- Mode is LEARNING, TRY_HARD or BOTH. If BOTH, the student chooses the concrete mode at start.
- If multiple selection strategies are configured, the student chooses one at start; Attempt stores the concrete selection_strategy.
- Try Hard time_limit_seconds is per question. Learning has no timer.
- Try Hard wrong answers cost lives; question timeout costs no life.
- No whole-Activity countdown.
- Unfinished Activity runs are not resumed; abandoned runs are ignored for finalized analytics/XP.

## Learning Mode
- One optional teacher-authored hint per Question.
- Maximum 3 answers per question.
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
- Attempt snapshots the exact question set/content.
- AttemptQuestion.position is runtime snapshot order, not AssignmentQuestion authoring order.
- Server is authoritative for correctness and scoring.
