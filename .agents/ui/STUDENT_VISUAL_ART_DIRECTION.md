# Student Visual Art Direction — Phase 3

Authority: ADR 0032 and STUDENT_VISUAL_STORYTELLING.md. Do not create a second Student brand.

## Shared character and scene grammar

The look is an analogue *personal learning journal*: rounded organic ink contours, warm paper cuts, soft irregular corners, offset tiny accents and restrained pencil-like linework. UI alignment stays precise. Avoid neon gradients, glass, 3D renderings and mixing illustration-library styles.

**Palette for SVG files (approved artwork references, not replacing CSS tokens):**
- Canvas `#F7F4EB`, paper `#FFFDF9`, kraft `#E8DEC8`.
- Ink `#2D2B2A`; soft pencil `#6E6863`.
- Mustard `#D99B26`, clay `#C85A32`, sage `#6B8E67`, denim `#4A6B82`.
- Highlight colors may be lighter **tints of these roles**, not unrelated accents.

**Contour:** usually 2–3px at native 320–480px scene size, rounded joins/caps, slightly irregular polygon/organic paths. Supporting doodles typically 2–3px on 120–240px viewBox. No text burned into SVG.

**Composition:** meaningful subject as focal point, plenty of whitespace, one strong illustration per ordinary page, optional small secondary annotation. Keep the functional UI in front. Educational content or true data is a stronger anchor than decorative imagery.

**Mobile:** use responsive max widths; allow art to disappear only when decorative and the content hierarchy remains intact. Never hide educational content. Don't use fixed large PNG assets as mobile backgrounds with clipped meaning.

**Pipo:** existing silhouette, face, palette and growth stages define character identity. New moods and props require the same eye/outline ratio and no intrusive animation. Speech must not be essential information. Use character as supportive context, not generic card filler.

**Motion:** subtle and optional; respect reduced motion. No autoplay sound. Real performance tests and motion perception need a browser/device QA pass.

**Approval:** inspect scene beside 15px body/16px reading copy on cream and kraft, at 360/390/768/1440px, with Pipo optional/disabled. Visual proposals must show source, purpose, fallback and accessible semantics.
