> **Status note (2026-10-23):** This document mixes implemented endpoint inventory with accepted target contracts. Sections explicitly marked “target contract, not yet implemented” are not callable API documentation. Verify all endpoint claims against current controllers before client implementation. Formal AssessmentAttempt runtime endpoints are not implemented.

# API Contract

## Authentication and session lifecycle

- Login creates an absolute seven-day session. Refresh rotates cookies without
  extending the original session deadline.
- Protected resources accept only JWTs whose `tokenType` is `ACCESS`; refresh JWTs
  are restricted to `/v1/auth/refresh`.
- An authenticated user whose current database status is `INACTIVE` receives `403
  ACCOUNT_INACTIVE`; the response clears the access and refresh cookies.
- Access authentication failures return `401 INVALID_TOKEN`. The frontend may
  perform one refresh and replay only the request rejected at the authentication
  layer, at most once.
- `/v1/auth/logout` does not require a valid access token. It always attempts token
  revocation and clears both cookies.
- Auth cookies remain HttpOnly. Access uses path `/v1`; refresh uses path
  `/v1/auth`.

## Auth
JWT access token. Teacher endpoints require TEACHER. Student runtime endpoints require STUDENT and own-session/attempt scope. Never accept owner ids from clients.

`POST /v1/auth/login` accepts `email`, `password`, and optional `expectedRole`
(`TEACHER` or `STUDENT`). The dedicated login portals always send the expected
role; a mismatch returns `403 LOGIN_ROLE_MISMATCH` before any auth cookie is set.

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
- AssignmentQuestion has no position. The canonical Assignment Builder and student runtime use Composition section/item/member position; question_id ASC is only legacy backfill/compatibility order.
- AssignmentQuestion has no position.
- Activity preview does not create ActivitySession state.
- Multiple Activity strategies require student runtime choice; ActivitySession stores it.
- Try Hard timer is per question.
- Assignment timer is whole Attempt.
- Post-submit Assignment answer visibility follows show_answers_after_submit.

## Error vocabulary
Common: INVALID_REQUEST, INTERNAL_ERROR, UNAUTHORIZED, FORBIDDEN, INVALID_TOKEN, ACCOUNT_INACTIVE.
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

The terminal Activity Result includes nullable `xpReward` and `xpQuestions`.
`xpReward` is an immutable server receipt (`questionXp`, `completionBonus`,
`committedXp`, `levelBefore`, `lifetimeXpAfter`, `levelAfter`, `finalizedAt`). It
is `null` for legacy or rollout-disabled sessions; reading this endpoint never
calculates or commits XP. `xpQuestions` contains only persisted resolved-question
audit values and is empty when no finalized reward exists.

ActivitySession start accepts optional `mode` and `selectionStrategy`; both are required only when the
Activity exposes more than one choice. The start response includes the complete selected question set without
correct answers, accepted answers or explanations. Activity answers are evaluated server-side and are not persisted
as answer history.

The Activity start response returns the complete selected question set. Correct answers are never included before the runtime flow permits them.

## Student Gamification (Streak / Level)

GET /v1/student/gamification/profile — own Lifetime XP, Level, XP-to-next, current effective Streak, longest Streak and qualification status.
GET /v1/student/gamification/streak — own run dates, timezone, four milestone amounts/ledger-awarded indicators, plus todayDate, weekStartDate and qualifiedDates (server-local Monday–Sunday dates).

Both endpoints require `ROLE_STUDENT`; student id comes only from the JWT, never a request parameter. There is no Streak claim/write API. XP and Streak are committed by the Activity completion workflow. Leaderboard remains demo-only until its own implementation phase.


## Question contract / security boundary

- Existing Question authoring/runtime contracts are implemented as they exist in code; this document does not approve a new QuestionSpec wire format or add new public endpoints.
- Teacher authoring responses may include correctness and accepted-answer details. Never reuse a teacher authoring DTO as a student runtime DTO.
- Student runtime payloads must not expose correctness flags, accepted answers, normalized values, or explanations before the corresponding Practice/review rule allows them. Hint content is returned through the explicit hint action so use can be recorded.
- ActivitySession uses the session endpoints above; do not reintroduce the legacy polymorphic `/v1/attempts/{id}` API from the historical tail of the old Phase 7 draft.
- Accepted Question Engine domain contract: see `.agent/architecture/question-engine-v1.md` and ADR 0023 (lifecycle refined by ADR 0025; Assignment scoring/display refined by ADR 0026). The discriminated QuestionSpec contract is accepted, but the new implementation/wire DTOs are not yet delivered; do not represent planned endpoints as current routes.


## Assignment Composition and AssessmentAttempt — accepted target contract, not yet implemented

Canonical model: .agent/architecture/assignment-composition-v1.md. Phase 7B responsibilities (not claims of current routes): read/write ordered composition; validate readiness/publish; start/get/save/submit/get result for AssessmentAttempt; teacher reporting by student and question/part with normalized wrong-answer distributions and CSV/Excel export. Server owns timer, eligibility, scoring and immutable snapshot. Do not ship routes before request/response schemas and security are reviewed. Student in-progress DTOs never expose correct/accepted/normalized answers; after submit, show_answers_after_submit governs reveal. Automatic grading runs on submit/timeout; no manual grading workflow exists in v1.


## Assignment score visibility

The server calculates and persists the Assignment score on submit/timeout regardless of `show_score_after_submit`. That boolean controls whether the student is shown the score immediately. `show_answers_after_submit` is a separate switch for correct answers and explanations. These are two independent response-projection policies. Scored questions default to 1 point; a teacher may customize possible points per Assignment item. Compound parts default to equal allocation with editable per-part points that must sum to the aggregate question points.

## Leaderboard (implemented read-only contract)

- `GET /v1/student/gamification/leaderboard?metric=XP&period=TODAY|WEEK|MONTH|ALL`: leaderboard XP aggregated from `xp_transactions` for the selected Ho Chi Minh calendar interval. For `metric=STREAK`, period is always ALL and the ranking uses effective current Streak. Sort value descending then student ID ascending; return top 50 + currentStudent rank even outside top 50. `totalStudents` includes active students, even with zero score.
- `GET /v1/student/gamification/leaderboard/honors`: all-time lifetime XP champion and longest-ever Streak champion among active students; no influencer/ambassador badge.
- `GET /v1/student/gamification/leaderboard/recent-activity?limit=8`: latest terminal `ActivitySession` rows (COMPLETED or GAME_OVER), status, Activity name, optional earned PRACTICE XP; no fabricated level-up or share events.
- Authenticated student only. Student ID from JWT for self rank; no client mutation or XP claims. No new migration.
