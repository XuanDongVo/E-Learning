# Current Implementation State

**Audit date:** 2026-10-31  
**Branch:** `feature/student-assignment-attempt`  
**Scope:** current source state after Sprint 0 contract implementation and session-policy rebaseline. This file records implementation truth; no runtime/build/browser verification was executed by these documentation changes.

## 1. Authority model

1. Accepted ADRs = approved product/architecture decisions.
2. `.agent/CURRENT_STATE.md` = current implementation state on this branch.
3. Active phase/spec/architecture documents = intended implementation contract.
4. `PROGRESS.md` = concise work log and verification record.
5. Historical audits/plans = traceability only.
6. Code = final authority when documentation and code disagree.

## 2. Repository baseline

- Frontend: Next.js + React + TypeScript + Tailwind CSS.
- Backend: Spring Boot + Java 21 + JPA + Flyway + PostgreSQL.
- V43 AssessmentAttempt schema was reported applied by the project owner and remains immutable; V45 migrates the Attempt duration column to minutes; V46 answer mutations; **V47 merges draft answer onto AssessmentAttemptQuestion and drops assessment_attempt_answers** (ADR 0028).
- `assessmentattempt` contains entities/repositories, contract DTOs, getIntro/startOrResume + snapshot, and autosave on the question row. Submit, timeout finalization and grading remain incomplete.

## 3. Phase status

| Area | Current state | Classification |
|---|---|---|
| Phase 0–2 | Foundation, auth/users and classes exist | Implemented baseline |
| Phase 3 Content | Grade → Unit → Section → Topic → QuestionBank → Question CRUD/preview/completeness/hint | Implemented baseline; semantic Question Engine migration still partial |
| Phase 4 Activity | Unit-scoped Activity, banks/distribution, modes, strategies, readiness, preview and lifecycle | Implemented baseline |
| Phase 5 Assignment | Assignment, Grade ownership, class target snapshots, schedule, whole-attempt time limit, answer/score display settings, Composition | Authoring baseline plus initial Attempt start/resume slice; scoring incomplete |
| Phase 6 Student Management | Student/class/profile management | Done |
| Phase 7 Scope A | ActivitySession runtime exists | Implemented, but Question Engine integration/verification incomplete |
| Phase 7 Scope B | Assignment authoring + V43/V45/V47 runtime schema + start/resume + autosave on question | **Partial; runtime not fully verified** |

See historical sections below for sprint-by-sprint notes. **Authoritative draft-answer storage:** ADR 0028 / section 18.

## 18. Draft answer on AssessmentAttemptQuestion — 2026-10-31 (ADR 0028)

- Accepted ADR 0028: remove 1–1 `AssessmentAttemptAnswer`; store `answer_payload`, `@Version revision`, and `saved_at` on `AssessmentAttemptQuestion`.
- V47 adds those columns and drops `assessment_attempt_answers` (no data backfill; owner confirmed cleared DB).
- `AssessmentAttemptAnswerService.saveAnswer` updates the question row; Mutation idempotency unchanged.
- Runtime projection reads answer fields from the question and still strips `grading` from student payloads.
- Normalized draft values are not persisted; analytics normalize on submit/grade later (e.g. PartResult).
- API wire shape unchanged. Service class name not renamed.
- Verification: source-only; compile/Flyway/tests/browser not run on this HEAD.

---

*Earlier sprint notes (sections 4–17) remain in git history on this branch; truncated here only if the previous full body is still present on the branch prior to this doc slice. Prefer section 2, section 18, ADR 0028, and PROGRESS.md for current truth on answer storage.*
