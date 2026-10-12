# Decisions (ADR)

An accepted ADR overrides lower-level documents. Never delete an ADR; supersede or amend it with a later decision. Proposed ADRs are design proposals only and do not authorize implementation or migrations.

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
| 0014 | Learning mode hint and retry | Accepted; formula-sheet implementation amended by 0016 and interaction count superseded by 0022 |
| 0015 | Try Hard time limit is per question | Accepted |
| 0016 | Topic formula/reference sheet is deferred | Accepted |
| 0017 | Activity selection strategy is chosen at run start | Accepted |
| 0018 | AssignmentQuestion has no position; order is deterministic | Partially superseded by 0024 |
| 0019 | Assignment post-submit answer visibility is boolean | Accepted |
| 0020 | Activity lifecycle transitions | Accepted |
| 0021 | Separate ActivitySession from AssessmentAttempt | Accepted |
| 0022 | Activity Practice interaction and one retry | Accepted |
| 0023 | Question Engine architecture | Accepted |

| 0024 | Assignment Composition is an ordered product document | Accepted |

## Current decision chain

ADR 0001 separates learning Activities from formal Assignments.
ADR 0003 makes Assignment questions owned by the Assignment and defers Excel import and reorder work.
ADR 0008 places Activities under Units.
ADR 0014 defines hint availability and older Practice interactions; ADR 0022 supersedes its old three-submission behavior with one retry.
ADR 0015 defines Try Hard timing per question.
ADR 0016 deliberately defers the shared Topic formula/reference sheet.
ADR 0017 makes the student-selected Activity strategy part of ActivitySession.
ADR 0018 keeps AssignmentQuestion.position-free; ADR 0024 supersedes its product-level no-reordering rule by putting order on Composition sections/items.
ADR 0019 replaces the Release Answers timestamp concept with show_answers_after_submit.
ADR 0020 defines the allowed Activity status transitions.
ADR 0021 separates repeatable ActivitySession from formal AssessmentAttempt and forbids a shared polymorphic Attempt table. AssessmentAttempt is deferred.
ADR 0022 fixes Practice semantics: no timer, one retry, optional Question hint, no detailed persisted Activity answer history.
ADR 0023 accepts the shared Question Engine, durable Activity snapshots, D1–D8, Assignment part-result analytics and weighted scoring. Implementation is still outstanding. See `.agent/architecture/question-engine-v1.md`.

ADR 0024 makes the Assignment Builder demo the product prototype and defines ordered Composition. See `.agent/architecture/assignment-composition-v1.md`.

## Authority note

Only ADRs marked Accepted define approved behavior. A Proposed ADR may guide review/planning but cannot override accepted ADRs or authorize code/schema changes.