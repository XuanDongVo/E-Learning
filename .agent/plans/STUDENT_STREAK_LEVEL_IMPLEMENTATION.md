# Student Streak and Level — v1 implementation plan

**Branch:** `feature/student-gamification`
**Policy accepted:** 2026-11-06
**Scope:** Activity completion Streak, milestone XP and Level/profile UI. The public leaderboard remains a presentation-only mock.

## Agreed rules

- One qualifying day requires at least one server-confirmed `ActivitySession.COMPLETED`, in either LEARNING or TRY_HARD mode. `GAME_OVER`, `ABANDONED`, `IN_PROGRESS`, and formal Assignments never qualify.
- More Activity completions on the same calendar day do **not** increase Streak or Streak Bonus; regular Activity XP remains independent and uncapped.
- Day boundary is `Asia/Ho_Chi_Minh`; qualification is based on the server-side completion transition, not Activity start time or a client-provided date.
- Consecutive next day: `currentStreak + 1`. Missed day: start a new run at 1. `longestStreak` never decreases. An unbroken yesterday Streak remains display-active through today; after a full missed day display 0 until the next completion.
- Milestones: 3 days = 10 XP, 7 = 20 XP, 14 = 40 XP, 30 = 80 XP. One fixed award per run/milestone, no Level multiplier or bonus beyond day 30. A new run after a missed day may earn each milestone again. No Streak Freeze in v1.
- The server awards `STREAK_BONUS` automatically in the ledger, within the same transaction as qualification and Lifetime XP/Level updates. No claim endpoint or client-authored XP. No Level-up XP. Reuse the established Activity XP Level thresholds; never recalculate a frozen Activity XP receipt after Streak awards.
- Historical sessions are not backfilled. A new Streak implementation starts accumulating qualifying days on server-side completions after rollout.

## Existing schema and minimal design

- `student_gamification_profiles`: `current_streak`, `longest_streak`, `last_qualified_date`, `lifetime_xp`, `current_level`.
- `student_learning_days`: unique `(student_id, learning_date)` is the authoritative one-qualification-per-day guard. `qualifying_session_count` remains at 1 in this version; it does **not** count all Activity completions, because only first completion matters for Streak.
- `xp_transactions`: `source_type=STREAK_BONUS`, `policy_version=STREAK_V1`, unique idempotency key `STREAK_BONUS:{studentId}:{runStartDate}:{milestone}`. A run starts on `lastQualifiedDate - (currentStreak - 1)` days. No new Streak run table required for this v1 policy. If Freeze or retroactive/out-of-order corrections are later accepted, revisit persistent run identity in a new ADR/migration.
- Profile locking serializes same-student updates. ActivitySession (already locked by its runtime) → Profile lock → day record/bonus ledger/Level within one transaction. Same-day duplicate terminal requests are inert. Avoid separate public mutation endpoints.

## Service/functions/API skeleton

| Component | Contract |
|---|---|
| `StudentStreakService.recordCompletedActivity(studentId)` | Called only on a new `COMPLETED` transition inside the Activity transaction; idempotent by student/day; date determined after serializing on student profile |
| `StudentStreakService.profile(studentId)` | Read official Lifetime XP/Level and display-effective Streak |
| `StudentStreakService.streak(studentId)` | Read current run and milestone award states from ledger |
| `GET /v1/student/gamification/profile` | Authenticated student profile, Level progress and Streak counters |
| `GET /v1/student/gamification/streak` | Authenticated current run, `qualifiedToday`, milestone XP/awarded indicators |

The student id always comes from the JWT subject. Client has no Streak/XP mutation route.

## Implementation stages

1. S1: wire completion transition to one-per-day qualification and locked Streak profile updates.
2. S2: add milestone XP ledger idempotency and recompute Level in the same transaction.
3. L1: read-only profile/streak APIs and Level progress contract.
4. UI: token-based Streak + Level panel on Student Rewards with live API data and explicit loading/error/empty states. Keep leaderboard, Hall of Fame and activity feed clearly marked mock; do not display mocked current student XP/Streak as official.
5. Verify: focused policy/service unit tests; backend compile/test; FE lint/type/build; PostgreSQL transaction/concurrency and authenticated mobile/desktop E2E before production rollout.

## Required acceptance cases

- 1, 3, 10 completed Activities in a calendar day → exactly 1 Streak day/award eligibility event.
- Day after previous → increment; skipped day → reset to 1; longest stays max; yesterday still active for display, two days ago expired.
- 23:59 completion and 00:01 completion in Ho Chi Minh time → two consecutive days; start before midnight and finish after → finish date only.
- GAME_OVER and ABANDONED do not qualify. Same Session duplicate finalize/HTTP retry cannot double credit.
- 3/7/14/30 milestones respectively award 10/20/40/80 once; new run can re-earn. Day 31+ has no new bonus.
- Activity reward and milestone reward both appear separately in ledger and contribute to one official Lifetime XP/Level. No Level-up reward loop; original Activity receipt is immutable.
- Two sessions completing concurrently, duplicate milestone requests and start/finalize contention never lose XP or duplicate Streak rows.
- No historical backfill. Verify authentication scope, loading/error/empty states, 375/768/1440 responsive layout.

## Delivery safety

This implementation in source is **not** proof of production deployment or concurrency testing. Do not activate/claim release before PostgreSQL integration and application E2E verification. The Activity XP rollout guard stays default off until its own release gate passes.
