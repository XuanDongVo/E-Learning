# AssessmentAttempt backend

This package owns the official Assignment runtime and remains separate from ActivitySession.

## Implemented in this branch

- V43 Attempt schema and related migrations (timer in minutes on V45).
- JPA entities, repositories, request/response DTOs and snapshot contract.
- Controller routes:
  - `GET /v1/student/assignments/{assignmentId}/assessment-attempt/intro`
  - `POST /v1/student/assignments/{assignmentId}/assessment-attempt`
  - `POST /v1/student/assignments/{assignmentId}/assessment-attempt/submit`
  - `GET /v1/student/assignments/{assignmentId}/assessment-attempt/result`
- Autosave with mutation idempotency and question-level optimistic locking.
- **Submit (manual):** grades from autosaved payloads + snapshots, sets `SUBMITTED` / `late`, clears session, deletes mutations. Allowed after due/deadline.
- **Result:** visibility from settings snapshot (`scoreVisible`, `answersVisible`).
- `finalizeTimeoutIfDue` ready for a future timeout job (not scheduled yet).

## Remaining work

- Timeout job / lazy auto-submit
- Authoring hard-lock after first attempt
- Characterization tests for Matching/CLOZE rebuild
- Compile/test/Flyway/E2E verification
- Frontend submit + result UI

## Session policy

ADR 0027: Web Locks, client UUID credential, no heartbeat/takeover in MVP.
