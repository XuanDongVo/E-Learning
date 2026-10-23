# Backend Architecture and Conventions

Spring Boot, Java 21, Spring Data JPA, Flyway, PostgreSQL, Spring Security/JWT.

## Feature layout
Current implemented feature areas include activity, assignment, content, question, classes, grades, user, auth and common. An `assessment-attempt` feature package is a target for Phase 7B and must not be assumed to exist until verified in the current tree.

## Rules
- Controllers use services, not another feature's repositories.
- Requests never carry owner ids, derived readiness or runtime state.
- Business validation lives in services.
- Student membership changes lock the Student row; PostgreSQL enforces at most one ACTIVE membership.
- Errors use stable ErrorCode values.
- Every entity change requires a new Flyway migration; never edit applied migrations.
- Deterministic product order must be explicit in repository/service queries.
- Assignment Composition sections/items/members use persisted position. AssignmentQuestion remains position-free; question_id ASC is legacy backfill only. Assignment is locked against authoring changes after the first attempt starts; changes require cloning. Assignment submissions are automatically graded by the Question Engine; no manual grading workflow or AUTO/MANUAL selector exists in v1. Activity edits are allowed, but active sessions use their immutable start snapshot and future sessions use the latest saved revision.
- ActivitySession runtime state is separate from Activity configuration. AssessmentAttempt runtime state is separate from Assignment configuration.

## Activity
Unit-scoped; available strategies live on Activity; concrete strategy and mode live on ActivitySession; Try Hard deadline is per question; preview is non-mutating; GameTemplate is not a current dependency.

## Assignment
Owns AssignmentQuestion. No position; Composition positions define official order and question_id ASC is legacy backfill only. `show_score_after_submit` controls score display, while `show_answers_after_submit` independently controls answer/explanation reveal. `time_limit_seconds` is whole Attempt. No Release Answers timestamp/endpoint.

## Question
Question.hint is optional, max 500 characters. Formula/reference sheet is deferred.


## Question Engine — implementation and boundary rules

See `.agent/architecture/question-engine-v1.md` and ADR 0023 (lifecycle refined by ADR 0025; Assignment scoring refined by ADR 0026). The Question Engine package structure and handler/spec/result contracts are present on the current Phase 7 branch; full compile/test validation remains required.
- `QuestionSpecMapper` is the persistence-to-engine boundary. Engine code must not depend on JPA repositories/entities, Spring web DTOs, or Jackson `JsonNode`.
- Preserve existing question-type semantics with characterization tests when moving behavior.
- Keep teacher and student projections separate.
- ActivitySession and AssessmentAttempt remain separate aggregates. Activity has no persisted detailed answer history under ADRs 0021/0022.
- ActivitySession orchestration delegates question selection to `activitysession/selection` and immutable snapshot assembly to `activitysession/snapshot`; runtime lifecycle remains in `ActivitySessionService` until behavior-focused tests support further extraction.
- Never edit applied migrations. Re-audit the latest migration before coding and select the actual next unused version; do not assume a version number is reserved.


## Assignment Composition / AssessmentAttempt

Canonical contract: .agent/architecture/assignment-composition-v1.md; active plan: .agent/plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md.
- Enforce readiness at the service transition to PUBLISHED; UI validation is not an invariant.
- Snapshot ordered composition, QuestionSpecs, item points/flags, media refs and grading/normalizer versions when AssessmentAttempt starts.
- Lock edits that would alter an active/published attempt's structure, content, points or grading mode; historical snapshots are immutable.
- Persist raw answers for review and per-part grade results including optional normalized submitted value. Keep these out of in-progress student DTOs.
- Weighted score uses earned/possible points × 100; examples excluded. All scored question types in v1 are automatically graded; there is no manual-review or pending-score workflow.
- Never merge AssessmentAttempt with ActivitySession.


## Assignment score calculation and projection
- The server calculates and persists automatic results when an AssessmentAttempt is submitted or timed out, using the immutable QuestionSpec/Composition snapshot.
- Each scored Composition question defaults to 1 possible point; the teacher can customize per Assignment item. CLOZE/MATCHING parts default to an equal split and may be adjusted while summing to the aggregate item points.
- `show_score_after_submit` defaults true and only controls score display; `show_answers_after_submit` independently controls answer/explanation display.
- In-progress student DTOs must never expose answer keys, correctness flags, normalized submitted values or hidden explanations.
- There is no manual-review queue, teacher grading UI or AUTO/MANUAL option in v1.
