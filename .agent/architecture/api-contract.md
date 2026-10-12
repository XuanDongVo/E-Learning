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

## Student class membership
- A Student has at most one ACTIVE class membership.
- `POST /v1/classes/{classId}/members` adds only a Student with no current ACTIVE membership.
- `POST /v1/classes/{classId}/members/{studentId}/transfer` moves the current membership to the target class and preserves the old row as INACTIVE history.
- `DELETE /v1/classes/{classId}/members/{studentId}` marks the membership INACTIVE.
- Class roster responses contain ACTIVE members only.

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
GET /v1/activities/{activityId}/session-options
GET /v1/activity-sessions/{sessionId}
POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/answer
POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/hint
POST /v1/activity-sessions/{sessionId}/finish
GET /v1/activity-sessions/{sessionId}/result

ActivitySession start accepts optional `mode` and `selectionStrategy`; both are required only when the
Activity exposes more than one choice. The start response includes the complete selected question set without
correct answers, accepted answers or explanations. Activity answers are evaluated server-side and are not persisted
as answer history.

The Activity start response returns the complete selected question set. Correct answers are never included before the runtime flow permits them.


## Question contract / security boundary

- Existing Question authoring/runtime contracts are implemented as they exist in code; this document does not approve a new QuestionSpec wire format or add new public endpoints.
- Teacher authoring responses may include correctness and accepted-answer details. Never reuse a teacher authoring DTO as a student runtime DTO.
- Student runtime payloads must not expose correctness flags, accepted answers, normalized values, or explanations before the corresponding Practice/review rule allows them. Hint content is returned through the explicit hint action so use can be recorded.
- ActivitySession uses the session endpoints above; do not reintroduce the legacy polymorphic `/v1/attempts/{id}` API from the historical tail of the old Phase 7 draft.
- Proposed Question Engine API/domain contract: see `.agent/architecture/question-engine-v1.md` and proposed ADR 0023. Its discriminated QuestionSpec wire contract is **pending Owner approval** and is not a current endpoint contract.
