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
| 0009 | Assignment time-out auto-submit | Accepted |
| 0010 | Assignment targets are CLASS or GRADE | Accepted |
| 0011 | Student sees answers after submit | Superseded by 0019 |
| 0012 | Unfinished Activity run is not resumable | Accepted |
| 0013 | Learning mode v1 feedback | Superseded by 0014 |
| 0014 | Learning mode hint and retry | Accepted; formula-sheet implementation amended by 0016 and retry count superseded by 0022 |
| 0015 | Try Hard time limit per question | Accepted |
| 0016 | Topic formula/reference sheet deferred | Accepted |
| 0017 | Activity selection strategy at run start | Accepted |
| 0018 | AssignmentQuestion has no position | Partially superseded by 0024 |
| 0019 | Assignment post-submit answer visibility | Accepted |
| 0020 | Activity lifecycle transitions | Accepted |
| 0021 | Separate ActivitySession from AssessmentAttempt | Accepted |
| 0022 | Activity Practice interaction and one retry | Accepted |
| 0023 | Question Engine architecture | Accepted; D7/D8 refined by 0025/0026 |
| 0024 | Assignment Composition | Accepted; defines canonical ordered Composition |
| 0025 | Assignment grading lock and Activity updates | Accepted; Assignment lock after first attempt starts |
| 0026 | Assignment automatic scoring and score visibility | Accepted; automatic scoring, default/custom points, independent score and answer visibility |
| 0027 | Single Active Tab with Resumable AssessmentAttempt | **Accepted; Phase 7B session ownership** |
| 0028 | AssessmentAttempt draft answer on AssessmentAttemptQuestion | **Accepted; drops 1–1 Answer entity (V47)** |
| 0029 | Activity XP lifecycle, outcome, scaling, replay and result visibility | **Accepted; runtime not yet enabled** |
| 0030 | Activity Streak day qualification, milestone XP and Level integration | **Accepted; source implementation under verification** |
| 0031 | Student Home Streak/Level placement and border-ink + shadow-pop | **Accepted; visual decision 1 superseded for Student by 0032; behavior retained** |
| 0032 | Student Indie Illustrated Scrapbook visual system | **Accepted; scoped theme implemented, route migration in progress** |
| 0032 | XP/Streak Leaderboard, Top 50, honors and ActivitySession feed | **Accepted; source under verification** |
| 0033 | Absolute seven-day auth session lifecycle | **Accepted; implemented, validation deferred by owner** |
| 0034 | Teacher Assignment portfolio summary | **Accepted; operational list summary** |

## Current decision chain

ADR 0001 separates repeatable Activity practice from formal Assignment work.
ADR 0003 defines Assignment-owned questions and lifecycle constraints; ADR 0024 adds ordered Assignment Composition and ADR 0025 freezes the Assignment after the first attempt starts.
ADR 0008 places Activities under Units.
ADR 0014 defines hint/retry behavior; ADR 0022 fixes Practice to two submissions total (first answer + one retry).
ADR 0015 defines Try Hard timing per question.
ADR 0016 defers the shared Topic formula/reference sheet.
ADR 0017 stores the selected Activity strategy on ActivitySession.
ADR 0018 remains historical for AssignmentQuestion ordering; ADR 0024 defines canonical persisted Composition order.
ADR 0019 controls Assignment post-submit answer visibility through show_answers_after_submit.
ADR 0021 separates ActivitySession from formal AssessmentAttempt and forbids a shared polymorphic Attempt.
ADR 0023 accepts Question Engine D1–D8. ADR 0025 governs Assignment hard-lock and Activity update/snapshot semantics. ADR 0026 defines automatic Assignment scoring and visibility.
ADR 0027 defines the Phase 7B single-active-tab/resumable session policy: Web Locks provides same-browser exclusive tab coordination, a stable session credential is persisted for recovery, another tab is rejected immediately, and there is no heartbeat-driven stale takeover in MVP.
ADR 0033 defines authentication session lifetime and recovery: seven days is an absolute deadline from login, refresh does not extend it, inactive users are blocked on their next protected request, and the frontend coordinates one-time refresh/replay across tabs.
ADR 0034 defines the Teacher Assignment list's server-owned portfolio summary,
including open, finalized, overdue-incomplete and due-delivery result-rate counts.
ADR 0028 stores the AssessmentAttempt draft answer on AssessmentAttemptQuestion (answer_payload, revision, saved_at) and removes the separate AssessmentAttemptAnswer table; Mutation idempotency remains; normalized values are not stored on draft save.

ADR 0029 also locks the Activity XP v2.2 outcome matrix, Hint precedence, Level scaling, Completion Bonus eligibility, replay without penalty, legacy no-backfill and Result-only first release; approved policy is not deployed engine code.
ADR 0030 locks the Activity completion-only daily Streak, calendar timezone, 3/7/14/30 milestone bonuses and per-run re-award policy. See `.agent/plans/STUDENT_STREAK_LEVEL_IMPLEMENTATION.md`.

ADR 0032 replaces the Student Playful Classroom visual direction with Indie Illustrated Scrapbook. The older ADR 0031 Streak/Level and rewards requirements remain in effect; Teacher visual identity stays unchanged. The canonical aesthetic is `.agent/ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md`.

## Canonical implementation plan

For Activity XP, the canonical policy is `.agent/domain/ACTIVITY_XP_V2_2_SPEC.md` and the staged plan is `.agent/plans/ACTIVITY_XP_ENGINE_IMPLEMENTATION.md`; the skeleton remains in `.agent/plans/ACTIVITY_XP_ENGINE_SKELETON.md`.

For Student Assignment Attempt, the historical implementation plan is `.agent/plans/08-STUDENT_ASSIGNMENT_ATTEMPT_SPEC.md` and UI/runtime blueprint `.agent/plans/09-STUDENT_ASSIGNMENT_ATTEMPT_UI_RUNTIME_BLUEPRINT.md`. ADR 0027 remains authoritative for session ownership.

For the current Teacher Assignment Analysis feature, read `.agent/plans/10-TEACHER_ASSIGNMENT_ANALYSIS_SPEC.md`. It is a product specification, not proof that analytics are implemented.

## Authority note

Only Accepted ADRs define approved behavior. Implementation status is tracked separately in `CURRENT_STATE.md` and `PROGRESS.md`; accepted architecture is not evidence of implemented code or passing tests.
