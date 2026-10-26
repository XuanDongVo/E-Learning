# Current Implementation State

**Audit date:** 2026-10-26  
**Branch:** `feature/student-assignment-attempt`  
**Scope:** current source state after Sprint 0 contract implementation. This file records implementation truth; no runtime/build/browser verification was executed by this change.

## 1. Authority model

1. Accepted ADRs = approved product/architecture decisions.
2. `.agent/CURRENT_STATE.md` = current implementation state on this branch.
3. Active phase/spec/architecture documents = intended implementation contract.
4. `PROGRESS.md` = concise work log and verification record.
5. Historical audits/plans = traceability only.
6. Code = final authority when documentation and code disagree.

## 2. Repository baseline

- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: Spring Boot + Java 21 + JPA + Flyway + PostgreSQL.
- V43 AssessmentAttempt schema was reported applied by the project owner; V43 must remain immutable.
- `assessmentattempt` backend package now contains V43 entities/repositories plus Sprint 0 contract DTOs and snapshot contract. Runtime orchestration/controllers are still not implemented.

## 3. Phase status

| Area | Current state | Classification |
|---|---|---|
| Phase 0–2 | Foundation, auth/users and classes exist | Implemented baseline |
| Phase 3 Content | Grade → Unit → Section → Topic → QuestionBank → Question CRUD/preview/completeness/hint | Implemented baseline; semantic Question Engine migration still partial |
| Phase 4 Activity | Unit-scoped Activity, banks/distribution, modes, strategies, readiness, preview and lifecycle | Implemented baseline |
| Phase 5 Assignment | Assignment, Grade ownership, class target snapshots, schedule, whole-attempt time limit, answer/score display settings, Composition | Implemented authoring baseline; formal runtime attempt/scoring not implemented |
| Phase 6 Student Management | Student/class/profile management | Done |
| Phase 7 Scope A | ActivitySession runtime exists | Implemented, but Question Engine integration/verification incomplete |
| Phase 7 Scope B | Assignment authoring + V43 runtime schema + Sprint 0 contract | **Sprint 0 DONE; runtime S1+ not implemented** |

## 4. Sprint 0 — Contract Freeze / Foundation

### Backend completed

- Added AssessmentAttempt-specific stable error codes to `ErrorCode.java`:
  - `ASSESSMENT_ATTEMPT_NOT_FOUND`
  - `ASSESSMENT_ATTEMPT_ACCESS_DENIED`
  - `ASSESSMENT_ATTEMPT_SESSION_CONFLICT`
  - `ASSESSMENT_ATTEMPT_SESSION_LOST`
  - `ASSESSMENT_ATTEMPT_TIME_UP`
  - `ASSESSMENT_ATTEMPT_ALREADY_SUBMITTED`
  - `ASSESSMENT_ATTEMPT_ALREADY_TIMED_OUT`
  - `ASSESSMENT_ATTEMPT_FINALIZING`
  - `ASSESSMENT_ATTEMPT_VERSION_CONFLICT`
  - `ASSESSMENT_ATTEMPT_INVALID_ANSWER`
  - `ASSESSMENT_ATTEMPT_SAVE_FAILED`
  - `ASSESSMENT_ATTEMPT_INVALID_STATE`
  - `ASSESSMENT_ATTEMPT_REQUEST_REPLAY`
- Added runtime DTOs for safe runtime projection, question projection, incremental answer save, session claim/heartbeat, submit, result and visibility-aware result questions.
- Expanded `SaveAttemptAnswerRequest` to include `attemptQuestionId`, `expectedRevision`, `activeSessionId` and `requestId`.
- Added `AssessmentAttemptSnapshotContract` with snapshot version 1 and stable top-level document/settings keys.
- Restricted runtime DTO comments/contracts explicitly state that active student payloads must not expose answer keys, accepted answers, grading internals or hidden normalized values.

### Frontend completed

- Added `assessmentAttempt.types.ts` containing runtime DTOs, answer payload, save/session/result contracts, error-code union and player states.
- Added `assessmentAttemptApi.ts` as the dedicated HTTP boundary. It is contract-only; no runtime endpoints are claimed to exist yet.
- Added `assessmentAttemptStateMachine.ts` with explicit player states: `LOADING`, `INTRO`, `STARTING`, `ACTIVE`, `SAVING`, `SESSION_CONFLICT`, `SUBMITTING`, `FINALIZING`, `TIME_UP`, `RESULT`, `ERROR`.
- Added `student/assignment-attempt.json` for both `en` and `vi` and registered the namespace in `client-e-learning/src/i18n/request.ts`.
- Extended both English and Vietnamese `error.json` catalogs with the new AssessmentAttempt backend codes.

### Sprint 0 intentionally NOT implemented

- No controller endpoints.
- No `startOrResume` service implementation.
- No snapshot assembly.
- No active-class authorization implementation for Assignment Attempt.
- No autosave persistence/idempotency implementation.
- No session heartbeat/takeover implementation.
- No grading/submit/timeout implementation.
- No student Attempt UI screen yet.
- No timer/autosave/submit/result components yet.

## 5. Assignment implementation truth

Implemented authoring remains unchanged: Composition owns order, AssignmentQuestion has no product-order position, whole-attempt time limit, target snapshots, independent score/answer visibility, server publish readiness and V40–V42 assignment fixes.

Not implemented: official runtime start/resume, immutable snapshot assembly, autosave, grading, timeout, result visibility enforcement and hard lock after first attempt.

## 6. Question Engine implementation truth

Question Engine and all seven handlers exist structurally. ActivitySession still has legacy grading/reveal branches; MATCHING cross-resource pool identity validation and complete authoring→snapshot→runtime grading verification remain open. Do not label the Question Engine end-to-end complete.

## 7. Error contract / localization truth

- Backend business errors use `AppException(ErrorCode.X)` and `GlobalExceptionHandler` exposes stable codes.
- `ErrorCode.java` is authoritative.
- Frontend `AppError` resolves `errors.<backendCode>`.
- Error-code/i18n parity is mandatory whenever `ErrorCode` changes.
- Sprint 0 added English/Vietnamese AssessmentAttempt translations in both the dedicated `student/assignment-attempt` namespace and the legacy `errors` catalog.

## 8. Routing / UI truth

Canonical teacher content routes remain under `/teacher/content/...`. Student Assignment Attempt UI has a contract ownership target under `features/student/assignment-attempt`; no route was added in Sprint 0.

## 9. Verification rule

Sprint 0 was implemented through source writes only. No backend tests, frontend lint/typecheck/build, Flyway validation, browser E2E or current-HEAD CI run was executed as part of this change. Do not call Sprint 0 runtime-verified until those checks run.

## 10. Next gate

Sprint 1 starts only after this contract is accepted: implement open/start/resume, active-class server authorization, immutable Assignment Composition/settings/question snapshots, restricted-answer-safe runtime projection, initial session claim, and the Student Attempt page shell.


## 11. Sprint 1 execution update — 2026-10-26

- Aligned `client-e-learning/src/types/student/assignment-attempt.ts` with the existing Java `AttemptRuntimeResponse` and `AttemptRuntimeQuestionResponse` flat DTO contract. The TypeScript question contract no longer contains `required`; all questions are skippable.
- Updated `client-e-learning/src/services/student/student-assignment-attempt.service.ts` to export/use the canonical `AttemptRuntimeResponse` type instead of the previous incompatible nested `AttemptRuntimeSnapshot` shape.
- These are contract-alignment changes only. Backend open/start/resume, snapshot assembly, active-class authorization, initial session ownership, controller endpoints and Student UI are **still not implemented**. Do not call Sprint 1 complete or end-to-end functional.
- No build, typecheck, backend compilation, tests, Flyway validation or browser checks were executed by this connector change. The project owner previously reported Flyway and FE build succeeded before this commit; that does not verify the current HEAD.
