# Activity XP Engine — implementation plan

**Branch:** `feature/student-gamification`  
**Date:** 2026-11-06  
**Status:** PHASES 1–4 IMPLEMENTED behind a default-off rollout flag; Phase 5 release verification pending.
**Authority:** ADR 0029, `.agent/domain/ACTIVITY_XP_V2_2_SPEC.md`; maintain gameplay decisions ADR 0012/0015/0022 and timeout changes in `.agent/plans/TRY_HARD_TIMEOUT_BACKEND_FE_IMPLEMENTATION.md`.

## Scope and non-goals

Deliver server-authoritative XP for ActivitySession only, with per-question audit, Level scaling, atomic final reward, and a result-only UI. Keep replay penalty-free and preserve gameplay scoring/lives/timer. Do not add XP for Assignment/AssessmentAttempt; do not deploy XP shop, reward inventory, live XP animations, daily cap, replay rate limiter or an autonomous background timeout scheduler.

## Current baseline (verify before coding)

- V49 profiles + ledger; V50 nullable Level/XP snapshot, per-question breakdown and PRACTICE Session partial unique index; V51 `resolution_reason` for CORRECT/WRONG/TIMEOUT. Migration scripts in source do not prove deployment.
- QuestionSnapshot schema v2 includes Difficulty. Legacy schema v1 may still be readable but is **never retroactively awarded**.
- `ActivityXpCalculator`, session audit and terminal reward workflow are wired.
  Eligible terminal transitions persist the receipt, ledger and profile update
  atomically; rollout-disabled/legacy sessions remain untouched.
- `ActivitySessionService.answer()/get()/timeout()/hint()/finish()` use a Session
  write lock where they mutate runtime state. `start()` serializes per Student and
  locks active Sessions before profile snapshot capture.
- FE Activity Result reads and renders the authoritative committed XP receipt.

## Phase 0 — policy sync and enablement guard (documentation here; code later)

1. Reference canonical v2.2 accepted matrix and ADR; define immutable `ACTIVITY_XP_V2_2` policy version.
2. Introduce a rollout/feature-enable boundary: until explicitly enabled for new Sessions, do not write XP or claim XP on Activity Result. A deployment enabling the policy must not reprice pre-activation Sessions.
3. Review whether V50 and V51 have been applied to target DB, inspect duplicate PRACTICE transactions, and establish rollback method. Make no old migration edits; future database adjustments receive new Flyway versions.
4. Keep individual XP calculations integer and deterministic with `BigDecimal` and HALF_UP.

**Gate:** documentation signed off; current Flyway history verified on deployment DB; no reward side effects while disabled.

## Phase 1 — pure calculator + characterization tests (implemented 2026-11-06)

**Files:** `gamification/service/ActivityXpCalculator` and implementation; `XpQuestionOutcome` mapping; JUnit unit tests.

1. Map server-authoritative Question outcome from `resolution_reason`, `answerAttempts`, `hintUsed`, `finalCorrect`. Retry has two submissions max; Hint precedes retry when correct. TIMEOUT (whether or not a draft existed), wrong and no response yield 0.
2. Base XP EASY/MEDIUM/HARD: first correct 8/10/12, retry 6/8/10, correct with Hint 4/5/6.
3. Scale per Question by Session-start Level: floor((L-1)/5), decrement 0.1/group to minimum 0.2; HALF_UP each positive award, minimum 1; 0 remains 0.
4. Compute `baseCompletionBonus=min(10,2*ceil(totalQuestions/5))` from **start-selected totalQuestions**, regardless of accuracy; scale/round bonus separately for COMPLETED only.
5. Derive `currentLevel` using threshold `100*(L-1)+10*(L-1)*(L-2)` and new Lifetime XP, including multiple-level jumps; protect arithmetic overflow and invalid input.

**Gate / tests:** implemented database-free coverage for the full outcome ×
difficulty matrix; Hint+retry; timeout; all-wrong completed; N boundaries
(5/6/10/11/20/21); positive minimum and HALF_UP; Levels 5/6, 10/11, 40/41;
threshold examples L20=5320, L30=11020, L50=28420; overflow and mixed
round-per-question regression. Focused calculator suite passes. No runtime reward
or persistence was activated.

## Phase 2 — snapshot capture and per-question audit (implemented 2026-11-06)

**Files:** `ActivitySessionService.start()/answer()/timeout()/hint()`, `ActivityQuestionSnapshotAssembler`, Session and SessionQuestion XP fields, reward workflow implementation.

1. Ensure a `StudentGamificationProfile` exists using a race-safe create-or-load path under UNIQUE(student_id); snapshot official Level, multiplier and policy version exactly once **at start**. Align transaction/lock ordering for concurrent start and other Session reward finalization.
2. Bind the chosen policy to *new eligible Sessions only*. Validate all chosen Questions have non-null frozen Difficulty; null/legacy XP snapshots cannot be silently repaired using live Question fields.
3. Keep the V51 authoritative outcome. When a Question becomes `resolved`, compute one XP evaluation, then persist outcome, base amount, scaled amount and resolved timestamp; do not treat first incorrect LEARNING submission as resolved.
4. Serialize Hint and Answer on the same Session lock. For races, define the order as the database's acquired mutation order; a Hint accepted after question resolution must be rejected and must not retroactively lower XP.
5. Keep timeout+answer under the same Session lock; TIMEOUT -> 0 XP, no lives deduction. Protect from request replay/duplicate resolve.

**Gate / tests:** focused tests cover frozen Difficulty and multiplier, default-off
rollout, conflict-safe profile create/load, lock routing for start/Hint/Answer/
Timeout, unresolved retry, duplicate audit, Try Hard wrong/timeout, zero-XP and
legacy ineligibility. The Phase 1–2 focused suite passes 30/30. PostgreSQL
contention/load verification remains part of Phase 3/release validation; no full
backend suite was run for this phase.

## Phase 3 — atomic and idempotent reward finalization (implemented 2026-11-06)

**Files:** `ActivityXpRewardWorkflow` implementation, `XpTransactionRepository`, profile repository, `ActivitySessionService` terminal paths.

1. Trigger finalization on the actual transition to `COMPLETED` or `GAME_OVER` in answer/timeout/finish where appropriate. `ABANDONED` finalizes as forfeited with 0 committed XP (no reward transaction).
2. Validate snapshots and resolved-question breakdown before computing sum; for GAME_OVER use only resolved Questions; for COMPLETED all selected Questions should be resolved.
3. Under a transaction, lock reward-critical Session then lock the student's profile in **consistent order** for every path. Mark terminal XP finalization once; return persisted receipt on repeated calls. Avoid deadlocks in concurrent Session start/abandon/finalize flows.
4. Aggregate `xp_question_total`, `xp_completion_bonus`, `xp_total`; insert **one** positive PRACTICE XP transaction with key `ACTIVITY_SESSION_REWARD:<sessionId>` and `activity_session_id`, using V50 uniqueness as defense-in-depth. Zero-XP terminals persist finalized marker/receipt without a positive ledger row.
5. Atomically increment profile Lifetime XP and derive Level from total; rollback ALL writes on any failure. Ledger amount = session total = sum(question XP)+bonus.
6. Set `earned_at` at server-confirmed terminal reward time. Never recalculate a committed award from mutable Question or future XP policy. Do not add streak for GAME_OVER.

**Gate / tests (PostgreSQL required):** implementation is complete, but these
checks were explicitly skipped for this task: same Session concurrent
finalization creates one reward; two Sessions same student cannot lose update;
profile first-create race; retry after rollback; GAME_OVER without finish;
all-wrong COMPLETED bonus; partial ABANDONED; zero-XP GAME_OVER; duplicate key;
concurrent start vs finalization. They remain mandatory before rollout.

## Phase 4 — read-only committed XP Result API and FE (implemented 2026-11-06)

**Files:** Result DTO/service/controller and student Activity Result component/FE types. No in-progress XP display.

1. Expose a persisted `ActivityXpRewardReceipt` plus optional per-question audit in the **Activity Result** response; ensure auth/ownership and avoid exposing answer keys in in-progress data.
2. Display Question XP total, scaled Completion Bonus, Session earned XP, Level before/after (only from server receipt). GAME_OVER shows zero bonus; ABANDONED shows no earned XP.
3. Handle old/no-reward Sessions honestly: no fabricated 0-earned-success notification for a legacy session not processed by XP Engine.
4. Do not touch formal Assignment Result or change Activity correctness/score semantics.

**Gate / tests:** code handles the read-only, retry, legacy and network states,
but test/build/lint and 375/768/1440 visual verification were explicitly skipped
for this task and remain mandatory before rollout.

## Phase 5 — release verification and rollout

1. Run Flyway preflight and migrations in controlled environment; verify V50 unique index and V51 resolution reason.
2. Run backend unit + transaction/concurrency integration tests, Java compile, FE typecheck/lint/build and authenticated E2E.
3. Stage feature-enable only for newly started Sessions. Verify no XP from pre-activation sessions; audit `sum(PRACTICE ledger.amount) == Lifetime XP attributable to PRACTICE` alongside any existing other reward sources; confirm one ledger per eligible rewarded Session.
4. Smoke test replay (no XP decay), Level 41 floor, Try Hard TIMEOUT, GAME_OVER, zero-XP and all-wrong COMPLETED.
5. Observe duplicate-key failures, profile lock contention, abandoned sessions, missing snapshots, ledger/profile mismatch and Result API failure; keep a reversible feature gate. Never delete committed ledger/profile updates as a naive rollback.
6. Activate only after acceptance; update project progress/status separately from approved policy documentation.

**Gate:** no unresolved P0/P1 XP consistency defects; explicit deployment approval, migration success and verified tests.

## Mandatory invariants / acceptance trace

| ID | Invariant | Covered in phase |
|---|---|---|
| XP-01 | Frozen per-Question Difficulty + Level + policy multiplier/version at start | 2 |
| XP-02 | Correct first/retry/Hint mapping, Hint priority, wrong/TIMEOUT 0 | 1–2 |
| XP-03 | Per-Question HALF_UP and scaled completion bonus, totalQuestions from start | 1 |
| XP-04 | COMPLETED always bonus; GAME_OVER question-only; ABANDONED none | 1, 3 |
| XP-05 | Every replay eligible, no penalty/cap | 1, 5 |
| XP-06 | Historical sessions without required snapshot never auto-awarded | 0, 2, 5 |
| XP-07 | One positive ledger per Session, zero-XP durable finalized receipt | 3 |
| XP-08 | Atomic Session + ledger + Lifetime XP + Level | 3 |
| XP-09 | Concurrent requests accepted without double/lost XP; Hint race serialized | 2–3 |
| XP-10 | GAME_OVER never streak-qualified | 3 |
| XP-11 | Initial UI shows committed XP only on Activity Result | 4 |
| XP-12 | No Activity XP in formal Assignment/AssessmentAttempt | 3–5 |

## Operational notes

- Use `PESSIMISTIC_WRITE` where appropriate but test lock ordering, not only repository annotations. Keep `@Transactional` boundaries explicit; internal self-invocation may bypass Spring proxies, so wire transactional boundaries deliberately.
- If an existing Session is terminal before the reward layer is enabled, do not retroactively award. If a newly eligible Session is interrupted by a rollout toggle change, use the frozen policy/eligibility state, not a mutable setting, to decide eligibility.
- If deploy/rollout is not yet approved, **stop after documentation, skeleton review and tests**; do not turn on reward writing.
