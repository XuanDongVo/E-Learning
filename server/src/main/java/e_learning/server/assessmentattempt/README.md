# AssessmentAttempt backend skeleton

This package is the formal Assignment runtime and is deliberately separate from ActivitySession.

## Created in this slice
- V43 schema for AssessmentAttempt, ordered immutable attempt question snapshots, one current answer per question, and per-part results.
- JPA entities and repositories.
- Request/summary DTO starting points.
- Service dependency skeleton.

## Not implemented in this slice
- Start/resume and snapshot construction.
- Student target/schedule/active-class authorization.
- Active-session heartbeat and safe takeover.
- Autosave idempotency and concurrency semantics.
- Server-side timeout processing.
- Question Engine snapshot/normalization/grading integration.
- Submit/review visibility enforcement.
- Assignment hard lock.
- Controller endpoints and UI.

Do not expose a placeholder endpoint that appears to support an operation it does not implement. The next slice must verify the Question Engine and then implement behavior with tests before adding the Student API.
