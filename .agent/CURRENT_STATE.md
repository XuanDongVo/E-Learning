# Current Implementation State

**Audit date:** 2026-10-23  
**Branch:** `refactor/teacher-content-ui-routing`  
**Branch HEAD audited:** `7bb5bb43bde786431c85ba0ca1d0c350cad684f4`  
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
- Current highest Flyway migration on this branch: **V42**.
- Applied migrations must never be edited; future schema changes start at the next unused version after a fresh migration-directory audit.
- Current branch has no `assessment-attempt` backend feature package and no `AssessmentAttempt` runtime implementation.

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

- No `AssessmentAttempt` entity/service/controller/repository exists yet.
- No official one-attempt-per-student Assignment runtime exists yet.
- No immutable Assignment attempt snapshot exists yet.
- No autosaved student Assignment answers or idempotent submit flow exists yet.
- No server-side automatic Assignment score calculation on submit/timeout exists yet.
- No persisted Assignment per-part grade/normalized-submission analytics exists yet.
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
- `ActivitySessionService` still contains type-specific answer checking/reveal branches instead of delegating all semantic operations to the canonical Question Engine.
- Full snapshot completeness, migration/legacy-session rollout and end-to-end leakage/runtime verification are not yet proven by a recorded current CI/browser run.

## 6. Question Engine implementation truth

The current server contains a real Question Engine package, not merely a proposal. It includes:

- `QuestionSpec`, `RawAnswer`, `ValidatedAnswer`, `AnswerParseResult` and `GradeResult` domain models.
- Handler/registry infrastructure.
- Handlers/specs for SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING and CLOZE.
- Focused engine/compound tests and request-factory tests.
- Question persistence/spec mapping classes remain in the feature layer.

The implementation is **partial**, not complete D1–D8 integration. Activity and Assignment feature services still contain semantic branches and the full persistence/round-trip/authoring/runtime contract for MATCHING/CLOZE is not yet verified end-to-end.

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

As of this audit, the branch has no recorded combined CI status on the audited HEAD. Therefore documentation must not say the current HEAD is fully verified. A future validation run must record the exact commit, workflow/run, backend tests, frontend lint/tests/typecheck/build and any browser/runtime checks.

## 11. Immediate next documentation-driven gates

1. Keep this file current after every substantive implementation change.
2. Rebaseline `PROGRESS.md` from this file instead of appending another historical continuation block.
3. Update active architecture/spec files whose status claims predate V31–V42.
4. Treat `AssessmentAttempt` as the major remaining Phase 7B feature; do not document it as existing.
5. Keep Content UI routing under `/teacher/content/...` until explicitly changed by an owner decision.
