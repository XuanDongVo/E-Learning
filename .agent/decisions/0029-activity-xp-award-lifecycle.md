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

## Deferred / explicitly not approved
Full outcome mapping (wrong/timeout/hint), replay XP farming limits, level-scaling economy and automatic timeout resolution require separate approval before wiring runtime XP.
