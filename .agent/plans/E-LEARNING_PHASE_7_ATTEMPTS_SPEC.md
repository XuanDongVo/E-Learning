# Phase 7 — Activity Sessions & Assessment Attempts
Status: **Scope A present in code; Scope B deferred. Question Engine target is proposed under ADR 0023.**
Date: 2026-10-12

Phase 7 is split into two independent scopes. **Scope A — ActivitySession** is present in the audited codebase but still requires a configured validation run. **Scope B — AssessmentAttempt** remains deferred and is not implemented. ActivitySession and AssessmentAttempt must never be represented by one polymorphic Attempt table.

> **Current authority:** accepted ADRs 0021 and 0022 plus `.agent/architecture/api-contract.md` govern current runtime routes and Activity behavior. The old combined draft at the end of the prior version of this file used the superseded polymorphic `/v1/attempts/{id}` contract and old retry behavior; that legacy section is removed below. Do not restore its routes or requirements.

# Scope A — Activity Sessions

## Domain
- Keep one `Activity` configuration. Practice and Try Hard are modes of the same Activity; do not create separate Activity entities.
- Runtime entity: `ActivitySession`.
- `ActivitySession` stores student, activity, concrete mode, concrete selection strategy, status, timestamps, question count, first-correct count, final-correct count, hint-used count, score and Try Hard lives.
- Status: `IN_PROGRESS`, `COMPLETED`, `GAME_OVER`, `ABANDONED`.
- Do not create a shared polymorphic `Attempt` table.

## Question set and FE flow
- `activity_session_questions(session_id, question_id, position)` freezes selected Question IDs/order only. The audited V28 runtime rows still reference mutable Question content; a durable full-content snapshot is not implemented and is only proposed under ADR 0023 (D4 pending).
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

# Historical material removed from the active plan

The former combined draft below this point described a single polymorphic `attempts` model for both Activity and Assignment, `/v1/attempts/{attemptId}` endpoints, Assignment autosave and response-history behavior in Activity, a three-submission Learning rule, and a Topic formula sheet endpoint. Those requirements conflict with accepted ADRs 0016, 0021 and 0022 and the current ActivitySession API contract, so they are not kept as executable requirements here. Git history retains the prior text for traceability.

For current API paths and security rules, read `.agent/architecture/api-contract.md`. Scope B AssessmentAttempt details remain deferred until Scope A validation passes and a new explicit owner-approved scope is created.
