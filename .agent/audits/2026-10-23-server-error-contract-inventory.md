# Server Error Contract Inventory (P2 S1/S2)

Branch: `refactor/teacher-content-ui-routing`
Scope: inspect current `ErrorCode`, `GlobalExceptionHandler`, `ApiResponse`, security boundary and Question Engine. This is an inventory of the implementation on this branch, not a proposal to change business behavior.

## 1. Current wire contract

Normal application errors currently return `ApiResponse<Void>` with:
- `success: false`
- `code: string`
- `message: string`
- `data: null`

The response type is annotated with `@JsonInclude(NON_NULL)`. There is no `details` property today. The FE currently converts API failures into a plain `Error` whose message is `[CODE] server message`; consumers may rely on `message`.

## 2. ErrorCode inventory by domain and HTTP status

The enum is the source of truth for application-level status/code/message. Each enum entry carries its status explicitly.

| Domain | Codes | Current HTTP status |
|---|---|---|
| Common/request | `INVALID_REQUEST` | 400 |
| Common/unexpected | `INTERNAL_ERROR` | 500 |
| Authentication | `UNAUTHORIZED`, `AUTHENTICATION_FAILED`, `INVALID_TOKEN` | 401 |
| Authorization | `FORBIDDEN`, `STUDENT_NOT_IN_ACTIVE_CLASS`, `ACTIVITY_SESSION_NOT_ACCESSIBLE` | 403 |
| Validation | `VALIDATION_FAILED` | 400 |
| Users/students | `USER_NOT_FOUND`, `STUDENT_NOT_FOUND`, `STUDENT_PROFILE_NOT_FOUND`, `CLASS_MEMBER_NOT_FOUND` | 404 |
| Users/students | `STUDENT_ALREADY_IN_CLASS`, `EMAIL_ALREADY_EXISTS` | 409 |
| Classes/grades | `CLASS_NOT_FOUND`, `GRADE_NOT_FOUND` | 404 |
| Classes/grades | `CLASS_ALREADY_EXISTS`, `GRADE_ALREADY_EXISTS` | 409 |
| Content hierarchy | `UNIT_NOT_FOUND`, `SECTION_NOT_FOUND`, `TOPIC_NOT_FOUND`, `QUESTION_BANK_NOT_FOUND`, `QUESTION_NOT_FOUND`, `MEDIA_NOT_FOUND` | 404 |
| Content hierarchy | `UNIT_CODE_ALREADY_EXISTS`, `SECTION_ALREADY_EXISTS`, `TOPIC_ALREADY_EXISTS`, `QUESTION_BANK_ALREADY_EXISTS` | 409 |
| Question/content validation | `QUESTION_NOT_IN_BANK`, `QUESTION_DEFINITION_INVALID`, `EMPTY_QUESTION`, `MEDIA_FILE_EMPTY`, `MEDIA_FILE_TOO_LARGE`, `MEDIA_TYPE_DETECTION_FAILED`, `MEDIA_TYPE_UNSUPPORTED`, `MEDIA_EXTENSION_INVALID`, `MEDIA_CONTENT_INVALID`, `MEDIA_FILE_TOO_LARGE_CONFIGURED` | 400 |
| Media state | `MEDIA_NOT_READY`, `MEDIA_ALREADY_IN_USE` | 409 |
| Activities | `ACTIVITY_NOT_FOUND` | 404 |
| Activities | `ACTIVITY_ALREADY_EXISTS`, `ACTIVITY_INVALID_CONFIGURATION`, `ACTIVITY_NOT_READY`, `ACTIVITY_QUESTION_BANK_OUTSIDE_UNIT` | 409 for `ACTIVITY_ALREADY_EXISTS` and `ACTIVITY_NOT_READY`; 400 for the configuration and bank-scope codes |
| Assignments | `ASSIGNMENT_NOT_FOUND` | 404 |
| Assignments | `ASSIGNMENT_INVALID_CONFIGURATION`, `ASSIGNMENT_COMPOSITION_INVALID`, `ASSIGNMENT_TARGET_REQUIRED`, `ASSIGNMENT_TARGET_INVALID`, `ASSIGNMENT_SCHEDULE_INVALID`, `ASSIGNMENT_TIME_LIMIT_INVALID`, `ASSIGNMENT_QUESTION_LIMIT_EXCEEDED`, `ASSIGNMENT_STATUS_TRANSITION_INVALID` | 400 |
| Assignments | `ASSIGNMENT_QUESTIONS_LOCKED`, `ASSIGNMENT_NOT_READY` | 409 |
| Activity session/runtime | `ACTIVITY_SESSION_NOT_FOUND`, `ACTIVITY_SESSION_QUESTION_NOT_FOUND` | 404 |
| Activity session/runtime | `ACTIVITY_SESSION_INVALID_MODE`, `ACTIVITY_SESSION_INVALID_STRATEGY`, `ACTIVITY_SESSION_ANSWER_INVALID` | 400 |
| Activity session/runtime | `ACTIVITY_SESSION_NOT_ACCESSIBLE` | 403 |
| Activity session/runtime | `ACTIVITY_SESSION_NOT_ACTIVE`, `ACTIVITY_SESSION_RETRY_EXHAUSTED`, `ACTIVITY_SESSION_HINT_UNAVAILABLE`, `ACTIVITY_SESSION_NOT_READY` | 409 |

The table groups every current enum value by domain. For exact per-code message text, consult `server/src/main/java/e_learning/server/common/exception/ErrorCode.java`; avoid duplicating message text in API consumers.

## 3. Exception mapping and observed gaps

| Exception/source | Current handler | Current behavior / concern |
|---|---|---|
| `AppException` | `handleAppException` | Uses the enum's status/code but serializes `exception.getMessage()`; custom detail messages are therefore exposed as `message`. Keep this for backward compatibility for now. |
| `MethodArgumentNotValidException` | `handleValidationException` | Maps to `VALIDATION_FAILED` / 400, but field errors are discarded. |
| `ConstraintViolationException` | Same validation handler | Maps to `VALIDATION_FAILED` / 400; constraint/path details are discarded. |
| `BadCredentialsException` | `handleBadCredentials` | Maps to `AUTHENTICATION_FAILED` / 401. |
| `MaxUploadSizeExceededException` | Dedicated handler | Maps to `MEDIA_FILE_TOO_LARGE` / 400. |
| `EntityNotFoundException` | Dedicated handler | Maps to `INTERNAL_ERROR` / 500. Do not change globally until call sites are classified; it may represent an invariant failure rather than user-facing 404. |
| `InternalServiceException` | Shared internal handler | Maps to `INTERNAL_ERROR` / 500 without exposing exception text. |
| `QuestionEngineException` | Shared internal handler | Maps to `INTERNAL_ERROR` / 500; this aligns with the engine's documented invariant-failure semantics. Do not expose its raw internal message to clients. |
| Other exceptions | Catch-all handler | Maps to `INTERNAL_ERROR` / 500. |
| Spring Security authentication/authorization filter failures | No explicit JSON `AuthenticationEntryPoint` or `AccessDeniedHandler` is configured in `SecurityConfig` | These can be handled before MVC advice and may not follow `ApiResponse`. Add dedicated contract only after confirming actual responses for missing/invalid token and role mismatch. |

## 4. `details` policy

Do not add a general-purpose `details` payload to every failure yet. A concrete candidate is field-level validation feedback: consumers can map field names to controls without parsing `message`. Before adding it, define a stable shape such as `details.fieldErrors: [{ field, code }]`, avoid echoing rejected values, and add contract tests. Constraint violations need a separate, deterministic mapping. Security responses should be investigated separately.

## 5. Required contract tests

- AppException: enum code and HTTP status are preserved; message remains present.
- Validation exceptions: stable `VALIDATION_FAILED` and HTTP 400.
- Question Engine invariant failures: stable generic `INTERNAL_ERROR` and HTTP 500; internal exception text is not returned.
- Unknown exceptions: stable generic `INTERNAL_ERROR` and HTTP 500.
- Security filter boundary: integration test missing/invalid authentication and insufficient role; confirm response envelope before changing handlers.

## 6. Rollout guardrails

- Keep `message` and the existing four-field envelope during this step.
- Do not rename codes or silently change HTTP statuses.
- Do not map every `EntityNotFoundException` to 404 without reviewing call sites.
- Do not expose `QuestionEngineException` messages.
- Introduce `details` only with a named consumer and a tested schema.
