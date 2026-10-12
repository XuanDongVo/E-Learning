# Decisions (ADR)

An accepted ADR overrides lower-level documents. Never delete an ADR; supersede or amend it with a later decision. Proposed ADRs are planning only and do not authorize implementation.

| ADR | Title | Status |
|---|---|---|
| 0001 | Activity and Assignment are independent | Accepted |
| 0002 | Adopt the UI guidelines and design tokens | Accepted |
| 0003 | Phase 5 assignment contract | Accepted; amended by 0024/0025 where noted |
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
| 0014 | Learning mode hint and retry | Accepted; formula-sheet implementation amended by 0016 and retry count superseded by 0022 |
| 0015 | Try Hard time limit is per question | Accepted |
| 0016 | Topic formula/reference sheet is deferred | Accepted |
| 0017 | Activity selection strategy is chosen at run start | Accepted |
| 0018 | AssignmentQuestion has no position; order is deterministic | Partially superseded by 0024 |
| 0019 | Assignment post-submit answer visibility is boolean | Accepted |
| 0020 | Activity lifecycle transitions | Accepted |
| 0021 | Separate ActivitySession from AssessmentAttempt | Accepted |
| 0022 | Activity Practice interaction and one retry | Accepted |
| 0023 | Question Engine architecture | Accepted; D7/D8 refined by 0025 for Assignment grading |
| 0024 | Assignment Composition is an ordered product document | Accepted |
| 0025 | Assignment lock after first attempt; Activity updates apply to future sessions | Accepted; scoring superseded by 0026 |
| 0026 | Assignment automatic scoring and score visibility | Accepted |

## Current decision chain

ADR 0001 separates repeatable Activity practice from formal Assignment work.
ADR 0003 defines Assignment-owned questions and lifecycle constraints; ADR 0024 adds ordered Assignment Composition and ADR 0025 freezes the Assignment after the first attempt starts.
ADR 0008 places Activities under Units.
ADR 0014 defines hint/retry behavior; ADR 0022 fixes Practice to two submissions total (first answer + one retry).
ADR 0015 defines Try Hard timing per question.
ADR 0016 defers the shared Topic formula/reference sheet.
ADR 0017 stores the selected Activity strategy on ActivitySession.
ADR 0018 remains authoritative that AssignmentQuestion itself has no position. ADR 0024 supersedes its product-level no-reorder/order-by-ID rule: canonical Composition has persisted ordered sections/items/members.
ADR 0019 controls Assignment post-submit answer visibility through show_answers_after_submit.
ADR 0021 separates ActivitySession from formal AssessmentAttempt and forbids a shared polymorphic Attempt.
ADR 0023 accepts Question Engine D1–D8. ADR 0025 governs Assignment hard-lock and Activity update/snapshot semantics. ADR 0026 supersedes ADR 0025 on grading: Assignment is automatically scored in v1.
ADR 0024 makes the Assignment Builder demo the product prototype and defines Composition; current demo localStorage/seed persistence is not production persistence.
ADR 0025 locks an Assignment after its first attempt starts; to change it, clone it. Activity edits are allowed; existing sessions keep their starting snapshot, and later sessions use the latest saved revision. ADR 0026 defines automatic scoring, per-question default/custom points, score visibility and the independent answer-reveal flag.

## Canonical implementation plan

Read .agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md before coding Phase 7B. It sequences environment validation, Question Engine contracts, Activity snapshots, Assignment Composition, AssessmentAttempt, automatic scoring, analytics and migration gates.

## Authority note

Only Accepted ADRs define approved behavior. Implementation status is tracked separately in PROGRESS.md; accepted architecture is not evidence of implemented code or passing tests.


ADR 0026 adds show_score_after_submit (default TRUE), independent from show_answers_after_submit, sets per-question points to default 1 with teacher customization, and requires automatic score calculation on submit/timeout. There is no manual grading UI or workflow in v1.
