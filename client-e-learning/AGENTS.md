# Frontend agent guide

This directory uses Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4.
Inherit all repository rules from [`../AGENTS.md`](../AGENTS.md).

Before changing frontend code:

- Read the matching guide in `node_modules/next/dist/docs/01-app/`. For styling and
  fonts, use `01-getting-started/11-css.md` and `01-getting-started/13-fonts.md`.
- Follow [`.agent/architecture/frontend.md`](../.agent/architecture/frontend.md)
  and [`.agent/ui/UI_ARCHITECTURE_GUIDELINES.md`](../.agent/ui/UI_ARCHITECTURE_GUIDELINES.md).
- For every Student route or shared component rendered by Student, also follow
  [`.agent/ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md`](../.agent/ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md)
  and ADR 0032.

Student feature code must use scoped semantic tokens, typography roles and
`components/student-ui` recipes. Raw colors, arbitrary type sizes and page-local
copies of shared paper/control/progress/dialog treatments are migration defects.
The Student shell owns outer width and padding; immersive runtimes are the only
documented exception.

Validate affected files with ESLint, then run the production build when the
environment supports Node.js. Check Student layouts at 375, 768, 1024 and 1440px.
