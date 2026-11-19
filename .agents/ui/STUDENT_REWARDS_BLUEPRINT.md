# Student Rewards — Live Leaderboard UI Contract

**Decision source:** ADR 0032 (Student XP and Streak leaderboard)
**Route:** `/student/rewards`
**Visual identity:** Indie Illustrated Scrapbook, scoped to Student.

## Screen brief

```text
User:            Authenticated Student
Goal:            See the live XP or current-Streak ranking and personal standing
Page type:       Read-only community leaderboard
Primary action:  Switch metric; choose XP period
States covered:  Ranking, honors and recent-feed loading/error/empty/success
```

## Data contract

- XP supports TODAY, WEEK, MONTH and ALL. Streak always requests ALL because it ranks the effective current Streak rather than a period total.
- The server returns at most 50 ranked students and the signed-in student's truthful standing. The client never computes rank.
- The top-three paper podium is derived from the same ordered `top` collection as the table.
- Hall of Fame contains only lifetime XP champion and historical longest-Streak champion.
- Recent activity contains real terminal ActivitySessions and optional committed Practice XP.
- No mock fallback, random avatar service, claim action or client-authored achievement is permitted. When no authoritative avatar URL exists, the UI uses initials.

## Interaction and visual contract

- Current-student status uses a visible “Bạn” label and inset boundary, not color alone.
- Touch controls are at least 44px, filters use `aria-pressed`, and ranking uses table roles.
- Page headings, controls, paper layers, podium geometry, ranking rows and honor cards use shared Student roles/recipes. The shared cross-workspace `LeaderboardPodium` is not restyled.
- Typography and layout dimensions live in `styles/student/`; feature TSX must not declare raw palette values, arbitrary type sizes or one-off card geometry.

## Non-goals

- Streak/Level dashboard widgets remain on Student Home.
- No social feed, likes, shares, reward inventory, claim endpoint or new ranking persistence.
- This UI change does not alter XP settlement, Streak qualification or leaderboard ordering rules.
