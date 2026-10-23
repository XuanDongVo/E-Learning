# P3/P4 — Frontend Error Normalization and Incremental UI Migration

Branch: `refactor/teacher-content-ui-routing`

## P3 — F3/F4 delivered in this slice

- Added `src/lib/errors/app-error.ts` with `AppError.code`, `status`, `details`, and `source` (`api | network | http | unknown`), plus normalization for legacy `Error` values.
- Updated the shared API service so HTTP/API failures become `AppError`; network failures are tagged `NETWORK_ERROR`.
- Kept the legacy `Error.message` shape `[CODE] server message` to avoid breaking unmigrated consumers.
- Extended the frontend `ApiResponse` type with optional `details`; server responses do not emit `details` yet.
- Added `errors` dictionary namespace in both `vi.json` and `en.json`. Error copy resolves by stable code first and then by category; unmapped keys fall back to the legacy message.
- Added Vitest coverage for AppError metadata, legacy Error normalization, category mapping and localized copy.

## P4 — Incremental migration progress

Order remains: Common/Errors/Auth → Teacher Content → Classes/Students → Assignments/Activities → Student runtime.

Migrated in this slice:
- Login form: API errors display localized text by code.
- Teacher Content — Topic detail: question-bank create/load error messages use the shared resolver.
- Teacher Content — Question Bank detail: update/archive/save/load-question errors use the shared resolver.
- Teacher Content — Question Editor and question authoring: save-question, bulk-save, and media-upload errors use the shared resolver.

Not yet migrated:
- Other teacher content screens and shared toast/error presentation.
- Classes/Students.
- Assignments/Activities.
- Student runtime.
- Existing `LocaleProvider` compatibility adapter; it must only be removed after a repository-wide consumer scan and tests.

## Server S1/S2 contract work

- Added `.agent/audits/2026-10-23-server-error-contract-inventory.md` documenting current ErrorCode/status, exception mappings, validation gaps, and security filter concerns.
- Added `GlobalExceptionHandlerContractTest` for AppException status/code/message compatibility, validation envelope, generic Question Engine failures and unexpected exceptions.
- Added `ErrorCodeContractTest` to enforce nonblank code/message, status presence and unique public error codes.
- No `details` field was added to the server response: field-level validation is a potential future consumer, not an implemented contract. Define a stable shape and tests before exposing it.
- Security filter failures remain an explicit follow-up: current `SecurityConfig` does not define a JSON AuthenticationEntryPoint or AccessDeniedHandler, and must be integration-tested before modifying the envelope.

## Validation status

These commits were written to the branch through GitHub. A new CI result for the latest head is not yet confirmed. Do not mark P2/P3 complete until frontend lint, Vitest, build and backend tests run on the current head and pass.
