# Project Progress

**Current audit baseline:** 2026-10-23  
**Branch:** `refactor/teacher-content-ui-routing`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

## Current stage

- Phase 6 Student Management: **DONE**.
- Phase 7 Scope A ActivitySession: **IMPLEMENTED, NOT FULLY VERIFIED**. ActivitySession supports mode/strategy selection, abandonment of the previous open run, Practice retry/hint behavior, Try Hard per-question timing/lives, and persisted snapshot payload metadata.
- Phase 7 Scope B Assignment Composition: **AUTHORING BASELINE IMPLEMENTED**. Composition schema/API, deterministic legacy backfill, Builder API persistence, ordered sections/items, assignment-specific points/required/example flags and score/answer display settings exist. AssessmentAttempt runtime is not implemented.
- Question Engine: **STRUCTURALLY IMPLEMENTED, INTEGRATION INCOMPLETE**. Canonical specs/results, registry and seven handler/spec types exist; feature services still contain semantic branches and full persistence/runtime/authoring parity is not verified.
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

## Current database baseline

The current branch contains Flyway migrations through **V42**. Never edit applied migrations. Re-audit the directory immediately before adding another migration and choose the next unused version.

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
4. ActivitySessionService still contains type-specific answer checking/reveal branches.
5. MATCHING/CLOZE are present in Question Engine and DTO/factory code but are not end-to-end verified as complete production authoring/runtime types.
6. Full Question persistence round-trip, student leakage and snapshot immutability tests remain incomplete.
7. Teacher Content UI slices still require browser regression and final lint/typecheck/build/test verification where not already recorded on the current HEAD.
8. ErrorCode-to-i18n parity must be checked against the full current server ErrorCode enum.

## Verification policy

A code/doc change is not considered verified merely because GitHub accepts the commit. Record exact CI/test/build/browser results against the exact commit. The audited branch HEAD currently has no recorded combined CI status.

## Next gates

1. Finish `.agent` rebaseline before starting unrelated implementation.
2. Validate current backend/frontend CI and record results.
3. Close remaining Content UI routing/bank validation gaps.
4. If Phase 7B is resumed, implement AssessmentAttempt only after the current ActivitySession/Question Engine gates are explicitly validated.
5. Keep `.agent/CURRENT_STATE.md` synchronized after every substantive implementation change.


## .agent documentation refactor (2026-10-23)

- Added `.agent/00-INDEX.md` with numbered reading order and file lifecycle/naming policy.
- Added `.agent/AUDIT_INVENTORY.md` with file-by-file classification and cleanup decisions.
- Rebased README, Question Engine/Composition architecture, Phase 7 and Phase 5 specs, domain model, screens inventory and relevant status notes.
- Removed three redundant/stale files: `plans/QUESTION_ENGINE_REFACTOR_STATUS.md`, `plans/assignment-grade-and-recipients-refactor.md`, and `ui/HYBRID_QUESTION_LIST_BLUEPRINT.md`.
- This was a documentation-only change. No application code, database migrations, builds, tests or browser checks were run. Remaining file-by-file source verification is still open; do not treat this documentation pass as proof that every contract matches code.
