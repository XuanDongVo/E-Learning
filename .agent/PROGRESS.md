# Project Progress

**Current source audit:** 2026-10-27  
**Branch:** `feature/student-assignment-attempt`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

## Current stage

- Phase 6 Student Management: **DONE**.
- Phase 7 Scope A ActivitySession: **IMPLEMENTED, NOT FULLY VERIFIED**. ActivitySession supports mode/strategy selection, abandonment of the previous open run, Practice retry/hint behavior, Try Hard per-question timing/lives, and persisted snapshot payload metadata.
- Phase 7 Scope B Assignment Composition: **AUTHORING BASELINE IMPLEMENTED**. Composition schema/API, deterministic legacy backfill, Builder API persistence, ordered sections/items, assignment-specific points/required/example flags and score/answer display settings exist. AssessmentAttempt start/resume and initial snapshot are partially implemented; autosave is now implemented, while timeout finalization and scoring remain incomplete.
- Question Engine: **CORE IMPLEMENTED, END-TO-END INTEGRATION INCOMPLETE**. Seven handlers/specs and factory/mapper branches exist. ActivitySession still uses legacy type-specific answer/reveal logic. MATCHING references are not resolved/validated against Composition POOL. CLOZE structural validation exists; round-trip/runtime parity is unverified.
- Teacher Content UI routing/bank work: **IMPLEMENTED IN SLICES, NOT FULLY VERIFIED**. Canonical routes remain under `/teacher/content/...`; global Question Banks is nested under Content.
- Server error contract: business throws use stable `AppException(ErrorCode.X)` vocabulary. Frontend AppError resolves `errors.<backendCode>` directly. ErrorCode/i18n parity remains an audit gate.

## Important current contracts

- Activity belongs to Unit.
- Activity and Assignment are independent.
- Activity may expose Learning/Practice, Try Hard or both; concrete mode is selected at start when needed.
- Multiple Activity selection strategies require student choice at start; the concrete strategy is stored on ActivitySession.
- Practice has no timer, one retry and optional hint. Try Hard timer is per question.
- AssignmentQuestion has no product-order `position`; Composition section/item/member positions are canonical order. `question_id ASC` is only deterministic legacy backfill order.
- Assignment time limit is a whole-attempt setting.
- `show_answers_after_submit` and `show_score_after_submit` are independent booleans; score calculation is not yet implemented because submit/grading are still pending.
- Assignment publishing readiness is server-enforced in `AssignmentService.updateStatus`.
- Assignment recipient model is Grade + explicit class ID snapshots; do not document the old recipient polymorphism as current.
- Topic formula/reference sheet and GameTemplate are deferred.
- Question hint is optional and teacher-authored.
- No shared polymorphic Attempt runtime.

## AssessmentAttempt session policy — ADR 0027

The active Student Attempt design is **Single Active Tab with Resumable AssessmentAttempt**:

- One browser tab owns the active Attempt interaction.
- Same-browser coordination uses Web Locks API with `ifAvailable: true`; another tab fails fast with `SESSION_CONFLICT` instead of waiting.
- A stable logical session credential is persisted for recovery after refresh/browser close/reopen when site data remains available.
- Backend validates the credential on every mutation and never silently replaces it for another tab/device.
- No heartbeat cadence, stale threshold or automatic takeover is part of the MVP.
- `TAB_HIDDEN` and `FULLSCREEN_EXIT` remain lightweight visibility events. `SESSION_TAKEOVER` is not emitted by MVP runtime.
- If credential/site data is cleared, runtime returns session-lost/recovery-required rather than silently creating a new session.

This policy supersedes the older heartbeat/stale-takeover wording in the Student Attempt plan. See `.agent/decisions/0027-single-active-tab-resumable-assessment-attempt.md`.

## Current database baseline

The source baseline documented Flyway through V42. This feature branch adds V43 for AssessmentAttempt runtime schema; V45 renames the attempt time-limit column to minutes and V46 adds answer mutation idempotency. Applied migrations are not edited. Run Flyway validation and confirm migration ordering/database state before applying.

## Current UI route contract

```text
/teacher/content
/teacher/content/units/:unitId
/teacher/content/sections/:sectionId
/teacher/content/topics/:topicId
/teacher/content/question-banks
/teacher/content/question-banks/:bankId
/teacher/content/questions/:questionId
```

Keep Question Bank and Question Editor under `/teacher/content/...` unless a new owner decision changes this.

## Known implementation gaps

1. AssessmentAttempt start/resume and snapshot projection exist; timeout finalization, automatic Assignment scoring, persisted per-part result generation, submit/result endpoints and Assignment hard-lock remain incomplete.
2. Answer autosave is implemented with `AssessmentAttemptAnswer.revision` as JPA `@Version`; `PESSIMISTIC_WRITE` is no longer used by the answer flow and the unused `findByIdForUpdate` repository method was removed.
3. Answer autosave uses `(attempt_id, request_id)` idempotency with canonical SHA-256 payload hashing and replays an already-processed request with the stored revision.
4. `expectedRevision` is checked before update; concurrent updates are still protected by `@Version`. Race conditions between autosave/submit/timeout/refresh are intentionally tolerated by the current MVP scope.
5. The autosave service currently performs only the immutable-snapshot boundary check; type-specific answer structural validation must be delegated to/integrated with the Question Engine before calling autosave fully runtime-ready.
6. MATCHING has a confirmed gap: `MatchingSpec` contains `poolId/correctEntryId`, but no pool resolver or entry-membership validation is applied. Composition POOL validation does not enforce stable unique entry IDs or validate question references.
7. CLOZE handler validates segment/blank cardinality, unique nonblank keys and accepted answers. Frontend save/reload/runtime parity remains unverified.
8. Full persistence round-trip, student answer-key leakage, snapshot immutability and end-to-end grading tests remain unverified.
9. Teacher Content UI slices still require browser regression and final lint/typecheck/build/test verification where not already recorded on the current HEAD.
10. ErrorCode-to-i18n parity must be checked against the full current server ErrorCode enum.
11. Web Lock/IndexedDB session behavior exists in slices but has not been verified end-to-end in a browser.

## AssessmentAttempt answer autosave implementation — 2026-10-27

Implemented on `feature/student-assignment-attempt`:

- Added `AssessmentAttemptAnswerMutationRepository.findByAttemptIdAndRequestId(...)`.
- Added `AssessmentAttemptQuestionRepository.findByIdAndAttemptId(...)` so a question cannot be saved through another attempt ID.
- Implemented `AssessmentAttemptAnswerService.saveAnswer(...)` end-to-end at the transaction/service boundary.
- Enforced attempt ownership, active-session credential, writable state and deadline checks.
- Added canonical payload hashing (SHA-256) for idempotency and request replay detection.
- Added `expectedRevision` precondition and `@Version` optimistic locking handling.
- Persisted answer + mutation in the same transaction and updated `lastActivityAt`.
- Kept answer-save response free of grading/correctness data.
- Updated `AssessmentAttemptAnswer.savedAt` on updates.
- Removed the unused pessimistic `findByIdForUpdate` repository method; answer saving now uses optimistic locking only.

**Entity/schema review:** `AssessmentAttemptAnswer.revision` already matches V43 `BIGINT NOT NULL DEFAULT 0`, so no migration is needed just for adding `@Version`. `AssessmentAttemptAnswerMutation` matches V46's `(attempt_id, request_id)` unique key and `result_revision`. `AssessmentAttempt` remains intentionally unversioned; `active_session_id` remains the session credential. `snapshot_version` fields are snapshot-format versions, not JPA concurrency versions.

**Verification:** implementation was inspected against the current branch source, but no backend compilation/tests, Flyway validation, FE lint/typecheck/build or browser/E2E tests were run against the resulting HEAD. Do not mark this slice verified until CI/local test evidence is tied to the exact commit.

## Next implementation gates

1. Integrate real Question Engine answer validation/normalization into autosave for all supported question types.
2. Implement submit: final answer persistence, grading, attempt totals/status, result projections and idempotent submit.
3. Implement timeout auto-submit/finalization using the same final-save/grading path.
4. Implement result/review access according to `show_score_after_submit` and `show_answers_after_submit`.
5. Enforce Assignment hard-lock after the first attempt exists.
6. Add focused autosave concurrency/idempotency tests, then full integration tests and Flyway verification.
7. Run exact-HEAD backend/frontend/browser verification and record evidence here.
