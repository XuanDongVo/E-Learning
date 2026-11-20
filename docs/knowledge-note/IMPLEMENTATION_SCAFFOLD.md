# Knowledge Note — Implementation status (Phase 01 approved metadata slice)

**Branch:** `feature/guided-reasoning-v1`  
**Authority:** [ADR 0039](../../.agents/decisions/0039-knowledge-note-phase-01-boundary.md) and [PHASE_01_APPROVED.md](./PHASE_01_APPROVED.md).

## Current API implementation
Only the following three Teacher endpoints are implemented in source:
- `POST /v1/teacher/knowledge-notes`
- `GET /v1/teacher/knowledge-notes`
- `GET /v1/teacher/knowledge-notes/{id}`

GET list supports page (1-indexed), size, gradeId, status, search, linked. The response uses existing `server/common/dto/PageResponse<T>`. Access is Teacher-only via existing Spring Security `/v1/teacher/**` rules. None of these APIs reads or writes learning document content.

## Final package layout for approved slice
```text
server/src/main/java/e_learning/server/knowledge/
├── entity/
│   ├── KnowledgeNote.java
│   └── KnowledgeNoteTopicLink.java
├── enums/KnowledgeNoteStatus.java
├── repository/
│   ├── KnowledgeNoteRepository.java
│   └── KnowledgeNoteTopicLinkRepository.java
└── teacher/
    ├── controller/TeacherKnowledgeNoteController.java
    ├── service/TeacherKnowledgeNoteService.java
    ├── dto/
    │   ├── request/CreateKnowledgeNoteRequest.java
    │   └── response/KnowledgeNoteResponse.java
    └── mapper/KnowledgeNoteMapper.java
```

The Student `controller`, `service`, and `dto/request`, `dto/response` directories are reserved as a **future package convention**, not created as unused empty folders. Topic-link services are also deferred pending UI/design review. Keeping the entity `KnowledgeNoteTopicLink` and repository is intentional: already part of the database model and used to count associations in metadata responses.

## Database
`V66__knowledge_note_foundation.sql` and `V67__simplify_knowledge_notes.sql` are unchanged. After V67, the final schema has two tables: `knowledge_notes` and `knowledge_note_topic_links`. No Draft/Revision entities. No category/media fields.

## Frontend status
- `src/types/knowledge-note.ts` defines the approved Teacher metadata contract and future document-renderer type.
- `src/services/teacher/knowledge-note.service.ts` contains only the three approved API calls.
- `src/hooks/knowledge-note/use-teacher-knowledge-notes.ts` connects list/detail/create to the three approved metadata APIs. Reuse existing `src/types/content.ts` `PageResponse<T>`.
- The Teacher workspace is available at `/teacher/knowledge-notes` as a first-class navigation item after Overview. Create is a dialog inside Management; detail/edit use `/teacher/knowledge-notes/{id}` and `/teacher/knowledge-notes/{id}/edit`, while `/teacher/knowledge-notes/new` redirects to Management for compatibility. The old Content-nested paths are retired. Management/Create/Detail use the approved metadata APIs; Editor content remains client-only and is not a content-save or publish implementation. The Teacher-only preview route `/teacher/knowledge-notes/{id}/preview` uses a per-session BroadcastChannel to read the live draft from the open Editor tab; it is not a Student endpoint.
- No student client service or student/backend controllers are active for Knowledge Note.

## Next rule
The client Editor, dedicated Student-styled Teacher Preview page and proposed JSON/API contract are documented in [PHASE_02_2_EDITOR_CLIENT.md](./PHASE_02_2_EDITOR_CLIENT.md). Review and approve that contract before implementing content persistence. Publishing, Topic linking, Student Library and reader still require their own approval; do not add/restore those APIs prematurely.

## Validation
GitHub tree/source inspection only. The server build, DB migration, auth checks, HTTP tests and client build have **not** been executed in this change. Verify them before deploying or declaring runtime acceptance.
