# Teacher Assignment Analysis — Implementation Status

**Status:** FEATURE COMPLETE (code) — pending local E2E  
**Branch:** `feature/teacher-assignment-analysis`  
**Spec:** `10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`  
**Last updated:** 2026-11-01

## Implemented

### Backend
- `dto/response/*` without Dto suffix; `PageResponse` for students
- Overview, students, questions aggregation, attempt review
- Class accuracyPercent; overall band; live roster
- Batch question/part load by attempt ids
- `questionId` key = `pos-{position}` (no lazy sourceQuestion)

### Frontend
- `analysis/` modules + AttemptReviewSheet
- Results route + **Results** link from assignment list (non-DRAFT)
- i18n `teacher.analytics`; feedback/skeleton
- Sample result view deleted

### Security
- `/v1/teacher/**` already requires TEACHER

## Deferred (documented, not blockers)

- Answer distribution charts by question type
- `GET .../analytics/questions/{id}` detail
- Students score-range filter
- Export / hard-lock / full IDOR suite

## Local E2E checklist

1. Compile server + FE
2. List → Results on published assignment
3. Overview / Students+review / Questions with graded data
4. Non-terminal attempt review → 409
