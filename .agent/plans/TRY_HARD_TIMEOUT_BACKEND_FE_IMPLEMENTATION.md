# Try Hard per-question timeout — backend + frontend implementation
**Scope:** Fix existing ActivitySession timer lifecycle; no XP calculation/ledger activation.  
**Branch:** feature/student-gamification  
**Date:** 2026-11-06

## Server authority
- Try Hard time limit remains **per question** (ADR 0015). Deadline is stamped when a question becomes the first unresolved item; the next question's deadline is stamped immediately after current question resolves. Practice/LEARNING continues without a timer.
- Answer and timeout requests in Try Hard must target **the current first unresolved question**. Sending the ID of a future question is rejected. The same protection applies to the timeout endpoint, preventing clients from starting arbitrary question timers.
- The existing **5-second network grace** is preserved. Before deadline + grace, a timeout synchronization request is a no-op returning current session state. After grace, the server finalizes the question as TIMEOUT, with finalCorrect=false, no answer attempt increment, and **no life deducted**.
- Late answers after the deadline + grace are treated as TIMEOUT. Answer requests are still accepted within the existing grace period (so a near-deadline in-flight response can be fairly handled).
- `POST /v1/activity-sessions/{sessionId}/questions/{questionId}/timeout` is idempotent: for already resolved questions or terminal sessions, it returns current session state. Pessimistic session locking serializes answer/get/timeout/finish state mutations; repeat timeout cannot decrement life or count the question twice.
- `activity_session_questions.resolution_reason`: CORRECT, WRONG, TIMEOUT; added in Flyway **V51** after existing V50. Previous rows remain NULL, not backfilled from `final_correct`.
- Session DTO adds `serverNow` with an explicit offset, and Question DTO changes `deadlineAt` to an ISO-8601 timestamp with offset, derived from the server's configured local timezone. This is backward-compatible JSON for clients parsing date strings, but verify all consumers. It assumes a consistent deployment/server DB timezone; for multiple server timezones a UTC clock migration is a separate concern.

## Client behavior
- The PracticeRunner countdown displays remaining time from the server's `deadlineAt` and `serverNow` offset (not a naive unzoned timestamp); tick frequency stays 1 second and resyncs on window focus/visibility changes.
- At displayed 0 seconds, the client prevents new answers, draft edits and early finish, calls `timeout`, and polls while the server's grace window is running. Server remains authoritative.
- Failed timeout sync shows an explicit "Thử lại" retry action. The client does not locally mark a question resolved, deduct lives or award XP.
- When timeout resolution arrives, display notice and move to the next unresolved question. Terminal session shows its normal final result.
- Pending answer submission at the deadline is allowed to finish; timeout sync waits for the answer request to settle, and the server applies deadline+grace.

## Verification gates and limitations
- Add JUnit Mockito tests covering early timeout, after-grace timeout, next-question timer, terminal completion, repeated timeout, future-question rejection, late answer no-life-loss, wrong answer game-over.
- No browser E2E or live Flyway PostgreSQL verification has been performed through the GitHub connector. Before deployment run Maven tests, FE lint/typecheck/build, Flyway V51, and authenticated browser tests at mobile/desktop sizes.
- **Not part of this change:** Activity XP outcome-to-reward mapping, replay policy, XP ledger, background timeout scheduler. Closing a browser with no subsequent request does not actively resolve an expired question; it remains subject to the existing no-resume/abandon rules.
