# .agent Knowledge Base Index

**Index version:** 1.0  
**Last structural/source audit:** 2026-10-25  
**Branch baseline:** `feature/student-assignment-attempt`  
**Rule:** this index describes the documentation lifecycle; it does not replace the code as evidence of implementation.

## 1. Read order

The numbered sequence below is the required reading order for an AI agent. The sequence number is a knowledge-flow order, not an invented historical creation date.

| Order | Document/group | Purpose | Authority |
|---|---|---|---|
| 00 | `.agent/00-INDEX.md` | Entry point, reading order, document lifecycle | Navigation only |
| 01 | `.agent/CURRENT_STATE.md` | What exists in the current branch and what remains unverified | Current implementation snapshot |
| 02 | `.agent/PROGRESS.md` | Latest work, validation evidence and next gates | Work log; must not redefine product rules |
| 03 | `.agent/intent/0001-core-platform.md` and `open-questions.md` | Product purpose, goals and unresolved questions | Product intent, subject to accepted ADRs |
| 04 | `.agent/decisions/README.md`, then numbered ADRs | Accepted decisions and decision history | Product/architecture decisions |
| 05 | `.agent/domain/` | Domain vocabulary, business rules, entities and invariants | Active domain contract, reconciled with ADRs |
| 06 | `.agent/architecture/` | Backend/frontend boundaries, API and architectural contracts | Active architecture, reconciled with ADRs and code |
| 07 | `.agent/plans/PHASES.md`, then the active phase spec | Scope and phase sequencing | Active execution scope |
| 08 | Task-specific plans under `.agent/plans/` | Concrete implementation plan for a current task | Active only when explicitly marked active |
| 08 (active plan) | `.agent/plans/08-STUDENT_ASSIGNMENT_ATTEMPT_SPEC.md` | Vietnamese business rules, ERD, use cases, risks and acceptance criteria for Student Assignment Attempt | Active specification; schema/skeleton added, runtime not implemented |
| 09 | `.agent/ui/` | Screen, route, interaction and accessibility contracts | UI contract; never overrides API/domain rules |
| 10 | `.agent/checklists/definition-of-done.md` | Verification gate | Process requirement |
| 11 | `.agent/audits/` | Dated evidence of prior code audits and migrations | Historical evidence; not current state unless revalidated |

## 2. Authority and conflict resolution

When sources disagree, apply this order:

1. Latest explicit owner decision / accepted ADR for product intent.
2. Current code and migrations for what is actually implemented.
3. `CURRENT_STATE.md` for the last documented implementation audit; if stale, correct it after inspecting code.
4. Active domain and architecture contracts.
5. Active phase specification and current task plan.
6. UI blueprint and checklist.
7. Dated audits and superseded plans as historical evidence only.

**Accepted does not mean implemented. Implemented does not mean verified.** Every status claim must distinguish these states.

## 3. Numbering and naming policy

- The leading order numbers in this index define the required reading sequence.
- ADRs keep their existing monotonic IDs (`0001`, `0002`, …); never renumber an existing ADR.
- Dated audits use `YYYY-MM-DD-<topic>.md`; dates must be actual audit dates.
- Active phase specs keep stable phase-based names so references remain clear.
- A task plan must declare `Status`, `Owner/branch` when relevant, `Last reviewed`, `Canonical state`, and explicit exit criteria.
- Do not add a second status file for the same feature. Put current status in `CURRENT_STATE.md`, execution/verification history in `PROGRESS.md`, and detailed task steps in one active plan.
- Historical plans must be marked `COMPLETED`, `SUPERSEDED`, or `ARCHIVED`; they must not remain phrased as instructions to execute.
- Do not encode an assumed creation date as a sequence number. Use the index for reading order and dates for actual chronology.

## 4. Folder policy

| Folder | Keep | Remove/archive when |
|---|---|---|
| `intent/` | One canonical platform intent and unresolved owner questions | Content is fully superseded or duplicated |
| `decisions/` | Numbered ADRs plus ADR index | Do not delete accepted history; supersede with a later ADR |
| `domain/` | Canonical glossary, domain model, business rules, question model | Merge overlapping contracts, then remove duplicate source |
| `architecture/` | Backend, frontend, API, engineering rules, Question Engine and Composition architecture | Delete duplicate status reports after merging useful facts |
| `plans/` | Phase specs and only currently actionable plans | Delete completed one-off plans after their durable outcome is captured elsewhere; Git history retains them |
| `ui/` | Current route/screen blueprints and reusable design guidelines | Remove overlapping blueprints after merging unique requirements |
| `audits/` | Dated audit evidence with scope and verification limits | Keep historical evidence; do not present it as current state |
| `checklists/` | Reusable Definition of Done / release gates | Merge duplicate checklists |
| Root | Index, current state, concise progress | No extra feature-status summaries |

## 5. Current high-priority facts

- Current task branch: `feature/student-assignment-attempt`; `refactor/teacher-content-ui-routing` is the parent/base branch for the Assignment Attempt work.
- New AssessmentAttempt migration V43 is added on `feature/student-assignment-attempt`; verify Flyway validation and actual database state before applying it or allocating any later version.
- Question Engine has seven handlers/specs and factory/mapper branches. ActivitySession still uses legacy grading branches; MATCHING POOL references are not resolved/validated; CLOZE cardinality validation is present. End-to-end parity remains unverified.
- Latest source audit: `.agent/audits/2026-10-25-question-engine-current-code-audit.md`.
- Assignment Composition authoring/API persistence exists. V43 and initial `AssessmentAttempt` entity/repository/service skeleton are added; runtime behavior is not implemented or verified.
- ActivitySession exists, but snapshot-only semantics and complete leakage/immutability verification remain open.
- Teacher content routes are under `/teacher/content/...`.
- Current implementation and remaining gaps are recorded in `CURRENT_STATE.md`; do not infer them from old plans.

## 6. Audit inventory

See [AUDIT_INVENTORY.md](./AUDIT_INVENTORY.md) for the file-by-file classification, duplicate candidates and cleanup decisions. Update that inventory whenever files are added, renamed or removed.

## 7. Completion criteria for this documentation refactor

- Every file under `.agent` has a declared role and status in `AUDIT_INVENTORY.md`.
- Duplicate or completed one-off plans are removed after preserving any unique current facts.
- Active docs no longer state old branch names, old migration baselines, or already-implemented work as pending.
- Internal links resolve after any renames.
- The current state is traceable to code; test/build/browser checks are claimed only when run.
