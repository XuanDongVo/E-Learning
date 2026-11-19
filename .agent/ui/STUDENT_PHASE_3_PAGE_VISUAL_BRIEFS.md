# Phase 3 — Reference Page Visual Briefs

Source integration on `feature/guided-reasoning-v1`; no API/domain assumptions. Each decoration below is deliberately optional; essential learning state remains textual.

| Page | Archetype | Anchor / role | Mobile | Fallback and accessibility |
|---|---|---|---|---|
| Learning Hub | Hub | Pipo Polaroid at desktop, `scene.study-desk` on mobile; `illustration.no-lessons` only when Unit collection empty | `scene.study-desk` replaces Pipo anchor under md (144px); empty image capped at 160px | `RegionState` text and navigation remain accessible when images fail |
| Units | Collection | Existing Pipo header; no-lessons / no-results image only for actual empty results | Illustration 128–160px | No state invented; `RegionState` communicates message/clear search |
| Vocabulary Hub | Hub | `scene.open-notebook` contextual header, Unit cover is data-authored | Scene omitted under sm | Header text and actions always visible |
| Vocabulary Word Library | Collection | `illustration.word-collection` compact header | Scene omitted under sm | Search/filter and server counts take priority |
| Activity History | Collection | Small `illustration.no-results` only in real empty state | 112px centered | Reset filters remains visible |
| Vocabulary Progress | Insights | Existing animated Mai tree built from actual review records | Existing responsive component | No decorative achievement stamp without verified milestone |

Pipo geometry remains the only character brand. `StudentIllustration` uses explicit `decorative` or translated `alt`. Uploaded content images and unit cover URLs remain owned by the feature/domain.

## Planned acceptance checks (not yet executed)

- Desktop and 360/390px screenshot comparison; no overflow and no hidden search controls.
- Reduced-motion Pipo, keyboard focus, focus outline on links, screen-reader empty-state text.
- Turning mascot off never hides educational information or leaves blank placeholder.
- Teacher remains unaffected by Student CSS and visual components.
- No added external runtime assets, licenses or fake Progress/XP/streak data.
