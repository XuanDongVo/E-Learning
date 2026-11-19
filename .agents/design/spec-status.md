# Spec Status — Current Contract vs Implementation

**Audit date:** 2026-11-17
**Branch:** `feature/guided-reasoning-v1`
**Canonical implementation state:** `.agents/CURRENT_STATE.md`

This file is a drift register, not a historical audit. Accepted ADRs define intended product behavior; this table records whether the current branch actually implements or verifies each contract.

| ID | Contract | Current implementation | Status |
|---|---|---|---|
| D-01 | Activity is Unit-scoped | Activity uses Unit ownership | Implemented |
| D-02 | GameTemplate is not a current dependency | No current GameTemplate dependency | Implemented |
| D-03 | Draft Activity may be incomplete | Draft/readiness distinction exists; publish readiness is the gate | Implemented |
| D-04 | Activity preview is non-mutating | Preview endpoint exists | Implemented; runtime verification still required |
| D-05 | Try Hard timer is per question | ActivitySession stores/enforces per-question deadlines | Implemented; tests not fully reverified |
| D-06 | Multiple strategies require start-time choice | ActivitySession stores concrete strategy | Implemented |
| D-07 | AssignmentQuestion has no order; Composition owns order | Composition sections/items use persisted positions; AssignmentQuestion remains position-free | Implemented |
| D-08 | Answer reveal is independent from score visibility | `show_answers_after_submit` and `show_score_after_submit` exist | Configuration implemented; AssessmentAttempt runtime not implemented |
| D-09 | Activity lifecycle is server-enforced | Activity service enforces transition rules | Implemented |
| D-10 | Topic formula/reference sheet deferred | No active implementation requirement | Implemented as deferral |
| D-13 | Independent Knowledge Note and optional Topic links (ADR 0038) | V66 schema, entity/DTO/repository, API 501 contracts, TS types/services and page shells exist | Scaffold only; business behavior not implemented |
| D-11 | Question hint is optional | Hint exists and Activity Practice hint endpoint uses it | Implemented; full authoring round-trip still requires verification |
| D-12 | No fabricated dashboard metrics | Dashboard work uses real/future data boundary | Implemented baseline |

## Student visual system

| ID | Contract | Current implementation | Status |
|---|---|---|---|
| S-UI-01 | Indie Illustrated Scrapbook is exclusive to Student | Student layout activates scoped semantic tokens, typography and surfaces; Teacher/base remains unchanged | Implemented |
| S-UI-02 | Feature code uses roles/primitives, not page-local palette or sizing | Home, Profile, Units and Rewards use semantic aliases, Student typography roles and `components/student-ui` recipes; immersive Activity runtime retains its documented functional scale | Implemented for standardized routes; remaining Student routes are migration debt |
| S-UI-03 | Shell owns outer page width/padding | Home, Profile, Units and Rewards render inside `StudentShell` without duplicate outer page padding; Activity runtime is the documented immersive exception | Implemented for standardized routes |
| S-UI-04 | Portal dialogs preserve theme and accessibility | Profile avatar selector uses the shared Dialog primitive and active Student body scope | Implemented; authenticated browser verification pending |

## Question Engine

| ID | Contract | Current implementation | Status |
|---|---|---|---|
| Q-01 | Canonical question semantics | Question Engine contains eight types, including ORDERING schema v1 with WORD/PHRASE/SENTENCE subtypes | Implemented structurally; Classic Ordering runtime implemented in M2 |
| Q-02 | Type behavior centralized | Handlers/registry exist, but ActivitySessionService still contains semantic branches | Partially implemented |
| Q-03 | Teacher/student projection separation | Teacher-oriented mappings exist; student leakage boundary requires endpoint-wide verification | Partially implemented; verification required |
| Q-04 | Explicit option order | V31/schema and API `displayOrder` support exist | Implemented |
| Q-05 | Durable Activity snapshots | V32 snapshot fields/payload exist and runtime reads snapshot for active question | Implemented structurally; immutability/rollout verification required |
| Q-06 | FILL_IN_BLANK remains distinct from multi-blank CLOZE | Separate types/specs exist | Implemented structurally |
| Q-07 | Hint round-trip across all authoring paths | Shared mapping exists, but endpoint-wide parity is not fully verified | Verification gap |
| Q-08 | Handler/contract tests | Focused tests exist | Implemented; full integration test gate remains |
| Q-09 | Ordering authoring and persistence | V63, Ordering handler/spec, persistence mappers and split Teacher authoring/preview components exist | M1 implemented; backend execution not verified in current environment |
| Q-10 | Ordering scope gates | Classic and Guided Final runtime accept Ordering; Guided Steps, Assignment/Assessment and CSV remain closed | M3 implemented; unsupported scopes remain fail-closed |
| Q-11 | Ordering Classic runtime | Classic eligibility, schema-v3 frozen shuffle, sanitized Student projection, typed answer, binary grading and Student controls exist | M2 implemented; targeted Maven execution blocked by environment |
| Q-12 | Ordering Guided Final runtime | READY/revision eligibility, pre-Final gate, shared Ordering submit/grading, Final Hint/retry and typed Review projection exist | M3 implemented; targeted Maven execution blocked by missing FSRS dependency |
| Q-13 | Ordering compatibility and QA | Assignment guard, malformed answer safety, alternative/duplicate grading, snapshot v2/v3 XP guards, mobile/keyboard semantics and disposable Classic/Guided seed exist | M4 source implemented; Maven and disposable-DB execution remain environment verification gates |

## Assignment Composition / Phase 7B

| ID | Contract | Current implementation | Status |
|---|---|---|---|
| A-01 | Builder is product authoring baseline, not disposable mock | Builder persists through Assignment/Question/Composition APIs; localStorage repository removed | Implemented baseline |
| A-02 | Ordered Composition is canonical order | Sections/items have persisted positions; legacy backfill uses question_id ASC | Implemented |
| A-03 | Weighted Assignment points live on Composition | Per-item possiblePoints/required/isExample exist and readiness validates score denominator | Authoring/readiness implemented; attempt scoring not implemented |
| A-04 | Assignment scoring is automatic; no manual/AUTO-MANUAL workflow | No AssessmentAttempt runtime exists yet | Not implemented |
| A-05 | Per-part persisted analytics | No AssessmentAttempt result persistence yet | Not implemented |
| A-06 | Publish readiness is a server invariant | `AssignmentService.updateStatus` validates metadata, targets, schedule, timer, questions, Composition and positive scored points | Implemented |
| A-07 | Hard lock after first attempt | No AssessmentAttempt exists | Not implemented |
| A-08 | AssessmentAttempt separate aggregate | No AssessmentAttempt implementation exists | Not implemented |
| A-09 | Question Engine used as canonical Assignment/runtime semantic engine | Engine exists but formal Assignment runtime does not | Partial |
| A-10 | Activity snapshots are immutable historical runtime data | Snapshot payload exists, but live Question FK remains and rollout/integration proof is incomplete | Partial |
| A-11 | `show_score_after_submit` default TRUE | Assignment entity contains boolean default TRUE | Implemented as configuration |
| A-12 | Compound part-point allocation | Target contract exists; complete MATCHING/CLOZE Composition round-trip is not verified | Partial |
| A-13 | Automatic Assignment grading on submit/timeout | AssessmentAttempt not implemented | Not implemented |

## Current migration baseline

The current branch contains migrations through **V63**. Older documents that name an earlier migration as the current baseline are historical and must not be used for migration numbering.

## Current UI routing contract

The teacher Content namespace is currently:

```text
/teacher/content
/teacher/content/units/:unitId
/teacher/content/sections/:sectionId
/teacher/content/topics/:topicId
/teacher/content/question-banks
/teacher/content/question-banks/:bankId
/teacher/content/questions/:questionId
```

Global Question Banks is nested under the Content navigation group. Do not document `/teacher/question-banks` or `/teacher/questions` as current routes.

## Verification rule

An implementation status is not a test result. If a test, build, Flyway validation, browser check or runtime check was not executed against the relevant current commit, record it as **not verified**, not as passed.
