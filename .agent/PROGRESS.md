# Project Progress

Audit date: 2026-10-07
Branch: phase-6-student-management

## Current stage

Phase 6 Student Management is done.
Phase 7 Scope A ActivitySession is implemented in the working tree; Scope B AssessmentAttempt remains deferred.

## Knowledge-base sync completed in this update

- Activity is consistently Unit-scoped.
- GameTemplate is removed from the current Activity domain contract and deferred as presentation work.
- Activity strategy selection is explicit: student chooses when more than one strategy is available; ActivitySession stores the concrete strategy.
- Try Hard timer is per question.
- AssignmentQuestion has no position and no reorder contract; list order is deterministic by question_id ascending.
- Assignment answer visibility is controlled by show_answers_after_submit; answers_released_at / Release Answers is historical only.
- Activity lifecycle transitions are explicit.
- Draft Activities may be incomplete; publish requires readiness.
- Activity preview is a real Phase 4 workflow contract.
- Learning Mode keeps the optional per-question hint; the Topic formula/reference sheet is deferred and not a current schema/UI requirement.

## Quality gate state

- Client tests: not re-run; Vitest dependencies are unavailable in the current install.
- Client ESLint: still failing on pre-existing errors in assignment/grades screens.
- Client TypeScript/build: still failing on pre-existing student-management, QuestionPreviewModal and missing Vitest type errors; changed hint files have no reported problems.
- npm ci: previously failed because the lockfile was out of sync.
- Server ./mvnw test: blocked because JAVA_HOME/Java is not configured in this environment.
- GitHub Actions: not present.

Activity Draft authoring, deterministic Activity Preview, Activity lifecycle transitions, and AssignmentQuestion question_id ordering
are implemented. Targeted server execution remains blocked because this environment has no configured Java/JAVA_HOME.
Assignment answer visibility authoring/schema migration is also prepared in V26; student review enforcement remains intentionally
blocked behind the Phase 7 sign-off.
Question hint authoring is now persisted through V27 and exposed in teacher question contracts/UI. Hint request/retry runtime remains
blocked behind Phase 7. Teacher dashboard fabricated metrics were replaced with explicit unavailable states.
Scope A adds V28 ActivitySession persistence and student runtime APIs/UI. The backend keeps no Activity answer history, and Scope B
AssessmentAttempt is not implemented.

## Next implementation gates

1. Re-run client lint/typecheck/test/build and server tests when the environment has the required dependencies/runtime.
2. Run the server test suite when Java/JAVA_HOME is available.
3. Scope B starts only after Scope A validation gate passes.
