# Knowledge Note — SRS v3.2 (Simple MVP)
Status: Approved simplification; scaffold only (not implemented)
Date: 2026-11-19
Supersedes: SRS v3.1 draft/revision lifecycle
Related: FRS v3.2, UI/UX v3.2, ADR 0038 amendment

## Goal
Knowledge Note is a Grade-scoped teacher-authored document, independent of Topic, optionally linked to many Topics. A Topic may link to many Notes but at most one Primary (Primary optional). Published, eligible and unlinked Notes appear in Student Knowledge Library.

## MVP scope
- A single `KnowledgeNote` record stores the current title, description, Grade, document JSON, summary JSON, status and editVersion.
- `KnowledgeNoteTopicLink` associates multiple Notes with Topics; optional per-Topic Primary and display order.
- Teacher can create, edit content, save directly, preview, publish/unpublish, archive, and manage Topic associations.
- Student can read only PUBLISHED Notes in its authorized Grade, with independent Library and contextual Topic Quick Summary.
- Teacher editor: Word-like rich-text with allowed learning blocks and Quick Summary; separate edit/read renderers.
- No category, mediaId, image upload, image block, personal notes, quiz, XP, DOCX or AI generation.

## Simplified publication behavior
There are **no** KnowledgeNoteDraft or KnowledgeNoteRevision entities in MVP.
- DRAFT: save content directly, hidden from Students.
- PUBLISHED: save content directly; saved changes are **immediately visible** to authorized Students. There is no snapshot isolation or revision history.
- UNPUBLISHED: save while hidden, re-publish when ready.
- ARCHIVED: hidden.
For controlled edits, the Teacher must Unpublish before saving changes and Publish again. UI should disclose this behavior clearly and ask confirmation before changing a published document.

## System requirements
| ID | Required behavior |
|---|---|
| SRS-01 | Note creation does not require Topic. |
| SRS-02 | Every Note belongs to one Grade in MVP. |
| SRS-03 | Optional many-to-many Note–Topic links, unique pair. |
| SRS-04 | No more than one Primary per Topic; Primary optional. |
| SRS-05 | Unlink never deletes Note or other links. |
| SRS-06 | Student Library includes authorized Published unlinked Notes, deduplicated. |
| SRS-07 | Student cannot view DRAFT, UNPUBLISHED or ARCHIVED documents. |
| SRS-08 | Current document content is saved directly to KnowledgeNote; no revision/history semantics. |
| SRS-09 | Summary is required before publishing if Note is Primary of a Topic, optional otherwise. |
| SRS-10 | Teacher and Student authorization, grade checks and JSON validation are server-enforced. |
| SRS-11 | Editor indicates status, unsaved changes and immediate visibility of published edits. |
| SRS-12 | Student Indie Illustrated Scrapbook style remains separate from Teacher UI. |

## Nonfunctional requirements
Validated allowlisted JSON nodes; safe link protocols; optimistic save conflict (editVersion); transactional Primary changes and lifecycle mutations; read access derived server-side; accessible keyboard/mobile UI; paginated Library and management list. No raw HTML interpretation.

## Acceptance
- One published Note can be linked to multiple Topics, with at most one Primary per Topic.
- An unlinked published Note appears in eligible Student Library.
- Saving a published Note changes what a permitted Student sees immediately; warning appears before editing/saving.
- Unpublish hides the Note, without deleting Topic links or document.
- Two editors cannot silently overwrite one another (409 conflict).
- Existing Activity/Topic views remain usable with no Note.
- No Draft/Revision tables remain in effective schema after V67.
