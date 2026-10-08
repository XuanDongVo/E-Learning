# API Contract

## Auth
JWT access token. Teacher endpoints require TEACHER. Student runtime endpoints require STUDENT and own-session/attempt scope. Never accept owner ids from clients.

## Activity
GET /v1/activities
GET /v1/activities/sources
GET /v1/activities/{id}
POST /v1/activities
PUT /v1/activities/{id}
PATCH /v1/activities/{id}/status
GET /v1/activities/{id}/readiness
POST /v1/activities/{id}/preview

No current GameTemplate endpoint.

## Assignment
GET /v1/assignments
POST /v1/assignments
GET /v1/assignments/{id}
PUT /v1/assignments/{id}
PATCH /v1/assignments/{id}/status
GET /v1/assignments/{id}/readiness
GET /v1/assignments/{id}/questions
POST /v1/assignments/{id}/questions
PUT /v1/assignments/{id}/questions/{questionId}
POST /v1/assignments/{id}/questions/bulk-delete

Assignment exposes show_answers_after_submit. No Release Answers endpoint.

## Contract rules
- AssignmentQuestion order is question_id ascending.
- AssignmentQuestion has no position.
- Activity preview does not create ActivitySession state.
- Multiple Activity strategies require student runtime choice; ActivitySession stores it.
- Try Hard timer is per question.
- Assignment timer is whole Attempt.
- Post-submit Assignment answer visibility follows show_answers_after_submit.

## Error vocabulary
Common: INVALID_REQUEST, INTERNAL_ERROR, UNAUTHORIZED, FORBIDDEN, INVALID_TOKEN.
Activity: ACTIVITY_NOT_FOUND, SOURCE_NOT_FOUND, DUPLICATE_SOURCE, NO_SOURCE_SELECTED, SOURCE_NOT_PUBLISHED, SOURCE_EMPTY, DISTRIBUTION_NOT_DIVISIBLE, PERCENTAGE_INVALID, ALLOCATION_ZERO, FIXED_COUNT_INVALID, INSUFFICIENT_QUESTION_POOL, TRY_HARD_TIMER_REQUIRED, TRY_HARD_LIVES_REQUIRED, ACTIVITY_NOT_READY, INVALID_STATUS_TRANSITION, PREVIEW_NOT_READY.
Assignment/Attempt codes must be verified against ErrorCode.java before implementation.


## Activity Session Runtime
POST /v1/activities/{activityId}/sessions
GET /v1/activity-sessions/{sessionId}
POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/answer
POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/hint
POST /v1/activity-sessions/{sessionId}/finish
GET /v1/activity-sessions/{sessionId}/result

The Activity start response returns the complete selected question set. Correct answers are never included before the runtime flow permits them.
