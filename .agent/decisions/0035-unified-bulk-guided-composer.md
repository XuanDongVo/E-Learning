# ADR 0035 — Unified Bulk Guided Composer

**Status:** Accepted (Product Owner approval 2026-11-14)

## Decision

Teachers may author an optional Guided Definition while a Question is still a
local Bulk Composer draft. Guided remains a separate persisted extension of a
Question; it is not added to `QuestionWriteRequest.definition`.

`POST /v1/content/questions/bulk-with-guided` receives a stable client
`draftId`, a normal Question request and an optional Guided draft for each item.
The server writes the complete batch in one transaction. A validation failure
rolls back every Question and Guided draft in that request.

The Bulk Composer has Main Question and Guided Reasoning tabs. Preview Exam is
local-only and follows Guided-first ordering; it never starts an ActivitySession,
awards XP or writes student progress.

## Consequences

- The existing per-Question Guided endpoints remain the API for saved Question
  maintenance and READY validation.
- Bulk-created Guided Definitions begin as DRAFT. READY remains explicit and
  captures the final Question content revision.
- Teacher Composer retains Teacher tokens. The Preview surface uses only the
  scoped Student visual system and cannot modify Teacher theme tokens.
