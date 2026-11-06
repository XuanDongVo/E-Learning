# Business Rules

## Student Class Membership
- A Student can have zero or one ACTIVE class membership at a time.
- A Student with no ACTIVE class has no current Grade-based content access.
- Adding a Student with an ACTIVE membership is rejected; moving the Student uses the explicit transfer operation.
- Transfer is atomic: deactivate the source membership, then reactivate an existing target history row or create a target row.
- A teacher can transfer a Student only when they own both source and target classes.
- INACTIVE memberships remain history and do not grant access to the old class or Grade.
- PostgreSQL enforces one ACTIVE membership per user; services lock the Student row during membership changes.

## Activity
- Activity belongs to one Unit.
- Activity and Assignment are independent.
- Activity may be DRAFT, PUBLISHED or ARCHIVED.
- Draft may be incomplete; PUBLISHED requires READY.
- Mode is LEARNING, TRY_HARD or BOTH. If BOTH, the student chooses the concrete mode at start.
- If multiple selection strategies are configured, the student chooses one at start; ActivitySession stores the concrete selection_strategy.
- Try Hard time_limit_seconds is per question. Practice (backend LEARNING) has no timer.
- Try Hard wrong answers cost lives; question timeout costs no life.
- No whole-Activity countdown.
- Unfinished ActivitySession runs are not resumed; abandoned sessions are ignored for finalized analytics/XP.
- Activity options/start and operations on an IN_PROGRESS session require the Student's current Grade to match the Activity Grade.

## Learning Mode
- One optional teacher-authored hint per Question.
- Maximum 2 answers per question: first answer + 1 retry.
- Hint usage is recorded and may affect future XP.
- No hint in Try Hard.
- Topic formula/reference sheet is deferred.

## Assignment
- Assignment owns AssignmentQuestion records.
- AssignmentQuestion has assignment_id and question_id only. No position or topic_id. Product ordering is Composition section/item/member position (ADR 0024).
- Composition order is authoritative and comes from persisted section/item/member position. question_id ASC is only deterministic legacy backfill/compatibility order.
- One Attempt per student.
- Assignment time_limit_minutes is the whole-attempt duration, stored in minutes. The server calculates deadline_at = started_at + time_limit_minutes; assignments.due_at is a separate due-policy timestamp.
- The Attempt deadline keeps running when the browser closes or the student loses network.
- Expiry must auto-submit server-confirmed answers and mark the Attempt Timed out; timeout finalization is not yet implemented.
- Submission after due_at is Late without score penalty. A late assignment can still be started.
- Completion means submitted.
- show_score_after_submit (default TRUE) independently controls immediate score display. show_answers_after_submit (default TRUE) independently controls correct-answer/explanation reveal. The server always calculates the score on submit/timeout; hiding it affects student display only.
- Official score is separate from XP.

## Snapshot
- ActivitySession freezes the selected Activity question set/order. AssessmentAttempt snapshots formal Assignment questions and answers separately.
- AttemptQuestion.position is runtime snapshot order, not AssignmentQuestion authoring order.
- Server is authoritative for correctness and scoring.

## Assignment Composition (ADR 0024)
- Assignment is an ordered document: sections, items and grouped members have persisted order; AssignmentQuestion has no position.
- The Assignment Builder demo is the product prototype; localStorage/seed is not production storage.
- V1 blocks: instructions, passage, image/media and answer pool; audio/nested blocks deferred.
- Points, required and isExample are Assignment-specific; examples have zero points and are excluded from denominator/most-missed analytics. Assignment v1 grades every submission automatically; no manual grading workflow or AUTO/MANUAL selector exists.
- Assignment percentage = total earned points / total possible scored points × 100; round only for display.
- All Assignment submissions are automatically graded on submit/timeout by Question Engine; no pending-review state or manual grading workflow exists in v1. Readiness blocks zero possible scored points.
- AssessmentAttempt snapshots ordered composition, QuestionSpecs, scoring flags, media refs and normalization/review provenance.
- Persist per-part outcomes and normalized submitted values for Assignment analytics; report unanswered separately from incorrect.
- In-progress student payloads never leak correctness/answer keys/normalized values. After submission, show_score_after_submit controls score display; show_answers_after_submit independently controls answers/explanations.
- Publishing readiness is server-enforced; once any AssessmentAttempt starts, reject Assignment edits and require cloning to change it. This authoring lock is not yet implemented.

## Assignment score display (ADR 0026)
- Every submission/timeout is intended to be graded server-side from the immutable AssessmentAttempt snapshot.
- show_score_after_submit controls whether students see the calculated score immediately; show_answers_after_submit independently controls answers/explanations.
- Composition position, not question ID, determines rendered item order. question_id ASC is only the legacy backfill order.

## Activity XP v2.2 reward lifecycle (ADR 0029)
- Activity only; Assignment and AssessmentAttempt never receive Activity XP.
- Per-question difficulty is snapshotted from each Question when ActivitySession starts, as are official Level and XP policy/multiplier.
- During IN_PROGRESS, XP is provisional: no XP ledger entry or Lifetime XP update.
- COMPLETED awards eligible Question XP + Completion Bonus; GAME_OVER awards eligible Question XP but no Completion Bonus; ABANDONED awards nothing.
- Each terminal Session has at most one PRACTICE reward transaction (if positive amount); zero-amount sessions are finalized durably without positive ledger entry.
- Concurrent requests may occur but must never cause duplicate or lost committed XP. Atomic reward ledger/profile update and database uniqueness are mandatory; this does not authorize a broad refactor of answer handling.
- Older Question snapshots missing difficulty cannot be repriced from current Question state. No retroactive XP backfill.
- Accepted base Question XP (EASY/MEDIUM/HARD): correct first no Hint 8/10/12; correct retry no Hint 6/8/10; correct with Hint 4/5/6 regardless of retry; all wrong, unanswered and Try Hard timeout = 0 XP. Hint takes precedence over retry. No timeout interaction/effort reward.
- Level scaling is fixed at Session start: 10% reduction per 5 Level group, minimum multiplier 20%; HALF_UP per positive Question award and Completion Bonus separately; 0 remains 0.
- Completion Bonus base = min(10, 2*ceil(totalQuestions/5)) where totalQuestions is the selected number at start. COMPLETED receives it even when every Question was wrong/timeout. GAME_OVER receives none and is not streak-qualified; only COMPLETED is streak-qualified.
- Every new eligible replay ActivitySession receives normal XP; no replay penalty, per-Activity cap or daily cap. Random Question selection does not promise nonrepetition.
- No XP backfill for historical sessions missing official XP Level/policy or immutable Question difficulty snapshots. Phase-1 UI exposes committed XP on Activity Result only, never as an in-progress earned award.
- Rules are accepted; the XP Engine is still NOT active. See `.agent/domain/ACTIVITY_XP_V2_2_SPEC.md` and `.agent/plans/ACTIVITY_XP_ENGINE_IMPLEMENTATION.md`.

## Student Streak and milestone rewards (ADR 0030)
- One `COMPLETED` ActivitySession on a `Asia/Ho_Chi_Minh` calendar day qualifies that day once; repeat completions still receive normal Activity XP but cannot increase Streak or milestone awards. GAME_OVER, ABANDONED and formal Assignments never qualify.
- Consecutive days extend Streak; a missed day ends the run, and the next completion starts a new run at 1. Yesterday's run remains display-active until today ends. `longestStreak` never decreases.
- At days 3/7/14/30 award fixed 10/20/40/80 STREAK_BONUS XP once per run/milestone. New runs can earn the same milestones again; no further bonus beyond day 30 and no Streak Freeze in v1.
- Streak rewards update Lifetime XP and derived Level under the same protected transaction and keep separate idempotent ledger entries. No Level-up XP and no Activity multiplier on Streak reward. Frontend must not award XP.
