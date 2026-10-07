# Decisions (ADR)

An accepted ADR overrides lower-level documents. Never delete an ADR; supersede or amend it with a later decision.

| ADR | Title | Status |
|---|---|---|
| 0001 | Activity and Assignment are independent | Accepted |
| 0002 | Adopt the UI guidelines and design tokens | Accepted |
| 0003 | Phase 5 assignment contract | Accepted |
| 0004 | Phase numbering | Accepted |
| 0005 | One teacher, many classes | Accepted |
| 0006 | Assignment completion means submission | Accepted |
| 0007 | Student visibility is own grade | Accepted |
| 0008 | Activity belongs to Unit | Accepted |
| 0009 | Assignment time-out auto-submits | Accepted |
| 0010 | Assignment targets are CLASS or GRADE | Accepted |
| 0011 | Student sees score and answers after submit | Superseded by 0019 |
| 0012 | Unfinished Activity run is not resumable | Accepted |
| 0013 | Learning mode v1 feedback | Superseded by 0014 |
| 0014 | Learning mode hint and retry | Accepted; formula-sheet implementation amended by 0016 |
| 0015 | Try Hard time limit is per question | Accepted |
| 0016 | Topic formula/reference sheet is deferred | Accepted |
| 0017 | Activity selection strategy is chosen at run start | Accepted |
| 0018 | AssignmentQuestion has no position; order is deterministic | Accepted |
| 0019 | Assignment post-submit answer visibility is boolean | Accepted |
| 0020 | Activity lifecycle transitions | Accepted |

## Current decision chain

ADR 0001 separates learning Activities from formal Assignments.
ADR 0003 makes Assignment questions owned by the Assignment and defers Excel import and reorder work.
ADR 0008 places Activities under Units.
ADR 0014 defines Learning Mode retry/hint behavior.
ADR 0015 defines Try Hard timing per question.
ADR 0016 deliberately defers the shared Topic formula/reference sheet.
ADR 0017 makes the student-selected Activity strategy part of the Attempt snapshot.
ADR 0018 removes AssignmentQuestion.position and the reorder feature.
ADR 0019 replaces the Release Answers timestamp concept with show_answers_after_submit.
ADR 0020 defines the allowed Activity status transitions.
