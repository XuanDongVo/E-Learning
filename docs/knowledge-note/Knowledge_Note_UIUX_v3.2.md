# Knowledge Note — UI/UX Specification v3.2 (Simple MVP)
Status: Approved design update; component shells only
Date: 2026-11-19
Supersedes UI/UX v3.1 references to Draft/Revision history and Publish Update.

## Information architecture
Four standalone pages: S01 Student Library, S03 Student Reader, T01 Teacher Management, T02 Teacher Editor.
Two embedded sections: S02 Topic knowledge in Student Unit Detail when exactly one Topic selected; T04 Topic links in Teacher Topic Detail.
T03 is a Preview mode within T02, not a separate page.

## Visual style
Student: Indie Illustrated Scrapbook, paper surfaces, readable 15–16px article text, line-height ~1.7, max width ~760px, mobile scrollable tables, accessible focus/keyboard. Teacher: existing administrative design. No category/cover/media controls.

## Student screens
**S01 Library:** Navbar "Sổ tay kiến thức"; search, authorized Grade and optional Unit filters, de-duplicated Note cards with title/description/Grade; unlinked Notes are included as general learning materials. Loading/error/empty states.

**S02 Topic Quick Summary:** Under selected Topic filter above Activity cards. Primary's valid published summary + CTA to full article; supplementary published Notes as reading links. Supplementary-only Topic shows links, no Primary placeholder. No linked eligible Note → section hidden.

**S03 Note Detail:** Full published document with title, summary, structured blocks, TOC desktop/mobile; no edit controls. Return to Library or preserve Unit/Topic filter context. Standalone notes do not require Activity CTA. No history/revision panel.

## Teacher screens
**T01 Management:** Search, Grade/status/linked filter, title/Grade/Topic count/status/updated columns. Actions: Create, Edit, Preview, Publish/Unpublish, Archive, manage links. No "unpublished changes" indicator because no separate Draft entity.

**T02 Editor:** Independent Word-like canvas with rich paragraphs, H2/H3, lists, links, formula/example/comparison/callout/common-mistake blocks; one dedicated Quick Summary field. Header: Save, Preview, Publish/Unpublish and current status. Metadata Grade/title/description and Topic linking live in settings. No per-paragraph textarea and no image upload. If status PUBLISHED, present a prominent warning before saving: "Lưu thay đổi sẽ cập nhật nội dung học sinh đang đọc." Provide Unpublish first as a safer option. No version history tab.

**T03 Preview:** Toggle Full Article / Quick Summary and Desktop/Mobile; read current Editor content. Publish toggles Note status, not creation of a revision.

**T04 Topic integration:** Link existing Note(s), reorder, mark/clear optional Primary, unlink without deleting source. Unpublished Notes remain visible only to Teacher.

## Error and state rules
Loading, empty, error, disabled, success across data screens; unsaved/save failed/stale version conflict in Editor. Student always sees only PUBLISHED Notes from current document. Failed save never reports success.

## Routes and rollout
Keep existing route shells from IMPLEMENTATION_SCAFFOLD.md, enable navigation only after backend endpoints and Student authorization work. Do not mount Student/Teacher Topic UI prematurely or return mock data.
