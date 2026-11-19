# ADR 0038 — Knowledge Note as independent reusable learning content
Status: Accepted
Date: 2026-11-19
Decided by: project owner

## Context
ADR 0016 deferred a Topic-owned formula/reference sheet. The owner has now approved a distinct reusable Knowledge Note feature with a Teacher Word-like editor and Student Knowledge Library. A Note must not depend on Topic ownership. This ADR introduces a new future feature and supersedes ADR 0016's deferral **only for Knowledge Note planning**; it does not claim a Topic.reference_sheet field or implementation.

## Decision
- Knowledge Note is independently owned, Grade-scoped content; it can be created/published without Topic.
- Note–Topic links are optional many-to-many. A Topic can have many Notes but at most one Primary; Primary is optional. Other links are supplementary.
- Primary supplies the contextual Quick Summary; supplementary links are reading references. No automatic promotion when Primary disappears.
- Student Library includes published, grade-authorized Notes with no Topic links.
- Teacher authoring uses a Word-like structured rich-text editor with a separate Quick Summary. Published snapshots are immutable; Draft edits do not affect Student until published.
- MVP excludes category, coverMediaId/mediaId, Image block/media upload, DOCX import/export, AI and reading XP.
- Adopt proposed defaults: Teacher with relevant content permissions may publish; Grade access is server-derived; Summary is required when publishing a Note linked as Primary and optional otherwise; cross-Grade Topic links are rejected; Grade changes must reconcile existing links.
- Knowledge Note remains a planned feature; no DB/API/frontend implementation is implied.

## Consequences
Canonical target documents: docs/knowledge-note/Knowledge_Note_SRS_v3.1.md, Knowledge_Note_FRS_v3.1.md, Knowledge_Note_UIUX_v3.1.md.
Existing Topic and Activity behavior stays unchanged without Notes. The older Topic-owned reference-sheet field remains out of scope.
