# Phase 7 — Activity Sessions & Assessment Attempts
Status: **UPDATED PLAN — owner sign-off requested**
Date: 2026-10-08

Phase 7 is split into two independent implementation scopes. **Scope A — Activity Sessions** is implemented first. **Scope B — Assessment Attempts** starts only after Scope A passes its gate.

# Scope A — Activity Sessions

## Domain
- Keep one `Activity` configuration. Practice and Try Hard are modes of the same Activity; do not create separate Activity entities.
- Runtime entity: `ActivitySession`.
- `ActivitySession` stores student, activity, concrete mode, concrete selection strategy, status, timestamps, question count, first-correct count, final-correct count, hint-used count, score and Try Hard lives.
- Status: `IN_PROGRESS`, `COMPLETED`, `GAME_OVER`, `ABANDONED`.
- Do not create a shared polymorphic `Attempt` table.

## Question set and FE flow
- Create `activity_session_questions(session_id, question_id, position)` to freeze the selected set/order.
- Do not persist Activity answer history.
- Start returns the complete selected question set to FE. Do not fetch one question at a time.
- The payload must not contain correct answers, accepted answers or explanations before the runtime flow allows them.
- FE keeps the current session's selected responses for immediate review; BE remains authoritative for correctness, retry, hint, score, timer and lives.

## Start
`POST /v1/activities/{activityId}/sessions`
- Re-check published state, own-grade access and readiness.
- If `BOTH`, require the concrete mode at runtime.
- If multiple strategies exist, require the concrete strategy.
- Abandon an existing open session before starting a new one.
- Select the full question set in one transaction using `ActivityDistributionCalculator`.

## Practice
UI terminology is **Practice**; keep backend enum `LEARNING` in this phase to avoid an unnecessary enum/database migration.
- No timer.
- Immediate server-side correctness feedback.
- Exactly 2 submissions: first answer + 1 retry.
- Wrong first answer: show incorrect + retry; do not reveal the answer.
- Correct retry: `first_correct=false`, `final_correct=true`.
- Wrong retry: reveal correct answer + explanation and resolve.
- `TRUE_FALSE` follows the same generic retry rule. A correct second boolean answer is final-correct.
- Optional hint; hint request records `hint_used`; XP deduction is deferred to Phase 9.
- Student-facing score uses `final_correct_count / total_questions`; retain `first_correct_count` for analytics.
- Review is only the just-finished session, not Attempt History.

Answer: `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/answer`.
Hint: `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/hint`.

## Try Hard
- Same `ActivitySession`, `mode=TRY_HARD`.
- No hint and no retry.
- `deadline_at = served_at + time_limit_seconds` for each question.
- Wrong answer costs one life.
- Timeout counts wrong but costs no life.
- Zero lives after a wrong answer => `GAME_OVER`.
- Timeout alone never causes `GAME_OVER`.
- No whole-Activity timer.

## Activity abandonment
- Activity sessions are not resumable.
- Leaving/starting a new run abandons the previous session.
- Abandoned sessions are excluded from finalized results/analytics/XP.

# Scope B — Assessment Attempts (deferred)
- Runtime entity: `AssessmentAttempt`.
- One official Assignment/Assessment attempt per student.
- Immutable question snapshot and persisted answers/autosave.
- Whole-attempt server timer, submit/timeout, official score and review controlled by `show_answers_after_submit`.
- Structure: `Assignment -> AssessmentAttempt -> AssessmentAttemptQuestion -> Answer`.
- No Activity fields on AssessmentAttempt and no Assignment fields on ActivitySession.

# Existing code/UI impact
## Keep Activity configuration
The current `ActivityService`, `ActivityController`, `ActivityValidationService`, `ActivityReadinessService`, `ActivityDistributionCalculator`, repositories, CRUD, readiness, preview and lifecycle endpoints remain. Scope A adds student runtime endpoints; it does not replace teacher CRUD.

## Teacher Activity UI changes
- Keep one Activity editor and one Activity detail page.
- Change student-facing `Learning` copy to **Practice**.
- Remove the current incorrect wording that says the Activity time limit applies to the whole run.
- Try Hard must say **seconds per question**.
- Explain Practice: no timer, immediate feedback, 1 retry, optional hint.
- Explain Try Hard: per-question timer, lives, no hint, no retry.
- When BOTH is offered, show the two supported modes rather than treating BOTH as a gameplay mode.
- Activity list needs only label/copy updates; no structural refactor.

## Student UI
The repository currently has no completed real Activity runtime; student Activity routes are placeholders. Build a new ActivitySession runner rather than refactoring an existing Attempt runner.
Required: mode selection for BOTH; Practice runner; Try Hard runner; result screen; loading/error/disabled/success states; responsive phone/desktop and keyboard accessibility.

# Scope A API
- `POST /v1/activities/{activityId}/sessions` — create session and return full selected question set.
- `GET /v1/activity-sessions/{sessionId}` — current state without answer leakage.
- `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/answer` — answer and feedback.
- `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/hint` — Practice hint.
- `POST /v1/activity-sessions/{sessionId}/finish` — finish if not auto-completed.
- `GET /v1/activity-sessions/{sessionId}/result` — completed result.

# Database plan
- Do **not** create the old polymorphic `attempts` table.
- Scope A: `activity_sessions`, `activity_session_questions`.
- No Activity `answers` persistence.
- Scope B later: `assessment_attempts`, `assessment_attempt_questions`, `answers`.
- Choose the actual Flyway version from the repository migration directory immediately before implementation; never edit an applied migration.

# Scope A tests
Backend: access/readiness, mode/strategy validation, distribution, full question selection, no answer leakage, Practice first-correct, one retry, final reveal, TRUE_FALSE retry, hint, Try Hard correctness/wrong/timeout/lives/no-retry/no-hint, abandonment, new random session and score aggregates.

Frontend: mode selection, Practice feedback/retry/reveal, TRUE_FALSE retry, hint, Try Hard timer/lives/timeout, result/Practice Again, loading/error/disabled/success, responsive and keyboard accessibility.

# Documentation synchronization required
Update contradictory runtime references in: `.agent/domain/domain-model.md`, `.agent/domain/business-rules.md`, `.agent/domain/question-model.md`, `.agent/domain/glossary.md`, `.agent/architecture/backend.md`, `.agent/architecture/frontend.md`, `.agent/architecture/api-contract.md`, `.agent/ui/screens.md`, `.agent/ui/UI_ARCHITECTURE_GUIDELINES.md`, `.agent/design/spec-status.md`, `.agent/plans/PHASES.md`, `.agent/PROGRESS.md`.

Controlling decisions: ADR 0012, ADR 0015, ADR 0021 and ADR 0022.

# Definition of done — Scope A
- Activity CRUD remains working.
- Teacher UI reflects Practice/Try Hard semantics correctly.
- Student can start a published Activity and receive the full question set.
- Practice: no timer, immediate feedback, one retry, optional hint, final reveal.
- TRUE_FALSE retry works as normal correctness.
- Try Hard: per-question timer, no hint, no retry, lives and timeout behavior.
- Server is authoritative.
- Activity answer history is not persisted.
- Abandoned sessions do not count as finalized results/XP.
- No shared polymorphic Attempt is introduced.
- Backend/frontend validation passes where the environment permits.
- No contradictory Activity Attempt rules remain in active documentation.

**Scope B starts only after Scope A passes this gate.**

---

# Legacy combined spec
The previous combined Attempt specification is retained below for traceability only. It is **not** the implementation contract after this split.

# Phase 7: Attempts and Answers (Spec v1, DRAFT)

Status: **DRAFT, waiting for owner sign-off.** All assumptions in §17 are confirmed or defaulted. Date: 2026-10-07.
Intent: [`../intent/0001-core-platform.md`](../intent/0001-core-platform.md) v1.5. Numbering follows [ADR 0004](../decisions/0004-phase-numbering.md).
Migration baseline: V25. Package convention: `e_learning.server.attempt` (new module), same layering as `assignment`.

> Where this spec and an accepted ADR disagree, the ADR wins. Older specs (Phase 4, Phase 5) use the old phase numbers.

---

# 1. Scope

**In scope**

- Student **Activity runs** (Learning and Try Hard) and **Assignment attempts**.
- Snapshot of the selected questions, answer checking, scoring, autosave, expiry.
- Learning-mode hint, retry and formula sheet (ADR 0014), including the data fields they need.
- Student read APIs (own grade only, ADR 0007) and the student result/review.
- Migrations, error codes, test plan, build order.

**Out of scope (separate documents or later phases)**

| Item | Where |
|---|---|
| Teacher tracking of an Assignment: status list, class average, most-missed questions, Excel/CSV export | Separate spec "Assignment tracking" (written after sign-off of this one) |
| Weak-topic aggregates, `WEAKNESS_PRIORITY` ranking | Phase 8 (until then `WEAKNESS_PRIORITY` behaves as `RANDOM`) |
| XP amounts, hint penalty amount, ranking | Phase 9 (this phase only stores the facts XP needs: `hint_used`, counts) |
| Game templates | Later (OQ-9) |
| Excel import of Assignment questions | Deferred (ADR 0003, OQ-7) |

---

# 2. Rules inherited from accepted decisions

| Rule | Source |
|---|---|
| Activity = repeatable, never expires, no official grade. Assignment = targeted, scheduled, **one attempt**, official score | ADR 0001 |
| Assignment owns its questions (`assignment_questions` → shared `questions`), never reads a QuestionBank | ADR 0003 |
| Late = `submitted_at > due_at`; accepted, labelled, no score change; **derived, not stored** | ADR 0003, Phase 5 §6.3 |
| Completed = submitted; no threshold | ADR 0006 |
| Server clock is authoritative. `expires_at = started_at + time_limit_seconds`. At expiry: auto-submit the saved answers, flag **Timed out**, counts as submitted | ADR 0009, Phase 5 §6.4 |
| After submitting an Assignment the student sees score and correct answers with explanations immediately | ADR 0011 |
| An unfinished Activity run is not resumed; opening the Activity again starts a new random run; an abandoned run is ignored for analytics, XP and results | ADR 0012 (amended) |
| Learning mode: at most 3 answers per question (2 retries), optional hint (XP reduced), per-Topic formula sheet (free), then answer + explanation | ADR 0014 |
| Try Hard: the time limit is per question | ADR 0015 |
| Student sees and practises **published** content of **their own grade** only | ADR 0007 |
| The attempt is a **snapshot** of the questions; never re-selected on refresh, resume or review; later edits never change it | `question-model.md`, Phase 4 §35 |
| Unanswered questions are not wrong but stay in the denominator of the percentage | `business-rules.md` |
| Grading is exact match, no partial credit; normalization happens on the server | `question-model.md` |
| Official score is not XP | `business-rules.md` |

---

# 3. Data model (migrations V26 and V27)

All ids are `BIGSERIAL`/`Long`, timestamps `TIMESTAMP`, like the existing schema.

## 3.1 V26: hint and formula sheet (task N3b, ADR 0014)

| Table | Change |
|---|---|
| `questions` | add `hint VARCHAR(500) NULL` |
| `content_topics` | add `reference_sheet TEXT NULL` |

Content write/read DTOs and the teacher authoring screens gain these two optional fields. No other behaviour changes in V26.

## 3.2 V27: attempts

### `attempts`

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| activity_id | BIGINT NULL FK `activities` | set for an Activity run |
| assignment_id | BIGINT NULL FK `assignments` | set for an Assignment attempt |
| student_id | BIGINT NOT NULL FK `users` | role `STUDENT` |
| mode | VARCHAR(20) NULL | `LEARNING` or `TRY_HARD` for a run; NULL for an Assignment |
| status | VARCHAR(20) NOT NULL | see §4 |
| started_at | TIMESTAMP NOT NULL | server time |
| last_activity_at | TIMESTAMP NOT NULL | for idle abandonment |
| finished_at | TIMESTAMP NULL | |
| expires_at | TIMESTAMP NULL | Assignment whole-attempt limit only; NULL for Activity runs |
| timed_out | BOOLEAN NOT NULL DEFAULT FALSE | the **Timed out** flag of an Assignment attempt (ADR 0009) |
| lives_remaining | INT NULL | Try Hard only |
| total_questions | INT NOT NULL | denominator |
| first_correct_count | INT NOT NULL DEFAULT 0 | answered correctly on the first submission |
| final_correct_count | INT NOT NULL DEFAULT 0 | correct at the end (after retries) |
| score_percent | NUMERIC(5,2) NULL | set when finished (§8) |
| created_at / updated_at | TIMESTAMP | |

Constraints:

- `CHECK ((activity_id IS NULL) <> (assignment_id IS NULL))`: exactly one parent.
- **One attempt per student per Assignment:** `UNIQUE (assignment_id, student_id) WHERE assignment_id IS NOT NULL`. This enforces ADR 0001 in the database.
- **One open run per student per Activity:** `UNIQUE (activity_id, student_id) WHERE status = 'IN_PROGRESS'`.
- Indexes: `(student_id, status)`, `(assignment_id, status)`, `(activity_id, student_id)`.

### `attempt_questions` (the snapshot)

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| attempt_id | BIGINT NOT NULL FK `attempts` ON DELETE CASCADE | |
| position | INT NOT NULL | order shown; unique per attempt |
| deadline_at | TIMESTAMP NULL | Try Hard only: when this question must be answered by (ADR 0015) |
| question_id | BIGINT NULL FK `questions` ON DELETE SET NULL | origin, for statistics |
| question_bank_id | BIGINT NULL | snapshot of the origin bank (Activity only) |
| topic_id | BIGINT NULL | snapshot of the bank's Topic (Activity only); keeps weak-topic analytics valid if the question is later deleted |
| snapshot | JSONB NOT NULL | frozen question: type, content, explanation, hint, options (key, content, isCorrect, **display order**), accepted answers, matching mode, media references |

Option order: **Activity** options are shuffled once per attempt with a deterministic seed `attemptId + questionId` and the order is stored in `snapshot`; **Assignment** options keep the teacher's order (Phase 5 has no shuffling).

### `answers` (one row per attempt question, created on the first submission)

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| attempt_question_id | BIGINT NOT NULL UNIQUE FK ON DELETE CASCADE | |
| first_response | JSONB NULL | selected option keys, boolean, or text; NULL for a timeout or a hint-only row |
| final_response | JSONB NULL | latest response |
| submission_count | INT NOT NULL DEFAULT 0 | 1 for Try Hard and Assignment; up to 3 in Learning |
| first_correct | BOOLEAN NOT NULL DEFAULT FALSE | used by weak-topic analytics (ADR 0014 A3) |
| final_correct | BOOLEAN NOT NULL DEFAULT FALSE | |
| hint_used | BOOLEAN NOT NULL DEFAULT FALSE | set by the hint endpoint, even before any answer |
| revealed | BOOLEAN NOT NULL DEFAULT FALSE | the retries were used up and the answer was shown (Learning) |
| timed_out | BOOLEAN NOT NULL DEFAULT FALSE | Try Hard: the question deadline passed without an answer (counts as wrong, costs no life) |
| answered_at | TIMESTAMP NULL | time of the last submission or timeout |

`hint_used` can be set before an answer exists, so the `answers` row is created by the first of: hint request, first submission, or a timeout.

---

# 4. State machines

## 4.1 Activity run

```text
            start
              ↓
        IN_PROGRESS ──finish (all questions resolved)──→ COMPLETED
              │ ──lives = 0 (Try Hard)──────────────────→ GAME_OVER
              │ ──new run started / idle too long───────→ ABANDONED
```

- `COMPLETED` and `GAME_OVER` are **finished** runs: they produce a result and count for analytics and XP.
- `ABANDONED` is ignored everywhere (ADR 0012). It is set when the student starts a new run of the same Activity while one is `IN_PROGRESS`, or when `last_activity_at` is older than the idle limit (§9).
- A finished run is immutable.

## 4.2 Assignment attempt

```text
            start (first open)
              ↓
        IN_PROGRESS ──submit──────────────→ SUBMITTED
              │ ──expires_at reached──────→ SUBMITTED  (timed_out = true)
```

- **Late** is not a status: `late ⇔ finished_at > assignment.due_at` (derived).
- **Overdue** (student-facing, derived): no attempt `SUBMITTED` and `now > due_at`.
- Student-facing status for an Assignment, derived: `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, `SUBMITTED_LATE`, `OVERDUE`; plus the `timed_out` flag.
- Reopening an `IN_PROGRESS` attempt resumes it with the same snapshot; the clock never stops.

---

# 5. Starting an attempt

## 5.1 Start an Activity run

1. The Activity is `PUBLISHED` and its Unit is `PUBLISHED`, and the Unit's grade equals the grade of one of the student's ACTIVE class memberships (ADR 0007). Otherwise `ACTIVITY_NOT_AVAILABLE`.
2. **Readiness is checked again:** `ActivityReadinessService.validateForPublish` must report ready (banks published, enough complete questions per bank, valid allocation). Otherwise `409 ACTIVITY_NOT_READY` and nothing is started. Content can change after publishing, so the publish-time check is not enough.
3. Mode: if `activity.mode = BOTH` the request must carry `LEARNING` or `TRY_HARD`; otherwise the request must omit it or match. Else `ATTEMPT_MODE_REQUIRED` / `ATTEMPT_MODE_NOT_ALLOWED`.
4. Any `IN_PROGRESS` run of this student for this Activity is set to `ABANDONED`.
5. Select questions (§5.3) and write `attempts`, `attempt_questions` in **one transaction**.
6. Try Hard: `lives_remaining = activity.lives`; the first question gets `deadline_at = now + time_limit_seconds` (seconds **per question**, ADR 0015). Learning: both NULL.

## 5.2 Start (or resume) an Assignment attempt

1. The Assignment is `PUBLISHED`, `now >= start_at` (if set), and **targets the student** (§14). Otherwise `ASSIGNMENT_NOT_OPEN` or `ASSIGNMENT_NOT_ASSIGNED_TO_STUDENT`.
2. No upper bound from `due_at`: late starts are allowed.
3. If an `IN_PROGRESS` attempt exists: return it (resume). If a `SUBMITTED` attempt exists: `ASSIGNMENT_ALREADY_ATTEMPTED`.
4. Otherwise snapshot **all** `assignment_questions` in the teacher's order, in one transaction. `expires_at` is set when `time_limit_seconds` is present.
5. The database unique constraint (§3.2) makes a double-click safe: the second request resumes the first.

## 5.3 Selecting questions for an Activity run

1. Candidate questions: complete questions (`questions.is_complete = true`) of the Activity's banks that are not archived.
2. Quotas per bank from the existing `ActivityDistributionCalculator` (`EQUAL`, `PERCENTAGE`, `FIXED_COUNT`) for `total_questions`.
3. Strategy `RANDOM`: random subset per bank, then shuffle the whole set. `WEAKNESS_PRIORITY` falls back to `RANDOM` until Phase 8.
4. Readiness (§5.1) guarantees every bank holds at least its quota of complete questions, so selection takes **exactly** the quota from each bank and `total_questions` is the configured number. There are no partial runs; a bank that is too small blocks the start (`ACTIVITY_NOT_READY`).
5. Write the snapshot (§3.2). No re-selection ever happens for this attempt.

---

# 6. Answer checking (server only)

| Question type | Response from the client | Correct when |
|---|---|---|
| `SINGLE_CHOICE` | one option key | equals the correct option |
| `MULTIPLE_CHOICE` | set of option keys | equals the set of correct options exactly (no partial credit) |
| `TRUE_FALSE` | boolean | equals the stored boolean answer |
| `FILL_IN_BLANK`, `TYPE_ANSWER` | text | normalized text equals one accepted answer (`normalized_value`, honouring the question's `matching_mode`) |

The server compares against the **snapshot**, never against the current `Question`. The client never receives `isCorrect`, accepted answers, `explanation` or `hint` in the attempt payload, except as allowed by §7 and §10.

---

# 7. Flows by kind

## 7.1 Learning (Activity run, ADR 0014)

Per question, the server tracks `submission_count` (max **3** = first answer + 2 retries).

| Step | Response |
|---|---|
| Student submits a **correct** answer | `result = CORRECT`; `first_correct` set if it is the first submission; the question is resolved; if wrong earlier, the answer is still recorded `final_correct = true` |
| Student submits a **wrong** answer and `submission_count < 3` | `result = INCORRECT`, `retriesLeft = 3 - submission_count`, no answer shown |
| Wrong answer and `submission_count = 3` | `result = INCORRECT`, `revealed = true`: response includes the correct answer and `explanation`; the question is resolved with `final_correct = false` |
| Student asks for a hint | allowed only if the snapshot has a hint and the question is unresolved; returns the hint; sets `hint_used = true` (idempotent) |
| Student opens the formula sheet | `GET` of the Topic sheet; nothing is recorded, free |

After a question is resolved the student presses **Continue**; this is a client-side step. The next question is already in the snapshot. A resolved question cannot be answered again (`QUESTION_ALREADY_RESOLVED`).
When every question is resolved the client calls `finish` (or the server finishes automatically on the last resolution).

## 7.2 Try Hard (Activity run)

- One submission per question. No hints, no retry.
- Wrong answer: `lives_remaining -= 1`. At 0: status `GAME_OVER`, the remaining questions stay unanswered.
- Response after each answer: `result` (`CORRECT`, `INCORRECT` or `TIMEOUT`), `livesRemaining`, and the next question with its `deadlineAt`. The full review is available on the result screen after the run ends.
- **Time is per question** (ADR 0015). The question gets `deadline_at` when it is served. If the answer does not arrive by `deadline_at` + grace, the question is a **timeout**: it counts as wrong but **costs no life**, and the next question is served with a fresh deadline. Only a wrong answer costs a life; at 0 lives the run is `GAME_OVER`.

## 7.3 Assignment

- **No feedback during the attempt.** Each answer is an **autosave**: `PUT` the current response; the latest one wins until submit. Changing an answer is allowed until submit. No hints, no retry.
- `submit` (or time-out) finalizes the attempt, computes the score and exposes the review (ADR 0011).

---

# 8. Scoring

| Case | `score_percent` |
|---|---|
| Assignment attempt | `final_correct_count / total_questions × 100`, rounded to 2 decimals, half up. Unanswered questions are not wrong but stay in `total_questions` |
| Activity run (Learning, Try Hard, Game Over) | `first_correct_count / total_questions × 100` (the honest first-try measure, §17 A-3). The result screen also shows `final_correct_count` |

- Activity results are practice results, never an official grade.
- `GAME_OVER` runs are scored from the answers given (a timeout counts as wrong); unanswered questions stay in the denominator.
- Official Assignment score and XP are separate concepts.

---

# 9. Time, expiry and abandonment

- **Server clock only.** The UI timer is a display.
- **Assignment, whole attempt:** `expires_at` (ADR 0009). Every request first checks it; if passed, the attempt is finalized (`SUBMITTED` + `timed_out`) and an answer request gets `ATTEMPT_EXPIRED`, a read gets the finished state.
- **Try Hard, per question:** `deadline_at` on the current question (ADR 0015). Every request first checks it; an expired question is processed as a **timeout** (§7.2) before the request continues. A student who stays away is handled by idle abandonment below, not by chained timeouts.
- **Sweep:** a scheduled job every minute finalizes expired Assignment attempts nobody touched, so the teacher's tracking is correct without a student request.
- **Grace:** an answer that arrives up to 5 seconds after `expires_at` or `deadline_at` is still accepted, to absorb network delay (§17 A-5).
- **Idle abandonment (Activity run only):** the same sweep sets `ABANDONED` for `IN_PROGRESS` runs with `last_activity_at` older than 120 minutes (§17 A-6). Assignments are never abandoned.
- `last_activity_at` is updated by every answer, hint and read of the attempt.

---

# 10. API

All endpoints require role `STUDENT` unless noted. The attempt must belong to the current user; another student's attempt answers `404`.
Responses use the same envelope and error format as the existing controllers (`ErrorCode`).

## 10.1 Student reading (ADR 0007: own grade, published only)

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/student/units` | Published Units of the student's grade(s) (from ACTIVE class memberships) |
| GET | `/v1/student/units/{unitId}` | Unit with Sections, Topics (flag `hasReferenceSheet`) and published Activities, each with `startable` (the readiness check of §5.1) so the UI can show "not available yet" |
| GET | `/v1/student/topics/{topicId}/reference-sheet` | Formula sheet text |
| GET | `/v1/student/assignments` | Assignments that target the student, with the derived status (§4.2) and `dueAt`, `timeLimitSeconds` |
| GET | `/v1/student/assignments/{assignmentId}` | One Assignment (no questions) |

## 10.2 Attempts

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/activities/{activityId}/attempts` | Start an Activity run (body: optional `mode`). `201` |
| POST | `/v1/assignments/{assignmentId}/attempts` | Start or resume the Assignment attempt. `201` new, `200` resumed |
| GET | `/v1/attempts/{attemptId}` | Current state: status, `expiresAt`, `livesRemaining`, questions in order **without** answers/explanations/hints, saved responses, per-question state (Learning: `retriesLeft`, `resolved`, `hintAvailable`; Try Hard: current question `deadlineAt`) |
| POST | `/v1/attempts/{attemptId}/questions/{attemptQuestionId}/answer` | Activity run: submit; returns §7 feedback. |
| PUT | `/v1/attempts/{attemptId}/questions/{attemptQuestionId}/answer` | Assignment: autosave the response; returns `{ saved: true, savedAt }` |
| POST | `/v1/attempts/{attemptId}/questions/{attemptQuestionId}/hint` | Learning only; returns the hint, records `hint_used` |
| POST | `/v1/attempts/{attemptId}/finish` | Assignment: submit. Activity run: finish when all questions are resolved |
| GET | `/v1/attempts/{attemptId}/result` | After the attempt is finished: score, counts, flags (`late`, `timedOut`), and the **review** (each question, the student's response, the correct answer, the explanation). Not available while `IN_PROGRESS` (`ATTEMPT_NOT_FINISHED`) |
| GET | `/v1/student/attempts` | The student's finished attempts (filters: `activityId`, `assignmentId`) |

Teacher endpoints that read attempts (tracking, review of one student, export) are specified in the separate tracking spec.

---

# 11. Errors

New codes (HTTP status in brackets). Names marked ★ were already announced in Phase 5 §10.6.

| Code | When |
|---|---|
| `ATTEMPT_NOT_FOUND` (404) | unknown id or not the student's attempt |
| `ACTIVITY_NOT_AVAILABLE` (404) | not published, Unit not published, or not the student's grade |
| `ATTEMPT_MODE_REQUIRED` / `ATTEMPT_MODE_NOT_ALLOWED` (400) | mode rules in §5.1 |
| `ACTIVITY_NOT_READY` (409, existing code) | the Activity no longer passes readiness (for example a bank lost questions after publishing) |
| `ASSIGNMENT_NOT_OPEN` ★ (409) | not published or before `start_at` |
| `ASSIGNMENT_NOT_ASSIGNED_TO_STUDENT` ★ (403) | the student is not a target |
| `ASSIGNMENT_ALREADY_ATTEMPTED` ★ (409) | a `SUBMITTED` attempt exists |
| `ATTEMPT_FINISHED` (409) | answering or hinting a finished attempt |
| `ATTEMPT_EXPIRED` (409) | answer after `expires_at` plus grace |
| `ATTEMPT_NOT_FINISHED` (409) | result requested too early |
| `QUESTION_ALREADY_RESOLVED` (409) | Learning: answering a resolved question |
| `HINT_NOT_AVAILABLE` (409) | no hint on the question, wrong mode, or already resolved |
| `INVALID_ANSWER_FORMAT` (400) | response does not fit the question type |

`ANSWERS_NOT_RELEASED` from Phase 5 is **not** created (ADR 0011).

---

# 12. Security and access

- Role `STUDENT` only; locked students cannot log in (Phase 6).
- Student content visibility = published content of the grade(s) of the student's ACTIVE class memberships. A student in no ACTIVE class sees nothing.
- The attempt payload never contains `isCorrect`, accepted answers, `explanation` or `hint` until §7 allows it. The hint comes only from the hint endpoint so the server records `hint_used`.
- Correct answers are returned only (a) in a Learning feedback with `revealed = true`, or (b) in `/result` of a finished attempt.
- All checks use the snapshot; a student cannot influence the score through client-sent values.

---

# 13. Editing impact on existing modules

- **Assignment:** once an attempt exists, questions, options, time limit and grade are locked (`ASSIGNMENT_LOCKED`, Phase 5 §6.5). This phase adds the check.
- **Activity / QuestionBank / Question:** editing or archiving never changes existing attempts (snapshot). A teacher edit that makes a published Activity not ready (unpublished bank, too few complete questions) blocks new runs with `ACTIVITY_NOT_READY`; the teacher screens should warn about this.
- **Assignment readiness (task N3)** must exist before students can start: publishing requires READY (Phase 5 §10.7).

---

# 14. Who an Assignment targets

A student is a target when the Assignment is `PUBLISHED` and:

- `CLASS` targets: the student is an ACTIVE member of one of the target classes; or
- `GRADE` target: the student is an ACTIVE member of a class whose grade level equals `assignments.grade_level` **and** whose academic year equals `assignments.academic_year` (both are required fields).

A class member marked inactive or a locked student is not a target.

---

# 15. Test plan (Given / When / Then)

Each rule has at least one automated test. IDs are used in `design/spec-status.md`.

| ID | Rule | Test |
|---|---|---|
| T-01 | One Assignment attempt | Given a SUBMITTED attempt, when the student starts again, then `ASSIGNMENT_ALREADY_ATTEMPTED` |
| T-02 | Resume | Given an IN_PROGRESS attempt, when the student starts again, then the same attempt and same question order are returned |
| T-03 | Double start | Given two simultaneous start requests, then exactly one attempt row exists |
| T-04 | Snapshot | Given an attempt, when the teacher edits or archives a question, then the attempt content is unchanged |
| T-05 | Late | Given `due_at` 21:00, started 20:58, submitted 21:05, then SUBMITTED, late, score unchanged |
| T-06 | Late start | Given `now > due_at`, when the student starts, then the attempt is created |
| T-07 | Time-out | Given a 30-minute limit and no submit, when 30 minutes + grace pass, then SUBMITTED with `timed_out = true` and the saved answers scored |
| T-08 | Denominator | Given 10 questions and 6 correct, 1 wrong, 3 unanswered, then score 60.00 |
| T-09 | Visibility | Given a student of Grade 7, then Grade 6 Units and Activities are not returned and cannot be started |
| T-10 | Isolation | Given another student's attempt id, then `404` |
| T-11 | No leakage | Given an IN_PROGRESS attempt, then the GET payload has no correct answers, explanation or hint |
| T-12 | Review after submit | Given a SUBMITTED attempt, then `/result` returns score and correct answers (ADR 0011) |
| T-13 | Learning retries | Given a wrong answer, then 2 retries are allowed; at the 3rd wrong submission the answer and explanation are returned and the question is resolved |
| T-14 | First-try analytics | Given wrong then correct, then `first_correct = false`, `final_correct = true` |
| T-15 | Hint | Given a question with a hint, when requested, then `hint_used = true` and the hint is returned; a question without a hint returns `HINT_NOT_AVAILABLE` |
| T-16 | Try Hard lives | Given 3 lives and 3 wrong answers, then `GAME_OVER`; score = correct / total |
| T-17 | Try Hard has no hints or retry | Then `HINT_NOT_AVAILABLE` and a second submission gives `QUESTION_ALREADY_RESOLVED` |
| T-18 | Abandonment | Given an IN_PROGRESS run, when the student starts a new run, then the old one is ABANDONED and excluded from results |
| T-19 | New random run | Given two runs of the same Activity, then both have `total_questions` questions drawn independently |
| T-20 | Distribution | Given `PERCENTAGE` 60/40 and 10 questions, then 6 and 4 come from the two banks |
| T-21 | Answer checking | Each type in §6, including multiple choice (exact set) and text normalization |
| T-22 | Autosave | Given repeated `PUT` answers, then the last one is scored at submit |
| T-23 | Targeting | `CLASS` and `GRADE` targets as in §14; non-targeted student gets `ASSIGNMENT_NOT_ASSIGNED_TO_STUDENT` |
| T-24 | Option order | Activity options keep the same order on reload; Assignment options keep the teacher's order |
| T-25 | Try Hard question timer | Given 30 seconds per question and no answer by 30 s + grace, then the question counts wrong, **no life is lost**, and the next question has a new `deadline_at` |
| T-26 | Timeouts never end a run by lives | Given only timeouts, then the run reaches `COMPLETED`, not `GAME_OVER`; a wrong answer still costs a life |
| T-27 | Readiness at start | Given a published Activity whose bank lost questions below its quota, when the student starts, then `ACTIVITY_NOT_READY` and no attempt is created |

Frontend tests: runner state (retry/hint/continue), timer display driven by server `expiresAt`, student pages with real API data (no `src/mock`).

---

# 16. Build order (vertical slices, each with its tests)

| Slice | Content | Done when |
|---|---|---|
| S0 | Quality gate (N1) and Phase 5 readiness (N3) | CI green; Assignment publish requires READY |
| S1 | **V26** hint + formula sheet: migration, content DTOs, teacher authoring UI | Teacher can author a hint and a Topic sheet; tests |
| S2 | **V27** attempts schema; Assignment attempt start/resume/answer/submit/expiry; `/result` | T-01…T-08, T-11, T-12, T-22, T-23 |
| S3 | Activity runs: selection, Learning flow, hint, Try Hard (per-question timer), abandonment | T-13…T-21, T-24…T-27 |
| S4 | Student read APIs (§10.1) | T-09, T-10 |
| S5 | Student screens: Units, Activity runner, Assignment runner, result; remove `src/mock` | Responsive on phone and computer (intent §6a) |

---

# 17. Assumptions to confirm (human gate)

The spec uses these defaults. Each can be changed by a short ADR.

| ID | Assumption | Status |
|---|---|---|
| A-1 | At most 3 answers per question (first answer + 2 retries) | **Confirmed by the owner 2026-10-07** |
| A-2 | The Try Hard time limit is **per question** | **Confirmed 2026-10-07** (ADR 0015) |
| A-2b | A Try Hard question timeout counts as wrong and costs **no** life | **Confirmed 2026-10-07** |
| A-3 | Activity run score = first-try correct / total; final-correct shown beside it | **Confirmed 2026-10-07** |
| A-4 | Try Hard shows only correct/incorrect and lives after each answer; explanations come in the final review | **Confirmed 2026-10-07** |
| A-5 | 5-second grace after `expires_at` / `deadline_at` | Default, change on request |
| A-6 | An Activity run idle for 120 minutes is ABANDONED | Default, change on request |
| A-7 | If a bank holds fewer questions than its quota, the run is **blocked**; an Activity must pass readiness to be published and again at start | **Confirmed 2026-10-07** (changed from "run with what exists") |
| A-8 | Opening the formula sheet is free and not recorded | Default, change on request |

---

# 18. Later

Weak-topic aggregation and `WEAKNESS_PRIORITY` (Phase 8), XP and hint penalty (Phase 9), teacher tracking and export (next spec), game templates (OQ-9), question shuffling for Assignments, Excel import.
