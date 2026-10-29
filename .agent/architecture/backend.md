# Backend Architecture and Conventions

Spring Boot, Java 21, Spring Data JPA, Flyway, PostgreSQL, Spring Security/JWT.

## Feature layout
Current feature areas include activity, assignment, assessmentattempt, content, question, classes, grades, user, auth and common.

## Rules
- Controllers use services, not another feature's repositories.
- Requests never carry owner ids, derived readiness or runtime state.
- Business validation lives in services.
- Student membership changes lock the Student row; PostgreSQL enforces at most one ACTIVE membership.
- Errors use stable ErrorCode values.
- Every entity change requires a new Flyway migration; never edit applied migrations.
- Deterministic product order must be explicit in repository/service queries.
- Assignment Composition sections/items/members use persisted position. AssignmentQuestion remains position-free; question_id ASC is legacy backfill only. Assignment is intended to lock authoring changes after the first attempt starts; the runtime hard-lock remains incomplete.
- ActivitySession runtime state is separate from Activity configuration. AssessmentAttempt runtime state is separate from Assignment configuration.

## Activity
Unit-scoped; available strategies live on Activity; concrete strategy and mode live on ActivitySession; Try Hard deadline is per question; preview is non-mutating; GameTemplate is not a current dependency.

## Assignment
Owns AssignmentQuestion. No position; Composition positions define official order and question_id ASC is legacy backfill only. show_score_after_submit controls score display, while show_answers_after_submit independently controls answer/explanation reveal. time_limit_minutes is the whole Attempt duration stored in minutes. The server calculates and persists deadline_at from started_at plus the configured minutes. No Release Answers timestamp/endpoint.

## Question
Question.hint is optional, max 500 characters. Formula/reference sheet is deferred.

## Question Engine — implementation and boundary rules
See .agent/architecture/question-engine-v1.md and ADR 0023 (lifecycle refined by ADR 0025; Assignment scoring refined by ADR 0026).
- QuestionSpecMapper is the persistence-to-engine boundary. Engine code must not depend on JPA repositories/entities, Spring web DTOs, or Jackson JsonNode.
- Preserve existing question-type semantics with characterization tests when moving behavior.
- Keep teacher and student projections separate.
- ActivitySession and AssessmentAttempt remain separate aggregates. Activity has no persisted detailed answer history under ADRs 0021/0022.
- ActivitySession orchestration delegates question selection to activitysession/selection and immutable snapshot assembly to activitysession/snapshot; runtime lifecycle remains in ActivitySessionService until behavior-focused tests support further extraction.
- Never edit applied migrations. Select the next unused migration version after inspecting the current branch.

## Assignment Composition / AssessmentAttempt
- Snapshot ordered Composition, QuestionSpecs, item points/flags and settings when an Attempt starts.
- The start/resume slice is implemented but not verified. Snapshot question types and matching POOL resolution require integration tests.
- Persist raw answers and per-part grade results for review; keep grading internals out of in-progress student DTOs.
- Weighted score uses earned/possible points × 100; examples are excluded. Full automatic scoring, submit/timeout finalization and Assignment authoring hard-lock are not implemented.
- Never merge AssessmentAttempt with ActivitySession.

## Assignment score calculation and projection
- The intended server calculates/persists results when an Attempt is submitted or timed out using immutable snapshots.
- show_score_after_submit controls score display; show_answers_after_submit independently controls answer/explanation display.
- In-progress student DTOs must never expose answer keys, correctness flags, normalized submitted values or hidden explanations.
- There is no manual-review queue or AUTO/MANUAL option in v1.
