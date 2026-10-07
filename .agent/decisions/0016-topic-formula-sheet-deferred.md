# 0016 — Topic formula/reference sheet is deferred
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Learning Mode discussions included a shared formula/reference sheet per Topic. The owner decided to expand that capability gradually and not implement it now.

## Decision

- The Topic formula/reference sheet is a future extension, not current scope.
- Do not add Topic.reference_sheet or content_topics.reference_sheet in the current schema.
- Do not add formula-sheet endpoints, controls, permissions, analytics or student UI now.
- Learning Mode must remain fully functional without a formula/reference sheet.
- The concept may be introduced later through a new phase decision/spec when the product requirements are concrete.

## Consequences

Active Phase 3, Phase 4 and Phase 7 documents must not list formula/reference sheet storage or UI as required work. ADR 0014 remains the source for the current hint/retry behavior; this ADR changes only the formula-sheet implementation scope.
