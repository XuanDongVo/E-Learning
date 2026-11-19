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
- `src/hooks/knowledge-note/use-teacher-knowledge-notes.ts` now has live list and detail queries. Reuse existing `src/types/content.ts` `PageResponse<T>`.
- Teacher Management (`/teacher/content/knowledge-notes`), Create (`/new`) and metadata Detail (`/{noteId}`) are connected to the three approved Teacher APIs. The Teacher Content sidebar links to the management page. See [UI 02.1](./TEACHER_MANAGEMENT_UI_02_1.md).
- Student UI and Teacher Editor/Preview/Topic Linking shells remain disconnected; no content authoring, Publish or Student API has been activated.
- No student client service or student/backend controllers are active for Knowledge Note.

## Next rule
**Client UI design first, server implementation afterward** for content editor, preview, publishing, Topic linking, Student Library and reader. Do not add/restore these API endpoints before the relevant UI and contract is explicitly approved.

## Validation
GitHub tree/source inspection only. The server build, DB migration, auth checks, HTTP tests and client build have **not** been executed in this change. Verify them before deploying or declaring runtime acceptance.
