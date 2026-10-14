# Open questions

## Deferred product questions
| ID | Question | Disposition | Status |
|---|---|---|---|
| OQ-7 | Assignment Excel import | Deferred until contract finalized | Later |
| OQ-8 | Payments/native mobile/multi-school | Need explicit v1 confirmation | Later |
| OQ-9 | First game experiences | Game presentation deferred | Later |
| OQ-17 | Hint XP deduction amount | Decide in Phase 9 | Later |
| OQ-18 | When/how to activate Topic formula/reference sheet | Future product decision | Later |

## Closed decisions
- OQ-1 one teacher/many classes.
- OQ-2 Activity under Unit.
- OQ-3 Assignment target CLASS or GRADE.
- OQ-4 Assignment completion = submitted.
- OQ-5 own-grade visibility.
- OQ-6 Learning allows two answers total (first + one retry) plus optional Question hint; formula sheet deferred (ADR 0022).
- OQ-10 phase numbering.
- OQ-11 Assignment tracking includes per-student status/score, class average, most-missed questions and CSV/Excel export.
- OQ-12 phone and computer equally.
- OQ-13 Assignment timeout auto-submits.
- OQ-14 `show_answers_after_submit` controls answer/explanation visibility; `show_score_after_submit` independently controls whether the calculated score is shown immediately (ADR 0026).
- OQ-15 unfinished Activity run is not resumed.
- OQ-16 abandoned Activity results ignored.
- OQ-19 AssignmentQuestion has no position; Composition section/item/member position defines product order. `question_id ASC` is only the legacy backfill order (ADR 0024).
- OQ-20 multiple Activity strategies require student choice when needed; store on ActivitySession.
- OQ-21 Activity lifecycle transitions.
- OQ-22 Assignment is hard-locked after first AssessmentAttempt starts; duplicate/clone it to make changes (ADR 0025).
- OQ-23 Assignment is automatically graded in v1; no manual grading workflow or AUTO/MANUAL selector. Each scored question defaults to 1 point; teachers may customize it per Assignment item. Compound part points default to equal split and may be adjusted while summing to the aggregate total (ADR 0026).
- D1–D8 in ADR 0023 are accepted; ADR 0026 refines Assignment scoring and score visibility.

## Remaining implementation questions
| ID | Question | Status / gate |
|---|---|---|
| OQ-24 | Which image asset/media storage contract and allowed URL policy will be used in student views? | Resolve against existing media implementation before snapshot/API work |
| OQ-25 | Which report export format details, filters and row granularity are required for CSV/Excel? | Basic Assignment export remains product intent; finalize schema during reporting slice |

All other relevant questions have an accepted product/architecture decision. Check ADR 0023–0026 and the Phase 7B implementation/migration plan before code.
