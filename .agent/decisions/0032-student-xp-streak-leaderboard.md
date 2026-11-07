# ADR 0032 — Student XP and Streak leaderboard (read-only)

**Status:** Accepted (owner request 2026-11-06)
**Scope:** Student /student/rewards leaderboard UX and read endpoints. No XP/Streak reward changes.

## Decisions

- The public Student Rewards screen is a leaderboard with only two tabs: XP and Streak.
- XP has TODAY, WEEK, MONTH, ALL filters based on server-local Asia/Ho_Chi_Minh calendar; values sum committed `xp_transactions.amount` (all positive XP source types) within the selected period, not snapshot Lifetime XP.
- Streak has no period filter. Rank by **effective current Streak** (0 when last qualifying day is earlier than yesterday), not longest-ever; longest-ever is used only for its Hall of Fame honor.
- Return at most 50 ordered students plus the signed-in student's own standing even if outside those 50. Sort metric descending and student ID ascending to resolve ties deterministically. Students with zero score remain eligible. If in Top 50, emphasize their own table row; otherwise show a separate personal position card.
- Top three share the same ordering/data as the table; do not fabricate separate podium results.
- Hall of Fame has exactly two categories: all-time Lifetime XP and historical longest Streak. No social ambassador/shares title.
- Recent activity is read-only, limited, and sourced from real terminal ActivitySessions (COMPLETED, GAME_OVER) with optional committed Activity PRACTICE XP. No mock social or level-up events.
- All leaderboard data come from authenticated student read endpoints and official DB tables; client has no claim/award API and cannot determine its own rank.
- UI honors border-ink + shadow-pop, responsive layout and loading/error/empty states. No mock fallback. Rankings use active student users only. No additional leaderboard table or migration is necessary for v1.

## Verification

PostgreSQL integration tests for timezone boundaries, exact top-50 cutoff, ties, zero scores, expired Streak, absent profile, session statuses, authorization and UI responsive layouts are required before release.
