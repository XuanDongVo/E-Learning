# StudentPageHeading — visual refinement (2026-11-21)

## Goal and scope

Improve the shared **information hierarchy** of Student page introductions for mobile/desktop, without creating another fixed hero recipe or changing the existing information architecture.

- Shared primitive: `client-e-learning/src/components/student-ui/patterns/student-page-heading.tsx`.
- Visual styling: `client-e-learning/src/styles/student/page-heading.css`, imported in Student layout.
- Responsibility: eyebrow + semantic heading + explanation + optional actions/illustration.
- Explicitly **not** responsible for paper materials, mascot selection, content ownership, routing, API state, or global Teacher typography.

## Reuse inventory / affected consumers

Existing uses verified in code:
- Student Unit Index (`UnitsView`)
- Student Assignment list (`AssignmentHero`)
- Student Knowledge Library
- Student Vocabulary Unit Library
- Student Vocabulary Word Library
- Student Activity History
- Student Design Lab `StudentPagePatternsGallery` (nested H3 examples)

The shared heading uses `ScrapbookHeading` and inherits the existing Student Indie Illustrated Scrapbook palette and font tokens. Every consumer retains its own `PaperSurface`, artwork and actions, if any.

## Visual changes

1. **Eyebrow:** accessible real text with small ink-bordered mustard dot, no badge/pill clutter.
2. **H1:** retain current typography scale and add a restrained translucent marker highlight (underline remains opt-in); headings remain text (not a picture).
3. **H2/H3:** smaller, distinct heading roles in nested Design Lab/section cases, avoiding the default page H1 scale.
4. **Description:** 64ch max, readable line-height, normal text wrapping (no line clamp or hidden content).
5. **Actions:** wrap naturally and remain keyboard focusable; no button behaviors changed.
6. **Artwork:** truly optional; page owners still choose to hide on mobile or display artwork below the main copy. No fixed visual frame that would show an empty box if Pipo is disabled.

Styles are `.student-theme` scoped; Teacher pages and portal overlays are unaffected.

## Verification checklist

- Inspect 360px / 390px / 768px / desktop widths in light/dark settings as applicable.
- Check H1 semantics on index pages, and H3 previews inside Design Lab; one H1 per document page.
- Unit Index has an original SVG in place of Pipo; header/title/actions must remain stable regardless of mascot state.
- Confirm Knowledge Library shelf art and Student Vocabulary illustration do not overflow at 640px/768px.
- Confirm Unit search, History filtering, Vocabulary pagination, Assignment metrics and link navigation remain unchanged.
- Check long unit names, localized Vietnamese text, wrapping, focus rings and buttons on mobile.
- Run `cd client-e-learning && npx vitest run src/components/student-ui/patterns/student-page-patterns.test.tsx`.
- Run `npx tsc --noEmit && npm run lint` and visual/browser regression before merging.

**Execution status:** source update and tests committed via GitHub connector only. No local Node, Vitest, browser or CI verification was executed.
