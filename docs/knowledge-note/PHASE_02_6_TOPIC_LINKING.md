# Phase 02.6 — Teacher Knowledge Note ↔ Topic Linking

Status: Implemented in `feature/guided-reasoning-v1` (2026-11-20). **Source-only; compilation, database integration and browser checks remain pending.**

## Scope

- Reuse `knowledge_note_topic_links` (introduced in V66). **No migration.** Each Note can link to many Topics; each Topic has 0..1 Primary and 0..N Supplementary Notes.
- Teacher-only APIs under `/v1/teacher/knowledge-notes`; existing `/v1/content/topics/**`, Question Bank, Activities and Assignments are unaffected.
- The Teacher Topic Detail now has **Ngân hàng câu hỏi** and **Kiến thức / Lý thuyết** tabs. The existing Banks/Activity view remains available in its original tab. Linking UI is implemented inside the Knowledge tab.
- Teacher Knowledge Note Detail shows Topic usages with navigation back to Teacher Content.
- For new Teacher surfaces, outer panels/Dialogs use `border-2 border-ink shadow-pop`; individual Note cards use the same border and shadow treatment.

## API contract

All responses use `ApiResponse<T>`.

| Operation | Method and path |
|---|---|
| List links for Topic | GET `/v1/teacher/knowledge-notes/topics/{topicId}/links` |
| Add, update role or replace Primary | POST `/v1/teacher/knowledge-notes/topics/{topicId}/links` |
| Remove one link | DELETE `/v1/teacher/knowledge-notes/topics/{topicId}/links/{noteId}` |
| Reorder Supplementary notes | PUT `/v1/teacher/knowledge-notes/topics/{topicId}/supplementary-order` |
| List linked Topics of a Note | GET `/v1/teacher/knowledge-notes/{noteId}/topics` |

POST body: `{"noteId":12,"primary":true}`. With `primary:true`, previous Primary is demoted to Supplementary and the new Note becomes Primary; existing link can be promoted without duplicate row.

PUT order body: `{"noteIds":[34,12,56]}`. Must contain all and only the supplementary Note IDs. Response returns the updated complete Topic link list. Primary is not included in ordering.

Link DTO: `noteId, linkId, gradeId, title, description, status, primary, displayOrder`.
Reverse usage DTO: `topicId, topicName, sectionId, sectionName, unitId, unitName, primary, displayOrder, topicStatus`.

## Invariants

- Server checks Topic existence, Note existence and Grade equality through `Topic → Section → Unit → Grade`. Frontend filters candidates by Grade as a convenience, not as authorization.
- New links and role changes require the Note status `PUBLISHED`. A linked Note can later be unpublished or archived; links remain visible to Teacher with a warning but must be filtered from future Student readers.
- Primary requires at least one nonempty H2/H3 heading **and** one marked Learning Block or Table. This is checked at linking time as well as publication time when already Primary.
- Backend disallows mutation of links for archived Topics. Frontend mirrors this by disabling controls.
- Backend locks the Topic row for writes and relies on existing partial unique index `uk_knowledge_note_topic_primary` to enforce one Primary under concurrent requests.
- Unlinking never deletes Note content. No implicit Note publication or content overwrite happens during linking.
- Student Knowledge Library / Topic Dialog implementation and Student API permissions are still deferred to Phase 03.

## Manual verification

1. Publish Note A and B in Grade 7, both with H2/H3 and marked keypoint; prepare a Grade 8 Note.
2. On a Grade 7 Topic, attach A as Primary, B as Supplementary, then promote B; A must become Supplementary (one Primary only).
3. Reorder multiple Supplementary notes using Up/Down and reload; order must persist.
4. Unlink a Note; reload Topic and Note Detail. Original Note still exists and Note Detail usage count changes.
5. Try attaching a Note of another Grade, Draft/Unpublished Note, or Note without keypoints as Primary; API should reject.
6. Unpublish a linked Note: Teacher sees a warning; the association remains. Archived Topic cannot mutate links.
7. Confirm the former Question Bank and Activity navigation still works and dialogs are keyboard-accessible on desktop/mobile.
8. Verify role-based authorization: non-Teacher principals cannot access any linking endpoint.
