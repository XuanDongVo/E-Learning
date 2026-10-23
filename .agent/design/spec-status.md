# Spec Status — Current Contract vs Implementation

**Audit date:** 2026-10-23  
**Branch:** `refactor/teacher-content-ui-routing`  
**Canonical implementation state:** `.agent/CURRENT_STATE.md`

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
| D-11 | Question hint is optional | Hint exists and Activity Practice hint endpoint uses it | Implemented; full authoring round-trip still requires verification |
| D-12 | No fabricated dashboard metrics | Dashboard work uses real/future data boundary | Implemented baseline |

## Question Engine

| ID | Contract | Current implementation | Status |
|---|---|---|---|
| Q-01 | Canonical question semantics | Question Engine contains seven types: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, MATCHING, CLOZE | Implemented structurally |
| Q-02 | Type behavior centralized | Handlers/registry exist, but ActivitySessionService still contains semantic branches | Partially implemented |
| Q-03 | Teacher/student projection separation | Teacher-oriented mappings exist; student leakage boundary requires endpoint-wide verification | Partially implemented; verification required |
| Q-04 | Explicit option order | V31/schema and API `displayOrder` support exist | Implemented |
| Q-05 | Durable Activity snapshots | V32 snapshot fields/payload exist and runtime reads snapshot for active question | Implemented structurally; immutability/rollout verification required |
| Q-06 | FILL_IN_BLANK remains distinct from multi-blank CLOZE | Separate types/specs exist | Implemented structurally |
| Q-07 | Hint round-trip across all authoring paths | Shared mapping exists, but endpoint-wide parity is not fully verified | Verification gap |
| Q-08 | Handler/contract tests | Focused tests exist | Implemented; full integration test gate remains |

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

The current branch contains migrations through **V42**. Older documents that say V30/V31/V32/V33 is the current baseline are historical and must not be used for migration numbering.

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
