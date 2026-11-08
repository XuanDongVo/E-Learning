# Student Profile — Screen Brief and UI Contract

**Scope:** `/student/profile` and the compatibility route `/student/profile/[id]`.
**Visual identity:** Indie Illustrated Scrapbook through the scoped Student theme.
**Implementation status:** standardized reference route as of 2026-11-07.

```text
User:            Student (Grades 6–8)
Goal:            Review learning identity and update owned personal/profile data
Page type:       Student profile notebook
Primary action:  Review profile; edit personal/avatar data when needed
States covered:  Loading, query error, read success, edit disabled/saving/success/error
```

## Product and data contract

- Preserve the four tabs: overview, learning, streak and personal.
- Identity, class, avatar, XP/Level, Streak, learning overview and Assignment
  counts come from their existing real APIs. Do not replace missing data with
  fabricated achievements or progress.
- Avatar updates use the student-owned avatar endpoint and refresh the profile.
- Guardian data is private and collapsed by default. Display/edit only the
  primary or first guardian, while preserving every other guardian in the
  collection-replacement PUT payload.
- Email and class identity remain read-only. Personal edit validation and
  guardian email validation must remain accessible and actionable.

## Visual and architecture contract

- Profile establishes Student content density, not a separate design system.
  Reuse `components/student-ui` and the roles in `styles/student/`.
- The Student shell owns outer width and padding. Profile may use an inner
  readable-width composition but must not add another page canvas or viewport.
- Use `PaperSurface`, `SketchProgress`, shared Dialog behavior and Student
  control/field recipes. No page-local palette, arbitrary typography, radius or
  shadow values.
- Keep forms and learning data aligned and stable. Imperfection belongs to
  paper, tape and small rotations—not inputs, tables or long reading content.
- Maintain ≥44px touch controls, visible focus, keyboard dialog behavior,
  reduced motion and 360px minimum support.

## Validation

Check focused ESLint, TypeScript, production build when the environment supports
SWC, and authenticated browser layouts at 375, 768, 1024 and 1440px.
