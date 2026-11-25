# Question Engine — Current Code Audit

**Audit date:** 2026-10-25  
**Branch:** `feature/student-assignment-attempt`  
**Scope:** source inspection of Question Engine, question authoring/persistence mapping, Assignment Composition POOL handling, ActivitySession snapshot/runtime, and discoverable tests.
**Limit:** this was GitHub source inspection, not local execution. No build, test, Flyway, frontend, browser or CI success is claimed.

## Executive result

The core Question Engine exists and declares seven types. The reason it is not verified end-to-end is not that the engine is absent: the runtime still bypasses canonical parsing/grading for ActivitySession, and MATCHING's Composition POOL references are not resolved or validated. One older finding must be corrected: ClozeHandler now checks segment/blank cardinality.

## Findings

### QE-01 — Core engine infrastructure exists (confirmed)

- `QuestionEngine` delegates `validateDefinition`, `parseAndValidate` and `grade` to `QuestionTypeHandlerRegistry`.
- The registry wires all seven declared types and rejects duplicate/missing handlers.
- `QuestionSpecRequestFactory` and `QuestionSpecMapper` have branches for all seven types.
- `QuestionPersistenceService` serializes MATCHING/CLOZE definitions into `Question.definition` JSON and computes completeness through engine definition validation.
- Evidence: [QuestionEngine](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/engine/core/QuestionEngine.java), [registry](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/engine/core/QuestionTypeHandlerRegistry.java), [factory](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/service/QuestionSpecRequestFactory.java), [mapper](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/service/QuestionSpecMapper.java).

Classification: **Implemented structurally**, not end-to-end verified.

### QE-02 — ActivitySession runtime still bypasses canonical parse/grade (confirmed)

- `ActivitySessionService.isCorrect` and `correctAnswer` contain explicit branches for MULTIPLE_CHOICE and SINGLE_CHOICE, then fall back to generic snapshot answers.
- The inspected runtime path does not call `QuestionEngine.parseAndValidate` or `QuestionEngine.grade` for every response.
- Evidence: [ActivitySessionService](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/activitysession/service/ActivitySessionService.java).

Impact: MATCHING/CLOZE and normalized/per-part grading semantics are not demonstrated in ActivitySession. This is a confirmed integration gap.

### QE-03 — MATCHING pool/entry references are not resolved or validated (confirmed)

- `MatchingSpec` is `MatchingSpec(common, poolId, correctEntryId)`, not a resolved pool plus expected-pairs structure.
- `MatchingHandler.validateDefinition` only requires nonblank pool and entry IDs. The parser comment mentions membership checking, but there is no resolver call; grading compares submitted entry ID with `correctEntryId`.
- `MatchingDefinitionRequest` only has those two string fields; frontend persistence and composition mapping serialize/restore those fields.
- `AssignmentCompositionService.validateBlockPayload` requires POOL entries and nonempty text, but does not enforce stable unique IDs or cross-check question references against the referenced pool.
- Evidence: [MatchingHandler](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/engine/types/compound/MatchingHandler.java), [MatchingSpec](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/engine/types/compound/MatchingSpec.java), [Composition service](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/assignment/service/AssignmentCompositionService.java).

Impact: nonblank nonexistent references can pass engine definition validation. Stable identity, pool edit/delete behavior and immutable resolved runtime input are not guaranteed.

Classification: **Confirmed model/integration gap**, not merely missing tests.

### QE-04 — CLOZE structural validator is stronger than older docs claimed (confirmed correction)

- `ClozeHandler.validateDefinition` checks that segments and blanks exist, `segments.size() == blanks.size() + 1`, blank keys are unique/nonblank, and each blank has a nonblank accepted answer.
- `ClozeSpec` still stores segments and blanks as separate lists. Frontend maps between marker prompt, segments and blank keys; save uses a synchronization helper.
- Evidence: [ClozeHandler](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/engine/types/compound/ClozeHandler.java), [Builder persistence](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/client-e-learning/src/services/assignment/assignment-question-persistence.service.ts), [Builder mapping](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/client-e-learning/src/services/assignment/assignment-composition.service.ts).

Classification: **Structural validation implemented; frontend round-trip/runtime parity unverified**. Older documentation claiming segment/blank cardinality is not checked must be treated as stale.

### QE-05 — DTO and persistence plumbing exists, but round-trip correctness is not established

- `QuestionPersistenceService` stores supported definition JSON; `QuestionResponseMapper` returns the saved definition; request DTOs contain matching/cloze/textInput definition fields.
- Frontend builder writes MATCHING pool/entry references and CLOZE segments/blanks.
- No inspected test establishes create → reload → edit → save → preview → student answer → grade for MATCHING/CLOZE.

Classification: **Basic authoring/storage plumbing exists; end-to-end behavior unverified**.

### QE-06 — Snapshot and runtime semantics are not yet proven consistent

- `ActivityQuestionSnapshotAssembler` uses `QuestionSpecMapper` plus option/answer repositories to build a snapshot.
- ActivitySession runtime reads snapshot data but checks answers with legacy branches. The current state also records that `ActivitySessionQuestion` retains a live Question relation alongside snapshot fields.
- Without integration tests, do not claim full snapshot immutability, seven-type runtime coverage or absence of answer-key leakage.

Classification: **Partially implemented; verification required**.

### QE-07 — Focused tests do not establish a vertical slice

- Inspected `QuestionEngineTest` covers generic choice/text grading and registry behavior; `QuestionSpecRequestFactoryTest` covers selected factory cases.
- GitHub search did not surface dedicated `MatchingHandlerTest`, `ClozeHandlerTest`, snapshot assembler integration tests or `AssessmentAttemptServiceTest`. Search absence is a warning, not proof no equivalent test exists under another name.
- No backend test, frontend lint/typecheck/build, Flyway validation, browser E2E or current-head CI run was executed during this audit.

Classification: **End-to-end verification not established**.

## Required next steps

1. Define Matching's canonical reference contract: stable unique POOL entry IDs; resolve `poolId` against the Assignment Composition; verify `correctEntryId` belongs to that pool; define edit/delete/reuse behavior.
2. Add a server-side resolver that produces a resolved Matching definition for preview and immutable attempt snapshots; do not rely on mutable Composition lookups during an attempt.
3. Route ActivitySession answer parsing/grading through Question Engine, or explicitly restrict and validate supported types before session creation.
4. Add integration tests for MATCHING/CLOZE authoring → persistence → reload → composition resolution → snapshot → parse/grade → result, including invalid references and malformed Cloze definitions.
5. Verify student projections never expose correctness flags, accepted answers or answer keys before reveal is allowed.
6. Run backend tests, frontend lint/typecheck/build, Flyway validation on fresh and representative existing databases, and browser E2E. Record exact commit and results in `PROGRESS.md`.

## Source links

- [Question Engine](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/engine/core/QuestionEngine.java)
- [Question persistence](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/service/QuestionPersistenceService.java)
- [Question response mapper](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/question/service/QuestionResponseMapper.java)
- [Activity snapshot assembler](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/server/src/main/java/e_learning/server/activitysession/snapshot/ActivityQuestionSnapshotAssembler.java)
- [Assignment Builder question persistence](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/client-e-learning/src/services/assignment/assignment-question-persistence.service.ts)
- [Assignment Builder composition mapping](https://github.com/XuanDongVo/E-Learning/blob/feature/student-assignment-attempt/client-e-learning/src/services/assignment/assignment-composition.service.ts)