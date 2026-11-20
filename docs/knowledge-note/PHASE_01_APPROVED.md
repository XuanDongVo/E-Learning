# Knowledge Note — Phase 01 Approved Scope (Teacher Metadata)

Date: 2026-11-19  
Branch: `feature/guided-reasoning-v1`  
Decision: implement only three approved Teacher APIs; **client UI design before content-authoring backend integration**.

## Domain placement
Knowledge Note is independent Grade-scoped reusable material, not owned by Topic. Place code at `server/src/main/java/e_learning/server/knowledge/`, **not** under `content/`. Existing `content_topics` stays a separate aggregate and is referenced only from `KnowledgeNoteTopicLink`. Keep the previously established two-table model; no Draft/Revision.

Teacher code belongs under:
- `knowledge/teacher/controller`
- `knowledge/teacher/service`
- `knowledge/teacher/dto/request`
- `knowledge/teacher/dto/response`
- `knowledge/teacher/mapper`

Common cross-role classes stay in `knowledge/entity`, `knowledge/repository`, `knowledge/enums`. Student controller/service/DTO namespaces will be added only after Student contract approval; avoid empty packages and placeholder endpoints.

## Approved live APIs
All routes require authenticated Teacher (existing `/v1/teacher/**` security rule).

| Method | URL | Status |
|---|---|---|
| POST | `/v1/teacher/knowledge-notes` | Implemented in source |
| GET | `/v1/teacher/knowledge-notes` | Implemented in source |
| GET | `/v1/teacher/knowledge-notes/{id}` | Implemented in source |

**POST request:** `{ "gradeId": 7, "title": "Present Tenses", "description": "..." }` (gradeId is the database ID, not necessarily the grade number). Title trimmed, max 200 chars, nonblank; description optional up to 1000 chars. Grade must exist. Server creates DRAFT, with an empty JSON document, unattached to Topic. Response is `ApiResponse<KnowledgeNoteResponse>` with HTTP 201.

**GET list:** optional `gradeId`, `status`, `search`, `linked`; `page` default 1, `size` default 20 (max 100). `page` is **1-indexed**, consistent with existing common `PageResponse<T>`. Search title and description, default updatedAt descending then ID descending. Response wraps **existing** `e_learning.server.common.dto.PageResponse<KnowledgeNoteResponse>`. No new pagination DTO. `linked` is based on presence of Topic associations, not publication.

**GET detail:** Return metadata + linkedTopicCount; missing ID returns `KNOWLEDGE_NOTE_NOT_FOUND` (404). No editor content yet.

**Teacher response:** id, gradeId, title, description, status, linkedTopicCount, createdAt, updatedAt, publishedAt. No category/mediaId/draft/revision.

## Explicitly NOT implemented in this phase
- PUT/GET content or editing, publish/unpublish/archive, metadata update.
- Topic linking mutation or primary assignment APIs.
- Student library/detail/topic APIs.
- Editor data bindings, UI publication behavior, Student Navbar or Topic widget. ADR 0040 separately approves the standalone Teacher route shell and its navigation entry; it does not approve additional APIs.
- Auto-creating arbitrary knowledge data or fake success responses.

The current Teacher/Student route shells and design components are placeholders. Their future paths and interactions are **not** approval for adding more backend endpoints. Design T02 Editor and Student Reader interaction first, then revise API contract and implement server behavior phase by phase.

## Migration/verification
V66 and V67 remain intact as immutable Flyway history; they already define the simplified target tables after V67. No new migration is needed for these three metadata APIs. Build, migration, security and integration tests remain verification gates; do not claim runtime verification based on source changes alone.

## Teacher Management UI follow-up
The previously approved three metadata APIs are now wired to Teacher Management, Create and Detail screens (see [UI 02.1](./TEACHER_MANAGEMENT_UI_02_1.md)). This does not authorize extra backend endpoints. Editor authoring, Publish, Topic linking and Student flows still require separate UI/contract review.
