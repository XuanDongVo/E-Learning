# 0002 — Adopt the UI guidelines and design tokens

Status: Accepted (token additions in guideline §3.3 are not implemented yet)  
Date: 2026-10-01

## Context

The UI drifted: raw palette utilities, mixed type sizes and radii, and contrast failures (see guideline §13).
The old `AGENTS.md` carried a short "UI and Design" paragraph that duplicated and partly contradicted the new rules.

## Decision

- [`ui/UI_ARCHITECTURE_GUIDELINES.md`](../ui/UI_ARCHITECTURE_GUIDELINES.md) is the single source for UI structure,
  tokens, components, accessibility and responsive behavior. It supersedes the former "UI and Design",
  "Accessibility" and "Responsive Web" sections of `AGENTS.md`.
- Feature code uses only tokens from `globals.css`; new tokens are proposed and documented first (guideline §3.8).
- There is **no top-level "Games" item** in Teacher navigation. A game is a GameTemplate chosen inside an Activity.
  The `TCH-18 Game Library` screen is reached from Activities.
- Generic UI skills (for example `ui-ux-pro-max`) may check states and accessibility but must not introduce a new
  palette, font pairing, radius scale or layout pattern.

## Consequences

- Follow the migration plan in guideline §13.1 (tokens PR → primitives PR → migrate screens as they are touched).
- Teacher nav items that link to `#` placeholders are removed or disabled; Teacher shell needs a small-screen drawer.
