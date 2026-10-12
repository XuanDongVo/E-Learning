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

| Decision | Question requiring explicit Owner resolution | Current recommendation in proposal |
|---|---|---|
| D1 | Should existing types gain partial-credit grading? | Preserve current scoring semantics; design partial credit separately for new Matching/Cloze types. |
| D2 | What is the semantic boundary for FILL_IN_BLANK vs CLOZE? | Preserve existing FILL_IN_BLANK; use a distinct CLOZE type for multi-blank content. |
| D3 | Should Question APIs switch to a discriminated type-specific QuestionSpec contract? | Change backend and frontend together in one vertical slice, after approval. |
| D4 | Should ActivitySession persist a full immutable question-content snapshot at start? | Approve durable content snapshot while preserving no detailed Activity answer-history persistence. |
| D5 | Should part-level Activity grading/analytics be persisted? | Calculate part-level GradeResult in the engine; do not persist detailed Activity parts until separately approved. |
| D6 | Must the Activity student runtime render authored image/audio media in v1? | Confirm supported media kinds and accessibility behavior before building snapshot/view contracts. |

These are not closed decisions. ADR 0023 and its architecture remain proposed and authorize no code/schema change.
