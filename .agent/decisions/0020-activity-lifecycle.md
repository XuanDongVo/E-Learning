# 0020 — Activity lifecycle transitions
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Decision

Allowed transitions are:
- DRAFT -> PUBLISHED only when the Activity is READY.
- DRAFT -> ARCHIVED.
- PUBLISHED -> ARCHIVED.
- ARCHIVED -> DRAFT.
- ARCHIVED cannot transition directly to PUBLISHED.
- Publishing from ARCHIVED therefore requires restore to DRAFT, readiness validation, then publish.

Draft is an authoring state and may be incomplete. Readiness is a derived publish gate, not a stored lifecycle status.

## Consequences

The status endpoint must reject unsupported transitions with a stable error code. Publish validation must not accidentally make DRAFT unusable for authoring.
