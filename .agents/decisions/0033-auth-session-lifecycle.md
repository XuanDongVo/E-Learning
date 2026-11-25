# ADR 0033 — Absolute seven-day auth session lifecycle

**Status:** Accepted (owner decision 2026-11-08)  
**Scope:** Spring Security JWT-cookie authentication and Next.js session recovery.

## Context

Access tokens expire after one hour by default, while refresh tokens expire after
seven days. The previous frontend refreshed only during authentication bootstrap,
so an application left open could not recover an ordinary API request after access
expiry. JWT-authenticated requests also trusted token claims without re-reading
`users.status`, refresh could issue tokens for an inactive user, refresh JWTs were
not excluded from resource authentication, and logout depended on a valid access
token.

## Decision

1. A login creates one absolute session deadline seven days after login. Token
   rotation preserves that deadline; it never extends it. Access tokens are capped
   by the earlier of their normal TTL and the absolute session deadline. Once the
   deadline passes, the user must log in again.
2. Legacy refresh tokens without the new session-deadline claim use their existing
   refresh-token expiry as the absolute deadline during transition.
3. Only `tokenType=ACCESS` JWTs authenticate protected resources. Refresh JWTs are
   accepted only by `/v1/auth/refresh`.
4. Every JWT-authenticated protected request reads the current account status from
   the database after token authentication. `INACTIVE` returns `403
   ACCOUNT_INACTIVE`, clears both auth cookies, and does not enter application
   controllers. This applies to every role and protected route.
5. Refresh refuses inactive users before rotation. Invalid, expired, missing-user,
   or inactive refresh outcomes clear auth cookies. Logout is public, performs
   best-effort revocation, and always clears both cookies.
6. The frontend retries an API request only after an authentication-layer 401,
   performs one single-flight refresh, and replays the rejected request at most
   once. It never retries network/5xx failures or `ACCOUNT_INACTIVE`.
7. Same-tab refreshes share one promise. Same-origin tabs serialize refresh through
   Web Locks and re-check `/me` after acquiring the lock. BroadcastChannel
   propagates logout, expiry, and inactive-account events. JWTs remain HttpOnly and
   are never stored in browser storage.
8. Session termination cancels and clears React Query state, transient Assessment
   runtime snapshots, and account-scoped Teacher question drafts. The durable
   browser credential used to resume an
   official AssessmentAttempt remains intact because deleting it would violate the
   accepted resumability contract.

## API behavior

- Missing/invalid/expired access authentication: `401 INVALID_TOKEN`.
- Wrong role: `403 FORBIDDEN`.
- Inactive account: `403 ACCOUNT_INACTIVE`.
- Invalid/expired refresh: `401 INVALID_TOKEN`, with both cookies cleared.
- Logout: `200 SUCCESS`, including when the access token is absent, expired, or
  revoked.

No endpoint, entity, or database migration is introduced.

## Consequences

- Protected requests perform one indexed user-status lookup so a committed status
  change affects the next request. A request that already passed the filter before
  the status transaction committed may still finish.
- Production must set the exact HTTPS frontend origin in
  `CORS_ALLOWED_ORIGINS`, keep `JWT_COOKIE_SECURE=true`, and keep the session TTL at
  604800 seconds.
- CSRF remains disabled as pre-existing security debt. SameSite=Lax remains in
  place; a dedicated CSRF change is required before broad public deployment rather
  than being mixed into this lifecycle change.
- Refresh-family/device revocation and server-side session inventories remain out
  of scope and would require a separate design and likely persistence changes.
- A device that makes a request while the account is inactive is terminated. With
  no per-user session version, a device that remains completely offline throughout
  both deactivation and later reactivation can still present an unexpired older
  token; closing that gap requires the deferred session-version/family design.
