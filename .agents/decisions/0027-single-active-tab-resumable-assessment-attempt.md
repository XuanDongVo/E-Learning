# 0027 — Single Active Tab with Resumable AssessmentAttempt

**Status:** Accepted  
**Date:** 2026-10-26  
**Decided by:** Project owner  
**Scope:** Phase 7B — Student Assignment Attempt

## Context

The official Assignment Attempt must have one interactive browser tab at a time. A second tab should be rejected immediately rather than queued. Refresh, network interruption, and ordinary browser restart must resume the same Attempt and must not create another official Attempt.

A heartbeat lease with automatic stale takeover adds complexity and can unexpectedly grant another screen write permission. That behavior is not required by the product intent.

## Decision

### Browser lock

- The Student client acquires an exclusive Web Locks API lock with `ifAvailable: true` before any start/resume request or runtime mutation.
- Scope the lock by authenticated Student and Assignment. Hold it for the active Attempt screen lifetime.
- If unavailable, show the localized session-conflict state immediately. Do not queue, call a claim/takeover endpoint, or send a write request.
- If Web Locks is unavailable, fail closed for the official Attempt flow rather than silently bypass single-tab protection.
- Web Locks coordinates the same origin and browser profile. It does not guarantee device-level or cross-browser exclusivity; server authorization remains mandatory.

### Stable session credential

- Generate a random UUID credential in the client and persist it in IndexedDB **before** the first start request, so retries after a lost response are idempotently recoverable.
- The start/resume endpoint registers this credential only when creating the first Attempt. For an existing `IN_PROGRESS` Attempt, it accepts only the credential already stored for that Attempt.
- Never silently replace a missing or mismatched credential. Return `ASSESSMENT_ATTEMPT_SESSION_LOST` / recovery-required.
- The credential must not be exposed in a generic runtime response. It is sent only by the owning client in request bodies for authorized operations.
- Every mutation checks the authenticated Student, Attempt ownership, matching credential, Attempt state, deadline and request/revision constraints.

### Resume behavior

- Refresh, browser close and network interruption do not change the official Attempt, snapshot or server deadline.
- After ordinary browser restart, the client reacquires the lock and reads the same credential from IndexedDB, then invokes the same start-or-resume operation.
- Server-confirmed answers are authoritative. Client-side unsynced draft recovery is handled by the autosave/outbox work, not by session takeover.
- If IndexedDB data is cleared/evicted and the credential is lost, use a controlled recovery path only after a separate product decision. Do not issue a replacement silently.

### Heartbeat and takeover

- Heartbeat is **not required in MVP** for session ownership, resumption or timer enforcement.
- Do not define heartbeat cadence or stale-session threshold.
- Do not grant access or take over automatically after inactivity or a missing heartbeat.
- `last_activity_at` may be updated by accepted operations such as start/resume, save-answer and submit.
- A future heartbeat is permitted only for a separately approved liveness/monitoring requirement; it must not transfer ownership.

### Events and schema

- `TAB_HIDDEN` and `FULLSCREEN_EXIT` are optional lightweight browser signals, not proof of cheating.
- The runtime MVP must not emit `SESSION_TAKEOVER`. If V43 already allows that event value, retain it as unused legacy compatibility; do not edit an applied migration.
- Do not introduce an AttemptSession table, Redis lock, device fingerprinting or anti-cheat infrastructure for this policy.

## Consequences for implementation

- Start/resume uses a stable client-generated credential and does not need a separate claim-session or heartbeat endpoint.
- Sprint 1 implements start-or-resume authorization, snapshot creation and safe runtime projection.
- Sprint 3 adds browser Web Lock / IndexedDB session recovery and server-authoritative timer behavior, but not heartbeat/stale takeover.
- Tests cover concurrent tabs, reload, browser restart, network retry and missing credential. Automatic takeover tests are out of MVP scope.
