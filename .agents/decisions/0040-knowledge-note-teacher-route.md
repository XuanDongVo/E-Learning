# ADR 0040 — Knowledge Note is a first-class Teacher route

Status: Accepted
Date: 2026-11-20
Decided by: project owner

## Decision

1. Teacher Knowledge Notes uses the standalone route family `/teacher/knowledge-notes`, `/teacher/knowledge-notes/{id}`, and `/teacher/knowledge-notes/{id}/edit`. Metadata creation is a dialog owned by Management; `/teacher/knowledge-notes/new` remains only as a compatibility redirect to Management.
2. Knowledge Notes appears as its own Teacher navigation item directly after Overview. It is not nested under the Content navigation group.
3. Existing `/teacher/content/knowledge-notes/**` paths are retired rather than retained as a second route family.
4. This information-architecture decision does not approve content-save, publish, Topic-link, or Student APIs. Phase 02.2 remains client-first until the Editor interaction and JSON/API contract are reviewed.

## Rationale

Knowledge Note is an independent Grade-scoped aggregate and backend module, not content owned by Unit, Section, or Topic. A first-class Teacher route makes the frontend information architecture match ADR 0038 and ADR 0039.

## Consequences

Breadcrumbs return to Teacher Overview rather than Content. Content Explorer remains responsible for Unit, Section, Topic, and Question Bank hierarchy. Future Knowledge Note links must target the standalone route family.
