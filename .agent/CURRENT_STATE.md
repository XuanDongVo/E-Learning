# Current Implementation State

**Audit date:** 2026-11-01  
**Branch:** `feature/teacher-assignment-analysis`  
**Baseline:** `main` after merge of `feature/student-assignment-attempt` (PR #30)  
**Scope:** documentation rebaseline after closing the Student Assignment Attempt feature and opening the next Teacher Assignment Analysis feature.

## 1. Authority model

1. Accepted ADRs = approved product/architecture decisions.
2. `.agent/CURRENT_STATE.md` = current implementation state.
3. Active phase/spec/architecture documents = intended implementation contract.
4. `.agent/PROGRESS.md` = concise work log and verification evidence.
5. Historical audits/plans = traceability only.
6. Code and migrations = final evidence of what is actually implemented.

## 2. Repository baseline

- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: Spring Boot + Java 21 + JPA + Flyway + PostgreSQL.
- Assignment Attempt runtime was merged to `main` through PR #30.
- V43–V47 are the current AssessmentAttempt migration sequence on the merged baseline.
- ADR 0028 is authoritative for current answer storage: draft answer payload, revision and saved time live on `assessment_attempt_questions`; the former `assessment_attempt_answers` table is removed.
- AssessmentAttempt contains start/resume, immutable snapshot and autosave slices. Submit, timeout finalization, automatic grading and persisted PartResults remain follow-up implementation work and were not verified by this documentation audit.

## 3. Feature status

| Area | Current state | Classification |
|---|---|---|
| Phase 0–2 | Foundation, auth/users and classes | Implemented baseline |
| Phase 3 Content | Grade → Unit → Section → Topic → QuestionBank → Question CRUD/preview/completeness/hint | Implemented baseline; Question Engine migration/integration still partial |
| Phase 4 Activity | Unit-scoped Activity, banks/distribution, modes, strategies, readiness, preview and lifecycle | Implemented baseline |
| Phase 5 Assignment | Assignment authoring, recipients, schedule, Composition, settings | Implemented authoring baseline |
| Phase 6 Student Management | Student/class/profile management | Done |
| Phase 7 Scope A | ActivitySession runtime | Implemented baseline; end-to-end verification remains open |
| Phase 7 Scope B | AssessmentAttempt start/resume, snapshot and autosave baseline | Feature closed/merged; remaining runtime completion is follow-up |
| Teacher Assignment Analysis | Business specification created; implementation not started | **ACTIVE NEXT FEATURE** |

## 4. Closed Student Assignment Attempt feature

`feature/student-assignment-attempt` is considered closed as a feature branch because its work was merged to `main` in PR #30.

Closure does **not** mean every planned runtime capability is production-verified. The remaining gaps are explicitly carried forward:

- submit finalization
- timeout finalization
- automatic grading
- persisted per-part result generation
- result/review endpoints
- Assignment hard-lock after first Attempt
- full Question Engine runtime/persistence parity
- exact-HEAD backend/frontend/browser verification

These are implementation follow-ups, not reasons to reopen the historical branch.

## 5. Current Teacher Assignment Analysis contract

Canonical next feature specification:

`.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`

Scope:

```text
Assignment
├── Overview
│   ├── Progress
│   ├── Score
│   └── Class Comparison
├── Students
│   └── Attempt Review
└── Questions
    ├── Assignment Section grouping
    └── Question Analysis
```

The analysis is based on persisted AssessmentAttempt/grading data. It must not re-grade from mutable Question Bank content or calculate authoritative metrics in the browser.

Important domain boundary:

- Assignment Section = Composition grouping inside an Assignment.
- Content Section = Unit-owned content hierarchy.
- Teacher Assignment Analysis uses Assignment Section only as grouping/context; it does not implement Content Section/Unit/Topic analytics in MVP.

## 6. Dependency gate for Teacher Analysis

Teacher Analysis is not production-ready until the Assignment Attempt pipeline can persist reliable finalized results:

1. submit
2. timeout finalization
3. automatic grading from immutable snapshot
4. PartResults
5. Attempt totals
6. example-question exclusion
7. historical snapshot integrity

The Teacher Analysis UI may be built against a contract/mock dataset before those dependencies are complete, but must not be presented as real analytics until the backend result pipeline is verified.

## 7. Verification status

This documentation rebaseline did not run backend compile/tests, Flyway validation, frontend lint/typecheck/build or browser/E2E. No new implementation verification is claimed.
