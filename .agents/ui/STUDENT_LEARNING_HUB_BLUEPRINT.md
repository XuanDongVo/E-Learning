# Student Learning Hub — Screen Brief and UI Contract

**Decision:** 2026-11-05, `feature/student-gamification`  
**Scope:** Student Home and the complete Units route branch, including Unit Detail, Activity list and immersive runtime entry.
**Visual identity:** Indie Illustrated Scrapbook; see `INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md` and ADR 0032. The Student layout activates the scoped theme. Home, Profile, the complete Units branch and Rewards are standardized reference routes; other Student routes may still contain migration debt.

## Product direction

Student is a **learning workspace, not an analytics dashboard**. The first screen helps a
Grade 6–8 learner choose a real Unit and begin an Activity. A compact Streak/Level motivation region may appear on Home using authoritative gamification APIs; rankings,
charts and formal assignments stay in their respective destinations. Do not
replace the home with a KPI wall or fabricate a learning path.

## Screen briefs

### Home (`/student`)

```text
User:            Student (Grades 6–8)
Goal:            Find a Unit and start learning, or open teacher assignments
Page type:       Student learning hub
Primary action:  Explore learning (`/student/units`)
States covered:  Unit loading, empty, error/retry, successful list; links stay usable
```

- Welcome heading and one primary Learning action.
- Up to three actual Unit entries from the existing Student Units endpoint,
  sorted by their `displayOrder`; each leads to the real Unit Detail route.
- Assignment destination is a secondary path, not an Activity variant and
  not an invented pending-work count.
- Never label a Unit **Resume / Continue** or show a progress percentage,
  due date, XP, locked state, or recommendation without an authoritative API
  contract for that data. The current Units summary does **not** expose resume.
- A compact **Streak calendar (Monday–Sunday)** and **XP-to-next-Level** panel appear near the welcome/learning entry, with live loading/error states. No leaderboard appears on Home; Learning remains the primary action. The week calendar is server-authored in Asia/Ho_Chi_Minh, with no Freeze or five-minute pseudo-goal.

### Unit list (`/student/units`)

```text
User:            Student (Grades 6–8)
Goal:            Find and enter a published Unit
Page type:       Student content explorer
Primary action:  Open a Unit's sections and activities
States covered:  Loading, empty, error/retry, no-search-results, successful list
```

- Reuse `studentUnitService.list`, `UnitCard` and `UnitCover`.
- Show Unit name, optional description, section count and activity count
  from the API. No fake mastery, duration, level or generated lock state.
- Search filters the available list by name; a no-results state clears search.
- One quiet visual vocabulary across all Unit cards; do not alternate badge
  colors based on the record's array index.

### Unit detail (`/student/units/:unitId`)

```text
User:            Student (Grades 6–8)
Goal:            Choose a Section/Topic and launch a published Activity
Page type:       Student content detail
Primary action:  Open an Activity
States covered:  Loading, error/retry, no matching Activities, successful list
```

- Reuse `studentUnitService.getUnitDetail`, `ActivityCard`, existing Section and
  Topic filtering, and Activity runtime routes. Keep Activity independent
  from Assignment.
- Clear sequence: Back → Unit identity → Section → optional Topic → Activities.
- Filters are keyboard-operable buttons with `aria-pressed`; activity listing
  reports the count and an actionable empty state.
- No new API, domain state, progress inference or navigation destination.

## Navigation contract

| Label | Existing route | Purpose |
|---|---|---|
| Home | `/student` | Learning Hub, not analytics dashboard |
| Learning | `/student/units` | Unit/Section/Topic/Activity exploration |
| Assignments | `/student/assignments` | Teacher-assigned formal work |
| Progress | `/student/progress` | Deferred; currently placeholder |
| Leaderboard | `/student/rewards` | Live XP/Streak ranking and honors |
| Profile | `/student/profile` | Account/profile route |

This stage changes the label **Units → Learning**, not the URL or the
underlying domain model. Do not expose a top-level Games route.

## Visual acceptance

- Follow the canonical [Indie Illustrated Scrapbook design rules](./INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md) for Student appearance, rather than legacy Playful Classroom values.
- Preserve the product's current Unit/Activity hierarchy, verified data, screen states, primary action and readability.
- Semantic tokens and shared components must be reused through the implemented scoped Student theme. Feature files must not re-declare the palette, typography scale, paper geometry or control treatment.
- Student touch targets ≥44px; visible focus, clear labels, reduced motion and responsive layouts at 375/768/1024/1440px.
- Validate lint/build and browser visual QA when applicable; do not claim runtime/API verification unless run.

### Activity list and runtime routes

- `/student/units/:unitId/activities` resolves `unitId` from the path, never from an optional duplicate query parameter.
- Activity lists show only server-published records and handle loading, error and empty states.
- `/student/units/:unitId/activities/:activityId` remains the immersive runtime. Its explicit functional type scale is allowed by the Student design system; its wrapper uses the scoped Student material treatment without changing mode choice, per-question timing, hints, lives, scoring or result data.

## Future dependencies

- Resume-learning requires authoritative per-student progress/session data.
- Progress charts require a verified analytics API and domain definitions.
- Additional progress charts require verified analytics contracts; the Units branch must not infer them from Unit or Activity counts.
