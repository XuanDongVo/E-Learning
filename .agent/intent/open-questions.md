# Open questions

Questions the docs and code cannot answer. Each has evidence, options and a recommendation.
When the owner answers: record an ADR if it changes a decision, update the affected docs, move the row to "Closed".
Status key: **Blocking** = stops the next build step; **Soon** = needed within the next phase; **Later**.

| ID | Question | Why it is open (evidence) | Options | Recommendation | Status |
|---|---|---|---|---|---|
| OQ-7 | Excel import for Assignment questions | Deferred by ADR 0003 | Keep deferred; pick a milestone | After Attempts | Later |
| OQ-8 | Non-goals beyond the repo docs | Payments, native mobile, multi-school are not written anywhere | Confirm each is out of scope | Confirm all three as out of scope for v1 | Later |
| OQ-9 | Which games first, and when? | `GameTemplate` is in the spec but there is no table, entity or endpoint | List 1–2 templates for the first release | Decide after Attempts work | Later |
| OQ-17 | How much XP is deducted when a hint is used? | Owner chose an XP deduction (ADR 0014); the amount is not set | A fixed percentage per hint · B fixed XP points · C decide with the XP rules | C | Later (Phase 9) |

## Closed

| ID | Question | Answer | Date |
|---|---|---|---|
| OQ-1 | One teacher or many? | One teacher, many classes. [ADR 0005](../decisions/0005-one-teacher-many-classes.md) | 2026-10-07 |
| OQ-4 | What counts as completed for an Assignment? | Completed = submitted; no threshold. [ADR 0006](../decisions/0006-assignment-completion-is-submission.md) | 2026-10-07 |
| OQ-5 | What may a student see? | Students see published content of their own grade only. [ADR 0007](../decisions/0007-student-visibility-own-grade.md) | 2026-10-07 |
| OQ-11 | What must the teacher see when tracking an Assignment? | Status list, score per student and class average, most-missed questions, Excel/CSV export (intent §3b) | 2026-10-07 |
| OQ-2 | Where does an Activity live? | Under a Unit. [ADR 0008](../decisions/0008-activity-belongs-to-unit.md) | 2026-10-07 |
| OQ-12 | Main device for students | Phone and computer equally (intent §6a) | 2026-10-07 |
| OQ-13 | What happens when the Assignment time limit runs out? | Auto-submit, flag Timed out, counts as submitted. [ADR 0009](../decisions/0009-assignment-timeout-auto-submit.md) | 2026-10-07 |
| OQ-3 | Assignment target types | Class(es) or Grade, never mixed. [ADR 0010](../decisions/0010-assignment-targets-class-or-grade.md) | 2026-10-07 |
| OQ-10 | Phase numbering collision | Student Management = Phase 6, Attempts = Phase 7. [ADR 0004](../decisions/0004-phase-numbering.md) | 2026-10-07 |
| OQ-14 | What does a student see right after submitting an Assignment? | Score and correct answers immediately. [ADR 0011](../decisions/0011-student-sees-answers-after-submit.md) | 2026-10-07 |
| OQ-15 | An Activity run that the student leaves unfinished | Not saved; a new run starts next time. [ADR 0012](../decisions/0012-activity-run-not-resumable.md) | 2026-10-07 |
| OQ-16 | Do answers in an abandoned Activity run count for analytics? | No, the whole abandoned run is ignored. [ADR 0012](../decisions/0012-activity-run-not-resumable.md) (amended) | 2026-10-07 |
| OQ-6 | Learning mode details | 3 answers in total then show answer + explanation; one optional hint per question, XP reduced when used; one formula sheet per Topic. [ADR 0014](../decisions/0014-learning-mode-hint-and-retry.md) | 2026-10-07 |
