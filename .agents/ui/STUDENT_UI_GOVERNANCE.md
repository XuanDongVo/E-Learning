# Student UI Design Governance — Phase 6E

**Status:** Active manual process for new or materially changed Student UI.
**Scope:** Student routes and Student-facing components, visual assets and UI behavior.
**Authority:** Accepted [ADR 0032](../decisions/0032-student-indie-scrapbook-visual-system.md) defines the exclusive Indie Illustrated Scrapbook identity; domain/phase specs govern feature behavior. This document governs **how changes are proposed, reviewed and accepted**, not a new color/font system or alternative design specification.
**Audience:** Human contributors, designers, reviewers and coding agents.
**Entry points:** [AGENTS.md](../../AGENTS.md), [frontend AGENTS.md](../../client-e-learning/AGENTS.md), [PR template](../../.github/pull_request_template.md).
**Copyable artifact:** [Student Page Brief template](./templates/STUDENT_PAGE_BRIEF_TEMPLATE.md).

## 1. What is required, and when?

| Change type | Before coding | PR evidence | Review gate |
|---|---|---|---|
| **New Student page / new user journey** | Full Screen Brief + Page Visual Brief; select an archetype and data ownership | Link or paste completed brief, reuse map and viewport/state evidence | Must pass all applicable gates |
| **Material redesign / change of page archetype** | Update existing brief or create one; document before/after goal and tradeoffs | Before/after images where test environment permits, changed behavior and preserved contracts | Must pass all applicable gates |
| **Student shared component or token** | Define semantic responsibility, existing consumers and reuse need | Consumer inventory, affected pages, regressions including Teacher/portals | Must pass shared-component gate |
| **New/edited mascot, illustration, SVG or animation** | Identify role, approved registry ID / provenance and visual fallback | Rights record + asset gallery/screenshot + alt/decoration decision | Must pass artwork gate |
| **Small local bugfix, copy or metadata adjustment** | A short Screen Brief inline in PR is enough; mention archetype if relevant | Focused before/after or reproduction + checks | No full Page Visual Brief if visuals/composition unchanged; explain "not applicable" |
| **Docs-only / backend-only** | No Student screen brief required | State why Student visual review is not applicable | No Student-specific visual gate |

Teacher UI retains its visual identity. Student-only decoration, typography and theme must not leak into Teacher or globally scoped portals.

## 2. Canonical reading & decision order

Read relevant **existing** sources before authoring a new visual recipe:

1. [AGENTS.md](../../AGENTS.md), active feature spec, domain rules and relevant accepted ADRs; code is evidence of what exists, not a license to invent features.
2. [UI Architecture Guidelines](./UI_ARCHITECTURE_GUIDELINES.md) for Screen Brief, navigation, states, accessibility and shared behavior.
3. [Student Page Archetypes](./STUDENT_PAGE_ARCHETYPES.md) for user-goal-driven page composition; [Phase 4 Patterns](./STUDENT_PAGE_PATTERNS_PHASE_4.md) for existing reusable presentation primitives.
4. [Indie Illustrated Scrapbook](./INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md) for **single visual identity**, role typography, tokens and surface hierarchy.
5. [Visual Storytelling](./STUDENT_VISUAL_STORYTELLING.md) for Pipo/scene/visual-anchor decision; [Asset Rights](./STUDENT_ASSET_LICENSES.md) and [registry](../../client-e-learning/src/lib/student-visuals/registry.ts) for approved artwork.
6. [Definition of Done](../checklists/definition-of-done.md) for project-wide release criteria.

Do **not** rewrite those design standards in this file. If two accepted documents genuinely conflict, follow the precedence in AGENTS.md: stop, ask for the product owner's decision, and update the appropriate ADR/active spec. A page-local PR is not authority to redefine the Student brand.

## 3. Required workflow for a Student page

```text
User goal + real product contract
        ↓
Screen Brief → Page Archetype (existing or justified new)
        ↓
Reusable-pattern inventory → Visual Brief / focus exception
        ↓
Page implementation (real data, states, mobile, access)
        ↓
Evidence & review (Student + Teacher when impacted)
        ↓
Fix blockers → Merge
```

### Step 1 — Goal and ownership

Describe the primary user task in one sentence and define success. Identify route, feature owner and data source (server response, existing state or content-owned media). Specify **one dominant task/action**, not an artificial requirement to limit navigation to one button.

Do not add invented XP, streak, unit count, progress, AI tutor behavior, API fields or navigation as filler. Activity and Assignment remain independent domains.

### Step 2 — Choose an archetype, not a new look

Choose Hub, Collection/Index, Detail, Workspace, Assessment/Immersive, Review/Result, Identity/Insights or Game Experience based on the user goal. Multiple patterns may compose a page, but one is the primary task.

Consult reference pages, choose existing `components/student-ui` primitives and the Phase 4 patterns (`StudentPageHeading`, `StudentBackLink`, `StudentCollectionPanel`, `StudentCollectionEmptyState`, `StudentDataList`, etc.) when they actually fit. Feature-local API, filtering, paging and scoring remain feature-owned.

**Do not** build a generic page mega-component, copy the same hero/Pipo to every route, or create a new pattern for a single page-local layout quirk. A new shared pattern needs at least two plausible real consumers **or** a strong behavioral/a11y standardization reason recorded in the PR.

### Step 3 — Decide visual storytelling deliberately

Every ordinary page identifies a meaningful visual anchor **or** a data/identity visualization (image, authentic diagram, cover, Pipo, illustration, real chart). High-focus Workspace/Assessment can intentionally have **no decorative visual** if this preserves comprehension; state that reason in the brief. No mascot quota.

Reuse first: existing feature-owned educational imagery → approved `studentVisualRegistry` asset → existing Pipo expression/prop → request a new asset if a semantic gap remains. Existing educational content must not be replaced with decorative art.

For new artwork, document creator/source, exact rights/license or in-repo original provenance, modifications, intended usage, `alt`/decorative semantics, mobile fallback and reduced-motion. Unknown external rights are **not approved** for production. Use the single Indie Illustrated Scrapbook art direction; no third-party mixed-style collage.

### Step 4 — Implement responsibly

Keep typography, paper/material vs emphasis, controls and motion within Student-scoped tokens. Readability and keyboard/focus matter more than washi, shadow or texture. The type of page determines density, not a second palette.

Document and implement data-driven states: loading, empty, error, disabled and success where applicable, including **filtered-empty**, retry or reset where useful. A visual cannot be the only status/error signal. For a page with only static content, mark genuinely inapplicable states N/A with a reason instead of adding fake UI.

Design mobile-first at **360/390px**, then validate **768/1024/1440px**. Actual browser viewport testing is required; Design Lab's inner-width preview is insufficient. Prevent hidden actions, clipped content, unreadable backgrounds and target sizes below 44px.

### Step 5 — Review actual evidence

PRs include the completed brief (or explicit small-change exemption), changed route(s), reused primitives/assets, source of truth, screenshots for meaningful visual changes **when a runnable environment exists**, test/viewport evidence, and anything not verified. Avoid screenshots with real user data or secrets.

Check at least one relevant reference route, the changed route, meaningful UI states, and Teacher isolation when touching scoped CSS/shared components. Do not mark a gate passed because files or tests were merely added.

### Step 6 — Record decisions and finish

Reviewers check task clarity, composition, visual coherence, rights, a11y, states and regression. Resolve blockers before approval. Add a new ADR **only** when changing an accepted product-wide rule, not for every screen. Update docs when a pattern/asset contract genuinely changes, and `PROGRESS.md` with checks actually run.

## 4. Review responsibilities

| Role | Responsibility |
|---|---|
| Feature author / coding agent | Complete relevant brief, inspect reuse, implement within scope, attach evidence, mark unknown checks honestly |
| Reviewer (frontend/UI) | Challenge layout hierarchy, reusability, mobile/keyboard, consistency, CSS/portal leakage and screenshot quality |
| Product owner / domain reviewer, **when needed** | Resolve scope, product contract, new archetype or visual-brand changes and contradictory ADR/spec requirements |
| Asset contributor/reviewer, **when needed** | Confirm visual style, provenance, licensing/attribution, accessibility and asset registry entry |

These are **review functions**, not a claim that CODEOWNERS, mandatory approvals or an automated GitHub gate already exist. Do not invent a required named approver.

## 5. Manual PR review gates

A reviewer checks these in the PR checklist, using [Definition of Done](../checklists/definition-of-done.md) for the full module-level gates.

| Gate | Evidence | Blocking condition |
|---|---|---|
| **Goal & truth** | Screen Brief, API/data source, clear primary task | Fabricated data/feature, changed assessment/ownership contract without approval |
| **Archetype & reuse** | Existing pattern/asset comparison; reason for any new primitive | Duplicate competing design system, unjustified page copy of existing shared interaction |
| **Design identity** | Student-scoped typography/palette/surface hierarchy + visual decision | New unauthorized palette/font/mascot language; decoration obstructs tasks |
| **States & accessibility** | Status and recovery states, labels/alt, keyboard/focus, real mobile viewport | Essential inaccessible content/controls, missing critical error/recovery path |
| **Assets & rights** | Approved registry/provenance and attribution when required | Unknown external rights or mixed unrelated style in production |
| **Regression** | Relevant Student journeys, Teacher/shared/portal where affected, test/build results or disclosed blockers | Known major regression or assertion of tests that did not run |

**Issue policy:** P0 = blocks task completion, correctness, access/security, accessibility of an essential action or rights compliance; never approve with a P0. P1 = significant repeated usability problem, broken mobile layout or cross-page inconsistency; fix before merge for the affected journey, or record a product-owner-approved, time-bound exception with a real follow-up issue when noncritical. P2 = polish, decorative nuance or minor density variance; may be scheduled after merge. Do not relabel an untested screen as "passed".

**Evidence status:** `Verified` (actual command or screenshot/device test), `Pending` (must run), `Not applicable` (explained). An explicit pending check is transparency, not a green approval.

## 6. Smallest-change and exception rules

- Pure copy fixes or bugfixes need only the short brief and focused checks; a full asset proposal adds no value.
- A shared component visual change still requires at least the known consumers and Teacher leakage check, even if a screen brief is not needed.
- A deliberately image-free focused page is acceptable with a rationale; do not add decoration just to satisfy a checklist.
- Do not ship a new Pipo pose/scene or swap lesson imagery without a clear user purpose and provenance.
- Document design tradeoffs once in the PR. Do not add a new ADR or duplicate long checklist files unless a product-wide accepted decision changes.
- If browser or authentication test access is unavailable, describe the limitation and leave relevant release checks pending; do not claim sign-off.

## 7. What Phase 6E does **not** implement

This governance change is **documentation and a human PR checklist only**. It does not add GitHub branch protection, required status checks, new lint rules, Playwright snapshots, visual-regression automation, CI jobs, UI screens or a new set of React components. Those are separate Phase 6A–6D/6F tasks and require explicit scope.

**Success criterion for Phase 6E:** Every substantial new Student page can be designed and reviewed from a consistent brief using existing tokens, archetypes, patterns and approved visuals, with evidence and exceptions visible in the PR.
