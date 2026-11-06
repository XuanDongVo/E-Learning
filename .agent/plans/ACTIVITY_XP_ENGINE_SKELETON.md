# Activity XP Engine — skeleton contracts and activation plan
**Branch:** feature/student-gamification  
**Status:** Interface, DTO, repository scaffolding only; NOT ACTIVE.  
**Authority:** ADR 0029 + domain/ACTIVITY_XP_V2_2_SPEC.md.

## Method responsibility matrix

| Contract method | When called (future) | Writes | Invariant |
|---|---|---|---|
| captureStartSnapshot(studentId) | start() after eligibility, before saving session | Session XP snapshot (via future orchestration) | Official level/version/multiplier frozen at start |
| onQuestionResolved(sessionQuestionId) | answer()/server timeout when resolved | per-question XP outcome/base/final/resolvedAt | Use frozen difficulty, never live Question |
| evaluateQuestion(...) | resolved-question evaluator | none | Deterministic pure calculation; ambiguous outcomes block activation |
| completionBonus(...) | terminal reward calculation | none | >0 only for COMPLETED |
| preview(sessionId) | answer/hint/get display | none | Provisional only; never ledger/account |
| finalizeTerminalSession(sessionId) | COMPLETED or GAME_OVER transition | Session summary + PRACTICE ledger + Student profile | Atomic, idempotent, no lost update |
| finalizeZeroAward(sessionId) | eligible terminal with 0 XP | Session finalized marker | Retry-safe without ledger |
| forfeitAbandonedSession(sessionId) | ABANDONED transition | optional session finalized metadata only | No ledger, no Lifetime XP |
| findFinalizedReward(sessionId) | result/repeated finalize | none | Persisted immutable receipt |
| lifetimeXpRequiredForLevel(level) | calculator | none | Threshold formula validated |
| levelForLifetimeXp(xp) | reward finalization | none | Monotonic level |

## Proposed future wiring (NOT PART OF THIS COMMIT)
1. In `ActivitySessionService.start()`: get official profile (create safe if absent); capture XP policy Level; store Session XP snapshot; capture per-question difficulty already in QuestionSnapshot v2.
2. On answer/hint/timer: server adjudicates first; only on resolved question persist stable enum outcome + XP breakdown. Use V51 resolution_reason plus Hint/attempts; TIMEOUT is always 0 XP. Hint overrides retry for correct answers.
3. Provisional XP remains server-only/internal for the first release; display committed XP only on Activity Result. No client-authored amounts.
4. On state transition to COMPLETED: sum resolved question XP plus scaled Completion Bonus; GAME_OVER: question XP only. ABANDONED: no award.
5. Lock Session reward transition and profile row in consistent order; create or fetch the stable single PRACTICE ledger transaction idempotently. The DB partial unique index and key are defense-in-depth, not a substitute for profile consistency.
6. Within the SAME transaction: finalize session XP fields, insert one ledger entry for positive award, increment lifetime XP and derive current Level. Persist zero XP finalization without ledger.
7. Read old receipt on retry; never re-evaluate from mutable Question/policy. `finish()` currently rejects terminal sessions; must preserve endpoint semantics or explicitly introduce a retry-safe reward response before activation.
8. Explicitly handle existing v1 Question snapshots as not eligible for backfill/award. Streak remains separate and only COMPLETED qualifies.

## Business rules locked; remaining implementation gates

The outcome table, Hint precedence, Level scaling, Completion Bonus N, all-wrong COMPLETED reward, replay at full normal policy, legacy non-backfill, Result-only FE, and GAME_OVER non-streak policy were all accepted on 2026-11-06. See the canonical spec; do **not** treat these choices as outstanding or invent a replay anti-farming policy.

- Align XP QuestionOutcome mapping with authoritative V51 `resolution_reason` and the two-submission/hint flags. TIMEOUT is 0 XP regardless of draft activity; it never consumes life.
- Reuse the repaired Try Hard timeout endpoint (V51) without implementing a new background scheduler for this XP scope.
- Coordinate `hint()` and all answer/timeout mutations under the Session lock so Hint precedence is deterministic; guard future question timing and results.
- Implement and test profile creation/snapshot locking against concurrent Session start + finalize and UNIQUE(student_id).
- Enforce legacy ineligibility: a pre-activation session without required snapshots must not be awarded, even if its status is terminal. Do not synthesize Level or Difficulty snapshots from mutable state.
- Ensure ledger + profile + Session reward finalization are committed together; zero-XP receipt is durable and retry-safe.
- Add result-only XP receipt API and FE display; no provisional XP display in initial release.
- Run migrations V50/V51 and new changes only on an approved deployed environment; verify via Flyway, Maven, FE build and end-to-end tests.

## Migration deployment checklist
- Verify the actual applied Flyway history: repository foundation is V49, XP groundwork is V50 and timeout resolution is V51. Do not assume that committed SQL has already run in any database.
- Run duplicate PRACTICE session preflight query from domain spec; reconcile any duplicates before applying V50.
- Apply V50 with configured PostgreSQL via Flyway; verify schema and index.
- Compile Java 21 / Spring Boot code with Maven; test old/new snapshot deserialize.
- Test concurrent answer/finalize/profile inserts, zero-XP terminal, retries, ABANDONED and GAME_OVER.
- No controller/ActivitySessionService/FE endpoint modifications in this skeleton. No claim of passing integration tests without running them.
