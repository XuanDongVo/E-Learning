# Student Asset Inventory — Phase 3A

Date: 2026-11-19. Source baseline: `9f42a94c0e65` (`feature/guided-reasoning-v1`).
Scope: Student only. See STUDENT_VISUAL_STORYTELLING.md (art direction), STUDENT_PAGE_ARCHETYPES.md (page decisions), STUDENT_ASSET_LICENSES.md (provenance).

## Existing production assets (retained, not moved)

| Source | Usage / role | Phase 3 decision |
|---|---|---|
| `src/components/ui/mascot.tsx` | Pipo character, moods, optional growth stage | Keep public exports backwards compatible; separate controller and SVG; never replace character |
| `public/assets/practice-garden.jpg` | Activity scene/background | Retain; inspect image rights and contrast before republishing beyond current project |
| `public/assets/practice-q-garden.jpg` | Activity question/background | Retain; contrast, responsive and performance QA outstanding |
| `public/assets/practice-mascot.png` | Legacy raster mascot asset | Do not add elsewhere; review provenance and usage before deprecation |
| `public/assets/vocabulary/{chess,gardening,healthy,helmet,music,omelette,recycle}.svg` | Educational content images | Keep feature-owned and verified for correctness; not decorative scrapbook illustrations |
| `features/student/units/unit-cover.tsx` | Data-driven Unit cover / numbered fallback | Keep authoritative cover URL; do not replace fallback with invented art |
| `features/student/vocabulary/memory-tree/memory-mai-tree.tsx` | Data-driven interactive progress tree | Keep component and stage rules; not a static illustration |
| `features/student/vocabulary/progress/vocabulary-progress-botanicals.tsx` | Original decorative botanical SVG | Keep; token/contrast review as future refinement |
| `features/student/dashboard/mascot-banner.tsx` | Old gradient-based student mascot banner | Legacy design debt; not source of truth for new artwork |

Do not treat `public/file.svg`, `next.svg`, `vercel.svg`, etc. as Student artwork.

## Phase 3 starter assets (original to this repository)

All newly authored SVGs under `public/assets/student` use the same warm paper/ink/mustard/denim/sage/clay art palette. They contain no external images, scripts or third-party artwork. Exact names are indexed by `src/lib/student-visuals/registry.ts`.

| Asset ID | Asset role | Intended use |
|---|---|---|
| `scene.study-desk` | scene | Learning Hub, wider contextual header |
| `scene.open-notebook` | scene | Vocabulary overview, detail or page support |
| `illustration.no-results` | state | Filtered search / collection empty |
| `illustration.no-lessons` | state | No learning content or assignments |
| `illustration.word-collection` | learning | Vocabulary Library / review index |
| `illustration.achievement-stamp` | achievement | Confirmed result / milestones; not fake metrics |
| `doodle.arrow` | annotation | Directional cue to actual nearby action |
| `doodle.underline` | annotation | Short emphasis near headings |
| `doodle.star-sticker` | sticker | Earned state or restrained editorial accent |

Not all nine must appear on every page. Asset import into a page requires a Page Visual Brief with a functional reason. Do not use the illustration in place of an API-supplied learning image.

## Acceptance and maintenance

- New assets require author, source URL or `in-repo-original`, usage rights, modification status, intended contexts and approval status in STUDENT_ASSET_LICENSES.md; runtime registry must use a stable typed ID.
- New external assets default to `proposed`, not production-approved. A URL to an image is NOT a license.
- Avoid duplicating React SVG character/motion components as static SVG files just to fill a directory.
- The Student Design Lab has an asset gallery. Browser/mobile inspection is still required to approve visual quality.
- Asset size, compression, localization, accessibility (decorative or translated alt), copyright/provenance and performance must be checked prior to each release.
