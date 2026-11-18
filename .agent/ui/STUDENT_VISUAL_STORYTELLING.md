# Student Visual Storytelling — Indie Illustrated Scrapbook v2

**Status:** Phase 1 proposed design contract; implementation/asset migration is NOT implied.  
**Authority:** Accepted ADR 0032 and INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md.  
**Scope:** All present and future Student pages. Teacher does not adopt Student mascots, decoration or illustration rules.

## 1. One coherent visual world

Visuals tell a **learning story** and improve recognition, emotion or comprehension. They are not filler. All assets belong to the single Indie Illustrated Scrapbook identity: handmade 2D linework, cream paper, warm graphite ink, controlled earthy accents and deliberately imperfect detail around **precise** text and layout.

Editorial clarity is the layout discipline within this identity, **not a second theme**. Never introduce a separate neon, glassmorphism, 3D or corporate-illustration style for a feature.

## 2. Visual roles (choose by meaning)

| Role | Good for | Must communicate | What to avoid |
|---|---|---|---|
| Learning-content image | Vocabulary, reading, scenarios, Unit art | Meaning of word or lesson, real subject matter | Incorrect or misleading educational diagrams |
| Character / Pipo | Welcome, prompt, supportive explanation, empty/success | Friendly guidance or emotional state | Mascot on every card, interrupting exams |
| Editorial scene | Landing within Student, Hub, thematic Detail | Setting, subject or journey | Reusing the same mascot-right hero everywhere |
| State illustration | Empty, failure recovery, success | What happened and what to do next | Illustration as the only error/status message |
| Data visual | Progress, XP, streak, review frequency | **Server-supplied real quantities**, labels, units | Fake charts, invented progress |
| Supporting doodle | Section annotation, book tab, directional arrow | Spatial grouping, context or relation | Random stars, washi, stamps on each row |
| Thumbnail / cover | Unit, notebook collection, saved material | Item identity and distinction | Unrelated stock imagery |

**Page Visual Anchor:** Each ordinary Student page needs one intentional primary visual **or an equally meaningful data/identity visual** documented in its Visual Brief. It can be embedded in the main content, not necessarily a hero. High-focus Assessment/Workspace screens may explicitly omit a decorative anchor to protect reading and task completion. The rule is never "one Pipo on every page".

## 3. Pipo character contract

Source baseline: components/ui/mascot.tsx, SVG-based Pipo with mood values idle, happy, cheer, oops, think, sleepy, wave and celebrate, optional stage (1–4) and semantic color. Treat Pipo as the same character across pages.

- Keep recognizable silhouette, eyes, palette role, stroke quality and proportions; do not fork a page-local character or redraw incompatible Pipo styles.
- Mood is meaningful: wave = welcome; think = reflection; oops = gentle retry without shame; happy/cheer/celebrate = earned positive feedback; idle = neutral presence. Avoid celebratory mood for incorrect answers.
- Character+props (notebook, pencil, compass, badge) and full scenes may be produced as versioned visual assets, not piled into a single oversized TSX component.
- Speech and motion must be optional and non-blocking. Do not obscure controls, delay grading feedback or auto-play sound. Pipo must not cover the question area on small screens.
- Use the existing toggle or accessibility preferences where present; verify reduced-motion and nonessential animation behavior in browser before release.
- Do not rely solely on mascot expression to convey state; pair with text and semantic feedback.

## 4. Illustration style specifications

- 2D hand-drawn / paper-cut language; simple organic shapes and restrained pencil/ink edges. Deliberate irregularity belongs to objects/materials, not text alignment.
- Use approved Student semantic colors; permitted art-specific accents require a documented palette role and accessible contrast for any labels. Existing older art may be inventoried as migration debt, not blindly recolored.
- Stroke and corner grammar must feel related to Pipo and Student surfaces; avoid large varying outline widths in the same illustration set.
- Texture is subtle and outside reading content; avoid detailed high-contrast backgrounds behind text.
- No visual information should be hidden in a decorative background, or conveyed using color alone.
- New illustration assets must have a clear subject, meaning and intended usage. A Lucide icon enlarged to 48px alone is not a substitute for contextual artwork when a scene is warranted.

## 5. Asset library & reuse

Existing baseline assets include public/assets/practice-*.jpg, public/assets/vocabulary/*.svg, UnitCover image/fallback, and React SVG Pipo and Mai tree. They remain valid until reviewed. Proposed **future** structure:

~~~text
client-e-learning/public/assets/student/
  character/pipo/
  illustration/learning/
  illustration/vocabulary/
  illustration/states/
  scene/
  doodle/
  texture/
~~~

Do not move files to this structure until consumers and migration strategy are planned.

Asset metadata (in an eventual manifest) should include: unique ID, subject, role, owner, route usage, source/rights, aspect ratio, dimensions, optimized formats, alt text or decorative flag, palette version and mobile variant/focal point.

Naming suggestion: pipo-{mood}-{prop}.svg; scene-{context}-{variant}.svg; illus-{concept}-{state}.svg. Use stable meaningful names; never duplicate files merely to rename for a page.

Reuse order:
1. Existing content-owned image / current approved asset.
2. Existing compatible scene, Pipo mood/prop or state illustration.
3. Adapt a reusable illustration with allowed props/variants.
4. Commission/create a new asset only if it solves a novel semantic problem.

Do not automatically fetch unrelated images or generate new illustrations as a coding side effect. Educational images need correctness checks; external images require appropriate rights and attribution where applicable.

## 6. Placement and composition

- One dominant focal moment at most; secondary visuals are quiet or functional.
- Page header may use a small supporting illustration, but a hero is **optional**. Never force a hero above dense task data.
- Collections prioritize scan speed and row content. Use thumbnails only when they distinguish records; filters/actions must remain prominent.
- Detail uses a meaningful cover or topic diagram; if data is its strongest visual, emphasize that instead.
- Workspace/Assessment keeps prompt, input, explanations and feedback visible before decoration. Scene background must preserve contrast and focus.
- Result/Progress may use achievement artwork or truthful data visuals; labels, numerals, legends and units stay readable.
- Empty/error states pair an illustration (optional) with explicit message and next action; a cute mascot cannot replace error recovery.

## 7. Mobile, accessibility and performance gate

- Plan mobile 360px and 390px FIRST; also verify 768px, 1024px, 1440px. Cropping/stacking/alternate art is decided in the page brief, not left to CSS accident.
- Essential information may not be clipped, hidden by mascot, or rendered into an unzoomable background; target controls >=44x44px.
- Semantic image: descriptive alt with educational meaning; adjacent-caption duplication avoided. Decorative SVG: aria-hidden; diagrams requiring explanation need nearby text and/or an accessible summary.
- Do not place text as rasterized artwork if it must be translated, searched, selected or read by assistive tech.
- Favor SVG for simple vector art; optimize JPEG/WebP/AVIF for photographs or textured scenes, give width/height or aspect ratio, use lazy loading below the fold. Avoid unnecessary network font/media calls and layout shift.
- Honor prefers-reduced-motion. Do not autoplay sound or high-frequency motion. Transitions must not hide results or cause double input.
- Preserve Vietnamese/English localization and contrast on both theme surfaces and image overlays. Test mobile fallback when the anchor is hidden.

## 8. Page Visual Brief (required for new Student screens)

~~~text
Page / user goal:
Archetype and focus mode:
Primary action and key content:
Visual anchor: content image | Pipo | scene | state | truthful data | none with reason
Why this anchor helps the learner:
Pipo mood / prop (if any):
Asset ID or asset request (reuse check done?):
Secondary visual(s), or none:
Desktop placement / mobile 360px fallback:
Empty, error, loading, success, disabled visual treatment:
Alt / decorative semantics / localization:
Motion, performance budget and reduced-motion fallback:
~~~

A visual brief is a design decision, not an instruction to ship placeholder imagery. Do not invent progress, educational diagrams, server states or features to justify a visual. Add visuals that make the user understand, recognize or care.

## 9. Recommended starting asset pack (Phase 3, NOT YET BUILT)

1. Pipo welcome / thinking / gentle retry / achievement states using the existing SVG identity.
2. A study-desk or open-notebook scene with a mobile-safe crop for a representative Hub.
3. A vocabulary/word collection illustration and one generic learning-empty illustration.
4. Reusable notebook doodles (underline, arrow, tab, stamp) with strict functional roles.
5. A small reference gallery showing artwork next to actual body text, buttons, lists and progress.

Artwork acceptance: recognizable on mobile, consistent with Pipo and scoped tokens, accessible, purposeful, reasonably compressed, and nonblocking. Phase 3 should create only assets needed for approved reference pages, not hundreds of speculative files.
