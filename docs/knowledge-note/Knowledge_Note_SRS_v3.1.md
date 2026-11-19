# Knowledge Note — Software Requirements Specification (SRS) v3.1
Status: Approved product decisions; documentation only (not implemented)
Date: 2026-11-19
Related: [FRS](./Knowledge_Note_FRS_v3.1.md) · [UI/UX](./Knowledge_Note_UIUX_v3.1.md) · [ADR 0038](../../.agents/decisions/0038-independent-knowledge-notes.md)

## Purpose and scope
Knowledge Note is a teacher-authored, grade-scoped reusable learning document independent of Unit/Section/Topic ownership. Students access published notes through a dedicated Knowledge Library or contextual Topic references. This feature does not alter Activity, Question Bank, Assignment, XP, Streak or vocabulary learning rules.

### In scope
- Teacher note list, create, edit, save draft, preview, publish/update, unpublish, archive.
- Word-like structured rich-text editor; headings, paragraphs, lists, links, formulas, examples, callouts, mistakes and comparison tables.
- Separate Quick Summary and full document; summary appears for a published Primary Note in Topic context.
- Optional many-to-many links between Notes and Topics; each Topic has at most one Primary and any number of supplementary notes.
- Student Library for published notes accessible to the student's authorized Grade, including notes with zero Topic links.
- Student full reader and Topic contextual summary/references.
- Server authorization, validation, concurrency and immutable published revisions.

### Out of scope (MVP)
Category, coverMediaId/mediaId, image upload and image blocks, DOCX import/export, videos, attachments, AI generation, personal annotations, Mistake Notebook, in-article quiz, XP for reading, multi-grade Note ownership, public anonymous sharing.

## Stakeholders and actors
Teacher: author and manage permitted content. Student: read only published, grade-authorized content. Administrator: only where existing permission model grants it. Server: authority for lifecycle, access and link invariants.

## System requirements
| ID | Requirement |
|---|---|
| SRS-01 | Notes must exist independently of Topic; creating a Note must not require topicId. |
| SRS-02 | Every Note must have exactly one valid gradeId in MVP. |
| SRS-03 | Note-to-Topic association must be many-to-many and optional. |
| SRS-04 | A Topic may have zero or one Primary Note; Primary is not required. |
| SRS-05 | Unlinking a Note must never delete the Note or other Topic links. |
| SRS-06 | Student Library must include eligible published unlinked Notes, without duplicates. |
| SRS-07 | Only a published revision may be served to Students; draft is Teacher-only. |
| SRS-08 | Editing a published Note must not mutate its published snapshot until Publish Update. |
| SRS-09 | Teacher must be able to preview the full reader and Topic Quick Summary. |
| SRS-10 | Student Topic must display Primary summary if eligible and supplementary links otherwise; no automatic promotion. |
| SRS-11 | Editor content must use validated, versioned structured JSON, not unrestricted HTML. |
| SRS-12 | APIs must enforce ownership/authorization, grade eligibility, status and safe content rendering. |
| SRS-13 | Changes to Note Grade must not leave invalid cross-grade links. |
| SRS-14 | Student UI must use Indie Illustrated Scrapbook; Teacher UI must retain its existing style. |
| SRS-15 | Existing Unit, Topic, Activity and Assignment flows must work when no Note exists. |

## Quality attributes
- Security: enforce access at API, not only in UI; sanitize rich text and links; reject unsafe nodes/attributes.
- Reliability: atomic publish and Primary switches; prevent duplicate links and concurrent draft overwrites.
- Accessibility: keyboard operation, visible focus, headings, readable contrast, mobile table overflow.
- Performance: paginate Library and Teacher list; Topic endpoint returns compact summary, not every full document.
- Maintainability: version JSON schema; shared block definitions with distinct Teacher edit and Student read renderers.
- Compatibility: no breaking changes to existing Topic/Activity endpoints required in MVP.

## Acceptance gates
A Note without Topic can be published and read by an eligible student; the same Note can be linked to multiple Topics; one Topic can link many Notes but cannot have two Primaries; removing Primary does not auto-promote another; drafts are inaccessible to Students; published content remains unchanged until update; existing student learning routes remain usable.

## Deferred decisions resolved for this baseline
- Authorized Teacher with permission for the relevant content may publish (server enforced).
- Published revision and editable draft remain separate.
- Summary is required when publishing a Note intended as Primary; optional for standalone/supplementary Notes. An existing Primary link cannot expose an empty summary after update.
- Student visibility is own authorized Grade; no Topic link required.
- Grade changes are blocked while linked to Topics of a different Grade unless links are explicitly reconciled in the same authorized operation.
- A Note without a Primary is valid; supplementary-only Topic is valid.

## Status
This SRS describes the approved target, not deployed functionality. No migrations, endpoints or UI are claimed implemented.
