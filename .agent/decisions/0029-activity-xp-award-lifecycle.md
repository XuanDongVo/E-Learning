# ADR 0029 — Activity XP award lifecycle, snapshot and ledger
**Status:** Accepted by project owner (2026-11-06)  
**Scope:** ActivitySession gamification, not AssessmentAttempt scoring.

## Accepted decisions
- A: Each Question's difficulty is snapshotted at ActivitySession start and is authoritative for XP.
- B: One aggregate PRACTICE XP transaction per eligible Session, with durable per-question XP breakdown.
- C: GAME_OVER awards eligible question XP but no completion bonus.
- D: ABANDONED awards no XP. IN_PROGRESS may show provisional XP, which never changes Lifetime XP.
- Concurrent requests are allowed; committed XP must never be lost or added twice. Do not broadly refactor existing answer concurrency in this foundation step.

## Required implementation invariants
- Freeze official Level, multiplier and policy version at Session start. Do not use mutable current Question difficulty when awarding XP.
- GAME_OVER may transition in the answer request without a finish request. Reward finalizer must be invoked on all eligible terminal transitions (COMPLETED and GAME_OVER).
- Each Session is awarded once: unique PRACTICE Session ledger index, stable idempotency key, retry-safe finalized state and safe zero-XP finalization.
- Persist outcome/breakdown per question; keep committed XP history immutable across later Question/policy changes.
- Apply transaction and profile-level protection to the reward-critical write: ledger + Lifetime XP + derived Level commit together. Uniqueness alone is insufficient to prevent lost updates.
- No XP for formal Assignments or AssessmentAttempts; no automatic backfill for legacy session snapshots.
- Streak only for COMPLETED; GAME_OVER and ABANDONED do not qualify.

## Relation to previous ADRs
- Narrows ADR 0021's general phrasing on completed-session XP: GAME_OVER is also a terminal reward-eligible ActivitySession state.
- Preserves ADR 0012: abandoned sessions are not resumable and do not award XP.
- No modifications to the gameplay answer service's existing semantics are authorized by this foundation milestone.

## Business-policy addendum — accepted 2026-11-06

The owner also locked all previously deferred reward policy choices:
- Base correct XP: EASY/MEDIUM/HARD = 8/10/12 on first attempt without Hint; 6/8/10 on retry without Hint; 4/5/6 whenever a correct answer follows Hint use (Hint **takes precedence** over retry). Incorrect, unanswered and TRY_HARD TIMEOUT all earn 0 XP; timeout never costs a life. Legacy v2.1 “timeout after interaction = 2 XP” is superseded.
- Level scaling uses the v2.1 rule: multiplier `max(0.20, 1 - 0.10*floor((L-1)/5))` from **Session-start Level**; per-question HALF_UP with positive minimum 1; completion bonus is rounded/scaled separately.
- `COMPLETED` earns completion bonus **even if all questions were answered incorrectly**; bonus `min(10, 2*ceil(N/5))` with `N = ActivitySession.totalQuestions` selected at start.
- Replay receives normal XP for each eligible new Session; **no replay penalty, decay, daily cap or replay-specific restriction**. Random selection may repeat prior questions.
- Historical Sessions missing required XP snapshots are never automatically backfilled/rewarded.
- First UI release shows committed XP **on Activity Result only**, not during question answering.
- `GAME_OVER` keeps earned Question XP but does not qualify for streak. Only `COMPLETED` qualifies for streak.

These are **accepted business rules**, not evidence of deployed code. The V50/V51 foundations and XP service interfaces remain non-awarding. The canonical matrix and exact invariants are in `.agent/domain/ACTIVITY_XP_V2_2_SPEC.md`; execution plan is `.agent/plans/ACTIVITY_XP_ENGINE_IMPLEMENTATION.md`.

## Technical activation gates (not open business decisions)

Implement race-safe profile creation and start snapshot, serialize Hint with answer/timeout mutations, produce an authoritative resolved-question XP outcome, finalize in one database transaction across Session + profile + ledger, handle zero-XP finalization, and prove idempotency/concurrent Session correctness. Run full Flyway, backend, FE and E2E tests before activation.
