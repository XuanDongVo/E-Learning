# Open questions

| ID | Question | Disposition | Status |
|---|---|---|---|
| OQ-7 | Assignment Excel import | Deferred until contract finalized | Later |
| OQ-8 | Payments/native mobile/multi-school | Need explicit v1 confirmation | Later |
| OQ-9 | First game experiences | Game presentation deferred | Later |
| OQ-17 | Hint XP deduction amount | Decide in Phase 9 | Later |
| OQ-18 | When/how to activate Topic formula/reference sheet | Future product decision | Later |

## Closed
- OQ-1 one teacher/many classes — decided.
- OQ-2 Activity under Unit — decided.
- OQ-3 Assignment target CLASS or GRADE — decided.
- OQ-4 Assignment completion = submitted — decided.
- OQ-5 own-grade visibility — decided.
- OQ-6 Learning: 2 answers total (first + 1 retry) + optional Question hint; formula sheet deferred — superseded by ADR 0022.
- OQ-10 phase numbering — decided.
- OQ-11 Assignment tracking requirements — decided.
- OQ-12 phone and computer equally — decided.
- OQ-13 Assignment timeout auto-submit — decided.
- OQ-14 show_answers_after_submit controls post-submit answers — decided.
- OQ-15 unfinished Activity run is not resumed — decided.
- OQ-16 abandoned Activity results ignored — decided.
- OQ-19 AssignmentQuestion has no position; question_id ASC — decided.
- OQ-20 multiple Activity strategies require student choice; store on ActivitySession — superseded by ADR 0021.
- OQ-21 Activity lifecycle transitions — decided.


## Accepted decisions — 2026-10-12

ADR 0023 D1–D8 and ADR 0024 are accepted. They are no longer open questions. See the ADR index and canonical architecture documents.

## Remaining implementation questions

| ID | Question | Status / gate |
|---|---|---|
| OQ-22 | How should future Assignment edits work after an AssessmentAttempt exists: create a new revision/draft or reject edits until archived? | Must decide before Phase 7B implementation |
| OQ-23 | What is the exact teacher review workflow and permission model for MANUAL grading? | Scope B must implement if MANUAL remains enabled in production; otherwise hide/disable it |
| OQ-24 | Which image asset/media storage contract and allowed URL policy will be used in student views? | Resolve against existing media implementation before snapshot/API work |
| OQ-25 | Which report export format details, filters and row granularity are required for CSV/Excel? | Basic Assignment export remains in product intent; finalize schema during reporting slice |

ADR 0023 D1–D8 and ADR 0024 are accepted product/architecture decisions. Remaining questions above are implementation contracts, not permission to weaken accepted requirements.
