# Current Implementation State

**Audit date:** 2026-11-01  
**Branch:** `feature/teacher-assignment-analysis`  
**Baseline:** `main` after merge of `feature/student-assignment-attempt` (PR #30)

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
- AssessmentAttempt finalize path is on `main` (submit, grade, PartResults, timeout job).

## 3. Feature status

| Area | State |
|---|---|
| Phase 0–6 | Baseline / DONE |
| Phase 7 Scope A ActivitySession | Implemented; E2E open |
| Phase 7 Scope B AssessmentAttempt | Code on `main`; E2E + hard-lock open |
| **Phase 8 Teacher Assignment Analysis** | **Code complete on this branch; local E2E not claimed** |

## 4. Teacher Assignment Analysis (this branch)

**Route:** `/teacher/assignments/{id}/results`  
**Spec:** `.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`  
**Impl log:** `.agent/plans/11-TEACHER_ASSIGNMENT_ANALYSIS_IMPLEMENTATION.md`

### Backend (`assignmentanalysis`)

- `GET .../analytics/overview` — progress, score (10 buckets), class comparison + accuracy + overall band
- `GET .../analytics/students` — filters + `PageResponse` (1-indexed)
- `GET .../analytics/questions` — aggregate by position (skip example)
- `GET .../students/{studentId}/attempt` — review; answer key always for teacher
- DTOs under `dto/response/` (no `Dto` suffix); students use `common.dto.PageResponse`
- Roster: live enrollment via `Assignment.classIds` + `ClassMember`
- Security: covered by existing `/v1/teacher/**` → `ROLE_TEACHER`

### Frontend

- Modular UI under `components/features/teacher/assignments/analysis/`
- Entry: list **Results** link (non-DRAFT) + results page route
- Attempt review sheet; i18n `teacher.analytics.*`
- Always `response.data` (ApiResponse wrap)
- Sample `result/teacher-assignment-result-view.tsx` **removed**

### Product decisions (locked)

| Topic | Decision |
|---|---|
| Roster | Live `classIds` enrollment |
| Duration | finishedAt − startedAt |
| Overall band | HIGH ≥80 / MID ≥50 / LOW &lt;50 (median %) |
| Accuracy | CORRECT / all non-example outcomes on terminal attempts |
| Class comparison | Always show rows (including single class) |
| Score range filter | Deferred |
| Export | None |

### Explicitly deferred (spec ok, not in MVP code)

- Answer distribution by question type (option/blank charts)
- Per-question detail endpoint
- Score range filter on Students
- IDOR tests / ownership beyond role + assignment exists
- Hard-lock on Assignment after first attempt (runtime follow-up)

## 5. Verification status

No compile/test/browser run claimed for this pass. Local E2E checklist lives in `11-...IMPLEMENTATION.md`.
