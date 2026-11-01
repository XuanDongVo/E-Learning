# Teacher Assignment Analysis — Implementation Scaffold

**Status:** IN PROGRESS  
**Branch:** `feature/teacher-assignment-analysis`  
**Spec:** `10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`  
**Last updated:** 2026-11-01

## Done in this branch (code)

### Backend
- DTO under `assignmentanalysis/dto/response/*` (no `Dto` suffix)
- Students list uses `common.dto.PageResponse` (1-indexed `page`)
- `AssignmentAnalysisService.getOverview` — live roster via `classIds` + `ClassMember`, attempts, progress, score distribution (10 buckets), class comparison + overall band
- `getStudents` — filter + in-memory page
- `getAttemptReview` — terminal attempts only; teacher always sees answer key from snapshot grading
- `getQuestions` — still empty stub
- Repo: `findAllByAssignmentIdWithStudent`

### Frontend
- Modular analysis UI
- `AttemptReviewSheet` wired from Students “View”
- Service uses `res.data`; students page 1-indexed
- i18n `teacher.analytics.review.*`

## Next phase

1. **Questions aggregation** from PartResults across finalized attempts (+ section grouping)
2. Class-level **accuracyPercent** (needs question outcomes)
3. Delete legacy sample `result/teacher-assignment-result-view.tsx` when UI stable
4. Spring Security path check for `/v1/teacher/assignments/**`
5. Remove leftover `*Dto.java` files if still present under old dto package root
6. E2E with real graded attempts
