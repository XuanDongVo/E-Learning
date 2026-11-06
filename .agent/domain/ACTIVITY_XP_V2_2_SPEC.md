# Activity XP Rules v2.2 — lifecycle accepted; balance pending
**Date:** 2026-11-06  
**Status:** ADR 0029 ACCEPTED for persistence/lifecycle. XP calculator rules NOT FULLY APPROVED and NOT ACTIVE.

## Reward terms and lifecycle
- **Provisional XP**: server-calculated display while IN_PROGRESS. Never counted in account, leaderboard or Level.
- **Awardable XP**: eligible settled question total and completion bonus (only COMPLETED).
- **Committed XP**: amount atomically entered into the PRACTICE XP ledger and StudentGamificationProfile.

| State | Question XP | Completion Bonus | Ledger |
|---|---|---|---|
| IN_PROGRESS | provisional only | 0 | none |
| COMPLETED | awardable | yes | one PRACTICE transaction if total > 0 |
| GAME_OVER | awardable | no | one PRACTICE transaction if total > 0 |
| ABANDONED | forfeited | no | none |

Zero-XP terminal Sessions require a durable finalized marker; no positive ledger entry. GAME_OVER may occur directly in answer() without finish(). XP finalization must use terminal state transition, not a finish-only hook.

## Authority, snapshots and history
- Each Question's own Difficulty (EASY / MEDIUM / HARD) is fixed in immutable QuestionSnapshot at Session start, not the Activity-level difficulty configuration or live Question later.
- Fix official Level, policy version, and multiplier at Session start; they do not change within a Session.
- Store the resolved XP outcome, base XP, final XP and time for each SessionQuestion. Do not reconstruct a timeout state from finalCorrect alone.
- Session aggregates question total, completion bonus, total XP and finalized timestamp. One transaction per Session contains actual committed amount, level and policy audit metadata. Ledger earned_at means finalized/committed time.
- Old snapshot schema v1 is readable for gameplay; XP engine MUST NOT price legacy Questions missing Difficulty from mutable live data. No retroactive XP award.
- The client never submits authoritative XP. Assignment and AssessmentAttempt cannot earn XP through this engine.
- Retry and simultaneous requests can occur, but Session reward + ledger + Lifetime XP + derived Level must be atomic/idempotent. Protect the profile row from lost updates and enforce a unique PRACTICE Session index, in addition to stable key ACTIVITY_SESSION_REWARD:<sessionId>.
- Existing answer handling is outside the foundation refactor; reward correctness remains a mandatory test gate.

## Original v2.1 base reward table — DRAFT balance, not implemented
| Outcome | EASY | MEDIUM | HARD |
|---|---:|---:|---:|
| First try correct without hint | 8 | 10 | 12 |
| Retry correct without hint | 6 | 8 | 10 |
| Hint then correct | 4 | 5 | 6 |
| Timeout after interaction | 2 | 2 | 2 |
| Wrong twice | 0 | 0 | 0 |
| No interaction | 0 | 0 | 0 |

Unsettled: Try Hard wrong once, wrong then timeout, hint then wrong, timeout with no interaction, meaning of effort XP. Outcome enum is scaffolding, **not approved mapping**. Autonomous Try Hard timeout expiry is not wired into XP. Do not guess missing outcomes.

## Original v2.1 Level scaling — DRAFT, not enabled
`group = floor((level - 1)/5)`  
`multiplier = max(0.20, 1.00 - 0.10 * group)`  
`finalQuestionXp = roundHalfUp(baseXp * multiplier)` (0 for base 0; minimum 1 for positive base). Round each Question independently.
`baseCompletionBonus = min(10, 2 * ceil(N/5))`, N = served questions, only COMPLETED; apply same multiplier/rounding/minimum rule.
`sessionXp = sum(finalQuestionXp) + finalCompletionBonus`.

Level thresholds are independent of scaling:
`xpToNext(L) = 100 + 20*(L-1)`  
`lifetimeXpToReach(L) = 100*(L-1) + 10*(L-1)*(L-2)`

| Level | Cumulative XP (corrected) |
|---:|---:|
| 1 | 0 |
| 2 | 100 |
| 3 | 220 |
| 4 | 360 |
| 5 | 520 |
| 10 | 1620 |
| 20 | 5320 |
| 30 | 11020 |
| 50 | 28420 |

The old v2.1 examples at 20/30/50 were arithmetically incorrect. Replay is permitted, but any full-reward unlimited replay, decay, daily cap or anti-farming policy remains **undecided**. Don't activate the XP calculator until these concerns are decided.

## Migration / deployment notes
- V50 adds **nullable** XP snapshot/breakdown/audit fields; no current ActivitySession service writes them and no XP award is triggered.
- Existing snapshot schema changes from 1 to 2 for NEW sessions to include Difficulty. Historical schema 1 continues to deserialize with null difficulty for gameplay; it is ineligible for a v2.2 reward.
- New XP fields must be populated by a future integration milestone; do not assume their nullability means a session has received XP.
- Partial unique index ensures one PRACTICE ledger transaction per session. Before migration run:
```sql
SELECT activity_session_id, COUNT(*)
FROM xp_transactions
WHERE source_type='PRACTICE' AND activity_session_id IS NOT NULL
GROUP BY activity_session_id HAVING COUNT(*) > 1;
```
Nonempty result requires reconciliation before applying V50.

## Planned engine skeleton (no runtime integration)
1. Calculate question XP from immutable difficulty + explicit outcome + policy snapshot.
2. Calculate Completion Bonus only for COMPLETED.
3. Preview provisional XP for IN_PROGRESS without account mutation.
4. Finalize on COMPLETED/GAME_OVER; ABANDONED forfeits.
5. Deduplicate by Session, record audit details, commit ledger/profile/level atomically.
6. Query final reward from persisted state for retries.

## Required activation tests
Snapshot update while active; old snapshot compatibility; answer double submit; concurrent finalize same Session; concurrent Sessions same profile; zero XP terminal; GAME_OVER via answer; abandoned via finish/new start; no answer timeout; replay policy; rounding and thresholds; historical policy version; negative XP prevention; leaderboard period earned_at; never award Assignment.
