# Phase 02.7 — Teacher Topic Knowledge Linking UX

**Source implemented:** 2026-11-21, branch `feature/guided-reasoning-v1`. No migration and no Teacher API shape changes.

## Changes
- Explicit Primary/Supplementary definitions in Teacher Topic Knowledge tab and picker.
- Can promote an **already linked Supplementary** Note to Primary in the picker.
- Existing Primary automatically demoted by existing transactional server service.
- Prevent duplicate "Add Supplementary" actions and display each Note's current role.
- Explain server requirements for Primary: same Grade, PUBLISHED, H2/H3 and marked Learning Block/Table (`isKeyPoint`).
- Inline `role="alert"` on POST failure; errors are still surfaced by toasts.
- Empty candidate list offers Teacher Knowledge Note Library creation/publication route.
- Server still checks all invariants; UI hints are not authorization.

## How to use
Open `/vi/teacher/content/topics/3` → **Kiến thức / Lý thuyết**.
- Click **Gắn bài chính** for a new Primary.
- Click **Thêm tài liệu** for Supplementary.
- Choose a candidate PUBLISHED Note within Topic Grade.
- A linked Supplementary can be promoted directly; current Primary becomes Supplementary.
- Remove links without deleting Note content.
- Verify network GET `/v1/teacher/knowledge-notes/topics/3/links`, POST to the same path with `{"noteId":12,"primary":true}`.

## Acceptance / regression
- Empty PUBLISHED candidates displays creation/publication guidance.
- Search/pagination returns valid candidates only; display existing role.
- Promote existing Supplementary; one Primary max after reload.
- Fail to link Draft, wrong-grade, or missing marked key point as Primary; show server message.
- Unpublished linked Note stays in Teacher with warning but is hidden from Student.
- Archived Topic cannot edit links.
- All dialogs keyboard-operable; no Teacher style leakage into Student.
