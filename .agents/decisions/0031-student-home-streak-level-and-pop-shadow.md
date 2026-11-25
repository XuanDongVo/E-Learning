# ADR 0031 — Student Home Streak/Level placement and pop-shadow styling

**Status:** Accepted (owner request 2026-11-06)
**Scope:** UI placement, visual language and read-only Streak API projection. No changes to Activity XP or Streak award rules.

## Decisions

1. Entire app uses **border-ink + shadow-pop** for prominent elevated surfaces, with the original Playful Classroom semantic palette; do not introduce shadow-ink. Secondary/nested surfaces have an ink border without redundant elevation.
2. Student Home remains a Learning Hub with Learning as primary CTA. Display a compact, accessible Streak Monday–Sunday activity calendar and a separate simple Level card. Weekly days come from server-verified `student_learning_days`; current week is in Asia/Ho_Chi_Minh. Today is highlighted, and the longest streak is shown.
3. The sample reference depicts Freeze and five-minute goals, but **neither is in scope**. Do not show fabricated counts or imply elapsed-minute qualification. An ActivitySession COMPLETED qualifies the day as in ADR 0030.
4. Level simply increases once Lifetime XP crosses the existing Activity XP v2.2 threshold. Show current Level, total XP, XP within level and XP to next; no rank/title/reward/claim gameplay is tied to leveling up.
5. `/student/rewards` focuses on **Leaderboard**. Keep existing sample rankings/Hall of Fame/feed explicitly labeled as demonstrations; a live ranking API is not approved in this slice.
6. Extend the existing read-only `GET /v1/student/gamification/streak` response with server-local `todayDate`, `weekStartDate`, `qualifiedDates`. No new write endpoint, Freeze, migration or retroactive XP.

## Verification

Check boundary weeks/year changes, local midnight, empty week, same-day duplicate activity, loading/error, small screens, focus/contrast/dark mode and preserved XP thresholds.
