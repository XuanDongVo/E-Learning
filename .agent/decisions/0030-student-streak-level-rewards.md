# ADR 0030 — Student Activity Streak and milestone XP

**Status:** Accepted by project owner (2026-11-06)
**Scope:** Student gamification, subsequent to Activity XP v2.2 (ADR 0029).

## Decisions

- A calendar day is Streak-qualified when at least one ActivitySession reaches `COMPLETED` in LEARNING or TRY_HARD. More completions in one day do not add Streak days. GAME_OVER, ABANDONED, IN_PROGRESS and Assignment/AssessmentAttempt do not qualify.
- Use server time in `Asia/Ho_Chi_Minh`; completion date, not start date, determines the day. Two completions across local midnight may qualify two consecutive days.
- A new qualification after yesterday extends the run, after a missed day starts a new run at 1. `longestStreak` never decreases. Yesterday remains a live Streak until today's deadline; older runs display an effective current Streak of 0.
- Milestone bonuses per run: days 3/7/14/30 award 10/20/40/80 XP. Once per run/milestone, no additional day 60/90 bonus. After the run is broken, milestones can be re-earned in a new run. No automatic Streak Freeze in v1.
- Streak XP is a fixed `STREAK_BONUS` ledger entry, not scaled by Activity session multiplier, and contributes to Lifetime XP/official Level. Level thresholds remain those of Activity XP v2.2; Level-up itself does not generate XP. Do not mutate an immutable Activity XP receipt to incorporate a later Streak award.
- Backend alone records qualifying days/bonus; the client has read-only profile/Streak APIs and no claim endpoint. Atomic ledger/profile updates and idempotency are mandatory.

## Implementation note

The minimum v1 schema (`student_learning_days`, profile, XP ledger) already exists. A run can be identified by the first day of a contiguous streak for the v1 policy without Freeze, and the idempotency key includes that date. A dedicated run/history table is deferred unless Freeze, backfill or retroactive correction is introduced. See `.agent/plans/STUDENT_STREAK_LEVEL_IMPLEMENTATION.md` for implementation/verification status.
