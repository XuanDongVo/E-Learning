# API Contract

<!-- Endpoint and error-code tables below were generated from the controllers and ErrorCode.java.
     Regenerate or edit them in the same PR that changes an endpoint. The code is authoritative. -->

Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`). All paths are under `/v1`.

## Envelope

Every response uses `ApiResponse`:

```json
{ "success": true, "code": "SUCCESS", "message": "Request succeeded", "data": { } }
```

Failures use `success: false`, a stable `code` from the table below, a `message`, and optionally `data` carrying
structured details (for example the list of readiness issues when publishing an Activity fails).

## Pagination

Paged endpoints accept `page` (**1-indexed**, default 1) and `size`, and return `PageResponse`:

```json
{ "items": [], "page": 1, "size": 20, "totalElements": 0, "totalPages": 0, "isFirst": true, "isLast": true }
```

## Authentication and roles

- Authentication is a JWT (cookie `accessToken` or `Authorization: Bearer`). The authenticated user id is the JWT `sub`.
- Public: `/v1/auth/login`, `/v1/auth/refresh`.
- `TEACHER` role: `/v1/teacher/**`, `/v1/users/students`, `/v1/classes/**`, `/v1/content/**`, `/v1/activities/**`.
- Everything else requires authentication.
- Never accept `teacherId` or any owner id from a request body; derive it from the token.

## Endpoints

### ActivityController

| Method | Path |
|---|---|
| GET | `/v1/activities` |
| POST | `/v1/activities` |
| GET | `/v1/activities/game-templates` |
| GET | `/v1/activities/{id}` |
| PUT | `/v1/activities/{id}` |
| PATCH | `/v1/activities/{id}/archive` |
| POST | `/v1/activities/{id}/preview` |
| GET | `/v1/activities/{id}/readiness` |
| PATCH | `/v1/activities/{id}/status` |

### AuthController

| Method | Path |
|---|---|
| POST | `/v1/auth/login` |
| POST | `/v1/auth/logout` |
| GET | `/v1/auth/me` |
| POST | `/v1/auth/refresh` |

### ClassController

| Method | Path |
|---|---|
| GET | `/v1/classes` |
| POST | `/v1/classes` |

### MediaController

| Method | Path |
|---|---|
| POST | `/v1/content/media` |
| POST | `/v1/content/media/question-draft` |
| DELETE | `/v1/content/media/{mediaId}` |
| GET | `/v1/content/media/{mediaId}` |
| GET | `/v1/content/questions/{questionId}/media` |
| DELETE | `/v1/content/questions/{questionId}/media/{mediaId}` |
| POST | `/v1/content/questions/{questionId}/media/{mediaId}` |

### QuestionBankController

| Method | Path |
|---|---|
| GET | `/v1/content/question-banks` |
| POST | `/v1/content/question-banks` |
| PUT | `/v1/content/question-banks/order` |
| GET | `/v1/content/question-banks/{id}` |
| PUT | `/v1/content/question-banks/{id}` |
| PATCH | `/v1/content/question-banks/{id}/archive` |
| PATCH | `/v1/content/question-banks/{id}/status` |

### QuestionController

| Method | Path |
|---|---|
| GET | `/v1/content/questions` |
| POST | `/v1/content/questions` |
| DELETE | `/v1/content/questions/bulk-delete` |
| GET | `/v1/content/questions/{id}` |
| PUT | `/v1/content/questions/{id}` |

### SectionController

| Method | Path |
|---|---|
| GET | `/v1/content/sections` |
| POST | `/v1/content/sections` |
| PUT | `/v1/content/sections/order` |
| GET | `/v1/content/sections/{id}` |
| PUT | `/v1/content/sections/{id}` |
| PATCH | `/v1/content/sections/{id}/archive` |
| PATCH | `/v1/content/sections/{id}/status` |

### TopicController

| Method | Path |
|---|---|
| GET | `/v1/content/topics` |
| POST | `/v1/content/topics` |
| PUT | `/v1/content/topics/order` |
| GET | `/v1/content/topics/{id}` |
| PUT | `/v1/content/topics/{id}` |
| PATCH | `/v1/content/topics/{id}/archive` |
| PATCH | `/v1/content/topics/{id}/status` |

### UnitController

| Method | Path |
|---|---|
| GET | `/v1/content/units` |
| POST | `/v1/content/units` |
| PUT | `/v1/content/units/order` |
| GET | `/v1/content/units/{id}` |
| PUT | `/v1/content/units/{id}` |
| PATCH | `/v1/content/units/{id}/archive` |
| PATCH | `/v1/content/units/{id}/status` |

### GradeController

| Method | Path |
|---|---|
| GET | `/v1/grades` |
| POST | `/v1/grades` |
| GET | `/v1/grades/all` |
| DELETE | `/v1/grades/{gradeId}` |
| PATCH | `/v1/grades/{gradeId}` |
| PATCH | `/v1/grades/{gradeId}/activate` |
| PATCH | `/v1/grades/{gradeId}/inactive` |

### UserController

| Method | Path |
|---|---|
| POST | `/v1/users/students` |

## Error codes

| Code | HTTP | Message |
|---|---:|---|
| `INVALID_REQUEST` | 400 | The request is invalid |
| `INTERNAL_ERROR` | 500 | An unexpected error occurred |
| `UNAUTHORIZED` | 401 | Authentication is required |
| `FORBIDDEN` | 403 | You do not have permission to perform this action |
| `INVALID_TOKEN` | 401 | The access token is invalid or expired |
| `USER_NOT_FOUND` | 404 | User was not found |
| `EMAIL_ALREADY_EXISTS` | 409 | The email is already registered |
| `CLASS_ALREADY_EXISTS` | 409 | A class with this name already exists for the academic year |
| `GRADE_NOT_FOUND` | 404 | Grade not found |
| `GRADE_ALREADY_EXISTS` | 409 | Grade already exists |
| `UNIT_NOT_FOUND` | 404 | Unit not found |
| `UNIT_CODE_ALREADY_EXISTS` | 409 | A unit with this code already exists for this grade |
| `SECTION_NOT_FOUND` | 404 | Section not found |
| `SECTION_ALREADY_EXISTS` | 409 | A section with this name already exists in this unit |
| `TOPIC_NOT_FOUND` | 404 | Topic not found |
| `TOPIC_ALREADY_EXISTS` | 409 | A topic with this name already exists in this section |
| `EMPTY_QUESTION` | 404 | — |
| `QUESTION_BANK_NOT_FOUND` | 404 | Question bank not found |
| `QUESTION_BANK_ALREADY_EXISTS` | 409 | A question bank with this name already exists in this topic |
| `QUESTION_NOT_FOUND` | 404 | Question not found |
| `ACTIVITY_NOT_FOUND` | 404 | Activity not found |
| `SOURCE_NOT_FOUND` | 404 | A selected question bank was not found |
| `DUPLICATE_SOURCE` | 400 | The same question bank was selected more than once |
| `NO_SOURCE_SELECTED` | 400 | Select at least one question bank |
| `SOURCE_NOT_PUBLISHED` | 400 | A selected question bank is not published |
| `SOURCE_EMPTY` | 400 | A selected question bank has no ready questions |
| `DISTRIBUTION_NOT_DIVISIBLE` | 400 | The total number of questions cannot be divided equally among the selected question banks |
| `PERCENTAGE_INVALID` | 400 | Percentages must be positive and add up to exactly 100 |
| `ALLOCATION_ZERO` | 400 | A selected question bank would receive zero questions |
| `FIXED_COUNT_INVALID` | 400 | Every question bank needs a fixed count of at least 1 |
| `INSUFFICIENT_QUESTION_POOL` | 409 | Activity cannot provide the configured number of questions |
| `TRY_HARD_TIMER_REQUIRED` | 400 | Try Hard mode needs a positive time limit |
| `TRY_HARD_LIVES_REQUIRED` | 400 | Try Hard mode needs at least 1 life |
| `INVALID_GAME_TEMPLATE` | 400 | The selected game template does not exist or is inactive |
| `INVALID_STATUS_TRANSITION` | 409 | This status change is not allowed |
| `PREVIEW_NOT_READY` | 409 | Activity cannot be previewed until it is ready |
