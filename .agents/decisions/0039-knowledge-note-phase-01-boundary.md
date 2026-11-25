# ADR 0039 — Knowledge Note Phase 01 scope and module boundary
Status: Accepted
Date: 2026-11-19
Decided by: project owner

## Decision
1. Implement exactly three initial Teacher APIs: POST list/create and GET list/detail under `/v1/teacher/knowledge-notes`. Authoring content, publication, Topic-linking and Student APIs are deferred until their UI/UX and contract are approved.
2. Client UI design precedes server implementation of content authoring and future behaviors; no premature persistence or fake UI.
3. Knowledge Note is a first-class domain module in `e_learning.server.knowledge`, not nested under `content`. Teacher roles use `teacher/controller`, `teacher/service`, `teacher/dto/request`, `teacher/dto/response`; Student packages will follow the same pattern when approved.
4. Reuse `e_learning.server.common.dto.PageResponse<T>` rather than creating `KnowledgeNotePageResponse`.
5. Retain ADR 0038 independent two-entity model: KnowledgeNote and optional KnowledgeNoteTopicLink; do not implement Draft/Revision.

## Consequences
The planned endpoints in FRS v3.2 remain **future scope**, not approved implementation scope. See `docs/knowledge-note/PHASE_01_APPROVED.md`.
