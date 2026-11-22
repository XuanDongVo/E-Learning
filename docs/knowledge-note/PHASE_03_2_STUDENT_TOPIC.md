# Phase 03.2 — Student Topic Knowledge Integration

**Source implemented:** 2026-11-21, branch `feature/guided-reasoning-v1`. Runtime and browser verification pending.

## API
`GET /v1/student/knowledge-notes/topics/{topicId}`
JWT subject resolves Student ID; ACTIVE class supplies Grade. Topic, Section and Unit must all be PUBLISHED and same Grade, and Unit must be visible. A hidden Topic fails closed (TOPIC_NOT_FOUND).

Response shape:
```json
{
  "data": {
    "topicId": 3,
    "primary": {
      "id": 12, "title": "Present Simple", "description": null,
      "summaryDocument": { "type": "doc", "content": [] },
      "totalKeyPoints": 0
    },
    "supplementary": [
      { "id": 15, "title": "Examples", "description": null }
    ]
  }
}
```
The above is a **schema example**, not actual seeded data.

- Includes only PUBLISHED Notes of matching Grade.
- Primary excerpt is **derived from** the stored Tiptap JSON at read time: at most the first 3 blocks/tables with `attrs.isKeyPoint === true` plus nearest preceding H2/H3 headings. `totalKeyPoints` counts all marked nodes.
- Does not save an alternative summary, regenerate content, or create artificial formulas.
- Supplementary notes are returned as ordered metadata; full content remains under existing authenticated `GET /v1/student/knowledge-notes/{noteId}`.
- Published Note without any marked blocks: empty excerpt with a "read full" action.
- Topic with only Supplementary: show supplementary links, no fabricated Primary.
- Topic without links: show neutral no-theory state without blocking Activity.

## UX
- Mount `StudentTopicKnowledge` in `UnitDetailView` **after selecting a particular Topic**, immediately above the Activity list.
- Quick Summary panel uses `PaperSurface` and the original `illustration.topic-notes` SVG.
- "Xem nhanh lý thuyết" opens a Dialog that fetches the **full published Note** on demand; "Đọc lý thuyết đầy đủ" opens the existing Student Knowledge Library reader.
- Reuses safe `KnowledgeDocumentRenderer`; optional idPrefix isolates excerpt and dialog anchor IDs.
- Loading, error/retry, no Note and supplementary-only states are distinguished.

## Student UX + security checks
1. Teacher: publish Primary Note with marked H2/H3 & key point and a Supplementary, link to Grade 7 Topic.
2. Student of Grade 7 ACTIVE class: choose relevant Unit → Section → Topic. Verify summary appears before Activity cards.
3. Open Dialog: compare full stored JSON with Teacher Preview, including tables and Learning Blocks, and close with Esc.
4. Open full reader; verify route `/student/knowledge/{noteId}`.
5. Only Supplementary / no Note / zero key points: no invented content.
6. Unpublish Primary: summary disappears; published Supplementary remains; no stale client cache after refresh.
7. Student of Grade 8, archived/hidden Unit, Section, Topic, locked account: reject Topic read.
8. Mobile 360px/390px, tablet, desktop: no overflow in long formulas or tables; tabbing + visible focus.
9. No regression to Activity filtering, game runtimes, Question Banks, Teacher linking, Vocabulary or Assignments.

Tests added for authorized visibility / keypoint excerpt and renderer ID prefixing. Source was committed via connector; **Maven, Next build, Vitest, browser and CI checks were not executed**.
