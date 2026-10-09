# E-Learning — Phase 4: Activities
Status: ACTIVE CANONICAL SPEC
Last revised: 2026-10-07

## Purpose
Activity is repeatable learning/practice built from QuestionBanks. It is not an Assignment.
Activity belongs to exactly one Unit.

## Configuration
- id, unit_id, name, description
- status: DRAFT/PUBLISHED/ARCHIVED
- distribution_mode: EQUAL/PERCENTAGE/FIXED_COUNT
- total_questions
- available_selection_strategies: RANDOM/WEAKNESS_PRIORITY
- mode: LEARNING/TRY_HARD/BOTH
- time_limit_seconds: seconds per question when Try Hard is offered
- lives when Try Hard is offered

No GameTemplate field/relation in current scope.

## ActivityBank
activity_id, question_bank_id, display_order, and conditional percentage/fixed_count.
Sources must be unique, belong to the Activity Unit, be published and sufficiently populated when publishing.

## Draft and readiness
Draft may be incomplete, including zero sources.
Readiness is derived.
PUBLISH requires READY and sufficient complete Questions.
Publish validation errors must be stable.

## Strategy
One configured strategy may be auto-selected.
Multiple configured strategies require student choice at run start.
ActivitySession stores concrete selection_strategy.
WEAKNESS_PRIORITY may fall back to RANDOM before Phase 8, but the stored choice remains explicit.

## Modes
Practice (backend `LEARNING`): no timer, immediate feedback, max 2 answers/question (first + 1 retry), optional Question hint.
Try Hard: per-question timer, deadline_at per served question, wrong answer costs a life, timeout costs no life, no hint.
BOTH: student chooses Learning or Try Hard at start.
No whole-run Activity timer.

## Preview
POST /v1/activities/{id}/preview.
Preview evaluates current configuration/readiness and returns a deterministic sample without creating an ActivitySession.

## Lifecycle
DRAFT -> PUBLISHED only when READY.
DRAFT -> ARCHIVED.
PUBLISHED -> ARCHIVED.
ARCHIVED -> DRAFT.
No ARCHIVED -> PUBLISHED.

## Teacher endpoints
GET /v1/activities
GET /v1/activities/sources
GET /v1/activities/{id}
POST /v1/activities
PUT /v1/activities/{id}
PATCH /v1/activities/{id}/status
GET /v1/activities/{id}/readiness
POST /v1/activities/{id}/preview

## Gate
Teacher can save incomplete Draft, configure and preview it, reload the same data, publish only when READY, archive and restore.
