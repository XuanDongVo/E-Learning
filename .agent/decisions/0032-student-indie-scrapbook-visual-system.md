# ADR 0032 — Student Indie Illustrated Scrapbook visual system

**Status:** Accepted (owner decision 2026-11-07)  
**Scope:** Visual governance. This ADR does not itself implement CSS, components or screens.

**Implementation note (2026-11-07):** The later scoped-theme change has now landed in the Student layout, `styles/student/` and `components/student-ui/`. Student Home, Profile, the complete Units route branch and Rewards are standardized reference routes; remaining Student routes are migration work. This note records implementation state without changing the historical decision below.

## Context

Student visual direction changes from Playful Classroom to Indie Illustrated Scrapbook (Hand Drawn × Hipness Purgatory). Teacher appearance must remain unchanged. Shared aesthetic requirements in prior UI rules conflict with this decision.

## Decision

1. Indie Illustrated Scrapbook is the **exclusive Student visual design direction**. The single canonical aesthetic specification is [INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md](../ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md).
2. Teacher retains the current visual tokens, typography and styling. Visual divergence between Student and Teacher is intentional; both still share accessibility, application behavior, domain integrity and reliable navigation.
3. Student typography, semantic colors, decorative surfaces and effects must be **scoped to Student**, with no unintended effect on Teacher or global components. A later implementation change will deliver the scoped theme.
4. The canonical design specification describes *visual identity only*. Architecture, data contracts, routes and migration plans remain in their respective documents.
5. The frontend-design skill must follow canonical project design directions, not generate new Student palettes or font pairs.
6. No UI feature is claimed implemented by this documentation decision.

## Supersession

- Supersedes **ADR 0031 decision 1** only insofar as it mandates Playful Classroom palette and border-ink/shadow-pop as the **app-wide** visual language. That legacy style remains available to Teacher; Student uses the new specification after implementation.
- Amends ADR 0002 by allowing **workspace-scoped Student visual tokens and typography** while preserving governance, reuse and accessibility rules.
- Does **not** supersede ADR 0031 decisions 2–6 (Student Home Streak/Level, XP, rewards, server-authored dates). Domain and interaction rules remain unchanged.

## Consequences and acceptance

- Align AGENTS.md, UI Architecture Guidelines, Student Learning Hub blueprint, frontend skill, documentation index and Definition of Done to this decision.
- No Student theme CSS, Teacher CSS, application route, backend entity or runtime change belongs to this documentation-only commit.
- Validate that no active Student visual specification still requires Playful Classroom; preserve historical ADR texts unchanged.
