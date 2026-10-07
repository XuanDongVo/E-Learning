# Spec status: what the docs say vs. what the code does

Verification baseline: `f27a99d4ba5cfbbaf88abe4e406dec14bb639610` (2026-10-07), immediately before the accompanying knowledge-base progress update. Re-verify whenever a phase closes or a normative artifact changes.

Rule: **accepted ADRs are authoritative for decisions; active specs are authoritative for intended phase behavior; code is authoritative for what exists.** Every disagreement gets a row here until it is fixed or explicitly superseded.

## 1. Drift register

| ID | Documents say | Code / ADR says | Resolution | State |
|---|---|---|---|---|
| D-01 | Activity lives under a Topic | `activities.unit_id` / Activity.unit | ADR 0008; active docs corrected | Fixed |
| D-02 | Assignment targets include obsolete types | AssignmentTargetType = GRADE, CLASS | ADR 0010; active docs corrected | Fixed |
| D-03 | Teacher ownership removed everywhere | `classes.teacher_id` exists; one-teacher scope is explicit | ADR 0005 | Fixed |
| D-04 | AssignmentQuestion described inconsistently | ADR 0003 and code define AssignmentQuestion ownership | ADR 0003 wins; docs restored/corrected | Fixed |
| D-05 | Phase 5 contains deferred Excel/reorder work | ADR 0003 defers Excel import/reorder until contract finalization | Track as OQ-7; do not implement spec-only deferred work | Tracked |
| D-06 | Phase numbering used old Phase 6 for Attempts | Phase 6 = Student Management; Phase 7 = Attempts | ADR 0004 | Fixed |
| D-07 | Agent entry paths referenced missing architecture/checklists/ADR/question-model artifacts | Branch now restores the canonical artifacts | Knowledge-base repair in this change | Fixed |
| D-08 | Definition of Done requires lint/typecheck/tests/build | Recorded client lint/typecheck failures; server test run not recorded; no CI | Quality gate in PROGRESS | Open |
| D-09 | Real APIs only / no fake metrics | Student/teacher dashboard mock data still exists | Replace when real data phases land | Open |
| D-10 | Activity completion gate includes preview | Preview DTOs exist without the endpoint | Implement or remove DTOs | Open |
| D-11 | Phase 6 runtime PASS was not claimed | Server tests still lack a recorded successful run | Run `./mvnw test` and record evidence | Open |
| D-12 | Old Phase 5 contract still described Release Answers | ADR 0011 makes score + answers available after submit | Removed old executable guidance from active Phase 5 spec | Fixed |

## 2. Rule traceability

A rule without a test is not complete under the Definition of Done. Add stable trace IDs as the corresponding phase is implemented.

| Rule | Source | Code | Test |
|---|---|---|---|
| Activity mode/time-limit/lives validation | Phase 4 spec | `ActivityValidationService` | Missing |
| Activity distribution | Phase 4 spec | `ActivityDistributionCalculator` | Missing |
| Activity publish requires READY | Phase 4 spec | `ActivityReadinessService` | Missing |
| Question-bank must belong to Activity Unit | Phase 4 spec | Validation/error code | Missing |
| Question completeness | `domain/question-model.md` | `QuestionContentValidator` | Missing |
| Assignment question limit/locking rules | ADR 0003 + Phase 5 | `AssignmentQuestionService` | Missing |
| Student Management membership/class lifecycle | Phase 6 plan | `StudentManagementService`, `ClassService` | Existing tests |

## 3. Usage

When a phase closes, compare docs against code again and update this register. A new unresolved disagreement is a stop condition for the agent: do not guess; update the register and obtain the required owner decision.