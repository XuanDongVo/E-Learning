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
- Added runtime DTOs for safe runtime projection, question projection, incremental answer save, session claim/heartbeat, submit, result and visibility-aware result questions.
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

**Status: IN PROGRESS; runtime implementation is not yet complete.**

Completed contract changes on this branch:
- Added accepted ADR 0027 for Single Active Tab with Resumable AssessmentAttempt.
- Added `StartOrResumeAttemptRequest`; the client generates/persists the UUID credential before the first request.
- Removed `activeSessionId` from the generic Java `AttemptRuntimeResponse` and corresponding TypeScript runtime DTO. The credential must never be echoed in a runtime response.
- Changed the frontend service contract to one `startOrResume(assignmentId, { activeSessionId })` POST; removed frontend heartbeat and claim-session calls.
- Removed stale heartbeat/takeover wording from active Sprint 1/3 blueprint sections.

Still not implemented:
- Student authorization/Assignment target and schedule validation in a runtime controller/service.
- Stable credential registration and verification in the backend.
- Active-class lookup and class snapshot.
- Immutable Composition/settings/question snapshot builder and answer-safe runtime projection.
- Student Attempt page/Intro/Player and Web Lock + IndexedDB implementation.
- Backend test coverage and runtime endpoints.

Verification: these are source/contract changes only. Backend compilation, frontend typecheck/build, tests, Flyway validation and browser/E2E checks were not run for this slice.
