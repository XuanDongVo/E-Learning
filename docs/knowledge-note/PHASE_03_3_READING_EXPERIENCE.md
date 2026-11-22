# Phase 03.3 — Student Knowledge Reading Experience

**Source implemented:** 2026-11-21, branch `feature/guided-reasoning-v1`.

## Intended flow

1. Student opens `/vi/student/knowledge/{noteId}` from Knowledge Library or a Topic.
2. Existing shared JSON renderer presents the complete published Teacher document (paragraphs, H2/H3, learning blocks and responsive tables); no new content editor or storage entity.
3. Reading progress reflects only the **current page view/session**. The top progress bar tracks the content region, updates on scroll/resize via a throttled listener and does not award XP, count streak or persist progress.
4. Active H2/H3 entry gets `aria-current="location"` in the sidebar Table of Contents. On narrow screens, the same outline lives inside a native `details` disclosure above the article.
5. Student sees visible linked Topics after the article and can open the corresponding Unit with `?topicId={topicId}`. Unit Detail validates the Topic ID against published Unit data and preselects its Section/Topic.
6. If the Note has no visible Topic association, Student can return to the Knowledge Library as usual.

## API additive change

`GET /v1/student/knowledge-notes/{noteId}` now also returns:

```json
{
  "data": {
    "id": 12,
    "title": "Present Simple",
    "description": null,
    "updatedAt": "2026-11-21T10:00:00",
    "document": { "type": "doc", "content": [] },
    "linkedTopics": [
      {
        "topicId": 3,
        "topicName": "Present Simple",
        "unitId": 1,
        "unitCode": "U03",
        "unitName": "Unit 3",
        "primary": true
      }
    ]
  }
}
```

This is an illustrative response **shape**, not actual database values. Linked Topics are filtered by PUBLISHED Topic, Section, Unit and matching Grade. Note content never leaks another Grade or unpublished Topic.

## QA checklist

- Article H1 remains unique; H2/H3 links and marked blocks land at correct headings below sticky navbar.
- Mobile `details` TOC opens with keyboard and closes without trapping focus.
- Progress remains 0..100, does not imply a saved bookmark, and does not persist across browser reloads.
- Table and long examples scroll horizontally inside the reader without growing body width.
- Note linked to 2+ published Topics shows all valid Topic backlinks; linked draft Topic remains hidden.
- Return from Note Detail to Unit selects correct Section and Topic; malformed or unrelated query ID is ignored.
- Teacher Editor/Preview rendering stays unchanged.
- Test `use-knowledge-reading-progress.test.ts` and backend `StudentKnowledgeNoteServiceTest`.
