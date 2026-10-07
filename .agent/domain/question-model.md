# Question Model and Attempt Snapshot Contract

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

Applies to Phase 3 (Content) and is relied on by Phase 4 and Phase 6.

MVP question types:

- `SINGLE_CHOICE`: exactly one correct option.
- `MULTIPLE_CHOICE`: one or more correct options.
- `TRUE_FALSE`: exactly one boolean answer, `TRUE` or `FALSE`.
- `FILL_IN_BLANK`: one or more accepted answers for the blank.
- `TYPE_ANSWER`: one or more accepted answers for free-text evaluation.

The canonical enum values are `SINGLE_CHOICE`, `MULTIPLE_CHOICE`,
`TRUE_FALSE`, `FILL_IN_BLANK`, and `TYPE_ANSWER`. Keep these values aligned
between the frontend types, backend enum, request validation, database
constraint, import format, and answer-checking logic.

Question data is split into a shared core and domain ownership contexts:

```text
questions
  ├── question_options
  ├── question_answers
  └── question_media

content_questions
  └── question_id + question_bank_id

assignment_questions
  └── question_id + assignment_id
```

- `Question` stores only shared core data: type, difficulty, prompt, optional explanation, server-derived `is_complete`, question-level `matching_mode`, and timestamps.
- `ContentQuestion` owns the relationship between a shared Question and a Content QuestionBank.
- `AssignmentQuestion` owns the relationship between a shared Question and an Assignment. Assignment questions do not point to `content_questions` or `QuestionBank`.
- `QuestionOption`, `QuestionAnswer`, and `QuestionMedia` are shared child records and reference `questions.id`.
- New question types are implemented once in the shared question core instead of creating separate Content/Assignment option, answer, and media tables.
- Content and Assignment create distinct Question rows. The sharing is schema/behavior, not reuse of the same assessment question instance.
- `matching_mode` belongs to `Question`, not to individual answers.

Validation rules must be type-aware:

- `SINGLE_CHOICE` requires at least two non-empty options and exactly one
  correct option when complete. Draft options may be empty.
- `MULTIPLE_CHOICE` requires at least two non-empty options and at least one
  correct option when complete. Exact-match grading is required in MVP: all
  correct options must be selected and no incorrect option may be selected.
  There is no partial credit in MVP.
- `TRUE_FALSE` requires exactly one valid boolean answer and no choice options.
- `FILL_IN_BLANK` supports exactly one blank in MVP. The prompt must contain
  the literal marker `____` and the question must have at least one accepted
  answer.
- `TYPE_ANSWER` requires a non-empty prompt and at least one accepted answer.
- Question content is limited to 2000 characters. Difficulty is required and
  defaults to `EASY` in the application layer. Explanation is optional.
- A question may have multiple image/audio media records. Media must be
  uploaded successfully and have real server `media_id` values before the
  question is saved. Video is out of scope for MVP.

The create, update, and bulk-create endpoints must apply the same
validation rules. Reject incompatible fields instead of silently ignoring
them. Updating a question type is allowed, but must run in one transaction,
delete incompatible child options/answers, and return a warning to the UI.
There is no optimistic locking in MVP.

Bulk create saves valid rows and returns errors by input index; one invalid
row must not roll back valid rows. Publishing is only a bank-level operation,
never a per-question operation.

Import supports CSV and XLSX only. A file may contain mixed question types,
but MVP import supports only `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, and
`TRUE_FALSE`. Validate and preview before commit, then import valid rows and
skip invalid rows with indexed errors. `FILL_IN_BLANK` and `TYPE_ANSWER` are
not importable in MVP.

Question lists require server-side pagination, type/difficulty/date filters,
and content search. The UI completeness column must show `Ready` or
`Incomplete`; do not show a question status column.

Answer evaluation must normalize on the server and must never trust a client
provided correctness or normalized value.

### Required implementation alignment

> Status note: migrations V7–V10 and the current `Question` entity already implement most of this list
> (`is_complete`, `matching_mode`, no question `status`/`display_order`). Verify against the code before relying on an item.

Before implementing question services, reconcile the current schema and
entities with this contract:

- Add `questions.is_complete` as a server-derived boolean. Never bind
  it from create/update request DTOs.
- Add nullable `questions.matching_mode` if the service needs to make
  the normalization rule explicit; MVP may default it in application code.
- Remove question `status` and `display_order` from Java entities, DTOs,
  mappers, repositories, and UI contracts. Keep bank status unchanged.
- Remove option `status` and `display_order` from entities and contracts.
- Move answer matching mode off `content_question_answers`. The answer table
  should store raw and normalized values only (`raw_value`,
  `normalized_value`), with a compatibility migration if the current columns
  are already deployed.
- Update the Flyway migration accordingly. Do not silently edit an already
  applied migration; add the next migration when V7 has been applied in any
  environment.
- Update the question list UI to remove Move up/Move down and replace the
  hardcoded Active status with Ready/Incomplete completeness.
- Keep `QuestionOption.is_correct` as the only correctness source for choice
  questions. Keep `QuestionAnswer` as the source for true/false and text
  answers.

Content completion gate:

Teacher must be able to create a Unit, Topic, QuestionBank, and incomplete or
complete Question, reload the page, and retrieve the saved data through the
real API. A published bank must expose only complete questions to students.

### Question attempt snapshot contract

When a student starts an activity, select and snapshot the exact question set
and question content inside the same transaction. The snapshot must survive
later bank archive, question edit, or question deletion. Select a random set
per student at attempt start, not when the teacher creates the Activity.

Randomize options per attempt using a deterministic seed based on
`attemptId + questionId`, so reloads preserve the same order. MVP grading is
exact-match with no partial credit. Do not recalculate an existing attempt
from the current Question or QuestionBank records.

---
