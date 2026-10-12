# Backend Architecture and Conventions

Spring Boot, Java 21, Spring Data JPA, Flyway, PostgreSQL, Spring Security/JWT.

## Feature layout
activity, assignment, assessment-attempt, content, question, classes, grades, user, auth, common.

## Rules
- Controllers use services, not another feature's repositories.
- Requests never carry owner ids, derived readiness or runtime state.
- Business validation lives in services.
- Student membership changes lock the Student row; PostgreSQL enforces at most one ACTIVE membership.
- Errors use stable ErrorCode values.
- Every entity change requires a new Flyway migration; never edit applied migrations.
- Deterministic product order must be explicit in repository/service queries.
- AssignmentQuestion order is question_id ascending.
- ActivitySession runtime state is separate from Activity configuration. AssessmentAttempt runtime state is separate from Assignment configuration.

## Activity
Unit-scoped; available strategies live on Activity; concrete strategy and mode live on ActivitySession; Try Hard deadline is per question; preview is non-mutating; GameTemplate is not a current dependency.

## Assignment
Owns AssignmentQuestion. No position. show_answers_after_submit controls review. time_limit_seconds is whole Attempt. No Release Answers timestamp/endpoint.

## Question
Question.hint is optional, max 500 characters. Formula/reference sheet is deferred.


## Question Engine — proposed, not yet accepted

See `.agent/architecture/question-engine-v1.md` and ADR 0023 for the target design. Until ADR 0023 is accepted:
- Do not claim QuestionTypeHandler, QuestionSpec, QuestionSnapshot, registry or capability policy already exists.
- Do not refactor the current validator/persistence/runtime services solely because the proposal describes a target boundary.
- Existing type semantics must be preserved by characterization tests before moving code.
- Handler/domain logic must not depend on JPA repositories, Spring web DTOs or Jackson JsonNode if/when the proposal is accepted.
- Keep teacher and student projections separate.
- ActivitySession and AssessmentAttempt remain separate aggregates. Activity has no persisted detailed answer history under ADRs 0021/0022.
- No migration V1–V30 may be edited. V31/V32/V33 are illustrative proposed boundaries only, pending Owner approval and a fresh migration audit.
