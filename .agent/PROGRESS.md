# Project Progress

Audit date: 2026-10-07
Branch: phase-6-student-management

## Current stage

Phase 6 Student Management is done.
Phase 7 Attempts/Answers remains DRAFT and is waiting for owner sign-off.
This update is documentation-only: no application code or database migration is changed.

## Knowledge-base sync completed in this update

- Activity is consistently Unit-scoped.
- GameTemplate is removed from the current Activity domain contract and deferred as presentation work.
- Activity strategy selection is explicit: student chooses when more than one strategy is available; Attempt stores the concrete strategy.
- Try Hard timer is per question.
- AssignmentQuestion has no position and no reorder contract; list order is deterministic by question_id ascending.
- Assignment answer visibility is controlled by show_answers_after_submit; answers_released_at / Release Answers is historical only.
- Activity lifecycle transitions are explicit.
- Draft Activities may be incomplete; publish requires readiness.
- Activity preview is a real Phase 4 workflow contract.
- Learning Mode keeps the optional per-question hint; the Topic formula/reference sheet is deferred and not a current schema/UI requirement.

## Quality gate state

- Client tests: previously recorded as passing for 3 files / 12 tests.
- Client ESLint: previously failing; re-run after implementation changes before claiming clean.
- Client TypeScript: previously failing in QuestionPreviewModal.tsx; re-run before claiming clean.
- npm ci: previously failed because the lockfile was out of sync.
- Server ./mvnw test: no successful run recorded yet.
- GitHub Actions: not present.

This documentation-only sync does not change those verification facts.

## Next implementation gates

1. Re-run client lint/typecheck/test/build and server tests.
2. Keep Phase 7 blocked until the Attempts spec receives owner sign-off.
3. When Phase 7 starts, implement Activity strategy selection persistence, per-question Try Hard deadlines, Assignment deterministic snapshot order, and Assignment answer-visibility behavior.
