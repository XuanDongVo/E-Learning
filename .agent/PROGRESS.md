# Project Progress

Audit date: 2026-10-12
Branch: feature/phase-7-assigment
Audited commit: 55f9ad1bf12ac34db3fc16044a6c2785498592cb

## Current stage

- Phase 6 Student Management: DONE.
- Phase 7 Scope A ActivitySession: present in the audited codebase; behavior and test gates still require validation in a configured environment.
- Phase 7 Scope B AssessmentAttempt: DEFERRED / NOT IMPLEMENTED.
- Question Engine: architecture proposal documented under ADR 0023; **not approved and not implemented**. Do not begin a broad Question refactor or add schema migrations from the proposal alone.

## Synchronized canonical decisions

- Activity and Assignment have distinct product semantics and runtime aggregates.
- Activity uses ActivitySession. It does not persist detailed response payload/history; AssessmentAttempt is a separate deferred formal Assignment runtime.
- Activity is Unit-scoped. Multiple modes/selection strategies are resolved and stored at session start when required.
- Practice has no timer, one retry (two submissions total) and an optional per-question hint. Try Hard timer is per question; timeout counts wrong and costs no life.
- ActivitySession start currently records the selected question set/order, but the audited implementation still points to mutable Question rows. Full durable content snapshots are a proposed Question Engine change, not an existing guarantee.
- Assignment owns its questions; AssignmentQuestion has no position/reorder contract; ordering is question_id ascending.
- Assignment has a whole-attempt timer and post-submit answer visibility is controlled by show_answers_after_submit.
- Topic formula/reference sheet and GameTemplate are deferred.
- Never modify applied Flyway migrations V1–V30. Proposed V31–V33 boundaries in the architecture proposal are not approved migration numbers.

## Question Engine audit findings

- Five existing types: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK and TYPE_ANSWER.
- Type-specific behavior is currently distributed across validation, persistence and Activity runtime services; the handler/registry design is not implemented.
- Student and teacher question projections must remain separate. Do not expose correctness, accepted/raw/normalized answers or hidden explanations in an in-progress student payload.
- Option order is not explicitly persisted in question_options; current order stability needs an explicit contract.
- Hint integration has known authoring/API mapping drift in some older Question editing paths; verify each path before claiming it fixed.
- FILL_IN_BLANK currently has no per-blank key/index contract and must not be treated as a general Cloze implementation.
- Backend has only the general Spring context test; no dedicated Question Engine handler contract tests were found in the audited tree.

## Validation status

This was a documentation synchronization task; tests, lint, TypeScript checks and builds were **not run** for this update.
Last known environment blockers from the prior audit (2026-10-07), not re-verified today:
- Client test dependencies / lockfile state prevented a reliable full client test run.
- Known client lint/typecheck/build errors remained in unrelated/pre-existing areas.
- Server Maven tests were blocked by missing Java/JAVA_HOME.
Do not represent these prior results as a fresh validation of the current commit.

## Current next gates

1. Owner reviews ADR 0023 decisions D1–D6 before approving the Question Engine contract.
2. Re-run current client lint/typecheck/tests/build and server tests in a configured environment.
3. Add characterization tests for the five existing question types before refactoring their behavior.
4. Resolve the durable Activity snapshot and legacy in-progress session policy before implementing a full snapshot.
5. Scope B (AssessmentAttempt) starts only after Scope A's validation gate passes and explicit approval.
