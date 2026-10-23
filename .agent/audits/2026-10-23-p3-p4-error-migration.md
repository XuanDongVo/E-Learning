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
- Auth: login form API errors display localized text by code.
- Teacher Content: Topic detail, Question Bank detail, Question Editor, Question Composer and Question Form error displays use the shared resolver.
- Classes/Students: class and grade management errors, student creation and student profile update errors use the shared resolver.
- Assignments/Activities: assignment creation/import, builder status changes, media upload in the assignment builder, and activity save errors use the shared resolver. Legacy builder load-error strings can recover a stable code from the existing `[CODE] message` format.
- Student runtime: unit loading, activity hub, practice hint/start/answer/finish errors use the shared resolver.

Not yet migrated:
- Remaining raw errors in less-common screens and generic shared error boundaries/toast utilities; continue repository-wide scan.
- Existing `LocaleProvider` compatibility adapter; it must only be removed after a repository-wide consumer scan and tests.

## Server S1/S2 contract work

- Added `.agent/audits/2026-10-23-server-error-contract-inventory.md` documenting current ErrorCode/status, exception mappings, validation gaps, and security filter concerns.
- Added `GlobalExceptionHandlerContractTest` for AppException status/code/message compatibility, validation envelope, generic Question Engine failures and unexpected exceptions.
- Added `ErrorCodeContractTest` to enforce nonblank code/message, status presence and unique public error codes.
- No `details` field was added to the server response: field-level validation is a potential future consumer, not an implemented contract. Define a stable shape and tests before exposing it.
- Security filter failures remain an explicit follow-up: current `SecurityConfig` does not define a JSON AuthenticationEntryPoint or AccessDeniedHandler, and must be integration-tested before modifying the envelope.

## Validation status

GitHub Actions run [#39948980025](https://github.com/XuanDongVo/E-Learning/actions/runs/39948980025) passed on code commit `7597e39e39f23140f9422e741f7a9efecd2583d1`: frontend lint, Vitest, frontend build, and backend tests all passed.
