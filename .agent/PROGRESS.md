# Project Progress

**Current source audit:** 2026-10-31  
**Branch:** `feature/student-assignment-attempt`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

## Current stage

- Phase 6 Student Management: **DONE**.
- Phase 7 Scope A ActivitySession: **IMPLEMENTED, NOT FULLY VERIFIED**. ActivitySession supports mode/strategy selection, abandonment of the previous open run, Practice retry/hint behavior, Try Hard per-question timing/lives, and persisted snapshot payload metadata.
- Phase 7 Scope B Assignment Composition: **AUTHORING BASELINE IMPLEMENTED**. Composition schema/API, deterministic legacy backfill, Builder API persistence, ordered sections/items, assignment-specific points/required/example flags and score/answer display settings exist. AssessmentAttempt start/resume and initial snapshot are partially implemented; autosave is now implemented on `AssessmentAttemptQuestion` (ADR 0028 / V47), while timeout finalization and scoring remain incomplete.
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
- **ADR 0028:** AssessmentAttempt draft answer lives on `AssessmentAttemptQuestion` (`answer_payload`, `revision`, `saved_at`). There is no `AssessmentAttemptAnswer` entity/table.

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

Flyway on this branch: V43 AssessmentAttempt runtime, V44 required default, V45 time limit minutes, V46 answer mutations, **V47 merges draft answer columns onto `assessment_attempt_questions` and drops `assessment_attempt_answers`**. Applied migrations are not edited. Run Flyway validation before applying on each environment.

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
2. Answer autosave persists on `AssessmentAttemptQuestion` with `@Version revision` (ADR 0028); Mutation idempotency remains on V46.
3. Answer autosave uses `(attempt_id, request_id)` idempotency with canonical SHA-256 payload hashing and replays an already-processed request with the stored revision.
4. `expectedRevision` is checked before update; concurrent updates are still protected by `@Version`. Race conditions between autosave/submit/timeout/refresh are intentionally tolerated by the current MVP scope.
5. Autosave validates payload shape via `QuestionAnswerFormatValidator` against `student.spec`; full Question Engine parse/grade on submit remains open.
6. MATCHING UI contract (`selectedKey` vs `pairs`) still needs end-to-end confirmation.
7. CLOZE handler validates segment/blank cardinality; frontend save/reload/runtime parity remains unverified.
8. Full persistence round-trip, student answer-key leakage tests, snapshot immutability and end-to-end grading tests remain unverified.
9. Teacher Content UI slices still require browser regression and final lint/typecheck/build/test verification where not already recorded on the current HEAD.
10. ErrorCode-to-i18n parity must be checked against the full current server ErrorCode enum.
11. Web Lock/IndexedDB session behavior exists in slices but has not been verified end-to-end in a browser.

## AssessmentAttempt answer on question — 2026-10-31 (ADR 0028)

Implemented on `feature/student-assignment-attempt`:

- Added V47: `answer_payload`, `revision`, `saved_at` on `assessment_attempt_questions`; dropped `assessment_attempt_answers` (no backfill; owner confirmed data cleared).
- Extended `AssessmentAttemptQuestion` with those fields; `@Version` on `revision`.
- `AssessmentAttemptAnswerService.saveAnswer` updates the question row; removed `AssessmentAttemptAnswer` entity and repository.
- `AssessmentAttemptRuntimeProjectionService` reads `answerPayload` / `revision` from the question; still strips `grading` from student projection.
- Kept `AssessmentAttemptAnswerMutation` for idempotency. API path and DTO wire shape unchanged.
- Added ADR 0028 and decisions index entry.

**Verification:** source committed only. No backend compile/tests, Flyway apply, FE lint/typecheck/build, or browser/E2E was run against this HEAD.

## Next implementation gates

1. Run backend compile/tests + Flyway validate on the exact HEAD after V47.
2. Implement submit: grade from question `answer_payload` + snapshot grading, PartResults, attempt totals.
3. Implement timeout auto-submit/finalization using the same path.
4. Implement result/review access according to `show_score_after_submit` and `show_answers_after_submit`.
5. Enforce Assignment hard-lock after the first attempt exists.
6. Add focused autosave concurrency/idempotency tests, then full integration tests.
7. Run exact-HEAD backend/frontend/browser verification and record evidence here.
