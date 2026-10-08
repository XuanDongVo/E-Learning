# Question Model and Runtime Snapshot Contract

## Question types
SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER.

## Ownership
questions -> options/answers/media
content_questions -> question_id + question_bank_id
assignment_questions -> question_id + assignment_id

## Hint
Question may have one optional teacher-authored hint.
Field: questions.hint, nullable, max 500 characters.
Hint is optional and does not affect completeness.
Student hint retrieval is an explicit runtime action so hint_used can be recorded.

Topic formula/reference sheet is deferred and is not a current schema/API/UI contract.

## AssignmentQuestion
Exactly assignment_id + question_id.
No position, topic_id or reorder.
Reads and snapshots use question_id ASC.

## Snapshot
ActivitySession start creates an immutable selected-question snapshot/order in one transaction.
AssessmentAttempt will create the formal Assignment question/content snapshot separately.
