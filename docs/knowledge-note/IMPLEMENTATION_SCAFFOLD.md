# Knowledge Note — Simple MVP scaffold (v3.2)

Branch: `feature/guided-reasoning-v1`  
Status: **Scaffold only — no business feature implemented**

## Approved structure
Two effective tables:
- `knowledge_notes`: independently Grade-scoped Note, metadata, current document JSON, optional summary JSON, schema/edit version, lifecycle status.
- `knowledge_note_topic_links`: optional many-to-many Topic associations, unique pair and at most one Primary per Topic (not required).

No KnowledgeNoteDraft or KnowledgeNoteRevision entity, repository, DTO or API. No category, cover/media or image block in MVP. Published saves become visible immediately; warn Teacher before editing/saving a Published Note, or use Unpublish → Edit → Publish.

## Flyway migration policy
- `V66__knowledge_note_foundation.sql`: previous scaffold migration; **do not rewrite**, since Flyway may have recorded its checksum.
- `V67__simplify_knowledge_notes.sql`: removes initial Draft/Revision tables, published revision FK and adds direct JSON fields to `knowledge_notes`. An existing database runs V66 then V67, a fresh database also runs both.
- V67 drops the provisional tables. Although Knowledge Note APIs have always returned HTTP 501, review database contents/backup first if any out-of-band data was inserted. PostgreSQL migration tests remain pending.

## Server source
`server/src/main/java/e_learning/server/content/knowledge/`
- entity: `KnowledgeNote`, `KnowledgeNoteTopicLink`.
- repository: matching JPA repositories.
- dto: `CreateKnowledgeNoteRequest`, `UpdateKnowledgeNoteMetadataRequest`, `SaveKnowledgeNoteContentRequest`, `KnowledgeNoteContentResponse`, `KnowledgeNoteResponse`, `StudentKnowledgeNoteResponse`, link/pagination/list contracts.
- controller: Teacher authoring, Teacher Topic links, Student read.
- service: Authoring, TopicLink, Student read, PhaseGate (HTTP 501).
- access, validation and mapper seams — fail closed until implemented.

Teacher: `GET/PUT /v1/content/knowledge-notes/{id}/content`. No `/draft` or `/revisions` endpoints. Student read API names unchanged.

## Client source
- `src/types/knowledge-note.ts`: `KnowledgeNote`, `KnowledgeNoteContent`, `SaveKnowledgeNoteContentRequest`, TopicLink and Student contracts.
- `src/services/teacher/content/knowledge-note.service.ts`: `getContent`, `saveContent`, lifecycle and Topic links.
- `src/services/student/student-knowledge-note.service.ts`: Student Library/Reader/Topic requests.
- `src/services/knowledge-note-query-keys.ts`; `src/hooks/knowledge-note/*` (disabled).
- Teacher shells T01 Management, T02 Editor, T03 Preview, T04 Topic links.
- Student shells S01 Library, S02 Topic summary, S03 Reader.
- Routes: Teacher `/teacher/content/knowledge-notes`, `/new`, `/[noteId]/edit`; Student `/student/knowledge`, `/[noteId]` (locale prefix provided by Next routing).
- Menu integration and Topic embedded mounts remain intentionally off until backend phases are implemented; no fake business success.

## Implementation phases
1. **Phase 01:** apply/test V66+V67 on disposable PostgreSQL; JPA validation; implement Teacher CRUD/content save with `baseVersion` optimistic locking, publish/unpublish, linking/Primary atomic updates, security and Student authorization policy. Replace HTTP 501 per completed endpoint.
2. **Phase 02:** Word-like editor, allowlisted JSON validation, Summary and structured learning blocks, save status and warning when editing Published Notes.
3. **Phase 03:** Teacher Management/Preview/Linking interactions and Topic integration.
4. **Phase 04:** Student Library/Reader/Topic summary, grade-authorized real API reads and Navbar.
5. **Phase 05:** integration, accessibility, mobile, security and regression.

## Verification
Committed Git-tree/source inspection only. No Maven/Next builds or Flyway tests executed from GitHub connector. Before enabling feature, run `./mvnw test` in server, `npm run lint && npm run build` in client and verify V66→V67 on a disposable PostgreSQL database.
