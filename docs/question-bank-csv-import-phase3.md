# Question Bank CSV Import — Phase 3 editor integration

## Import → editor

1. Upload .csv on Question Bank and validate using Phase 1 API.
2. If there are any valid rows, **Chỉnh sửa N câu hợp lệ** writes a 24-hour handoff to sessionStorage. Its key is a random import ID; the URL contains only the ID.
3. The editor validates import ID, bank ID and current TEACHER user ID. Expired or unrelated handoffs cannot be loaded.
4. The validated rows map to the existing DraftQuestion model with stable A/B/C/D keys, chosen answers, accepted answers, question difficulty and notes.
5. If the bank already has a local draft, the teacher must explicitly choose **Giữ bản nháp cũ** or **Thay bằng câu từ CSV**; no silent overwrite.
6. After applying imported drafts, they are persisted through QuestionComposer's existing localStorage draft mechanism. The sessionStorage entry retains only the CSV validation report and its source metadata.
7. The report remains available in the editor, including CSV export of errors; no invalid rows enter the editor.
8. Editing, preview, duplicate, delete, adding extra questions and saving use the unchanged QuestionComposer and its existing bulk create API.
9. Save success or Clear Draft clears the import report. A failed save does not clear the draft or report.

## Scope and limitations

- No new backend save route, no Flyway migration, no Assignment modifications, no unit tests (as requested).
- The old editor's localStorage key is preserved for compatibility. A future hardening pass should scope all pre-existing teacher draft storage by authenticated user, not only CSV handoff.
- Error reports are held in sessionStorage; after closing the browser tab, they may not be recoverable.
- Validation is performed at import time; the existing Save route still handles its own server-side validation/readiness behavior.
- This phase is source implementation; a runtime build and end-to-end test on Docker remain necessary.
