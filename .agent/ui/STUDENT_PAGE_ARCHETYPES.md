# Student Page Archetypes & Composable Patterns — v2

**Status:** Phase 1 proposed architecture; new React templates have **not** been implemented.  
**Authority:** UI_ARCHITECTURE_GUIDELINES.md + accepted ADR 0032 for visuals; business/domain specs for functionality.  
**Principle:** One Indie Illustrated Scrapbook design language across all routes. Archetypes vary **information architecture**, not palette, typography or mascot style.

## 1. How pages are classified

Select the archetype from the user's main goal, not the route name or current design. Feature ownership remains in its domain. A page may combine patterns but has **one primary journey** and one primary action or task.

| Archetype | Main goal | Content composition | Visual anchor strategy | Example route |
|---|---|---|---|---|
| Hub | Choose learning path | Orientation -> clear options -> continuation | Pipo/scene or meaningful Unit imagery; optional hero | /student; /student/vocabulary |
| Collection / Index | Find, compare, resume an item | Compact header -> search/filter -> list/grid -> paging -> states | Small notebook scene or meaningful item thumbnails; data first | /student/vocabulary/words; Activity History |
| Detail | Understand one object and act | Back/context -> identity -> key info -> sections -> CTA | Cover image, course illustration or subject-specific diagram | /student/units/[unitId] |
| Workspace | Complete a guided task | Context -> step -> prompt -> input -> feedback -> next | Learning-media or small Pipo feedback; decoration suppressed | Vocabulary study/review, future AI assistance |
| Assessment / Immersive | Stay focused and finish fairly | Status/navigation -> question -> controls -> submit | Only task-relevant image; immersive backdrop may be used if readable | Activity runtime; Assignment attempt |
| Review / Result | Understand outcome and next action | Truthful result -> explanation -> review details -> next | Earned/recovery illustration or truthful progress visualization | Activity session review; Assignment result |
| Identity / Insights | Understand self and progress | Identity/period -> real metrics -> history -> action | Avatar, streak/calendar, server-backed visualization | /student/profile; vocabulary progress |
| Game Experience | Play with clear rules | Setup -> round -> response -> game feedback -> results | Dedicated scene and animation WITHIN shared tokens/motion/a11y | /student/game/[unitId]/[gameType] |

Game Experience is a functional composition profile, not a second visual identity. Existing route categorization does not change product domain boundaries.

## 2. Composition slots, not identical templates

Recommended generic slots to implement only when a demonstrated reuse need exists:

- PageContext: breadcrumbs/back, unit or task context.
- PageHeading: one h1, concise explanation, primary action.
- VisualAnchor: optional area for approved character/scene/subject image/truthful data visual.
- MainContent: activity, list, learning material, profile, or form.
- SupportingContent: metadata, summary, filters or learning tips without competing with the main task.
- FeedbackState: loading/empty/error/disabled/success including retry/next action.
- FooterActions: pagination or guided steps when appropriate.

The **slots are conceptual**, not a mandatory rigid React super-component. Reuse patterns with composition before creating complex prop APIs.

Anti-template rule: do NOT render every page as kraft hero + Pipo on right + three stat cards + a grid. Decide visual anchor and layout from content. Never insert a mock KPI or filler card to match a template.

## 3. Archetype contracts

### Hub
- Answer "What can I learn next?" in the first viewport. One obvious continuation action.
- Curated options should be real navigable data. A welcoming scene is allowed; avoid analytics dashboard walls.

### Collection / Index
- Filter/search are close to items and retain correct query/paging semantics. Separate empty and filtered-empty states.
- Use existing StudentDataList for compact comparable items; grid when artwork/item identity justifies tiles.
- A shared toolbar may coordinate search/filter/order but must not own feature-specific API logic.
- Scannable title, metadata and action; mobile rows do not hide essential information.

### Detail
- Show contextual back navigation, identity, core attributes and action before long supporting content.
- Unit/word artwork is meaningful; no duplicate hero if the content cover is already the anchor.

### Workspace & Assessment
- Keep prompt and response area primary. Navigation/feedback/timeout remain the accepted domain contract.
- Immersive mode can hide normal shell and show a scene, but retains shared typography roles, contrast, focus and status semantics.
- Never let mascot, animations or decorative media interfere with composing answers or reading correctness feedback.

### Review / Result
- Explain the truthful outcome, incorrect reasoning and next learning step.
- Earned celebration only on confirmed outcomes; incorrect results use supportive, non-shaming copy.

### Identity / Insights
- Avatar/progress/data already provide visual focus. Decorative Pipo is optional, not a quota.
- No fabricated streaks, grades, rankings or charts to fill space.

### Game Experience
- Playful motion/scene is permitted if purposeful; share the same Student identity, semantic colors, accessibility and core feedback.
- Use a dedicated Game scene instead of importing a new UI framework/theme. Reduced motion and mobile controls required.

## 4. New-page decision sequence

1. Read AGENTS.md, accepted ADRs, relevant domain spec, canonical visual spec and STUDENT_VISUAL_STORYTELLING.md.
2. Write one Screen Brief + Page Visual Brief; declare archetype, user goal, real data, primary action, focal visual and mobile behavior.
3. Inspect at least one reference page of the same archetype and inventory reusable components/assets.
4. Reuse tokens, shared primitives and established patterns. Create a new component only for recurring UI responsibility, not for page-local styling.
5. Implement responsive/keyboard/states. Test against Teacher scope and Activity/Assignment domain rules.
6. For a new archetype, document the missing use case and alternatives; get design review before adding it.

## 5. Page Brief template

~~~text
Route / feature / owner:
User goal and task success:
Archetype (why):
Primary action and information hierarchy:
Existing references / components / assets reused:
Page Visual Brief (link or inline; meaningful anchor or focus exception):
Source of truth for data (no mocks):
Mobile (360/390) and desktop composition:
Loading / empty / filtered-empty / error / disabled / success:
Keyboard / touch / focus / accessible text / reduced-motion:
Teacher regression surface:
Open questions and scope exclusions:
~~~

## 6. Reference pages and adoption (later phases)

- Hub: Learning Hub.
- Collection: Vocabulary Word Library and Activity History; apply a common data-list pattern after validating different filter needs.
- Detail: Unit Detail / UnitCover.
- Workspace: Vocabulary Learn/Review.
- Immersive: Activity runtime and Assignment attempt (different domain semantics remain unchanged).
- Identity/Insights: Profile and vocabulary botanical progress.
- Game: current Game Hub is known visual drift; use it as a migration candidate, not the styling reference.

Design Phase 4 should implement a **minimal** set of reusable patterns proven by these examples; avoid inventing abstractions for future speculative pages (Mistake Notebook, AI Tutor etc.).

## 7. Acceptance

- One Student identity, not route-specific color/font sets.
- Distinct information structure where warranted; no forced repetitive banner.
- A purposeful visual anchor or documented high-focus exception, with responsive fallback.
- Real data, no feature/domain invention.
- Shared states, accessible interactions and Teacher isolation.
- All migration and validation claims must refer to actual code/browser/test evidence, never to these documents alone.
