# Phase 03.2.1 — Knowledge Note Stabilization

**Branch:** `feature/guided-reasoning-v1`  
**Implementation date:** 2026-11-21  
**Scope:** Knowledge Note read/link API and Student reading regressions. No database migration.

## Audited contracts

- `GET /v1/student/knowledge-notes/topics/{topicId}` uses the JWT Student identity and ACTIVE-class Grade. Reject hidden/nonpublished Topic, Section, Unit and cross-grade links.
- `GET /v1/student/knowledge-notes/{noteId}` continues to return only PUBLISHED Notes in the active Grade.
- Read-time Topic Summary is derived from original `isKeyPoint` Table/Learning Blocks, with nearest H2/H3 headings; no alternate Theory data is stored.
- Teacher Primary replacement remains transactional and only one Primary link is allowed.
- `KnowledgeDocumentRenderer` accepts `idPrefix` for excerpt/Dialog clones to prevent duplicate DOM anchor IDs.

## Regression tests added

- Student Topic rejects draft/unpublished Topic and another Grade before querying linked Notes.
- An unpublished Primary is omitted while a published Supplementary remains visible.
- Note Detail backlinks omit hidden Topic metadata.
- Teacher promotion of already linked Supplementary does not duplicate the association.
- Renderer headings/key points remain scoped when embedded twice.

## Verification still required

The implementation was committed through the GitHub connector. It did **not** execute Node, Maven, TypeScript, browser or database integration tests. The following commands must be run against the checked-out branch:

```bash
cd client-e-learning
npm ci
npm run test
npx tsc --noEmit
npm run lint
npm run build

cd ../server
./mvnw test
```

For Windows PowerShell, use `./mvnw.cmd test`.

Manual checks: access denial for Grade 8 Student reading Grade 7 Topic, Topic archived/unpublished, Note unpublished, Teacher Primary/Supplementary toggles, and no regression to Question Banks or Activities.
