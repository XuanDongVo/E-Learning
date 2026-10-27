# Current Implementation State

**Audit date:** 2026-10-26  
**Branch:** `feature/student-assignment-attempt`  
**Scope:** current source state after Sprint 0 contract implementation and session-policy rebaseline. This file records implementation truth; no runtime/build/browser verification was executed by these documentation changes.

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
- `assessmentattempt` backend package contains V43 entities/repositories plus Sprint 0 contract DTOs and snapshot contract. Runtime orchestration/controllers are still not implemented.

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

- Added AssessmentAttempt-specific stable error codes to `ErrorCode.java`.
- Added runtime DTOs for safe runtime projection, question projection, incremental answer save, submit, result and visibility-aware result questions. Session claim/heartbeat DTOs were removed when ADR 0027 simplified the MVP policy to a stable credential without lease/takeover.
- Expanded `SaveAttemptAnswerRequest` with `attemptQuestionId`, `expectedRevision`, `activeSessionId` and `requestId`.
- Added `AssessmentAttemptSnapshotContract` with snapshot version 1 and stable top-level document/settings keys.
- Restricted runtime DTO comments/contracts explicitly state that active student payloads must not expose answer keys, accepted answers, grading internals or hidden normalized values.

### Frontend completed

- Added `assessmentAttempt.types.ts`, API boundary, state machine and English/Vietnamese i18n.
- TypeScript runtime types were aligned with the flat Java runtime DTO contract; `required` is not part of the student runtime question contract because all questions are skippable.

### Sprint 0 intentionally NOT implemented

- No controller endpoints.
- No `startOrResume` service implementation.
- No snapshot assembly.
- No active-class authorization implementation for Assignment Attempt.
- No autosave persistence/idempotency implementation.
- No session runtime implementation.
- No grading/submit/timeout implementation.
- No student Attempt UI screen yet.
- No timer/autosave/submit/result components yet.

## 5. Session ownership — accepted design, not yet implemented

ADR 0027 is now the authoritative Phase 7B session policy.

- One active browser tab may operate an Attempt.
- Same-browser coordination uses Web Locks API with an exclusive lock and `ifAvailable: true`; a second tab fails fast instead of waiting.
- A stable logical session credential is persisted for recovery so refresh, browser close/reopen and network interruption can resume the same Attempt when the credential remains available.
- Backend validates the credential on every mutation and never silently replaces it for a second tab/device.
- No heartbeat cadence, stale threshold or automatic takeover exists in the MVP design.
- `TAB_HIDDEN` and `FULLSCREEN_EXIT` remain lightweight events; `SESSION_TAKEOVER` is not emitted by the MVP runtime even though V43 can accept the legacy value.
- If site data/credential is cleared or unavailable, the runtime returns session-lost/recovery-required rather than silently creating a new session.

This is a design decision only. Web Lock integration, durable credential handling and backend verification are not implemented yet.

## 6. Assignment implementation truth

Implemented authoring remains unchanged: Composition owns order, AssignmentQuestion has no product-order position, whole-attempt time limit, target snapshots, independent score/answer visibility, server publish readiness and V40–V42 assignment fixes.

Not implemented: official runtime start/resume, immutable snapshot assembly, autosave, grading, timeout, result visibility enforcement and hard lock after first attempt.

## 7. Question Engine implementation truth

Question Engine and all seven handlers exist structurally. ActivitySession still has legacy grading/reveal branches; MATCHING cross-resource pool identity validation and complete authoring→snapshot→runtime grading verification remain open. Do not label the Question Engine end-to-end complete.

## 8. Error contract / localization truth

- Backend business errors use `AppException(ErrorCode.X)` and `GlobalExceptionHandler` exposes stable codes.
- `ErrorCode.java` is authoritative.
- Frontend `AppError` resolves `errors.<backendCode>`.
- Error-code/i18n parity is mandatory whenever `ErrorCode` changes.

## 9. Routing / UI truth

Canonical teacher content routes remain under `/teacher/content/...`. Student Assignment Attempt UI has a contract ownership target under `features/student/assignment-attempt`; no route was added in Sprint 0.

## 10. Verification rule

Documentation and contract changes are not runtime verification. No backend tests, frontend lint/typecheck/build, Flyway validation, browser E2E or current-HEAD CI run was executed by this rebaseline. Do not call the runtime verified until exact test/build/browser evidence exists for the current HEAD.

## 11. Next gate

Sprint 1 starts with:
1. implement start/resume and active-class server authorization;
2. build immutable Assignment Composition/settings/question snapshots and restricted-answer-safe projection;
3. implement stable session credential registration/verification and Student Attempt page shell;
4. integrate single-active-tab Web Lock coordination before allowing the active player to write.

The next implementation must not introduce heartbeat/stale takeover merely because older contract DTOs or reference code contain those concepts.

## 12. Session-policy rebaseline — 2026-10-26

- Added ADR 0027: `Single Active Tab with Resumable AssessmentAttempt`.
- Updated active Student Attempt specification and UI/runtime blueprint to remove heartbeat/stale takeover from MVP ownership semantics.
- The existing V43 `active_session_id` remains useful as the stable logical credential; it is not a time-based lease.
- `last_activity_at` may be maintained from accepted runtime operations, but it is not used to transfer ownership.


## 13. Sprint 1 — initial contract alignment (2026-10-26)

**Status: Sprint 1 frontend scaffold + server method shells added; backend business logic and end-to-end runtime remain unimplemented/unverified.**

Completed contract changes on this branch:
- Added accepted ADR 0027 for Single Active Tab with Resumable AssessmentAttempt.
- Added `StartOrResumeAttemptRequest`; the client generates/persists the UUID credential before the first request.
- Removed `activeSessionId` from the generic Java `AttemptRuntimeResponse` and corresponding TypeScript runtime DTO. The credential must never be echoed in a runtime response.
- Changed the frontend service contract to one `startOrResume(assignmentId, { activeSessionId })` POST; removed frontend heartbeat and claim-session calls.
- Removed stale heartbeat/takeover wording from active Sprint 1/3 blueprint sections.

Still not implemented:
- Student authorization/Assignment target and schedule validation in the runtime service.
- Stable credential registration and verification in the backend.
- Active-class lookup and class snapshot.
- Immutable Composition/settings/question snapshot builder and answer-safe runtime projection.
- Backend business logic in `getIntro` and `startOrResume`; both service methods intentionally throw `UnsupportedOperationException` for owner implementation.
- Start/resume integration, answer autosave, timer, submit/result logic, and end-to-end tests.

Verification: these are source/contract changes only. Backend compilation, frontend typecheck/build, tests, Flyway validation and browser/E2E checks were not run for this slice. The latest available CI evidence reviewed previously was on an older commit and failed; source-level changes are not a substitute for rerunning Gate A on the exact current HEAD.


## 14. Sprint 1 readiness decision — 2026-10-26

- **Contract/preparation work:** may proceed; the heartbeat/claim mismatch and credential leakage from the generic runtime DTO have been corrected.
- **Full runtime implementation:** not GO until Gate A in .agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md is passed against the exact current HEAD. The latest available CI run at review time was on an older SHA and failed; no current-HEAD run was found.
- Required next gate: backend test/compile + Flyway validation, frontend tests/typecheck/build, and verification of existing ActivitySession/Question Engine/snapshot security before building Start/Resume runtime on top.


## 15. Sprint 1 scaffold update — 2026-10-26

**Scope delivered by assistant: frontend scaffolding + server signatures only. Server business logic is intentionally owner-owned.**

Frontend source added:
- Route: `/student/assignments/:assignmentId`.
- Student-safe Intro API contract: `GET /v1/assignments/:assignmentId/assessment-attempt/intro`.
- Start/Resume API contract: `POST /v1/assignments/:assignmentId/assessment-attempt`.
- Web Locks exclusive tab lock with `ifAvailable: true`, fail-fast conflict and unsupported-browser states.
- IndexedDB stable UUID credential store; client persists before the first request.
- Student Paper for composition blocks and common question types; bilingual section/block labels.
- Local-only answer draft warning and unsaved-navigation guard. No save endpoint is called in Sprint 1.

Backend source added:
- `AttemptIntroResponse` safe DTO.
- `getIntro(assignmentId, studentId)` and `startOrResume(assignmentId, studentId, request)` service method stubs.
- Controller method shells that extract the JWT subject and delegate.
- Both service methods intentionally throw `UnsupportedOperationException`; the assistant has not implemented backend business logic.

Not yet done:
- Actual assignment/target/schedule/role authorization, ACTIVE class attribution, Attempt creation concurrency, credential comparison, snapshot builder, restricted-answer projection.
- Autosave, server timer enforcement, submit/grading/results, Student assignment list integration.
- Build/test/browser/E2E verification on the current HEAD. The page is a scaffold, not a working runtime until the owner implements the stubs.

Important integration risk for the later code review:
- Current Question Engine handlers consume type-specific `RawAnswer` values (e.g. single choice and Matching expect a string; Multiple Choice expects a collection; Cloze has structured parts), while the frontend stores structured `answerPayload` objects such as `{ selectedKey }`, `{ selectedKeys }`, `{ value }`, `{ pairs }`, and `{ values }`. The backend implementation must define and test an explicit adapter from persisted JSON payload to canonical `RawAnswer` for every question type. Do not grade directly from a UI-shaped JSON object without normalization.
- The student runtime projection must omit correct keys, accepted answers, explanation/grading internals where restricted; a raw serialized `QuestionSpec` must not be returned to the client without a dedicated safe projection.


## Sprint 1 implementation update — 2026-10-27

- V43 was already applied and remains unchanged. V45 renames assessment_attempts.time_limit_seconds to time_limit_minutes and converts legacy stored seconds to minutes.
- AssessmentAttempt entity and runtime response now use minutes. deadline_at is calculated once as started_at + time_limit_minutes and is preserved on resume.
- getIntro validates active Student, active class and class target; its question count comes from Composition QUESTION items rather than the legacy AssignmentQuestion count.
- startOrResume uses get-or-create without an Assignment-wide lock. A separate transactional creation service builds the snapshot. The unique constraint uq_assessment_attempt_assignment_student arbitrates concurrent creation; only a conflict on that named constraint is re-read and recovered.
- The snapshot contains ordered Composition, settings, question render specs and separate grading data. The runtime projection returns only the student portion of each question snapshot.
- Timeout auto-submit/finalization, answer autosave/revision/idempotency, Question Engine grading, result visibility and Assignment authoring hard-lock remain incomplete. Matching/POOL resolution and all question-type projections require integration tests.
- No current-HEAD compilation, automated tests, Flyway validation, frontend build or browser/E2E verification has been run.
