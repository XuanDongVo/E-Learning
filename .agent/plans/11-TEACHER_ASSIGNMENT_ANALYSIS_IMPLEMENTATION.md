# Teacher Assignment Analysis — Implementation Status

**Status:** FEATURE COMPLETE (code) — pending local E2E  
**Branch:** `feature/teacher-assignment-analysis`  
**Spec:** `10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`  
**Last updated:** 2026-11-01

## Decisions locked

| Topic | Decision |
|---|---|
| Roster | Live enrollment in `Assignment.classIds` |
| Duration | `finishedAt - startedAt` |
| Overall band | HIGH ≥80 / MID ≥50 / LOW <50 median % |
| Accuracy denominator | Non-example outcomes on terminal attempts; CORRECT only in numerator |
| Score distribution | Fixed 10 buckets |
| Auth | `/v1/teacher/**` → `ROLE_TEACHER` (already in SecurityConfig) |
| Answer key | Always on teacher attempt review |
| Students page | `PageResponse` 1-indexed |

## Implemented

### Backend
- `dto/response/*` without Dto suffix; students use `common.dto.PageResponse`
- Overview: progress, score, class comparison + **accuracyPercent**
- Students filters + paging
- **Questions aggregation** by position (skip example); accuracy + score rate
- Attempt review with answer key
- Batch load questions/parts by attempt ids

### Frontend
- Modular analysis UI + AttemptReviewSheet
- i18n vi/en `teacher.analytics`
- Feedback + Skeleton; always `res.data`

### Security
- Verified: no additional path rules needed for `/v1/teacher/assignments/{id}/analytics/**`

## Local E2E checklist

1. Teacher → `/teacher/assignments/{id}/results`
2. Overview metrics with graded data
3. Students filter + review sheet
4. Questions tab counts
5. Non-terminal attempt → 409

## Optional later

- Remove sample `result/teacher-assignment-result-view.tsx`
- Cache/large-class performance
