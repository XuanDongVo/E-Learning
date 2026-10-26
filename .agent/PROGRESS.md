# Project Progress

**Current source audit:** 2026-10-26  
**Branch:** `feature/student-assignment-attempt`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

## Current stage

- Phase 6 Student Management: **DONE**.
- Phase 7 Scope A ActivitySession: **IMPLEMENTED, NOT FULLY VERIFIED**. ActivitySession supports mode/strategy selection, abandonment of the previous open run, Practice retry/hint behavior, Try Hard per-question timing/lives, and persisted snapshot payload metadata.
- Phase 7 Scope B Assignment Composition: **AUTHORING BASELINE IMPLEMENTED**. Composition schema/API, deterministic legacy backfill, Builder API persistence, ordered sections/items, assignment-specific points/required/example flags and score/answer display settings exist. AssessmentAttempt runtime is not implemented.
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
- `show_answers_after_submit` and `show_score_after_submit` are independent booleans; score calculation is not yet implemented because AssessmentAttempt is not implemented.
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

The source baseline documented Flyway through V42. This feature branch adds V43 for AssessmentAttempt runtime schema; run Flyway validation and confirm migration ordering/database state before applying. Never edit applied migrations.

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

1. AssessmentAttempt entity/service/controller/repository, attempt snapshot, autosave, timeout, automatic Assignment scoring and persisted per-part results are not implemented.
2. Assignment hard-lock after first attempt cannot be runtime-enforced until AssessmentAttempt exists.
3. ActivitySessionQuestion still has a live Question relation alongside snapshot fields; snapshot rollout/legacy-session handling requires verification.
4. ActivitySessionService still has legacy type-specific answer checking/reveal logic rather than canonical engine grading for all seven types.
5. MATCHING has a confirmed gap: `MatchingSpec` contains `poolId/correctEntryId`, but no pool resolver or entry-membership validation is applied. Composition POOL validation does not enforce stable unique entry IDs or validate question references.
6. CLOZE handler validates segment/blank cardinality, unique nonblank keys and accepted answers. Frontend save/reload/runtime parity remains unverified.
7. Full persistence round-trip, student answer-key leakage, snapshot immutability and end-to-end grading tests remain unverified.
8. Teacher Content UI slices still require browser regression and final lint/typecheck/build/test verification where not already recorded on the current HEAD.
9. ErrorCode-to-i18n parity must be checked against the full current server ErrorCode enum.
10. Web Lock/IndexedDB session recovery is design-only; no frontend/backend implementation or browser verification exists yet.

## Verification policy

A code/doc change is not considered verified merely because GitHub accepts the commit. Record exact CI/test/build/browser results against the exact commit. No backend/frontend/browser/Flyway verification was run during the 2026-10-26 session-policy rebaseline. Do not describe this branch as verified until test evidence is tied to an exact HEAD.

## Next gates

1. Implement Sprint 1 start/resume and active-class authorization.
2. Build immutable Composition/settings/question snapshots and restricted-answer-safe runtime projection.
3. Implement stable session credential registration/verification.
4. Implement frontend Web Lock + IndexedDB recovery before allowing active player writes.
5. Validate the Question Engine/Composition Matching-Pool boundary before claiming all question types are runtime-ready.
6. Keep `.agent/CURRENT_STATE.md` synchronized after every substantive implementation change.

## Phase 7B AssessmentAttempt schema and skeleton

- Added V43 AssessmentAttempt runtime schema with attempt, question, answer and part-result persistence plus session/event metadata.
- Added JPA entities, repositories, request/response DTOs, snapshot contract and service skeleton.
- One attempt per Assignment/student is guarded by a database unique constraint. Composition order remains on `assignment_items`; runtime snapshot order is stored separately. ActivitySession remains a separate aggregate.
- **Not implemented:** start/resume snapshot assembly, authorization/target validation, single-active-tab session credential runtime, autosave concurrency/idempotency, timeout processing, Question Engine grading integration, submit/review endpoints, Assignment hard lock and Student UI.
- **Verification:** no backend tests, Flyway validation, compilation or frontend/browser checks were run in this connector change. The project owner previously reported Flyway and FE build success, but that is not verification of this current HEAD.

## Session-policy rebaseline — 2026-10-26

- Added ADR 0027 for Single Active Tab with Resumable AssessmentAttempt.
- Updated active Student Attempt specification and UI/runtime blueprint to remove heartbeat/stale takeover from MVP ownership semantics.
- Kept `active_session_id` as the stable logical credential; it is not a time-based lease.
- Kept `last_activity_at` only as an activity timestamp from accepted operations; it does not transfer ownership.
- This is documentation/design work only; runtime behavior remains unimplemented.
