# Current Implementation State

**Audit date:** 2026-10-25  
**Branch:** `feature/student-assignment-attempt`  
**Scope:** source inspection of Question Engine, Assignment Composition mapping, and ActivitySession runtime. This is not a build/test run.  
**Purpose:** canonical implementation truth for AI agents. This file records what is actually present in the branch; accepted ADRs remain the source of product decisions, while this file is the source of current implementation status.

## 1. Authority model

Use this order when resolving project knowledge:

1. Accepted ADRs = approved product/architecture decisions.
2. `.agent/CURRENT_STATE.md` = current implementation state on this branch.
3. Active phase/spec/architecture documents = intended implementation contract, updated to match the current state.
4. `PROGRESS.md` = concise work log and verification record.
5. Historical audits/plans = traceability only; never treat an old audit date as current state.
6. Code = final authority for what physically exists when documentation and code disagree.

A document must not claim that a target architecture is implemented merely because an ADR or plan accepts it.

## 2. Repository baseline

- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: Spring Boot + Java 21 + JPA + Flyway + PostgreSQL.
- Source branch baseline documented Flyway through V42; this feature branch adds V43 for AssessmentAttempt runtime schema. Validate Flyway and database state before applying.
- Applied migrations must never be edited; future schema changes start at the next unused version after a fresh migration-directory audit.
- `assessmentattempt` backend package now contains initial enums, JPA entities, repositories, DTOs and a service skeleton. Runtime behavior is not implemented.

## 3. Phase status

| Area | Current state | Classification |
|---|---|---|
| Phase 0–2 | Foundation, auth/users and classes exist | Implemented baseline |
| Phase 3 Content | Grade → Unit → Section → Topic → QuestionBank → Question CRUD/preview/completeness/hint | Implemented baseline; semantic Question Engine migration is still partial |
| Phase 4 Activity | Unit-scoped Activity, banks/distribution, modes, strategies, readiness, preview and lifecycle | Implemented baseline |
| Phase 5 Assignment | Assignment, Grade ownership, class target snapshots, schedule, whole-attempt time limit, answer/score display settings, Composition | Implemented authoring baseline; formal runtime attempt/scoring is not implemented |
| Phase 6 Student Management | Student/class/profile management | Done |
| Phase 7 Scope A | ActivitySession runtime exists with mode/strategy selection, per-question Try Hard timer, Practice retry/hint behavior, snapshot payload persistence | Implemented, but Question Engine integration and verification are incomplete |
| Phase 7 Scope B | Assignment Composition authoring is implemented; AssessmentAttempt, autosave answers, timeout scoring and analytics are not implemented | In progress / not complete |
| Phase 8+ | Analytics, XP/ranking, dashboard/reporting work not complete as formal phases | Future |

## 4. Assignment implementation truth

### Implemented

- Assignment owns AssignmentQuestion records; AssignmentQuestion has no product-order `position` field.
- Composition uses ordered `assignment_sections` and `assignment_items` with persisted positions.
- Existing assignments were backfilled deterministically from `question_id ASC` into Composition.
- Composition GET/PUT API exists.
- Builder persistence uses backend APIs rather than the former localStorage repository.
- Builder is the canonical authoring route reached from Assignment list/create flows; legacy assignment routes redirect to it.
- Assignment-specific points/required/example flags live on Composition items.
- `show_answers_after_submit`, `show_score_after_submit` and `show_points_per_question` exist on Assignment.
- Server publish readiness is enforced in `AssignmentService.updateStatus`: metadata, class/grade/year consistency, schedule, whole-attempt time limit, question completeness, Composition structure/order, ownership, block payloads and positive total scored points are checked server-side.
- Assignment time limit is validated as a whole-attempt setting and must be greater than one minute.
- Grade ownership plus explicit class IDs are the current recipient model; do not describe the old recipient polymorphism as current.
- V40 contains the Grade/class-recipient refactor; V41 contains the column rename correction; V42 enforces the time-limit constraint.

### Not implemented / not verified

- Initial `AssessmentAttempt` entities/repositories and a service skeleton exist; no controller or runtime orchestration is implemented yet.
- No official one-attempt-per-student runtime behavior exists yet; the new schema adds a unique (assignment_id, student_id) constraint.
- Snapshot storage schema/entity exists, but immutable snapshot assembly and completeness are not implemented.
- Answer storage schema/entity exists, but autosave, idempotency and submit flow are not implemented.
- Part-result schema/entity exists, but automatic scoring and timeout processing are not implemented.
- Per-part result and normalized-value storage fields exist; persistence behavior and analytics are not implemented.
- The accepted hard-lock-after-first-attempt policy cannot be runtime-enforced until AssessmentAttempt exists.
- `show_score_after_submit` is modeled/configured, but the runtime that calculates and conditionally exposes the score is not implemented.

## 5. ActivitySession implementation truth

### Implemented

- ActivitySession is a separate aggregate from Assignment work.
- Student start validates published/readiness/grade access and resolves concrete mode and selection strategy.
- Multiple available strategies require explicit student choice; the concrete strategy is stored on ActivitySession.
- Existing open sessions are abandoned when a new run starts.
- Selected questions are persisted with snapshot schema version, content revision and serialized snapshot payload.
- Current ActivitySession answer/hint/reveal code reads the saved snapshot payload for the active question.
- Practice has no timer, one retry, optional hint and final reveal behavior.
- Try Hard uses a per-question deadline and life handling.

### Remaining boundary

- `ActivitySessionQuestion` still retains a live `Question` relation alongside snapshot fields.
- `ActivitySessionService` still contains legacy type-specific answer-checking/reveal branches; the inspected runtime path does not use canonical engine parsing/grading for all seven types.
- Full snapshot completeness, migration/legacy-session rollout and end-to-end leakage/runtime verification are not yet proven by a recorded current CI/browser run.

## 6. Question Engine implementation truth

### Confirmed present in code

- `QuestionEngine` exposes `validateDefinition`, `parseAndValidate` and `grade`, delegating through `QuestionTypeHandlerRegistry`.
- Registry registers all seven types: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `FILL_IN_BLANK`, `TYPE_ANSWER`, `MATCHING` and `CLOZE`; it rejects duplicate/missing registrations.
- `QuestionSpecRequestFactory` and `QuestionSpecMapper` have branches for all seven types. `QuestionPersistenceService` stores MATCHING/CLOZE definitions as JSON in `Question.definition` and computes completeness using engine definition validation.
- `ClozeHandler` checks nonempty segments/blanks, `segments.size() == blanks.size() + 1`, unique nonblank blank keys, and nonempty accepted answers. Older audit wording that says cardinality is not checked is stale.
- `MatchingSpec` is `MatchingSpec(common, poolId, correctEntryId)`. `MatchingHandler` checks these references are present but does not resolve the pool or prove the entry belongs to it.

### Confirmed integration gaps

- `ActivitySessionService.isCorrect` and `correctAnswer` still contain legacy type-specific branches for MULTIPLE_CHOICE and SINGLE_CHOICE plus a generic fallback using `snapshot.answers()`. The inspected runtime path does not delegate every response to `QuestionEngine.parseAndValidate` and `QuestionEngine.grade`.
- `ActivityQuestionSnapshotAssembler` builds snapshots through `QuestionSpecMapper` and option/answer repositories, but runtime checks the snapshot with legacy logic. End-to-end agreement between snapshot, normalization and engine grading is not demonstrated.
- Builder serializes MATCHING as `definition.matching { poolId, correctEntryId }` and CLOZE as segments/blanks. DTO and persistence support exists, but does not prove Composition POOL references are resolved or frozen into a runtime snapshot.
- `AssignmentCompositionService` requires nonempty POOL entries and nonempty text per entry; it does not enforce stable unique entry IDs or cross-check Question references against the POOL.
- Frontend CLOZE mapping reconstructs prompt markers from saved segments/blanks when needed. Full save → reload → edit → save → preview/runtime grading parity remains unverified.

### Test and verification status

- Focused tests exist for generic engine behavior and selected request-factory cases. Inspected tests do not establish a full authoring → persistence → composition resolution → snapshot → student response → grade → result persistence flow.
- GitHub search did not surface dedicated `MatchingHandlerTest`, `ClozeHandlerTest`, snapshot integration tests or `AssessmentAttemptServiceTest`. Search absence is a warning, not proof no equivalent test exists under another name.
- No backend tests, frontend lint/typecheck/build, Flyway validation, browser E2E or current-HEAD CI run was executed during this audit.

**Classification:** core engine and handlers exist; integration is partial. MATCHING has a confirmed unresolved cross-resource identity/validation gap. CLOZE structural validation is present, but full authoring/runtime parity is unverified. Do not label Question Engine end-to-end complete.

## 7. Question/content UI implementation truth

Current canonical teacher content routes on this branch are:

```text
/teacher/content
/teacher/content/units/:unitId
/teacher/content/sections/:sectionId
/teacher/content/topics/:topicId
/teacher/content/question-banks
/teacher/content/question-banks/:bankId
/teacher/content/questions/:questionId
```

The global Question Banks screen is nested under the Content navigation group. The current routing work intentionally keeps Question Bank and Question Editor under the `/teacher/content/...` namespace. Do not introduce `/teacher/question-banks` or `/teacher/questions` unless a new owner decision explicitly changes this contract.

The current Question Bank UI work includes Explorer retry states, Topic bank lifecycle/filter improvements, Question completeness filtering/pagination, preview accessibility, breadcrumbs and global Question Bank browsing. Validation gaps remain for full browser/navigation regression and complete lifecycle coverage.

## 8. Error contract / localization truth

- Backend business errors use `AppException(ErrorCode.X)` and `GlobalExceptionHandler` exposes stable error codes.
- `ErrorCode.java` contains the authoritative server code vocabulary; frontend `error.json` is expected to cover that vocabulary.
- Frontend `AppError` resolves translations directly as `errors.<backendCode>`; the removed `explicitMessageKeys`/`inferMessageKey`/`appErrorMessageKey` indirection is not part of the current architecture.
- Error-code/i18n parity is a required audit item whenever `ErrorCode` changes.

## 9. UI/documentation truth

- `.agent/ui/QUESTION_BANK_QUESTION_MANAGEMENT_BLUEPRINT.md` and `QUESTION_BANK_UI_PHASE_PLAN.md` are active planning documents for the current content UI work.
- Question Editor redesign/autosave refactor is deliberately separate from the current Content UI routing/bank work.
- Historical UI audit checklists may remain incomplete until browser validation is actually executed; an unchecked validation item is not evidence of a code defect.

## 10. Verification rule

No backend/frontend/browser/Flyway verification was run during the 2026-10-25 source audit. Do not describe this branch as verified until test evidence is tied to an exact HEAD. A future validation run must record the exact commit, workflow/run, backend tests, frontend lint/tests/typecheck/build and any browser/runtime checks.

## 11. Immediate next documentation-driven gates

1. Keep this file current after every substantive implementation change.
2. Rebaseline `PROGRESS.md` from this file instead of appending another historical continuation block.
3. Update active architecture/spec files whose status claims predate V31–V42.
4. Treat `AssessmentAttempt` as the major remaining Phase 7B feature; do not document it as existing.
5. Keep Content UI routing under `/teacher/content/...` until explicitly changed by an owner decision.
