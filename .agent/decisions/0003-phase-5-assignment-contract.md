# 0003 — Phase 5 assignment contract
Status: Accepted
Date: 2026-10-02

## Context

Phase 5 introduces formal Assignments that are independent from Activities. The specification had open
questions affecting persistence, scheduling, recipient resolution and the future Excel importer.

## Decision

- An Assignment stores `grade_level` and `academic_year` for target resolution.
- Students may start after `due_at`; the submission is labeled `Late` without a score penalty.
- `time_limit_seconds` is per Attempt and independent of `due_at`.
- Assignment questions are owned by the Assignment and are locked after the first Attempt exists.
- `topic_id` on an AssignmentQuestion is nullable and used for optional organization/statistics.
- Excel import accepts `.xlsx` text-only files up to 5 MB and 100 questions per Assignment.
- Excel work follows `template → upload → preview → confirm`; validation happens again during commit.
- Apache POI (`poi-ooxml`) is the backend Excel library.
- Import/template work is implemented after the Assignment API and teacher authoring flow.

## Consequences

Assignment must not reference Activity or QuestionBank as its question source. The backend must derive readiness
from owned questions and target/schedule configuration. The frontend must provide a downloadable official template
before presenting Excel import as complete.
