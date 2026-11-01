# Teacher Assignment Analysis — Implementation Scaffold

**Status:** IN PROGRESS  
**Branch:** `feature/teacher-assignment-analysis`  
**Spec:** `10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`  
**Last updated:** 2026-11-01

## Decisions locked

| Topic | Decision |
|---|---|
| Roster | Live enrollment in `Assignment.classIds` |
| Duration | `finishedAt - startedAt` (`submittedAt` or `timedOutAt`) |
| 1-class comparison | Still show one row |
| Overall band | HIGH ≥80 / MID ≥50 / LOW <50 median % |
| Accuracy denominator | All finalized graded attempts; statuses CORRECT/PARTIAL/INCORRECT/UNANSWERED |
| Score filter | Deferred |
| Score distribution | Fixed 10 buckets |
| Auth MVP | TEACHER + assignment exists |
| Export | None |
| Attempt review answer key | Always visible to teacher |

## FE structure (modular)

```text
components/features/teacher/assignments/analysis/
  analysis-page.tsx
  analysis-header.tsx
  analysis-tabs.tsx
  types.ts
  overview/
    overview-panel.tsx
    progress-summary.tsx
    score-summary.tsx
    score-distribution.tsx
    class-comparison-table.tsx
  students/
    students-panel.tsx
    students-filters.tsx
    students-table.tsx
  questions/
    questions-panel.tsx
```

Legacy sample (do not extend): `.../result/teacher-assignment-result-view.tsx`

Route: `/[locale]/teacher/assignments/[id]/results?tab=overview|students|questions`

i18n: `messages/{vi,en}/teacher/analytics.json` under namespace `teacher.analytics`

Feedback: `RegionState`, `FullPageState`; loading: `Skeleton` / `SkeletonTable`

Service: `services/assignment/assignment-analysis.service.ts` — **always `res.data`**

## BE structure

```text
server/.../assignmentanalysis/
  AssignmentAnalysisController.java
  service/AssignmentAnalysisService.java   # skeleton: empty aggregates, assignment lookup
  dto/*Response / *Dto
```

Endpoints:

- `GET /v1/teacher/assignments/{id}/analytics/overview`
- `GET /v1/teacher/assignments/{id}/analytics/students`
- `GET /v1/teacher/assignments/{id}/analytics/questions`
- `GET /v1/teacher/assignments/{id}/students/{studentId}/attempt`

## Next slices

1. Overview aggregation (roster + attempts + score + class rows)
2. Students pagination/filters
3. Questions aggregate by snapshot + PartResult
4. Attempt review sheet UI + endpoint body
5. Security config path permit for TEACHER role if needed
6. E2E with real graded attempts
