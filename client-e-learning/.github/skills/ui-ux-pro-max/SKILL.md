---
name: ui-ux-pro-max
description: "Design, redesign, review, or improve frontend UI/UX with the UI UX Pro Max methodology. Use for dashboards, learning experiences, responsive layouts, component styling, visual systems, accessibility, and interaction design in Next.js, React, or Tailwind projects."
argument-hint: "Describe the UI/UX surface to design or improve"
user-invocable: true
disable-model-invocation: false
---

# UI UX Pro Max

Use the design intelligence and quality principles from [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) for every UI design or redesign task in this workspace.

## When to Use

- Build or redesign a page, dashboard, component, navigation, form, or interaction.
- Review an existing interface for visual, responsive, usability, or accessibility problems.
- Improve hierarchy, typography, color, spacing, states, motion, or information density.
- Create a design system or page-specific visual direction for the e-learning product.

## Procedure

1. Inspect the existing page, shared components, tokens, and nearby feature patterns before editing.
2. Identify the user, task, content density, platform, and existing design constraints. Preserve the project's domain model and established visual language unless the request explicitly asks for a new direction.
3. Define a compact design direction before implementation:
   - product context and primary user task
   - layout pattern and information hierarchy
   - typography pairing and type scale
   - purposeful color palette with semantic states
   - spacing, borders, radii, elevation, and component density
   - interaction, loading, empty, error, disabled, hover, focus, and success states
4. For substantial redesigns, use the upstream search and design-system generator when it is installed. Prefer the project-specific stack guidance for Next.js, React, and Tailwind:

   ```powershell
   python .github/skills/ui-ux-pro-max/scripts/search.py "<product context>" --design-system -f markdown
   python .github/skills/ui-ux-pro-max/scripts/search.py "<UX question>" --domain ux
   python .github/skills/ui-ux-pro-max/scripts/search.py "<stack question>" --stack nextjs
   ```

   If the bundled script is unavailable, apply the same principles manually and state that the catalog search was unavailable.
5. Implement with existing project primitives and libraries. Use Lucide or the project's icon library for icons; do not use emoji as UI icons. Keep controls semantic, keyboard-operable, and visibly focusable.
6. Make responsive behavior intentional at 375px, 768px, 1024px, and 1440px. Ensure headings, buttons, badges, chips, tables, and long identifiers reflow without clipping or overlap.
7. Add meaningful motion only where it clarifies state or hierarchy. Respect `prefers-reduced-motion`; do not add decorative animation that competes with the learning workflow.
8. Validate the result with the narrowest available checks. For frontend work, run the relevant typecheck/lint/test command and inspect the rendered result at mobile and desktop widths when browser tooling is available.

## Design Rules

- Design the actual workflow first; avoid adding marketing-style hero sections to operational teacher or student screens.
- Use expressive, purposeful typography rather than default-looking typography when the existing system permits it.
- Avoid generic purple-on-white layouts, excessive gradients, decorative blobs, nested cards, and one-note palettes.
- Use cards only for repeated items, modals, or genuinely framed tools; keep page sections unframed and structured.
- Use icons in icon buttons, tooltips for unfamiliar icons, and text labels for commands that need explicit clarity.
- Do not rely on color alone for status or meaning. Pair status colors with text, icons, or other accessible indicators.
- Preserve stable dimensions for grids, toolbars, icon buttons, tiles, and other fixed-format UI so content changes do not shift the layout unexpectedly.
- Keep text readable with at least 4.5:1 contrast for normal text, and provide visible keyboard focus states.

## Pre-Delivery Checklist

- [ ] The primary user task is obvious and the visual hierarchy supports it.
- [ ] The implementation follows existing components, tokens, API boundaries, and domain concepts.
- [ ] Loading, empty, error, disabled, hover, focus, and success states are handled where relevant.
- [ ] Layout and text remain usable at 375px, 768px, 1024px, and 1440px.
- [ ] No text, badge, chip, button, icon, or control is clipped, overlapped, or dependent on color alone.
- [ ] Clickable elements have semantic controls, pointer affordance, accessible names, and keyboard behavior.
- [ ] Icons come from Lucide or the existing icon library; no emoji are used as interface icons.
- [ ] Motion is purposeful and reduced-motion behavior is respected.
- [ ] The relevant executable validation has passed, or any unavailable validation is reported clearly.

## Upstream Reference

Keep this skill aligned with the current guidance and catalog at [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). The upstream project is MIT licensed and supports design-system generation, domain-specific recommendations, UX guidelines, and stack-specific guidance.