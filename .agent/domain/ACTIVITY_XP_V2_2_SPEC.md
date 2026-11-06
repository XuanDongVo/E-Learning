# Activity XP Rules v2.2 — accepted policy, implementation pending

**Decision date:** 2026-11-06  
**Status:** Business rules ACCEPTED (ADR 0029). XP Engine is NOT IMPLEMENTED / NOT ACTIVE.  
**Scope:** ActivitySession (LEARNING/Practice and TRY_HARD) only; never Assignment or AssessmentAttempt.  
**Implementation roadmap:** `.agent/plans/ACTIVITY_XP_ENGINE_IMPLEMENTATION.md`.

## 1. Source of truth and reward vocabulary

- The backend alone adjudicates answers, determines XP and commits rewards; FE cannot submit an XP amount.
- **Provisional XP**: XP calculated from resolved questions while `IN_PROGRESS`; informational only. In phase 1 of the UI integration it is **not shown during the Activity**, only settled XP is shown on Activity Result.
- **Awardable XP**: sum of settled per-question XP and eligible completion bonus in a terminal Session.
- **Committed XP**: an idempotent, atomic ledger award applied to Lifetime XP and Level.
- **Snapshot**: at Session start, persist the official Level, multiplier and XP policy version. Each selected Question's own Difficulty is frozen in immutable QuestionSnapshot v2; never use Activity difficulty or today's Question value for scoring.
- No retroactive XP for sessions created before activation or missing any required XP snapshot; no attempt to reconstruct missing difficulty or historical gameplay outcome from mutable records.

## 2. Canonical per-question XP matrix (base XP before Level scaling)

| Final question result | EASY | MEDIUM | HARD |
|---|---:|---:|---:|
| Correct first submission, no Hint | 8 | 10 | 12 |
| Correct on retry, no Hint | 6 | 8 | 10 |
| Correct with Hint (first submission or retry) | 4 | 5 | 6 |
| Wrong after exhausting permitted attempts | 0 | 0 | 0 |
| TRY_HARD wrong submission | 0 | 0 | 0 |
| TRY_HARD timeout, with or without an unsubmitted draft | 0 | 0 | 0 |
| No submitted answer / unresolved | 0 | 0 | 0 |

**Precedence:** A final wrong or TIMEOUT outcome is always 0. If correct and a Hint was used at any point, choose **CORRECT_WITH_HINT** (including when retrying); otherwise correct first submission uses **CORRECT_FIRST_TRY** and correct retry uses **CORRECT_RETRY**. Never stack Hint + Retry awards. A previously wrong first answer in LEARNING is *not resolved* and receives no per-question award until the question reaches its final outcome. LEARNING has at most two answer submissions per Question; TRY_HARD has one submission and no Hint.

**Timeout authority:** The server's `resolution_reason=TIMEOUT` is final for Try Hard; TIMEOUT yields 0 XP and consumes no life. The existing per-question deadline and 5-second network grace remain gameplay rules (ADR 0015 / V51), not XP multipliers. A client draft, click or timeout request before backend adjudication never earns effort XP. The legacy v2.1 “Timeout after interaction = 2 XP” is **superseded** by this decision.

**Canonical mapping** for a resolved SessionQuestion:
1. `resolution_reason=TIMEOUT` -> TIMEOUT (0).
2. `resolution_reason=WRONG` -> TRY_HARD_WRONG or WRONG_EXHAUSTED (0).
3. `resolution_reason=CORRECT` + `hint_used=true` -> CORRECT_WITH_HINT.
4. `resolution_reason=CORRECT` + `answer_attempts=1` -> CORRECT_FIRST_TRY.
5. `resolution_reason=CORRECT` + `answer_attempts=2` (LEARNING only) -> CORRECT_RETRY.
6. Missing/inconsistent final outcome -> reject finalization rather than silently invent XP. Legacy null `resolution_reason` is not proof of a rewardable new Session.

The implementation may simplify the stored XP timeout enum values but must not change this table.

## 3. Level scaling (locked v2.1 formula)

For the Level `L` **at Session start**:

```text
group      = floor((L - 1) / 5)
multiplier = max(0.20, 1.00 - 0.10 * group)
scaled(x)  = 0 if x == 0; otherwise max(1, HALF_UP(x * multiplier))
```

Apply `scaled(baseQuestionXp)` **per question**, then sum. Apply the same scaling to the completion bonus independently. Use decimal arithmetic (BigDecimal) to avoid float rounding drift. The multiplier never changes within a Session, including when it crosses a Level threshold upon finalization.

| Start Level | Multiplier |
|---|---:|
| 1–5 | 1.00 |
| 6–10 | 0.90 |
| 11–15 | 0.80 |
| 16–20 | 0.70 |
| 21–25 | 0.60 |
| 26–30 | 0.50 |
| 31–35 | 0.40 |
| 36–40 | 0.30 |
| 41+ | 0.20 |

## 4. Completion bonus and lifecycle (locked)

```text
N                    = ActivitySession.totalQuestions captured at start
baseCompletionBonus  = min(10, 2 * ceil(N / 5))
completionBonus      = scaled(baseCompletionBonus) only if status == COMPLETED
totalAward           = sum(scaled(questionBaseXp)) + completionBonus
```

- All-wrong or all-timeout **COMPLETED** Sessions **still earn the Completion Bonus**, even with zero Question XP.
- `N` is the **selected question count at Session start**, not answered/served/resolved count. Do not recompute it from live Activity.
- `IN_PROGRESS`: question XP may be provisional; no ledger, no Lifetime XP or Level mutation, no committed completion bonus.
- `COMPLETED`: resolved Question XP + completion bonus; finalized atomically.
- `GAME_OVER`: resolved Question XP only; no completion bonus. GAME_OVER may occur in `answer()`; do not depend on `finish()`.
- `ABANDONED`: forfeits all provisional XP; no ledger or Lifetime XP reward. Closing a tab by itself does not automatically finalize a session under the current no-resume rules.
- Only `COMPLETED` is streak-qualified. `GAME_OVER` may earn XP but never qualifies for streak.
- A terminal Session with total award 0 has a durable finalization marker, **no positive PRACTICE ledger transaction**, and is safe to retry.

## 5. Replay (locked)

Activity question selection can be randomized; this does not guarantee a disjoint Question set. **Every new eligible ActivitySession receives regular XP under its frozen Level/policy**, even when repeating an Activity or encountering a Question from a previous run. No replay counter, anti-farming cap, daily limit or replay penalty. Differences arising solely from the student's Level snapshot and Question outcome are expected, not replay penalties.

## 6. XP ledger, profile and Level

- Exactly **one positive PRACTICE `XpTransaction` per awarded ActivitySession** (unique `activity_session_id` partial index in V50 plus stable `idempotency_key = ACTIVITY_SESSION_REWARD:<sessionId>`).
- The Session stores immutable Question breakdown (`xp_outcome`, `xp_base`, `xp_final`, `xp_resolved_at`), aggregate (`xp_question_total`, `xp_completion_bonus`, `xp_total`) and `xp_finalized_at`. The transaction stores policy/Level/multiplier audit data; `earned_at` reflects terminal award, not Session start.
- All money-like XP numbers are nonnegative integral values; scaled positive values have a minimum of 1. The transaction amount equals persisted Session XP total and total question breakdown plus completion bonus. For ABANDONED, the eligible committed amount is zero regardless of provisional breakdown.
- In the **same database transaction**, serialize the reward-critical Session transition and student's profile update; insert ledger, update Lifetime XP, derive Current Level and persist finalization. Distinct concurrent Sessions for one student must not overwrite each other's Lifetime XP. The unique key/index alone is **not** protection against lost profile increments.
- If a profile is absent, create safely against the existing unique student constraint before reward/Level snapshot; address first-create races. Never update a student's profile based on a client-provided XP/Level.
- A retry returns the persisted finalized result, never recalculates from mutable Questions. Applying a ledger award and updating profile must succeed/fail as a unit.

## 7. Level thresholds

```text
XP required from Level L to L+1: 100 + 20*(L-1)
Total Lifetime XP required for Level L: 100*(L-1) + 10*(L-1)*(L-2)
```

| Level | Lifetime XP to reach |
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

`Current Level` is derived from the **new total Lifetime XP**, potentially skipping several levels in one award. It never decreases under Activity XP awards.

## 8. Result UI (locked initial release)

The first XP UI surfaces the **committed** XP only on Activity Result, with Session Question XP, Completion Bonus (0 for GAME_OVER), Session XP earned, and Level before/after as supported by server receipt. No live/in-progress XP counter required in this release. UI cannot award XP, commit rewards, or infer uncommitted provisional XP as earned. Existing scoring and Assignment result UI remain separate.

## 9. Persistence status, versioning and deployment

- V49: initial profile and XP ledger; V50: nullable XP snapshot/audit/breakdown columns and PRACTICE Session unique index; V51: `resolution_reason` for gameplay TIMEOUT. They are committed source migrations, **not proof of execution on a given database**.
- QuestionSnapshot v2 includes Difficulty; old schema v1 can remain readable for gameplay but cannot earn retroactive v2.2 XP.
- An immutable policy identifier (proposed literal `ACTIVITY_XP_V2_2`) is stamped for each eligible newly started session. Future policy changes require a new policy version.
- Existing skeleton interfaces are intentionally not injected into the runtime. **No Activity XP reward is active until phases and acceptance tests pass.**
- Deployment requires duplicate-ledger preflight, database Flyway verification, Maven/FE validation, concurrency tests and end-to-end gameplay/result tests.

## 10. Acceptance examples

- Ten HARD questions all first-try correct at Level 1: `10*12 + 4 = 124` XP.
- Ten questions all WRONG/TIMEOUT but Session COMPLETED at Level 1: `0 + 4 = 4` XP.
- Same ten-question Session GAME_OVER: only resolved correct Question XP, no completion bonus.
- Level 6 EASY first-try correct: `HALF_UP(8 * 0.90) = 7` XP.
- Level 41+ HARD first-try correct: `HALF_UP(12 * 0.20) = 2` XP.
- Repeat the same Activity: no replay penalty; do not use the session's previous reward amount as a multiplier.
- A user double-submitting, timeout racing with answer, duplicate terminal requests, or two Sessions concurrently finalizing may not create duplicate/lost XP.
