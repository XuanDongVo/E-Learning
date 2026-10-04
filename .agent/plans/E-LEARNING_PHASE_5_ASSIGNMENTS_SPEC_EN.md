# E-Learning — Phase 5: Assignments (Spec v2 — English)

**Status:** DRAFT v2 — open items in §4 require project-owner confirmation before ADR 0003.
**Target file:** `.agent/plans/E-LEARNING_PHASE_5_ASSIGNMENTS_SPEC.md`
**Purpose:** English implementation version of the Phase 5 Assignment specification.

> Technical identifiers (`entity`, `enum`, endpoint, error code, field name) remain unchanged.
> Code, type names, API contracts and UI copy use English.

---

## 0. Executive summary

An **Assignment** is a formal assessment with a due date, one attempt per student, and an official score.

### Core decision

> **An Assignment owns its own questions.** Teachers can create questions manually or import them from the official Excel template.
> Assignments **do not read from `QuestionBank`**. Question banks contain practice content used by Activities and should not become the source
> of official assessments.

Consequences:

- No Assignment question-source distribution or random-pool configuration.
- No Assignment readiness based on question-bank availability.
- No `Assignment.activity_id` or `ActivityAssignment` relationship.
- A new `AssignmentQuestion` aggregate is required.
- Assignment questions become structurally locked after the first Attempt.
- Excel import is a new backend capability using Apache POI.

## 0.1 Changes from v1

| Area | v1 | v2 |
|---|---|---|
| Question source | `AssignmentBank` → `QuestionBank` with distribution/random selection | Own `AssignmentQuestion` records; manual form + Excel import |
| Exam paper | Randomized per student | One fixed question set and order for all students |
| `teacher_id` | Owner-scoped | Removed; the system has one teacher |
| Target | `CLASS` / `STUDENT` / `GRADE` / `ALL` | `CLASS` or `GRADE`, never mixed |
| Due date | Hard cut-off with auto-submit/`late_until` | No hard cut-off; submissions after `due_at` are labeled **Late** |
| `total_questions` | Stored configuration | Derived from AssignmentQuestion count |
| Topic statistics | Derived from question-bank source | Only AssignmentQuestions with optional `topic_id` |
| Excel | Export-only infrastructure | Template generation + import + export |

## 0.2 Before coding

1. Excel import does not exist yet. The Phase 3 frontend contains only a mock import flow. Backend Phase 5 must build the parser and template first.
2. `QuestionService.computeIsComplete(...)` must be extracted into a shared pure `QuestionContentValidator`, with field-level errors and tests.
3. Class membership APIs are required for real target resolution and must be completed in M0.
4. `classes` contain `academic_year`; target resolution must use the matching school year.
5. `/v1/assignments/**` must be restricted to `TEACHER`; one teacher does not remove role-based security.

---

# 1. Confirmed decisions

| ID | Decision | Implementation note |
|---|---|---|
| C1 | Assignment owns its own questions; no QuestionBank dependency | Manual creation or Excel template import |
| C2 | No hard due-date cut-off | Students can continue after `due_at`; submission is labeled `Late` and is not penalized |
| C3 | Remove question pools/random distribution | No bank selection, quota, source readiness or calculator |
| C4 | No `teacher_id` | Single-teacher system; endpoints check role only |
| C5 | No mixed target types | `CLASS` for selected classes in one grade/year, or `GRADE` for the whole grade/year |
| C6 | One attempt + official score | Unanswered questions are not wrong, but total question count remains the denominator; score is separate from XP |

---

# 2. Repository baseline

- Roles: `TEACHER`, `STUDENT`.
- Classes have `grade` 6–8 and `academic_year`.
- `ClassMember` is required for target resolution.
- Phase 3 Question types: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `FILL_IN_BLANK`, `TYPE_ANSWER`.
- Difficulty: `EASY`, `MEDIUM`, `HARD`.
- Phase 3 supports incomplete questions in DRAFT and uses `is_complete` as a derived service result.
- Answer normalization is trim + case-insensitive lower-case.
- Media is uploaded separately and linked through a question-media table.
- Backend currently has no real Excel parser and frontend import is mock.
- Migration after the current Phase 4 state should be `V18` after confirming the migration history.
- `/v1/assignments/**` requires the `TEACHER` role.
- Frontend stack: Next.js, TanStack Query, React Hook Form, Zod, Sonner and Radix.

---

# 3. Scope, milestones and completion gate

## 3.1 Dependency sequence

```text
M0  Prerequisites: membership API, test DB infrastructure, shared question validator, ADR 0003
 ↓
M1  Phase 5 backend: Assignment + questions + import/template + target + schedule + publish
 ↓
M2  Phase 5 frontend: authoring + import flow + review/assign + detail
 ↓
M3  Phase 6: Attempt / Answer
 ↓
M4  Results + student attempt review + optional Release answers / Finalize unfinished
 ↓
M5  Statistics
 ↓
M6  Export / Reports
```

## 3.2 Included in Phase 5

- Assignment list with server-side filtering, search and pagination.
- Create / edit / archive.
- Assignment questions: create, edit, delete, reorder, preview and media.
- Excel import: download template → upload → preview row errors → confirm.
- Target: `CLASS` or `GRADE`, with recipient preview.
- Schedule: optional `start_at`, required `due_at`, optional `time_limit_seconds`.
- Derived readiness + publish + archive.
- Structural question locking after the first Attempt.
- Detail: Overview, Questions, Recipients and a progress shell.

## 3.3 Out of scope

- Student attempt execution and grading (Phase 6).
- Results and student attempt review (M4).
- Statistics (M5).
- Export (M6 unless pulled forward).
- XP.
- Copying QuestionBank questions into Assignment in MVP.
- Regrading/editing correct answers after an Attempt.
- Question/answer shuffling.
- Gradebook.
- Email/push notifications.

## 3.4 Phase 5 completion gate

> A teacher can create an Assignment with manually created and/or Excel-imported questions, select a valid target, configure schedule,
> reload the page and recover the same configuration/questions/order/recipients through the real API, publish only when READY, receive
> actionable readiness errors otherwise, and a `STUDENT` receives 403 from Assignment APIs. There is no `Assignment.activity_id`, no
> Assignment → QuestionBank reference, and no permanent teacher mock flow.

---

# 4. Open decisions

| ID | Question | Default proposal |
|---|---|---|
| O1 | Should target include `academic_year`? | Yes. Store `grade_level` + `academic_year`. |
| O2 | Can a student start after `due_at`? | Yes. The submission is Late. Archive to stop new starts. |
| O3 | Does `time_limit_seconds` remain effective? | Yes. It is per Attempt and independent of due date. |
| O4 | When are answers visible? | Score immediately; correct answers + explanations only after `Release answers`. |
| O5 | Can questions be edited after an Attempt exists? | No. Lock completely in MVP. |
| O6 | How are unfinished attempts finalized? | M4 action: `Finalize unfinished`. |
| O7 | Shuffle question/answer order? | No in Phase 5. |
| O8 | Optional Topic on an AssignmentQuestion? | Yes, nullable `topic_id`. |
| O9 | Excel import limits? | 5 question types, `.xlsx` only, text only, ≤ 5 MB, ≤ 100 questions per Assignment. |
| O10 | Display score scale? | `%` + `correct/total`; 10-point scale only as an optional Excel-derived column later. |
| O11 | Excel library? | Apache POI (`poi-ooxml`); use CSS/SVG for charts before adding a chart library. |
| O12 | Assignment name uniqueness? | `UNIQUE (grade_level, academic_year, name)`. |
| P0 | Membership API before Phase 5? | Yes; M0 prerequisite. |

---

# 5. Domain model

## 5.1 Relationships

```text
Assignment ──┬─→ AssignmentQuestion ──→ Question Core
             ├─→ AssignmentTarget
             └─→ [Phase 6] Attempt → AttemptQuestion → Answer

Question Core
  ├── questions
  ├── question_options
  ├── question_answers
  └── question_media

Content ownership
  └── content_questions → QuestionBank
```

There is no `Assignment.activity_id`, no `ActivityAssignment`, and no Assignment dependency on Phase 3 `QuestionBank`/`Question`.

## 5.2 Assignment

| Field | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL | |
| `name` | VARCHAR(150) | Unique by grade + academic year + name |
| `description` | VARCHAR(1000) | Optional |
| `status` | `DRAFT` / `PUBLISHED` / `ARCHIVED` | Lifecycle |
| `grade_level` | SMALLINT 6–8 | Matches `classes.grade` |
| `academic_year` | VARCHAR(20) | Matches class school year |
| `target_type` | `CLASS` / `GRADE` | Never mixed |
| `start_at` | TIMESTAMP NULL | NULL = open immediately when published |
| `due_at` | TIMESTAMP | Required when published |
| `time_limit_seconds` | INT NULL | Optional; per Attempt |
| `answers_released_at` | TIMESTAMP NULL | Release answers state |
| `published_at`, `created_at`, `updated_at` | TIMESTAMP | |

Do not store `teacher_id`, `attempt_limit`, `total_questions`, `allow_late_submission`, `late_until`, readiness, schedule state,
recipient count or progress. These are derived or system constants.

## 5.3 AssignmentQuestion

- `assignment_id`, `position`: fixed paper order.
- `type`, `difficulty`: shared enums; default difficulty `EASY`.
- `content` ≤ 2000 chars.
- `explanation` ≤ 2000 chars, optional.
- `is_complete`: derived by service; incomplete questions may remain in DRAFT.
- `topic_id`: nullable.
- No `matching_mode` field; normalization is centralized in `AnswerNormalizer`.

Child records:

- `AssignmentQuestion` owns only Assignment context: `assignment_id`, `question_id`, nullable `topic_id`, and fixed `position`.
- Options, accepted answers and media use the shared Question Core child tables: `question_options`, `question_answers`, `question_media`.
- Assignment does not reference `content_questions` or `QuestionBank`.

## 5.4 AssignmentTarget

`target_type` is stored on Assignment. `assignment_targets` is populated only for `CLASS`.

| Target | Rule |
|---|---|
| `CLASS` | At least one class; every class must match `grade_level` and `academic_year`; no duplicates |
| `GRADE` | No target rows; all matching classes in the grade + academic year |

No `STUDENT`, no `ALL`, and no mixed target types.

## 5.5 Derived concepts

| Concept | Formula |
|---|---|
| `questionCount` | Count of AssignmentQuestions |
| `recipients` | Active students in target classes/grade ∪ students with an existing Attempt; dedupe by user ID |
| `readiness` | `READY` / `NEEDS_ATTENTION` + `issues[]` |
| `scheduleState` | `NOT_PUBLISHED` / `SCHEDULED` / `OPEN` / `PAST_DUE` / `ARCHIVED` |
| `structuralLocked` | At least one Attempt exists |
| `late` | `submitted_at > due_at` |
| `progress` / `studentStatus` | Phase 6+ |

Lifecycle and readiness are separate UI concepts.

---

# 6. Lifecycle, schedule, Late and locking

## 6.1 Lifecycle

```text
DRAFT ──publish (READY)──→ PUBLISHED ──archive──→ ARCHIVED
```

- Archive replaces delete for normal lifecycle management.
- Archived Assignments do not accept new starts.
- Students already working may finish and submit.
- Archived Assignments are hidden from the default list.

## 6.2 Schedule state

```text
DRAFT → NOT_PUBLISHED
ARCHIVED → ARCHIVED
PUBLISHED + start_at != NULL + now < start_at → SCHEDULED
PUBLISHED + now ≤ due_at → OPEN
PUBLISHED + now > due_at → PAST_DUE
```

There is no `CLOSED` state.

## 6.3 Late submission

```text
Start:  PUBLISHED and start condition is met; no upper bound based on due_at
Work:   never cut by due_at
Submit: late ⇔ submitted_at > due_at
Score:  unchanged by Late
```

`late` is derived, not stored. `Overdue` is the student-facing state for an unfinished submission after `due_at`.

Changing `due_at` can change historical Late labels because Late is derived from the current due date. The UI must warn the teacher when changing
the due date after submissions exist.

## 6.4 Time limit

`expires_at = started_at + time_limit_seconds`.

The timer is independent of `due_at`. At expiry, the server finalizes the Attempt as `TIMED_OUT`, including when the due date has passed.
The UI timer is only a display; the server is authoritative.

## 6.5 Editing rules

| Change | DRAFT | PUBLISHED, no Attempt | PUBLISHED, Attempt exists | ARCHIVED |
|---|---|---|---|---|
| Name/description | ✅ | ✅ | ✅ | ❌ |
| Start/due | ✅ | ✅ | `due_at` ✅ with Late warning; `start_at` ❌ | ❌ |
| Time limit | ✅ | ✅ | ❌ `ASSIGNMENT_LOCKED` | ❌ |
| Questions/options/answers/media/order/import | ✅ | ✅ with lock warning | ❌ `ASSIGNMENT_LOCKED` | ❌ |
| Grade/year | ✅ | ✅ | ❌ | ❌ |
| Add class / `CLASS → GRADE` | ✅ | ✅ | ✅ only expansion | ❌ |
| Remove class / `GRADE → CLASS` | ✅ | ✅ | ❌ | ❌ |
| Release answers | — | ✅ | ✅ | ✅ |

The UI should explain: once the first Attempt exists, archive the Assignment and create a new one to change the question set.

---

# 7. Business rules

## 7.1 Assignment questions

- `SINGLE_CHOICE`: ≥2 non-empty options; exactly one correct.
- `MULTIPLE_CHOICE`: ≥2 options; at least one correct; exact-set grading, no partial credit.
- `TRUE_FALSE`: one of `TRUE`/`FALSE`; no option rows.
- `FILL_IN_BLANK`: exactly one `____` marker; ≥1 accepted answer.
- `TYPE_ANSWER`: ≥1 accepted answer.
- Content ≤2000 chars.
- Incomplete questions may be saved in DRAFT and are shown as `Incomplete`.
- Publish requires every question to be `Ready`.
- `MAX_QUESTIONS_PER_ASSIGNMENT = 100`.
- All questions have equal weight.
- `position` is teacher-controlled and sequential.
- Media is uploaded separately, then linked to the saved question.
- Changing question type removes incompatible child data in one transaction and warns the UI.

## 7.2 Excel import

```text
Template → Upload → Preview → Confirm
```

Preview parses and validates without writing to the DB. Commit revalidates server-side and persists valid rows only.
Errors are returned by Excel row number. Imported rows append to the end of the current question list.

## 7.3 Score

- One Attempt only; no retry/best-score behavior.
- `score% = correct / questionCount × 100`.
- Unanswered questions are not wrong, but still reduce the percentage because the denominator is total question count.
- Grading is server-side through shared `AnswerEvaluator` and `AnswerNormalizer`.
- UI/statistics/export read stored score fields; they do not recalculate score independently.
- Official score is independent of XP.

## 7.4 Recipient resolution

`CLASS`: active students in active memberships of the selected classes.

`GRADE`: active students in active memberships of every class matching the grade and academic year.

Union existing Attempts, filter active users/Student role, dedupe by user ID.

Recipient resolution is dynamic in MVP: a student who joins before submitting may receive the Assignment.

## 7.5 Answer visibility

Immediately after submission: score + `correct/total`.

Correct answers + explanations are hidden until `Release answers`.

Teachers can always see correct answers.

---

# 8. Backend architecture

## 8.1 Package structure

```text
server/src/main/java/e_learning/server/
├── question/
│   ├── QuestionContentValidator
│   ├── AnswerNormalizer
│   └── AnswerEvaluator
├── assignment/
│   ├── controller/
│   │   ├── AssignmentController
│   │   ├── AssignmentQuestionController
│   │   └── AssignmentImportController
│   ├── dto/request|response/
│   ├── entity/
│   │   ├── Assignment
│   │   ├── AssignmentTarget
│   │   ├── AssignmentQuestion
│   │   ├── AssignmentQuestionOption
│   │   ├── AssignmentQuestionAnswer
│   │   └── AssignmentQuestionMedia
│   ├── repository/
│   ├── recipient/AssignmentRecipientResolver
│   ├── importer/
│   │   ├── AssignmentQuestionImportParser
│   │   └── AssignmentQuestionTemplateBuilder
│   └── service/
│       ├── AssignmentService
│       ├── AssignmentQuestionService
│       ├── AssignmentValidationService
│       ├── AssignmentReadinessService
│       └── AssignmentScheduleService
└── existing packages remain unchanged except for required M0 support
```

## 8.2 Shared logic

Reuse only the parts that are truly common:

- `QuestionContentValidator` for question completeness and field errors.
- `AnswerNormalizer` for trim + case-insensitive normalization.
- Shared option/answer DTO components where appropriate.
- Existing `MediaService` and media endpoints.
- Shared enums `QuestionType` and `Difficulty`.

Do not share the `content_questions` entity/table with AssignmentQuestions.

## 8.3 Service responsibilities

- `AssignmentService`: CRUD configuration, publish/archive, release answers.
- `AssignmentQuestionService`: question CRUD/order/import commit and lock checks.
- `AssignmentValidationService`: target, schedule and time-limit rules.
- `AssignmentReadinessService`: `READY`/`NEEDS_ATTENTION` + issues.
- `AssignmentScheduleService`: derived schedule state and date validation.
- `AssignmentRecipientResolver`: recipient calculation.
- Importer: parse without DB writes; template generated from enums/constants.

## 8.4 Transactions

- Create: Assignment + target in one transaction.
- Update configuration: lock check + config + target replacement in one transaction.
- Question write: one transaction per operation.
- Import commit: one transaction for all valid rows.
- Publish: recompute readiness and publish atomically.
- Archive: one transaction; never delete Attempts.

---

# 9. Database migration — `V18__create_assignments.sql`

The migration creates:

- `assignments`
- `assignment_targets`
- `assignment_questions`
- `questions`
- `question_options`
- `question_answers`
- `question_media`

Key constraints:

```sql
UNIQUE (grade_level, academic_year, name)
UNIQUE (assignment_id, position) DEFERRABLE INITIALLY DEFERRED
UNIQUE (question_id, option_key)
UNIQUE (question_id, media_id)
```

Question child rows cascade only while questions may legally be removed before Attempts exist.
Phase 6 must use restrictive references from AttemptQuestion/Answer to assignment questions.

---

# 10. API contract

Base path `/v1`. Envelope rules remain unchanged except binary template/export endpoints.

## 10.1 Assignment

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/assignments` | Server-paginated list with query filters |
| POST | `/v1/assignments` | Create DRAFT |
| GET | `/v1/assignments/{id}` | Detail + derived state/readiness/recipient count |
| PUT | `/v1/assignments/{id}` | Update configuration/target/schedule |
| PATCH | `/v1/assignments/{id}/status` | Publish/status transition |
| PATCH | `/v1/assignments/{id}/archive` | Archive |
| PATCH | `/v1/assignments/{id}/release-answers` | Release answers |
| GET | `/v1/assignments/{id}/readiness` | Readiness + issues |
| GET | `/v1/assignments/{id}/recipients` | Resolved recipients |
| GET | `/v1/assignments/{id}/progress` | Progress shell in Phase 5 |
| POST | `/v1/assignments/target-preview` | Recipient preview |
| GET | `/v1/assignments/target-options?academicYear=` | Available grades/classes |

Normal create/update requests do not accept server-derived fields such as `status`, readiness, `recipientCount`, schedule state,
`isComplete` or `answersReleasedAt` unless a dedicated endpoint owns that change.

## 10.2 Assignment questions

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/assignments/{id}/questions` | Ordered question list |
| POST | `/v1/assignments/{id}/questions` | Create one or many questions |
| PUT | `/v1/assignments/{id}/questions/{questionId}` | Update a question |
| DELETE | `/v1/assignments/{id}/questions/bulk-delete` | Delete multiple questions + resequence |
| PUT | `/v1/assignments/{id}/questions/order` | Replace question order |
| POST | `/v1/assignments/{id}/questions/import/preview` | Parse/validate `.xlsx` without DB writes |
| GET | `/v1/assignments/question-import-template` | Binary `.xlsx` template |

All question writes return `ASSIGNMENT_LOCKED` once the first Attempt exists.

## 10.3 Progress shell

Phase 5 has no Attempt data. The progress endpoint returns real assigned-recipient data and an explicit `available:false` state.
Never show fake zero-valued result metrics.

## 10.4 Future results

Phase 6+ adds result summary, paginated Results, single-student review, and `Finalize unfinished`.

## 10.5 Statistics/export

Phase 7+ provides statistics and Excel export. Export is binary `.xlsx`.

## 10.6 Error codes

```text
ASSIGNMENT_NOT_FOUND
ASSIGNMENT_INVALID_CONFIGURATION
ASSIGNMENT_LOCKED
ASSIGNMENT_NOT_READY
ASSIGNMENT_SCHEDULE_INVALID
ASSIGNMENT_TIME_LIMIT_INVALID
ASSIGNMENT_TARGET_REQUIRED
ASSIGNMENT_TARGET_INVALID
TARGET_NOT_FOUND
TARGET_EMPTY
ASSIGNMENT_QUESTION_NOT_FOUND
ASSIGNMENT_QUESTION_INVALID
ASSIGNMENT_QUESTION_LIMIT_EXCEEDED
ASSIGNMENT_QUESTION_ORDER_INVALID
IMPORT_FILE_INVALID
EMPTY_QUESTION
RESULT_NOT_AVAILABLE
EXPORT_TOO_LARGE
```

Phase 6 may add `ASSIGNMENT_NOT_OPEN`, `ASSIGNMENT_ALREADY_ATTEMPTED`, `ASSIGNMENT_NOT_ASSIGNED_TO_STUDENT`, and `ANSWERS_NOT_RELEASED`.

## 10.7 Readiness issues

Blocking examples:

```text
NO_QUESTIONS
INCOMPLETE_QUESTIONS
TOO_MANY_QUESTIONS
NO_TARGET
TARGET_EMPTY
TARGET_GRADE_MISMATCH
DUE_MISSING
SCHEDULE_INVALID
TIME_LIMIT_INVALID
```

Warnings may include:

```text
DUE_SOON
TIME_LIMIT_VERY_SHORT
QUESTIONS_WITHOUT_EXPLANATION
```

---

# 11. Security and privacy

- `/v1/assignments/**` → `TEACHER`.
- Unauthenticated requests → 401.
- `STUDENT` calling Assignment APIs → 403.
- No owner-scope check because the system has one teacher.
- Student APIs must not reveal correct answers before `Release answers`.
- Excel import: enforce 5 MB limit, row limit, `.xlsx` only, macro rejection, Apache POI zip-bomb protection, no formula evaluation and no question content in logs.
- Export and review contain student information and are teacher-only.
- Never trust client-provided score, `isCorrect` or derived counts.

---

# 12. End-to-end workflows

| Flow | Steps |
|---|---|
| F1 Create & assign | New Assignment → DRAFT → Questions (manual/import) → Target → Schedule → Review & Assign → readiness → PUBLISHED |
| F2 Import | Download template → fill → upload → preview → fix/re-upload or import valid rows |
| F3 Draft editing | Create/edit/delete/reorder questions → incomplete state → publish blocked until all Ready |
| F4 Monitoring | Detail → Overview/Recipients; Results appears after Phase 6 |
| F5 Change due date | Change due date → show Late-label recalculation warning |
| F6 Past due | `PAST_DUE` → still accepts work → late submissions labeled Late |
| F7 Review attempt | Results → View attempt → questions in fixed position order → previous/next |
| F8 Finalize unfinished | Results → Finalize unfinished → server grades stored answers |
| F9 Release answers | Detail → Release answers → submitted students can see answer + explanation |
| F10 Statistics/export | Statistics → tables/charts as applicable → export `.xlsx` |
| F11 Archive | Hide from default list, block new starts, preserve data |

---

# 13. Phase 6 data contract

## 13.1 Attempt

- Each Attempt belongs to exactly one Assignment or Activity.
- One Attempt per Assignment/student is enforced by a unique partial index.
- Fields include student, status, timestamps, question count, answered/correct counts, score, and duration.
- Do not store `is_late`; derive it from Assignment due date.

## 13.2 AttemptQuestion / Answer

Because AssignmentQuestions are locked after the first Attempt, AttemptQuestion can reference the original AssignmentQuestion.

- AttemptQuestion preserves the fixed question set and position.
- Answer stores `raw_response`, normalized value, server-computed `is_correct` and answer time.
- Unanswered questions have an AttemptQuestion without an Answer row.

---

# 14. UI conventions

Assignment UI follows the same architecture as Activity UI but must reflect the Assignment domain.

## 14.1 Teacher information hierarchy

```text
Breadcrumb
Page title + lifecycle / schedule state
Primary action
Brief description

Overview
Questions
Recipients
Progress shell
```

Do not mix Activity configuration concepts such as QuestionBank distribution into Assignment screens.

## 14.2 Assignment editor

Use a readable main column and flat sections:

```text
Basics
Questions
Target
Schedule & settings
Review & Assign
```

Use spacing and dividers before cards. Do not make every form section a rounded card.

## 14.3 Questions

Provide two clear paths:

```text
Create question
Import from Excel
```

Excel import is a three-step flow:

```text
1. Upload
2. Preview validation
3. Confirm import
```

The preview must make row number, field/column, error code/message, valid rows and invalid rows easy to scan.

## 14.4 Excel template visual rules

The workbook must be easy for a teacher to follow without reading backend documentation.

- `Questions` is the data-entry sheet.
- `Examples` contains exactly five reference examples and must not be imported.
- `Instructions` explains the rules in plain English.
- Use English machine-readable headers.
- Use dropdown validation for `type` and `difficulty`.
- Freeze the header row.
- Wrap long text cells.
- Keep example rows visually distinct but restrained.

---

# 15. Display normalization

- Use the fixed application timezone `Asia/Ho_Chi_Minh` on backend/Jackson.
- Display teacher-facing time consistently as GMT+7.
- Use one score-formatting helper across Results/Review/Statistics/export.
- Use glossary vocabulary: `Assignment`, `Attempt`, `Recipient`, `Schedule state`, `Late`, `Overdue`, `Timed out`, `Release answers`.

---

# 16. Excel: template, import and export

## 16.1 Official template

Endpoint:

```text
GET /v1/assignments/question-import-template
```

Generated at runtime from the `QuestionType` and `Difficulty` enums using Apache POI.

### Sheets

| Sheet | Purpose |
|---|---|
| `Questions` | Teacher data-entry sheet. Row 1 is the fixed machine-readable English header. |
| `Examples` | Five examples, one per question type. Reference only; never imported. |
| `Instructions` | Human-readable rules, limits, import steps and template version. |

### `Questions` columns

| Column | Required | Rule |
|---|---|---|
| `type` | Yes | `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `FILL_IN_BLANK`, `TYPE_ANSWER` |
| `content` | Yes | ≤ 2000 chars; `FILL_IN_BLANK` contains exactly one `____` |
| `option_a` … `option_f` | For choice types | Continuous A→F; at least 2 non-empty options; forbidden for the other types |
| `correct` | Yes | `SINGLE_CHOICE`: one letter; `MULTIPLE_CHOICE`: comma-separated letters; `TRUE_FALSE`: TRUE/FALSE; text-answer types: answers separated by `|` |
| `explanation` | No | ≤ 2000 chars |
| `difficulty` | No | `EASY`, `MEDIUM`, `HARD`; blank defaults to EASY |

### Example data

```text
SINGLE_CHOICE   What is the past tense of "go"?     go | went | gone | goes       correct=B
MULTIPLE_CHOICE Which are programming languages?    Java | HTML | Python | CSS    correct=A,C
TRUE_FALSE      The Earth orbits the Sun.                                       correct=TRUE
FILL_IN_BLANK   Yesterday I ____ to school.                                     correct=went|did go
TYPE_ANSWER     What is the largest planet?                                    correct=Jupiter
```

### Import rules

- `.xlsx` only, ≤ 5 MB.
- Header matching is case-insensitive, whitespace-tolerant and independent of column order.
- Entirely blank rows are ignored.
- Maximum data rows are limited by the Assignment question limit.
- Use `DataFormatter`; do not evaluate formulas.
- Cell errors such as `#REF!` become row errors.
- Validation uses `QuestionContentValidator`.
- Each error contains `{row, column, code, message}`.
- Warnings do not block commit; examples include `DUPLICATE_CONTENT` and `EXPLANATION_MISSING`.
- Preview never writes to the DB.
- Commit writes only valid rows in one transaction and appends them in file order.
- Excel import is text-only; images/audio are added manually later.

## 16.2 Stable import error codes

```text
TYPE_INVALID
CONTENT_REQUIRED
CONTENT_TOO_LONG
OPTIONS_TOO_FEW
OPTION_GAP
OPTIONS_NOT_ALLOWED
CORRECT_REQUIRED
CORRECT_INVALID_FORMAT
CORRECT_REFERS_MISSING_OPTION
SINGLE_CHOICE_MULTIPLE_CORRECT
TF_VALUE_INVALID
BLANK_MARKER_MISSING
BLANK_MARKER_MULTIPLE
ANSWER_REQUIRED
DIFFICULTY_INVALID
```

Warnings:

```text
DUPLICATE_CONTENT
EXPLANATION_MISSING
```

## 16.3 Export

Phase 7/10 export is binary `.xlsx`, implemented with Apache POI streaming where appropriate.
Exports must contain consistent score/date formatting and must not expose unauthorized student data.

---

# 17. Representative business-case matrix

| Case | Expected behavior |
|---|---|
| No questions | DRAFT allowed; publish blocked by `NO_QUESTIONS` |
| Incomplete question | DRAFT allowed; publish blocked with position(s) |
| 100 questions | Allowed; 101st is blocked |
| Target with wrong grade/year | `ASSIGNMENT_TARGET_INVALID` |
| `GRADE` with class IDs | `ASSIGNMENT_TARGET_INVALID` |
| Target resolves to zero students | DRAFT allowed; publish blocked by `TARGET_EMPTY` |
| Missing/invalid due date | Publish blocked by schedule validation |
| Time limit expired | Server finalizes `TIMED_OUT` |
| Student starts after due date | Allowed; submission is Late |
| Student working across due date | Continue; submission may become Late |
| Due date changed after submission | Allowed with warning; Late is recalculated |
| Question edited after first Attempt | `ASSIGNMENT_LOCKED` |
| Archive while student is working | Allowed; current Attempt can finish |
| Student joins target after publish | Receives Assignment if still eligible before submission |
| Student becomes inactive after submission | Existing result remains visible |
| Student calls Assignment API | 403 |
| No authentication | 401 |
| Statistics below minimum sample | `Insufficient data`, not fake zeros |
| Assignment and Activity share a topic | Independent; questions are not shared |

---

# 18. Testing plan

Phase 5 must not add another testing debt.

## 18.1 Backend

### Unit

- `QuestionContentValidator`: every question type × valid/invalid combinations.
- `AnswerNormalizer` and `AnswerEvaluator`.
- `AssignmentScheduleService`.
- Target rules.
- Expiry calculation.
- Excel parser: header variations, blank rows, numbers, formulas, cell errors, every error code, limits and Unicode text.

### Integration

- CRUD and Flyway migration.
- Question create/update/delete/reorder.
- Type-change cleanup.
- Import preview without DB writes.
- Import commit transaction.
- Publish success/failure + issues.
- Recipient resolution for `CLASS` and `GRADE`, including dedupe and school year.
- `ASSIGNMENT_LOCKED` behavior.
- `due_at` changes.
- Media cleanup does not remove Assignment media.

### Security

- Student → 403 for every Assignment endpoint.
- Unauthenticated → 401.
- Derived fields not accepted in normal create/update requests.
- Invalid `.xlsx`, macro and zip-bomb protections.
- Export/review restricted to authorized teachers.

## 18.2 Frontend

- TypeScript, ESLint, build.
- Loading/error/empty/validation/success states.
- Dirty guard.
- Server error → field mapping.
- Three-step import flow.
- Responsive and keyboard-accessible tables/forms/import controls.
- No permanent teacher-side mock import.

## 18.3 End-to-end acceptance scenarios

1. Create grade-7 Assignment → import 30 rows with 3 errors → commit 27 → add 3 manual questions → reorder → reload and verify order/content.
2. Select 7A + 7B → preview recipient count → switch to Whole grade → count matches all grade-7 classes in the selected school year.
3. Publish with one incomplete question → blocked with position → fix → publish.
4. Student calls `GET /v1/assignments` → 403.
5. After Phase 6: start before due date, submit after due date → Results shows Late; extend due date → Late may disappear; edit question → locked.
6. Export matches visible data, including blank scores for students with no submission.

---

# 19. Milestones and Definition of Done

## M0

- [ ] Confirm O1–O12 and record ADR 0003.
- [ ] Complete class-member APIs.
- [ ] Test then extract `QuestionContentValidator` + `AnswerNormalizer`.
- [ ] Confirm test DB strategy.
- [ ] Approve `poi-ooxml`.
- [ ] Fix timezone/docs drift.

## M1 — Backend

- [ ] `V18__create_assignments.sql` + entities/repositories.
- [ ] Assignment services, validation, readiness, schedule, recipient resolver.
- [ ] Excel parser + template builder.
- [ ] Controller/DTO/security/error-code updates.
- [ ] Unit/integration/security tests pass.

## M2 — Frontend

- [ ] Assignment list/new/edit/detail.
- [ ] Question authoring + reorder + import.
- [ ] Target + recipient preview.
- [ ] Schedule + Review & Assign.
- [ ] Recipients + progress shell.
- [ ] Shared question editor and real import flow.
- [ ] Teacher sidebar contains Assignments.
- [ ] No teacher mocks.

## Common Definition of Done

```text
[ ] Real backend contract verified; no permanent mock
[ ] Loading / Error / Empty / Validation / Success implemented
[ ] TypeScript / ESLint / test / build pass
[ ] Responsive + keyboard/a11y checked
[ ] No Assignment.activity_id / ActivityAssignment
[ ] No Assignment → QuestionBank reference
[ ] One shared location for validation, normalization, grading, readiness and statistics logic
[ ] api-contract.md, ErrorCode, domain docs and ADR updated together
[ ] Excel template matches this spec exactly
```

---

# 20. Documentation updates required with Phase 5

Update all documentation that still describes the old "Assignment reads QuestionBank" model:

- `ADR 0003`: record C1–C6 and O1–O12.
- `plans/PHASES.md`: remove QuestionBank source-selection language and old target types.
- `domain/domain-model.md`: add Assignment / AssignmentTarget / AssignmentQuestion model.
- `domain/business-rules.md`: move Late/target/locking rules into confirmed business rules.
- `domain/question-model.md`: distinguish Activity question-bank behavior from Assignment-owned questions.
- Phase 4 Activities spec: remove old Assignment → QuestionBank assumptions.
- ADR 0001: document that the old shared-QuestionBank assumption was superseded by ADR 0003.
- `domain/glossary.md`: add Recipient, Schedule state, Late, Overdue, Timed out, Release answers.
- `architecture/api-contract.md`: add Assignment endpoints and binary template/export exceptions.
- `architecture/backend.md`: update migration/package/timezone/ownership assumptions.
- `architecture/frontend.md` and `engineering-rules.md`: remove stale Assignment rules.
- `ui-design/UI_ARCHITECTURE_GUIDELINES.md`: add Assignment UI conventions next to Activity conventions.

---

# 21. Risks

| Risk | Mitigation |
|---|---|
| Missing membership API | Finish M0 before real target testing |
| Wrong answer after question lock | Archive + create a replacement Assignment in MVP |
| Timezone mismatch | Fix server timezone to `Asia/Ho_Chi_Minh`; server is authoritative |
| Multi-class duplicate students | Dedupe by user ID |
| Unfinished attempts | M4 `Finalize unfinished`; keep `IN_PROGRESS` out of final averages |
| Concurrent edit vs Start | Serialize/lock the Assignment row around the race-sensitive operations |
| Due-date edits change Late labels | Explicit UI warning |
| Assignment media cleanup conflicts with Phase 3 | Check both link tables before deleting media |
| Malicious/large Excel | 5 MB limit, row limit, `.xlsx` check, POI zip-bomb protection, no formula evaluation |
| Validator extraction changes Phase 3 behavior | Characterization tests before extraction |
| Old mocks treated as contracts | Deprecate teacher-side mocks and use real APIs |
| Future second teacher | Record single-teacher assumption in ADR 0003; future change point is owner field + scope |
| Student data leakage | Teacher-only API/export/review and minimized logging |
| Two question models drift | Share validator/normalizer/evaluator/enums and cross-model tests |

---

# 22. Quick decision checklist for the project owner

The following decisions are already confirmed: **C1–C6**.

The following remain open until explicitly confirmed:

| ID | Decision to confirm | Default |
|---|---|---|
| O1 | `academic_year` included in target scope | Yes |
| O2 | Start after `due_at` remains allowed | Yes; Late |
| O3 | Time limit still auto-finalizes | Yes |
| O4 | Correct answers require Release answers | Yes |
| O5 | Questions lock after first Attempt | Yes |
| O6 | `Finalize unfinished` in M4 | Yes |
| O7 | No shuffling in Phase 5 | Yes |
| O8 | Nullable `topic_id` | Yes |
| O9 | `.xlsx`, text-only, 5 MB, 100 questions | Yes |
| O10 | `%` + correct/total | Yes |
| O11 | Apache POI + CSS/SVG charts | Yes |
| O12 | Unique name by grade/year/name | Yes |
| P0 | Membership API before Phase 5 | Yes |

---

## Appendix A — Official Excel input format

Use the generated workbook `Assignment_Question_Import_Template.xlsx` as the reference implementation.

The teacher workflow is intentionally simple:

```text
Download template
      ↓
Open Questions sheet
      ↓
Use Examples sheet as reference
      ↓
Fill rows 2–101
      ↓
Save as .xlsx
      ↓
Upload
      ↓
Preview row-level validation
      ↓
Fix or confirm valid rows
```

The `Examples` sheet is intentionally separate from `Questions` so example data cannot be accidentally imported as real questions.

## Appendix B — Excel example rows

| type | content | option_a | option_b | option_c | option_d | correct | explanation | difficulty |
|---|---|---|---|---|---|---|---|---|
| SINGLE_CHOICE | What is the past tense of "go"? | go | went | gone | goes | B | The past tense of "go" is "went". | EASY |
| MULTIPLE_CHOICE | Which of the following are programming languages? | Java | HTML | Python | CSS | A,C | Java and Python are programming languages. | EASY |
| TRUE_FALSE | The Earth orbits the Sun. | | | | | TRUE | The Earth revolves around the Sun. | EASY |
| FILL_IN_BLANK | Yesterday I ____ to school. | | | | | went\|did go | Both accepted answers are valid. | MEDIUM |
| TYPE_ANSWER | What is the largest planet in the Solar System? | | | | | Jupiter | Jupiter is the largest planet in the Solar System. | EASY |
