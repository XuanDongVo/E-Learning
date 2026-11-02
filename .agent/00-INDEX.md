# .agent Knowledge Base Index

**Index version:** 1.1  
**Last structural/source audit:** 2026-11-01  
**Branch baseline:** `feature/teacher-assignment-analysis`  
**Rule:** this index describes the documentation lifecycle; it does not replace the code as evidence of implementation.

## 1. Read order

1. `00-INDEX.md` — reading order, authority and lifecycle policy.
2. `CURRENT_STATE.md` — actual implementation state and known gaps.
3. `PROGRESS.md` — latest work and verification record.
4. Product intent and open owner questions.
5. Accepted ADRs, in numerical order; read the ADR index first.
6. Domain and architecture contracts relevant to the task.
7. `plans/PHASES.md` and the active phase specification.
8. One active task plan, if one exists.
9. Relevant UI blueprint and Definition of Done checklist.

## 2. Authority and conflict resolution

1. Latest explicit owner decision / accepted ADR.
2. Current code and migrations for implementation truth.
3. `CURRENT_STATE.md`.
4. Active domain and architecture contracts.
5. Active phase/specification and task plan.
6. UI blueprint and checklist.
7. Dated audits and superseded plans as historical evidence.

**Accepted does not mean implemented. Implemented does not mean verified.**

## 3. Current phase

The Student Assignment Attempt feature is closed as a branch and merged through PR #30. Its remaining runtime gaps are follow-up implementation work and are not carried as an active historical branch.

The next active feature is:

`Teacher Assignment Analysis`

Canonical specification:

`.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`

The feature analyzes one Assignment through:

```text
Overview
├── Progress
├── Score
└── Class Comparison

Students
└── Attempt Review

Questions
├── Assignment Section grouping
└── Question Analysis
```

## 4. Important domain boundary

`Assignment Section` is a Composition grouping inside an Assignment. It is not the `Content Section` under Unit.

Teacher Assignment Analysis must not introduce Unit/Content Section/Topic analytics in MVP.

## 5. Naming and lifecycle policy

- ADR IDs remain monotonic and are never renumbered.
- Dated audits retain their actual dates.
- Active task plans declare status, owner/branch, last reviewed date, canonical state and exit criteria.
- Completed one-off plans become historical or are removed only after durable facts are represented elsewhere.
- `CURRENT_STATE.md` is the current implementation snapshot; `PROGRESS.md` is the work/verification log.

## 6. Current implementation facts

- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: Spring Boot + Java 21 + JPA + Flyway + PostgreSQL.
- Assignment Attempt migrations currently include V43–V47.
- ADR 0028 governs current draft-answer storage on `AssessmentAttemptQuestion`; `assessment_attempt_answers` is no longer the current schema.
- Teacher Analysis depends on finalized persisted grading results and must not implement a second grading engine.
- Teacher Content routes remain under `/teacher/content/...`.

## 7. Documentation completion criteria

- Every active plan has a clear lifecycle status.
- Historical Student Attempt plans are not presented as active instructions.
- Current state names the next feature and its dependency gates.
- No document claims build/test/browser validation unless it was actually run.
- Internal links remain valid after documentation changes.
