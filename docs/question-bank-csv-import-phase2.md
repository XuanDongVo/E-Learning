# CSV Import — Phase 2 frontend

Continues the Phase 1 branch `feature/question-bank-csv-import-phase1`.

## Scope completed
- Question Bank Detail: Import CSV button enabled and routed to `?mode=import`.
- CSV upload (drag/drop or file picker), file size/extension check, and real POST to Phase 1 validation endpoint via existing authenticated `requestMultipart`.
- UTF-8 downloadable template: `/templates/question-bank-csv-v1.csv`; five supported Question Bank question types.
- Row-level error report from backend, download errors as UTF-8 CSV, and lightweight summary of valid questions.
- Error states for invalid file, upload failure, expired session, and missing bank; ignores stale responses.
- Distinguishes invalid *rows* from error *messages*, because one row may have several errors.
- No fake import success or data persistence. No unit tests added.

## Deferred explicitly to Phase 3
- Handoff `validQuestions[].question` into `BulkQuestionCreator / QuestionComposer`.
- Handling draft conflicts in localStorage and preserving error report through navigation.
- The continue button is intentionally disabled until the editor integration is implemented. Phase 2 validates and reports but does not add questions.

Backend API: `POST /v1/content/question-banks/{bankId}/questions/import/validate`.
