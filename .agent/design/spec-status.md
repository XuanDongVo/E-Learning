# Spec status: what the docs say vs. what the code does

Verified against commit `0905da0` (2026-10-06) on 2026-10-07. Re-verify whenever a phase closes.
Rule: **the code is authoritative for what exists; accepted ADRs for what is decided.** Every disagreement gets a row here until it is fixed.

## 1. Drift register

| ID | Documents say | Code / ADR says | Resolution | State |
|---|---|---|---|---|
| D-01 | Activity lives under a Topic (`activities.topic_id`): Phase 4 spec §3.1, `domain-model.md` | `activities.unit_id` (migration V15, `Activity.unit`); no ADR records the move | ADR 0008; spec §3.1 and domain model corrected | Fixed |
| D-02 | Assignment targets `CLASS`/`STUDENT`/`GRADE`/`ALL`: `PHASES.md`, `domain-model.md` | `AssignmentTargetType = GRADE, CLASS` (Phase 5 spec v2 agrees) | ADR 0010; `PHASES.md` and `domain-model.md` corrected | Fixed |
| D-03 | "The system has one teacher; `teacher_id` removed": Phase 5 spec v2 | `classes.teacher_id` exists; Phase 6 scopes students by teacher-owned classes | ADR 0005 | Fixed |
| D-04 | `domain-model.md` lists `AssignmentQuestion` under "NOT core entities"; `PHASES.md` says "do not invent a new entity for assignment questions" | ADR 0003 (Accepted), Phase 5 spec and code have `AssignmentQuestion` (`assignment_questions`) | ADR 0003 wins; docs fixed in this change | Fixed |
| D-05 | Phase 5 spec §3.2 includes Excel import, question reorder, readiness, recipients preview, locking | ADR 0003 defers Excel and reorder; readiness, recipients preview, locking are not in code; release-answers is dropped by ADR 0011 | ADR wins; remaining items tracked in `PROGRESS.md` | Tracked |
| D-06 | `PHASES.md` Phase 6 = Attempts | Merged "Phase 6" = Student Management (PR #7) | ADR 0004 (Accepted); `PHASES.md` renumbered, notes added to old specs | Fixed |
| D-07 | `AGENTS.md` links to `.agent/...`, `ui/`, `PROGRESS.md`, `README.md`, `ui/screens.md` | Entry point lived in `client-e-learning/`; folder was `ui-design/`; three files missing | Moved to repo root, renamed folder, files created | Fixed |
| D-08 | Definition of Done: lint, typecheck, tests, build must pass | Client: ESLint 21 errors / 26 warnings; `tsc` 1 error; `npm ci` fails; no CI | Quality-gate task in `PROGRESS.md` | **Open** |
| D-09 | "Real APIs only, no fake metrics" | Student dashboard reads `src/mock`; teacher dashboard shows hardcoded numbers (for example "4 classes, 128 students") | Replace when the data exists (Analytics / Dashboard phases) | **Open** |
| D-10 | Phase 4 completion gate includes "preview" | `ActivityPreviewRequest/Response` DTOs exist, but no controller endpoint or service method | Implement per Phase 4 spec §11, or delete the DTOs | **Open** |
| D-11 | Phase 6 plan: "runtime PASS not claimed" | Server tests have never been recorded as run | Run `./mvnw test` locally and record the result | **Open** |

## 2. Rule traceability (spec rule → code → test)

Only rules that exist today are listed. A rule without a test is not "done" in the Definition-of-Done sense.

| Rule | Source | In code | Test found |
|---|---|---|---|
| `LEARNING` mode rejects time limit and lives; `TRY_HARD` needs time limit > 0 and lives ≥ 1 | Phase 4 §6 | `ActivityValidationService` | none |
| Distribution `EQUAL` / `PERCENTAGE` / `FIXED_COUNT` | Phase 4 §8 | `ActivityDistributionCalculator` | none |
| Publish an Activity only when READY; readiness is derived, never stored | Phase 4 §12 | `ActivityReadinessService`, `ACTIVITY_NOT_READY` | none |
| Question bank used by an Activity must belong to the same Unit | Phase 4 §7 | `ACTIVITY_QUESTION_BANK_OUTSIDE_UNIT` | none |
| Question completeness (`is_complete`) | `question-model.md` | `QuestionContentValidator` | none |
| Assignment max 100 questions; questions locked when archived | Phase 5 §7, ADR 0003 | `ASSIGNMENT_QUESTION_LIMIT_EXCEEDED`, `AssignmentQuestionService` | none |
| Assignment publish only when READY | Phase 5 §6.1, §10.7 | **missing** (no readiness, no `ASSIGNMENT_NOT_READY`) | none |
| Assignment: one attempt, Late label, time limit per attempt, snapshot of questions | ADR 0001, ADR 0003, Phase 5 §6.3–6.4 | **missing** (no Attempt tables) | none |
| Student: create transactionally, lock/unlock, membership rules, class archive | Phase 6 plan | `StudentManagementService`, `ClassService` | `StudentManagementServiceTest`, `StudentManagementControllerTest`, client `student.service.test.ts`, `class.service.test.ts`, `student-filters.test.ts` |

Test inventory (2026-10-07): server 3 test classes (2 cover Student Management, 1 context load); client 3 files, 12 tests, all passing.

## 3. How this file is used

- When a phase closes, re-run the comparison and update both tables.
- A new row in §1 means: stop, ask the owner, then record the answer (ADR if it changes a decision).
- A rule in §2 with "none" under Test becomes a task in `PROGRESS.md`.
