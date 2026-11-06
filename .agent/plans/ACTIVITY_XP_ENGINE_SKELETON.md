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
2. On answer/hint/timer: server adjudicates first; only on resolved question persist stable enum outcome + XP breakdown. Don't infer missing timeout interaction semantics from answerAttempts alone.
3. Return Provisional XP in a backwards-compatible response DTO; no client-authored amounts.
4. On state transition to COMPLETED: sum resolved question XP plus scaled Completion Bonus; GAME_OVER: question XP only. ABANDONED: no award.
5. Lock Session reward transition and profile row in consistent order; create or fetch the stable single PRACTICE ledger transaction idempotently. The DB partial unique index and key are defense-in-depth, not a substitute for profile consistency.
6. Within the SAME transaction: finalize session XP fields, insert one ledger entry for positive award, increment lifetime XP and derive current Level. Persist zero XP finalization without ledger.
7. Read old receipt on retry; never re-evaluate from mutable Question/policy. `finish()` currently rejects terminal sessions; must preserve endpoint semantics or explicitly introduce a retry-safe reward response before activation.
8. Explicitly handle existing v1 Question snapshots as not eligible for backfill/award. Streak remains separate and only COMPLETED qualifies.

## Hard blockers before implementing active calculation
- Agree all timeout/wrong/hint outcome base XP cases, Try Hard single wrong outcome, unanswered semantics.
- Agree replay anti-farming eligibility and scaling economics, including combined effect with Level thresholds.
- Decide how to resolve Try Hard timeout with no incoming request (current runtime checks deadline on answer).
- Decide when/how old active sessions without required snapshot should be terminated safely; do not award them using live Question.
- Ensure first-time StudentGamificationProfile creation is race safe under UNIQUE(student_id).

## Migration deployment checklist
- Verify V49 installed; V50 is the next version from repository tree.
- Run duplicate PRACTICE session preflight query from domain spec; reconcile any duplicates before applying V50.
- Apply V50 with configured PostgreSQL via Flyway; verify schema and index.
- Compile Java 21 / Spring Boot code with Maven; test old/new snapshot deserialize.
- Test concurrent answer/finalize/profile inserts, zero-XP terminal, retries, ABANDONED and GAME_OVER.
- No controller/ActivitySessionService/FE endpoint modifications in this skeleton. No claim of passing integration tests without running them.
