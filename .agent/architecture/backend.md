# Backend Architecture and Conventions

Spring Boot, Java 21, Spring Data JPA, Flyway, PostgreSQL, Spring Security/JWT.

## Feature layout
activity, assignment, attempt, content, question, classes, grades, user, auth, common.

## Rules
- Controllers use services, not another feature's repositories.
- Requests never carry owner ids, derived readiness or runtime state.
- Business validation lives in services.
- Errors use stable ErrorCode values.
- Every entity change requires a new Flyway migration; never edit applied migrations.
- Deterministic product order must be explicit in repository/service queries.
- AssignmentQuestion order is question_id ascending.
- Attempt runtime state is separate from Activity/Assignment configuration.

## Activity
Unit-scoped; available strategies live on Activity; concrete strategy and mode live on Attempt; Try Hard deadline is per question; preview is non-mutating; GameTemplate is not a current dependency.

## Assignment
Owns AssignmentQuestion. No position. show_answers_after_submit controls review. time_limit_seconds is whole Attempt. No Release Answers timestamp/endpoint.

## Question
Question.hint is optional, max 500 characters. Formula/reference sheet is deferred.
