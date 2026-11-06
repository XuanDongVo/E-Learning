# Activity XP Engine — skeleton contracts and activation plan
**Branch:** feature/student-gamification  
**Status:** Superseded as a skeleton: Phases 1–4 are implemented behind the default-off rollout flag; Phase 5 verification remains.
**Authority:** ADR 0029 + domain/ACTIVITY_XP_V2_2_SPEC.md.

## Method responsibility matrix

| Contract method | When called (future) | Writes | Invariant |
|---|---|---|---|
| mapResolvedOutcome(...) | resolved-question evaluator | none | Reject missing/inconsistent adjudication; Hint precedes retry |
| levelMultiplier(level) / xpToNext(level) | snapshot/Level policy | none | BigDecimal group floor and overflow-safe thresholds |
| captureStartSnapshot(studentId, questions) | eligible start behind rollout flag | profile create-if-missing + Session snapshot via orchestration | Freeze official Level/version/multiplier only with schema-v2 Difficulty |
| auditResolvedQuestion(item, snapshot) | answer/server timeout after final resolution | per-question XP outcome/base/final/resolvedAt | Use frozen Difficulty/multiplier once; legacy sessions stay ineligible |
| evaluateQuestion(...) | resolved-question evaluator | none | Deterministic pure calculation; ambiguous outcomes block activation |
| completionBonus(...) | terminal reward calculation | none | >0 only for COMPLETED |
| preview(sessionId) | answer/hint/get display | none | Provisional only; never ledger/account |
| finalizeTerminalSession(sessionId) | COMPLETED or GAME_OVER transition | Session summary + PRACTICE ledger + Student profile | Atomic, idempotent, no lost update |
| finalizeZeroAward(sessionId) | eligible terminal with 0 XP | Session finalized marker | Retry-safe without ledger |
| forfeitAbandonedSession(sessionId) | ABANDONED transition | optional session finalized metadata only | No ledger, no Lifetime XP |
| findFinalizedReward(sessionId) | result/repeated finalize | none | Persisted immutable receipt |
| lifetimeXpRequiredForLevel(level) | calculator | none | Threshold formula validated |
| levelForLifetimeXp(xp) | reward finalization | none | Monotonic level |

## Implemented runtime wiring
1. Implemented in `ActivitySessionService.start()`: create/load and lock the official profile; capture XP policy Level; store Session XP snapshot; require per-question Difficulty in QuestionSnapshot v2 when rollout is enabled.
2. Implemented on answer/server timeout: adjudicate first and persist stable enum outcome + XP breakdown only when resolved. V51 resolution_reason plus Hint/attempts is authoritative; TIMEOUT is always 0 XP and Hint overrides retry for correct answers.
3. Provisional XP remains server-only/internal for the first release; display committed XP only on Activity Result. No client-authored amounts.
4. Terminal transitions now settle COMPLETED with bonus, GAME_OVER without bonus,
   and ABANDONED as a durable forfeited receipt.
5. Reward settlement locks Session then profile and uses the PRACTICE partial
   unique index plus idempotency key as defense-in-depth.
6. Session receipt, positive ledger entry, Lifetime XP and derived Level commit
   in one transaction; zero awards persist without a positive ledger row.
7. Result reads the immutable stored receipt; it never recalculates or awards.
8. Explicitly handle existing v1 Question snapshots as not eligible for backfill/award. Streak remains separate and only COMPLETED qualifies.

## Business rules locked; remaining implementation gates

The outcome table, Hint precedence, Level scaling, Completion Bonus N, all-wrong COMPLETED reward, replay at full normal policy, legacy non-backfill, Result-only FE, and GAME_OVER non-streak policy were all accepted on 2026-11-06. See the canonical spec; do **not** treat these choices as outstanding or invent a replay anti-farming policy.

- Align XP QuestionOutcome mapping with authoritative V51 `resolution_reason` and the two-submission/hint flags. TIMEOUT is 0 XP regardless of draft activity; it never consumes life.
- Reuse the repaired Try Hard timeout endpoint (V51) without implementing a new background scheduler for this XP scope.
- Coordinate `hint()` and all answer/timeout mutations under the Session lock so Hint precedence is deterministic; guard future question timing and results.
- Implement and test profile creation/snapshot locking against concurrent Session start + finalize and UNIQUE(student_id).
- Enforce legacy ineligibility: a pre-activation session without required snapshots must not be awarded, even if its status is terminal. Do not synthesize Level or Difficulty snapshots from mutable state.
- Ensure ledger + profile + Session reward finalization are committed together; zero-XP receipt is durable and retry-safe.
- Result-only XP receipt API and FE display are implemented; no provisional XP display is exposed.
- Run migrations V50/V51 and new changes only on an approved deployed environment; verify via Flyway, Maven, FE build and end-to-end tests.

## Migration deployment checklist
- Verify the actual applied Flyway history: repository foundation is V49, XP groundwork is V50, timeout resolution is V51 and immutable receipt snapshots are V52. Do not assume that committed SQL has already run in any database.
- Run duplicate PRACTICE session preflight query from domain spec; reconcile any duplicates before applying V50.
- Apply V50 with configured PostgreSQL via Flyway; verify schema and index.
- Compile Java 21 / Spring Boot code with Maven; test old/new snapshot deserialize.
- Test concurrent answer/finalize/profile inserts, zero-XP terminal, retries, ABANDONED and GAME_OVER.
- Phase 3/4 validation was skipped by explicit request; do not claim release readiness until the mandatory matrix is run.
