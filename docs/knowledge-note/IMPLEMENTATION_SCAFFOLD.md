# Knowledge Note — End-to-End Scaffold & Phase Implementation Plan

**Branch:** `feature/guided-reasoning-v1`  
**Baseline:** SRS / FRS / UI/UX v3.1 and ADR 0038  
**Status:** Skeleton only. No Knowledge Note business functionality implemented.

## Why V66 is included now
The project configures `spring.jpa.hibernate.ddl-auto=validate`. Registering annotated entities without matching tables would break server startup. Therefore V66 is an **executable structural migration**, included with the scaffolding. It creates only the four specified tables and constraints; it does not seed notes, expose data or implement any business behavior. Flyway will run V66 automatically when this branch boots against an eligible DB. Review before deploying.

## Server package
`server/src/main/java/e_learning/server/content/knowledge/`
- `enums/KnowledgeNoteStatus.java`
- `entity/KnowledgeNote.java` — Grade-scoped independent metadata
- `entity/KnowledgeNoteDraft.java` — mutable JSONB editor state
- `entity/KnowledgeNoteRevision.java` — immutable published snapshot target
- `entity/KnowledgeNoteTopicLink.java` — optional M:N, per-Topic Primary
- `repository/*Repository.java` — four typed Spring Data JPA interfaces
- `access/KnowledgeNoteAccessPolicy.java` — pending server authorization seam, fails closed
- `validation/KnowledgeNoteDocumentValidator.java` — pending allowlisted JSON validation seam, fails closed
- `mapper/KnowledgeNoteMapper.java` — pending Teacher DTO projection seam, fails closed
- `dto/*.java` — Teacher/Student request/response contracts and paging
- `service/KnowledgeNoteAuthoringService.java`
- `service/KnowledgeNoteTopicLinkService.java`
- `service/StudentKnowledgeNoteService.java`
- `service/KnowledgeNotePhaseGate.java` — **explicit 501, no data returned**
- `controller/TeacherKnowledgeNoteController.java`
- `controller/TeacherTopicKnowledgeNoteController.java`
- `controller/StudentKnowledgeNoteController.java`
- `db/migration/V66__knowledge_note_foundation.sql`

The `KNOWLEDGE_NOTE_NOT_IMPLEMENTED` error code uses the existing `AppException` contract and emits HTTP **501**, not fake 200 data. Controller route wiring is present but cannot create, read, publish, attach or mutate any Note.

## Frontend packages
- `src/types/knowledge-note.ts`: document JSON, Note, Draft, Revision, links, filters, Student projections.
- `src/services/teacher/content/knowledge-note.service.ts`: typed Teacher requests and Topic-link endpoints.
- `src/services/student/student-knowledge-note.service.ts`: typed Student read requests.
- `src/services/knowledge-note-query-keys.ts`: React Query key factory.
- `src/hooks/knowledge-note/`: Teacher/Student typed query hook shells with `enabled:false` until corresponding phases.
- `src/components/features/knowledge-note/knowledge-document-renderer.tsx`: safe renderer boundary placeholder (must not render raw HTML).
- `src/components/features/teacher/knowledge-notes/`: T01 Management, T02 Editor, T03 Preview, T04 Topic linking, shared layout.
- `src/components/features/student/knowledge/`: S01 Library, S03 Reader, S02 Topic Quick Summary slot.

### Route shells (accessible directly but not linked from navigation)
- `/[locale]/teacher/content/knowledge-notes`
- `/[locale]/teacher/content/knowledge-notes/new`
- `/[locale]/teacher/content/knowledge-notes/[noteId]/edit`
- `/[locale]/student/knowledge`
- `/[locale]/student/knowledge/[noteId]`

**Deliberate integration gate:** Do not add menu entries or mount T04 into `TopicDetail` and S02 into `UnitDetailView` until relevant services are implemented. This preserves existing learning flows and prevents misleading calls to 501. The shells contain no fake content, fake saves or active controls.

## Phase gates (not yet implemented)
| Phase | Ownership | Required work to mark implemented |
|---|---|---|
| 01 — Foundation | Backend | Validate V66 against disposable DB; access-policy/authorization and grade checks; create, Draft save with optimistic locking, revisions and atomic publish/unpublish; link CRUD/Primary transaction rules; security tests and API contract tests; remove 501 per completed endpoint |
| 02 — Editor | Frontend + server schema | Choose rich-text engine, allowlisted versioned JSON, structured learning blocks, paste sanitization, Summary editor, reliable draft save, conflict and unsaved-change flow |
| 03 — Teacher UX | Frontend | Management list/search/filter, metadata editor, topic picker, primary/reorder/unlink, Student preview/publish, error/loading/empty states; integrate T04 into Teacher Topic Detail |
| 04 — Student UX | Frontend + backend | Grade-restricted Student list/detail/topic queries and tests; Student Library, Reader and renderer, S02 in UnitDetailView after one Topic is selected; back-context retention and Navbar link |
| 05 — QA | End-to-end | Auth, content safety, repeated links, concurrent Primary, published/draft isolation, accessibility, mobile responsiveness, regression and build/test results |

## Database constraints and deliberately deferred behavior
- `knowledge_notes` has **no** `topic_id`, `category`, `cover_media_id` or `media_id`.
- `knowledge_note_topic_links` is optional M:N and indexes enforce **at most one** Primary per Topic (not required).
- Published revision ownership is protected by composite FK; service-level revision immutability still required.
- Summary required for a Note linked as Primary at publish time; optional otherwise (validation pending Phase 01).
- Unlinked published Note must be visible to authorized Grade students (query pending Phase 04).
- Cross-Grade linking prohibited (service validation pending Phase 01).
- Image/media block, DOCX, AI, XP and Mistake Notebook are **out of scope**.

## Verification and limitations
The GitHub connector can write and inspect the committed Git tree but cannot execute a Maven build, Next.js build, test suite or apply Flyway migration in this workspace. This is **source scaffolding only**, not verified runtime functionality. Before implementing Phase 01, run:
```bash
cd server && ./mvnw test
cd ../client-e-learning && npm run lint && npm run build
```
Also validate V66 and Spring JPA schema with a disposable PostgreSQL DB (never assume running migrations against production is safe).
