# UI Architecture Guidelines

**Status:** Source of truth for shared UI architecture and Teacher styling; Student visual identity governed by ADR 0032 and INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md (2026-11-07)  
**Applies to:** Teacher UI and Student UI  
**Audience:** Developers and AI agents who create or modify any screen

> Goal: every screen looks like it belongs to **one** product. Structure comes from proven
> education products; values (color, size, radius) come only from the project tokens.
> Nothing in this product should look like a one-off, generated screen.

---

## 0. How to use this document

### 0.1 Precedence

When two sources disagree, the higher one wins.

1. **Domain model and phase specs** (`AGENTS.md`, `.agent/plans/*`) decide *what* a screen is for.
2. **This document** decides *how* it is structured and styled.
3. **Tokens in `globals.css`** are the currently implemented values (Section 3); Student-scoped overrides follow ADR 0032 after implementation. Canonical Student appearance is defined in [Indie Illustrated Scrapbook](./INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md).
4. **Existing shared components** (`components/ui`, shared feature primitives) are reused before anything new is built.
5. **Generic UI tools and skills** (for example `ui-ux-pro-max`) may be used to *check* states, accessibility and hierarchy. They must **not** introduce a new palette, font pairing, radius scale or layout pattern. Their "define a design direction" step means *choose a pattern from Section 5 and Section 9*, not invent one.

### 0.2 Before building any screen

Write a five-line **Screen Brief** in the PR description or task notes:

```text
User:            Teacher | Student
Goal:            what the user must be able to finish
Page type:       List | Detail | Editor | Dialog | Student flow (Section 5)
Primary action:  exactly one
States covered:  loading, empty, error, disabled, success (Section 6.10)
```

If the brief cannot be written, the screen is not ready to be designed.

---

## 1. Main principle

```text
User → Goal → Information Architecture → User Flow → UI
```

Do **not** start from decoration. Prioritize, in this order:

1. **Readability and clear hierarchy**
2. Simple workflows (fewest steps to the goal)
3. Consistency (same problem → same pattern → same component)
4. Scalability (new features fit without redesign)
5. Educational usability (a teacher or a 12-year-old understands it without help)

**Readability is a product requirement, not decoration.** A user should be able to scan the screen and
understand its purpose, primary action and important state in about three seconds.

**Visual structure is information.** A border, divider, badge, number or label must tell the user
something. If removing it loses no meaning, remove it.

**Prefer hierarchy through typography, spacing and alignment before adding color, containers or shadows.**

## 2. Product structure and navigation

### 2.1 Domain hierarchy

```text
Grade
 └── Unit
      ├── Content
      │    ├── Section
      │    ├── Topic
      │    └── Question Bank
      │
      └── Activities            (placed under a Unit)
           ├── Learning Mode
           ├── Try Hard Mode
           └── Game Experience  (optional layer)
```

`Activity` and `Assignment` are **independent**. Never build one screen or form that mixes them.

```text
Activity   = "Do this to learn, practice or play."   → repeatable, no deadline, no official grade
Assignment = "You must complete this by a date."      → class/student target, one attempt, official score
```

Games are an **experience layer of an Activity**, not a top-level product area (see 2.3).

### 2.2 Teacher navigation (target)

```text
Overview     Dashboard
Teaching     Classes · Students
Content      Content · Activities · Assignments
Insights     Reports
             Settings
```

### 2.3 Navigation rules

- The sidebar lists **real routes only**. A planned feature is hidden or shown disabled with a "Soon" tag. Never link to `#anchor` placeholders.
- **No top-level "Games" item.** Future game presentation may be chosen inside an Activity; future game presentation is deferred and is not a current domain dependency. Student-facing games appear under Activities.
- The active item is derived from the current route, not hard-coded.
- Labels are nouns, sentence case, one or two words: `Content`, `Activities`, `Assignments`.
- Depth is shown with breadcrumbs, never by adding more sidebar levels.

### 2.3.1 Student navigation (target)

```text
Home · Learning · Assignments · Progress · Rewards · Profile
```

Student navigation uses the same brand/tokens and route-derived active-state rules.
Its Home is a **Learning Hub** focused on choosing real Unit content, not an
analytics dashboard. See `ui/STUDENT_LEARNING_HUB_BLUEPRINT.md` for the active
Student screen and route contract; Profile remains reachable from the account area.

---

## 3. Design tokens

Tokens live in `globals.css`. **Raw palette utilities are forbidden in feature code**
(`text-slate-400`, `bg-emerald-50`, `border-rose-300`, `#hex`, `rgb()`), as are arbitrary sizes
(`text-[11px]`, `h-[37px]`). Use a token or propose a new one (3.8).

### 3.1 Current implemented semantic colors — Teacher/base and Student-scoped overrides

**Implementation note:** This table describes the global/Teacher palette in `client-e-learning/src/app/globals.css`. Student routes override the same semantic roles inside `styles/student/theme.css` under `.student-theme`/the active Student body scope. ADR 0032 and the Indie Illustrated Scrapbook specification decide Student appearance; feature code in either workspace consumes semantic aliases and must not copy either palette as raw values.

| Current CSS variable | Current value (light theme) | Meaning | Usage |
|---|---|---|---|
| `--primary` | `#F0652F` | Shared LearnUp orange | Primary actions, active navigation, focus |
| `--primary-hover` | `#DE5523` | Orange interaction | Hover/pressed |
| `--primary-soft` | `#F0652F1F` | Orange tint | Selected state, low-emphasis emphasis |
| `--background` | `oklch(98.5% 0.006 95)` | Warm page background | Both workspaces |
| `--card` | `#FFFFFF` | Content surface | Self-contained content |
| `--foreground` | `#2B2220` | Warm ink | Primary text |
| `--muted-foreground` | `#6F625B` | Supporting ink | Secondary text |
| `--secondary` | `#FFF5E9` | Warm cream surface | Secondary actions/surfaces, **not Learning mode** |
| `--accent` | `#F0A81C` | Reward amber | XP, streak, reward milestones, attention |
| `--learning` | `#2F7FE0` | Learning blue | Student learning context and progress |
| `--learning-soft` | `#2F7FE01F` | Learning tint | Contextual student surfaces |
| `--success` | `#2F9A5E` | Success | Correct/completed |
| `--warning` | `#F0A81C` | Warning | Warnings and Try Hard timer attention |
| `--destructive` | `#D93F3F` | Destructive/error | Invalid, incorrect, destructive |
| `--info` | `#2F7FE0` | Information | Informational feedback |
| `--border` | `#462D142B` | Structural border | Separators, cards |
| `--input` | `#462D1433` | Control boundary | Form controls |

Use the registered Tailwind semantic aliases in `globals.css` (e.g. `bg-primary`,
`bg-primary-soft`, `bg-learning`, `text-foreground`, `text-muted-foreground`,
`bg-card`, `border-border`). Compatibility aliases such as `primary-light`,
`neutral-dark`, `neutral-muted`, `background-app`, `card-bg`, and
`border-color` resolve through the same theme and may be migrated gradually.
Do **not** assume `secondary` means cyan: its current role is warm cream.

**Color budget**
- Teacher: mostly neutral; LearnUp orange only for actions/selection; semantic status colors only
  when communicating status. No game styling.
- Student: warm paper and graphite ink dominate; clay is the primary action,
  faded denim communicates learning, mustard communicates XP/streak/reward, and
  success/error colors appear only when the outcome calls for them.
- Never use blue or amber as a competing primary CTA color. Never assign random
  bright colors by list index or screen.

### 3.2 Contrast and accessibility

Use WCAG 2.1 AA: text ≥ 4.5:1 (large text ≥ 3:1); meaningful UI boundaries
and non-text indicators ≥ 3:1. **Recalculate contrast for the current computed
token values, including light/dark themes and overlays.** Historical contrast
ratios measured against the superseded indigo/cyan theme are not valid evidence.

- Use `primary-foreground`, `secondary-foreground`, `accent-foreground`
  and other matching foreground tokens on filled surfaces; verify the rendered pair.
- Never assume amber/blue/green text on white, or white text on a status fill,
  automatically passes.
- Muted text remains meaningful: test contrast rather than using decorative
  opacity for instructions, scores, dates or errors.
- Control boundaries and keyboard focus must remain visible. A divider's contrast
  requirement is different from an input's.
- Never communicate correctness, rank changes or warnings by color alone:
  pair color with a label/icon and accessible text.

### 3.3 Tokens and naming (existing, not proposed)

`globals.css` already defines semantic status colors, foreground pairs,
soft variants, chart colors and the warm brand. **Do not copy the former
indigo/cyan token proposal from this document into CSS.**

- Prefer existing `primary[-soft|-hover|-foreground]`, `learning[-soft]`,
  `accent[-foreground]`, `success[-soft]`, `warning[-soft]`,
  `destructive[-soft|-foreground]`, `info[-soft]` and form/border tokens.
- Add missing semantic aliases only through a separate token-governance change
  with contrast evidence, usage examples and dark-mode behavior.
- Raw hex colors and Tailwind palette utilities are not a feature-level styling API.
- Current code containing older indigo/raw colors is **migration debt**, not an
  alternative Student theme.

### 3.4 Status vocabulary (one meaning, one color)

| Meaning | Surface | Text/icon strategy |
|---|---|---|
| Draft / Archived | Neutral | Muted text + explicit lifecycle label |
| Published / Ready / Correct | `success-soft` if useful | `success` plus check icon/label; verify contrast |
| Needs attention / timer warning | `warning-soft` | Warning label/icon; separate from lifecycle |
| Error / Blocked / Incorrect | `destructive-soft` | Error label/icon, actionable explanation |
| Selected / Primary action | `primary-soft` or `primary` | Shared orange, visible focus |
| Learning context | `learning-soft` | Blue used only as learning cue |
| XP / Streak / Reward | `accent` or a suitable soft surface | Amber plus numerical/unit label |

Status must never substitute for lifecycle, and reward must not resemble an error
or teacher operational warning. Use text/icon first; avoid redundant badge walls.

### 3.5 Typography — current Teacher/base implementation

The **current Teacher/base** uses **Plus Jakarta Sans** (`--font-jakarta`). Student typography is implemented as scoped roles in `styles/student/typography.css` and defined exclusively by the Indie Illustrated Scrapbook visual specification. The table below remains the Teacher/base reference; Student feature code uses `student-page-title`, `student-section-title`, `student-card-title`, `student-body`, `student-label`, `student-meta`, `student-caption` and `student-stat` rather than Tailwind default or arbitrary type sizes.
Do not use Tailwind defaults (`text-xs`, `text-sm`, `text-base`) or arbitrary pixel sizes in feature code.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 48 / 1.08 | 800 | Student result and celebration screens only |
| `page-title` (= `ui-3xl`) | 30 / 1.2 | 800 | The single `h1` of a page |
| `ui-2xl` | 24 / 1.25 | 800 | Large numerals (score, XP, stat values), student step headings |
| `section-title` (= `ui-xl`) | 20 / 1.3 | 700 | Section headings, dialog titles |
| `ui-lg` | 18 / 1.35 | 700 | Sub-section headings in editors and side panels |
| `card-title` | 16 / 1.35 | 700 | Card titles, list-item titles |
| `body` | 14 / 1.5 | 400 · 600 | Default text, form labels (600), buttons (600), table cells |
| `body-sm` | 12 / 1.45 | 400 · 600 | Meta, helper text, timestamps, table sub-lines |
| `label` | 11 / 1.4 | 600 | Table column headers, badge text, chart axis labels |
| `caption` | 10 / 1.4 | 600 | Dense count chips only; never a sentence |
| `micro` | 9 / 1.35 | 700 | Notification dots and counters only |

Rules:

- `ui-3xl`/`page-title` and `ui-xl`/`section-title` are the same size. Use the **semantic** names; `ui-*` are legacy aliases.
- Exactly one `page-title` per page.
- **Instructions, errors, helper text and any sentence are ≥ `body-sm` (12px).** `label`, `caption`, `micro` are for non-essential, short labels.
- Weights allowed: 400, 600, 700, 800. Titles 800/700, controls and labels 600, text 400.
- Avoid ALL-CAPS labels and tracked-out "eyebrow" text above titles. Use a breadcrumb instead (Section 5.2). All-caps is allowed only for true acronyms.
- Line length for reading text ≤ 75 characters (`max-w-prose` or equivalent).
- Numbers in tables and scores use tabular figures (`tabular-nums`).

### 3.6 Spacing

4px base grid. Use these steps only.

| Step | px | Typical use |
|---:|---:|---|
| 1 | 4 | Icon to text inside a badge |
| 2 | 8 | Between related controls; inline gaps |
| 3 | 12 | Label to control; compact list item padding |
| 4 | 16 | Between form fields; card inner groups; mobile page padding |
| 5 | 20 | List-card padding |
| 6 | 24 | Between page sections; desktop page padding; dialog padding |
| 8 | 32 | Between major page regions |
| 10–12 | 40–48 | Student hero spacing, empty-state breathing room |

Rule of thumb: **space between groups is always larger than space inside a group.**

### 3.7 Radius, borders, elevation, motion, icons

**Radius.** Rounded corners are an exception, not the visual default.

| Token | px | Tailwind utility | Use |
|---|---:|---|---|
| `radius-sm` | 8 | `rounded-lg` | Inputs, buttons, small interactive controls |
| `radius-md` | 12 | `rounded-xl` | Dialogs and rare self-contained cards |
| `radius-lg` | 16 | `rounded-2xl` | Large Student surfaces only |
| `radius-xl` | 20 | `rounded-[var(--radius-xl)]` | Game/celebration surfaces only |
| full | – | `rounded-full` | Badges, avatars, progress indicators |

**Teacher default:** structural containers are square/flat. Do **not** round tables, page sections, toolbars,
sticky headers, dividers, side rails or navigation groups.

Forbidden: `rounded-md`, `rounded`, `rounded-3xl`. Do not use `rounded-xl` just to make a normal
section look polished.

**Borders.** Use 1px `border-border-color` only when it clarifies a boundary. Prefer a single divider
between sections over a bordered box around every group. No double borders.

**Elevation.** Flat by default; hierarchy comes from spacing, typography and alignment.

| Level | Utility | Use |
|---|---|---|
| 0 | none | Page sections, tables, panels, navigation |
| 1 | `shadow-sm` | Sticky headers and genuinely interactive surfaces |
| 2 | `shadow-md` | Dropdowns, popovers |
| 3 | `shadow-xl` | Dialogs |

No colored glow shadows in Teacher UI.

**Motion.** 150–200ms, ease-out, for user-triggered state changes. No entrance animations on Teacher pages.
Honor `prefers-reduced-motion`.

**Icons.** `lucide-react` only. 16px inline with text/buttons; 20px in navigation; 24px+ mainly in
Student UI and empty states. Icon-only controls require `aria-label`. Do not decorate every heading.

### 3.8 Token governance

Need a value that does not exist? In this order:

1. Use the closest existing token.
2. Compose existing tokens (for example `bg-primary-light text-primary`).
3. Propose a new token: add it to `:root` and `@theme`, document it in this file with its contrast ratio, and use it in at least two places.

Never add a one-off hex in a component.

---

## 4. Responsive and density

Breakpoints are Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

| Surface | Primary device | Minimum supported | Density |
|---|---|---|---|
| Teacher | Desktop | Tablet (≥ 768) | **Readable compact:** efficient tables/forms without crowding |
| Student | Phone / tablet | Phone (≥ 360) | Comfortable: larger targets, more space |

- Control heights: `sm` 32px for dense secondary controls, `default` 40px, `lg` 48px for Student primary actions and touch screens.
- Touch targets: ≥ 40px on Teacher tablets, ≥ 44px on Student. Spacing between adjacent targets ≥ 8px.
- **Compact never means tiny.** Do not reduce type, line-height or padding just to keep more items on screen.
- A Teacher screen should normally have one dominant content area and at most one supporting rail.
- Filters and toolbars may wrap into two rows when needed. Never compress unrelated controls into one cramped line.
- Below `lg`, navigation collapses into a drawer opened from the header.
- Wide content scrolls inside its own `overflow-x-auto` container. The page never scrolls sideways.
- Below `md`, tables degrade to stacked rows or drop low-priority columns. Do not shrink text to fit.
- Never hide an error or required-field message in a hover tooltip.

## 5. Layout architecture

### 5.1 App shell (shared by Teacher and Student)

```text
┌────────────┬───────────────────────────────────────────┐
│            │ Header  64px  (context · user menu)       │
│ Sidebar    ├───────────────────────────────────────────┤
│ 240px      │ Main    padding 24px (16px below md)      │
│ (≥ lg)     │   centered content                        │
└────────────┴───────────────────────────────────────────┘
```

- Sidebar: 240px, `card-bg`, 1px right border, 16px inner padding. Logo at top, grouped nav, account/switch at bottom.
- Header: 64px, `card-bg`, 1px bottom border.
- Main: `background-app`. The layout owns page padding; pages do not add a second outer padding.
- Content container: `max-w-7xl`, centered, with clear vertical spacing between regions.
- Navigation is flat: no pill-shaped nav groups. Active Teacher navigation uses `primary-light` + `primary`
  and may use a 2px leading border; inactive items stay neutral.
- Teacher uses `primary` as its only saturated action/active color. `learning` is reserved for Student
  Learning context; `secondary` is a warm neutral surface, never a cyan brand.
- Structural containers do not need rounded corners. Use spacing, dividers and alignment to establish hierarchy.

### 5.2 Page anatomy

Every page follows the same top-to-bottom order:

```text
Breadcrumb (when depth > 1)
Page title (page-title)                        [Primary action]
Optional one-line description (body, muted)
────────────────────────────────────────────────────────────
Toolbar / filters (lists only; may wrap)
Content
Pagination / footer actions
```

- One primary action per page region, top-right of the header.
- Secondary actions are `outline` or `ghost`.
- The toolbar is allowed to wrap to a second row. Group related filters together; do not force search,
  selects and view controls into one cramped line.
- A description explains the page in one sentence, or is omitted.
- Operational screens do not use hero banners, decorative KPI blocks or marketing copy.
- Every page needs a visible hierarchy: context → title → primary action → main content → supporting details.

### 5.3 Page types

Every Teacher screen is exactly one of these. Pick the type, then use its template.

**A. List page** (Activities, Classes, Students, Assignments, Question banks)

```text
Header [+ Create]
Toolbar: search · status · domain filters
Table
Pagination
```

- Use a **table** when records are comparable. Use cards only for navigable "places" such as classes or units.
- Keep a **column budget of about 4–5 primary columns**. Move low-value details into the primary cell or detail page.
- The first column carries the main identity and one short secondary line at most.
- Status should be quickly scannable but not turn every row into a cluster of colorful pills.
- Default sort: most recently updated. Archived items are hidden unless the status filter asks for them.
- Row click and the name link open the detail/editor. Row actions end the row.

**B. Detail page**

```text
Breadcrumb · Title · Status · Actions
Optional tabs for sibling views
Overview / primary content
Supporting sections
```

- The first viewport should answer: what is this, where does it belong, what is its current state, what can I do?
- Do not put every attribute into a card/grid row. Use readable sections and definition lists.
- Tabs are for genuinely different sibling views, not for hiding a handful of fields.

**C. Editor page**

```text
Sticky header: Back · Name · lifecycle · [Save]
Main content column (readable width)
  Section: Basics
  Section: Sources
  Section: Rules
  Section: Mode
Optional supporting summary
```

- The main editing column is the focus. A summary rail is **optional**, not mandatory.
- Prefer section headings, dividers and whitespace over bordered cards.
- Use a supporting rail only when it reduces repeated scanning; it should not compete with the form.
- Below `lg`, supporting content moves below the main content or into a compact summary.
- Dirty-state guard and server-authoritative validation remain mandatory.
- Publish is disabled while the form is dirty or unsaved, with the reason visible.

### 5.4 Cards: when and how

A card is a **single self-contained object or interaction**. It is not the default wrapper for a section.

- Structural page sections should usually be plain surfaces separated by spacing/dividers.
- When a card is necessary: `card-bg`, 1px border, `radius-sm`, comfortable padding, no shadow by default.
- Never use cards inside cards.
- Never turn every form section, metric or row into a separate rounded container.
- Avoid card walls. One strong content area is easier to scan than six small panels.

## 6. Component standards

Build these once as shared primitives and reuse them. A feature that needs a variant extends the primitive; it does not fork it.

### 6.1 Button

| Variant | Use | Limit |
|---|---|---|
| `primary` | The one main action of a region | 1 per region |
| `secondary` | Important, non-primary action | – |
| `outline` | Cancel, back, neutral actions | Default for secondary actions |
| `ghost` | Tertiary, icon, toolbar actions | – |
| `danger` | Destructive **confirmation** only | Inside a confirm dialog |
| `teal` / `amber` / `inverted` | Student reward/game surfaces and dark surfaces only | Not in Teacher forms |

Sizes: `sm` 32px, `default` 40px, `lg` 48px, `icon` 40px square. Radius per 3.7. Label is a verb:
`Create activity`, `Save draft`, `Publish`, `Archive`. While submitting: keep the label, show an inline spinner, disable the button.
Fills for `teal`/`amber` use dark text (3.3).

### 6.2 Badge and status chip

One `Badge` primitive, tones taken **only** from 3.4: `neutral`, `success`, `warning`, `danger`, `info`,
plus mode tones below. Text is `label` (11px, 600), `rounded-full`, `px-2 py-0.5`, optional 12px icon.

Activity mode tones: **Learning** → `learning-soft` + a verified readable foreground; **Try Hard** → `warning-soft` + a verified readable foreground.
An Activity that offers both modes shows **two chips** (`Learning` `Try Hard`), not a third color or a "Both" chip.

### 6.3 Form controls

- Structure: label (`body`, 600) above the control, optional helper (`body-sm`, muted) below, error (`body-sm`, a contrast-verified destructive foreground, with an icon) replacing the helper.
- Control: 40px tall, `radius-md`, `card-bg`, 1px `border-input`, `px-3`, `body`. Placeholder uses `neutral-subtle` and never carries required information.
- Focus: **visible ring** (`focus-visible:ring-2 ring-primary ring-offset-2`) in addition to the border change. Do not remove the outline without replacing it.
- Disabled: `neutral-subtle` text, `background-app` fill, and a reason when it is not obvious.
- Validate on blur and on submit, not on every keystroke. Keep all entered values after an error.
- Selection groups with 2–5 mutually exclusive options that need explanation use **selectable option rows** (radio semantics, `primary-light` + `primary` border when selected), not a dropdown. Example: Mode (Section 9.2), Distribution, Selection strategy.
- Numeric inputs show the unit next to the field (`seconds`, `%`, `questions`).

### 6.4 Table

- Container: `card-bg`, 1px border, **square corners**, `overflow-hidden`; scroll wrapper inside.
- Header row: `background-app`, `label` text in `neutral-muted`, normal case.
- Rows: 48px minimum, `body`, bottom border `border-color`, hover `background-app`. No zebra striping.
- Primary column is a link (`body`, 600, `neutral-dark`). Secondary lines use `body-sm` muted.
- Keep columns to the information needed for scanning. If a value is rarely used, move it to the detail page.
- Numeric columns are right-aligned with `tabular-nums`. Status columns use compact status text or a Badge when comparison requires it.
- Actions column last, right-aligned.
- Sorting and filtering are explicit controls; never implicit.
- Do not add rounded status chips to every row just to create visual variety.

### 6.5 Tabs, filters, pagination

- Tabs: underline style, `body` 600, active `primary` with a 2px underline.
- Filters: search first, then related selects. The toolbar may wrap. Controls use `default` height and `radius-sm`.
- Keep filter controls visually quieter than the page title and primary action.
- Applied filters are visible; provide `Clear filters` when useful.
- Pagination: `Previous` / `Next` + `Page x of y`, separated from table content by spacing rather than a rounded container.

### 6.6 Dialog

- Use the Radix `Dialog` primitive already in the project (focus trap, ESC, `aria-*`), not hand-rolled `fixed inset-0` divs.
- Overlay `neutral-dark` at 40% opacity. Panel `card-bg`, `radius-lg`, `p-6`, `shadow-xl`, width `max-w-md` (confirm/short form) or `max-w-lg`.
- Title `section-title`; one sentence of description; footer right-aligned `[Cancel]` (outline) `[Confirm]` (primary or danger).
- A destructive confirm names the object and the consequence: `Archive "Past Simple Practice"? Students will no longer see it. Past results are kept.`
- Full-screen overlays (Student preview, game) are allowed only for immersive content, with a visible close button.

### 6.7 Toast (Sonner, bottom-right)

- Success: one short past-tense sentence. Error: what failed + what to do next.
- Never use a toast for a field error or for information the user must keep (use inline text or an alert).

### 6.8 Alert / banner

Inline, above the affected content: icon + title (600) + one line + optional action. Tones: info, success, warning (`accent-light`), danger (`danger-light`). Use `role="alert"` for errors. A published Activity whose sources are short shows a warning banner with the affected source and a `Review sources` action.

### 6.9 Progress and feedback

- Linear progress for known steps (question 7 of 20); ring or bar for mastery. Always show the number next to the bar.
- Correct/incorrect feedback uses `success`/`danger` **plus** icon and text.
- Lives are heart icons (`danger`), timers are `accent` chips with `tabular-nums`, XP uses `accent`.

### 6.10 The five states (mandatory for every data-driven screen)

| State | Pattern |
|---|---|
| Loading | Skeleton that matches the final layout (rows, cards). A spinner only inside a button. Disable submit while initial data loads. |
| Empty | One sentence on what belongs here + the next action. Dashed border container, no illustration on Teacher screens. Distinguish *no data* from *no search results* (offer `Clear filters`). |
| Error | Inline alert with the reason and `Retry`. Keep entered form values. |
| Disabled | Visibly disabled + the reason. |
| Success | Toast for completed actions; the UI reflects the new state without a manual refresh. |

---

## 7. Teacher UI

Teacher UI is an **LMS / management system**. It should feel calm, editorial and dependable rather than decorative.

### 7.1 Principles

- **Clarity before density.** Efficient does not mean visually crowded.
- **One primary visual accent per region.** Teacher actions use `primary`; `accent` is reserved for attention/warnings.
- **Flat structure.** Use typography, spacing and dividers before cards, color blocks or shadows.
- **Predictable.** The same task (create, edit, archive, publish) works the same way in every module.
- **Readable tables and forms.** Keep row height, line length and labels comfortable enough to scan.
- **No decorative color blocks.** A filled color surface should communicate a state, selection or action.
- It must never look like a game: no confetti, mascots, big gradients, animated backgrounds or XP-style visuals.
- A Teacher screen should pass the three-second scan test: purpose, main action and important state are obvious.

## 8. Student UI — Indie Illustrated Scrapbook

**Only approved Student visual direction:** Hand Drawn × Hipness Purgatory (Indie Illustrated Scrapbook), per [ADR 0032](../decisions/0032-student-indie-scrapbook-visual-system.md). The canonical rules for palettes, typography, surfaces, linework, geometry, decoration and motion are in [INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md](./INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md). Do not use legacy Playful Classroom as a design instruction.

### 8.1 Boundaries

- Applies to Student visual presentation regardless of route or screen type; do not maintain a hard-coded screen list inside the aesthetic document.
- Teacher keeps existing design. Shared interaction, accessibility, auth, domain, responsive and state requirements remain binding.
- Student visual tokens and variants are scoped by the Student layout; no global Teacher visual changes are allowed as a side effect. Portal overlays, toasts, popovers and themes still require verification whenever their implementation changes.
- Student Home, Profile, the complete Units branch and Rewards are standardized reference routes. Other Student routes may contain migration debt; debt is not an alternative visual contract.

### 8.2 Student product behavior

- Home remains a learning hub focused on real Units, not a KPI wall; do not invent resume/progress, rank, due-date or completion metrics.
- Learning/activity remains one task at a time; Learning and Try Hard use their accepted interaction rules and server-supported data.
- Rewards/ranking use authenticated live XP/Streak, honors and terminal ActivitySession data. No sample or generated social data is allowed.
- All data views handle loading, empty, error, disabled and success. Student touch controls remain ≥44px; keyboard focus and reduced motion are required.
- App shell owns outer padding and container width; child pages do not add duplicate page-level padding.

### 8.3 Activity modes and game experience

Practice/Learning: no timer, hint and one retry according to accepted domain rules. Try Hard: per-question timer, lives and no hints. Keep the same semantic flow while expressing the visual language through the approved Student theme. Games are an experience layer inside Activity, not a separate design identity.

### 8.4 Teacher/Student acceptance

Compare a Teacher and Student screen to ensure the intended **visual distinction** and no styling leakage. Shared functional semantics, focus behavior and data states remain consistent; palette, font, paper texture and decorative geometry are intentionally different.

---

## 9. Activity UI conventions (Phase 4)

### 9.1 Editor sections, in order

```text
Basics (name, description, topic)
↓
Question sources
↓
Distribution
↓
Selection strategy
↓
Mode
↓
Game (optional)
↓
Preview / Publish
```

**Visual direction for Activity Editor**

- Use one readable main column. Do not make every section a bordered card.
- Sections are separated by generous vertical spacing and a single divider.
- Each section has one clear heading, one short description and one coherent group of controls.
- Controls may be arranged side-by-side only when they are genuinely related; otherwise stack them vertically.
- Use `primary-light` only for a selected option. Do not give every option its own color.
- Question source browsing uses hierarchy through text indentation and dividers, not nested boxes.
- Source rows show the Question Bank name first, then `ready / total` and lifecycle as quiet metadata.
- Distribution, strategy and mode use selectable rows/cards with **one selected state**, not multiple semantic colors.
- Validation messages use a left border + text/icon rather than large colored rectangles when possible.
- The summary may be a compact inline "At a glance" area or a quiet supporting rail. It must not compete with editing.
- Activity Try Hard uses a per-question time limit; Practice has no timer.

Topic shows a readable path such as `Grade 10 / Unit 3 / Section 2 / Past Simple`.
Sources remain limited to the current Unit. Draft/archived banks are disabled with a reason.
Distribution must show derived question counts. Strategy, mode, readiness and preview follow the existing domain rules.

### 9.2 Mode selector (default: both)

Three selectable options remain:

| Option | Meaning | Extra fields |
|---|---|---|
| **Learning and Try Hard** *(default)* | Students choose a mode at start | Time limit, lives |
| Learning only | No timer, hints and explanations | none |
| Try Hard only | Timed challenge, no hints | Time limit, lives |

- Show the mode choice as a clear selection group, not three colorful cards.
- Selected state = `primary-light` + `primary` border/text.
- Unselected state is neutral.
- Time limit and lives appear only when Try Hard is offered; lives default to 3.
- The time limit applies to the **whole Activity run**, not each question.
- The summary/list may show mode as quiet metadata; do not create a third "Both" color.

### 9.3 Readiness and "Needs attention"

- Readiness is **derived** from the server; the UI never persists or edits it.
- Use `accent` only when something needs attention. A ready state can remain neutral in ordinary detail views.
- Errors are source-specific and actionable.
- Prefer inline warning text with an icon and left border over a large filled warning panel.
- A published Activity with a short source stays published and shows a warning; the configuration is never silently changed.

### 9.4 Preview

Teacher preview is read-only, creates no attempt, awards no XP, and renders all five question types.
When the Activity offers both modes, a two-option toggle lets the teacher preview either one, mirroring the student's choice.

---

## 10. Reference architecture map

Use references to decide **information architecture, hierarchy and flow**, not to copy appearance.

| Reference | Borrow (pattern) | Apply to | Do not copy |
|---|---|---|---|
| **Google Classroom** | Class-centric navigation, simple grouped work lists | Classes, assignments, course structure | Brand colors and card headers |
| **Canvas** | Persistent navigation, clear course/assessment hierarchy | Assignments, Gradebook, Reports | Dense legacy chrome |
| **Khan Academy** | Unit → lesson hierarchy, progress framing, calm learning structure | Student Learning, Units, Progress | Illustration style |
| **Schoology** | Folder-style organization | Content hierarchy | Social-feed UI |
| **Quizizz** | Creator settings and activity configuration flow | Activity editor | Playful teacher chrome |
| **Kahoot** | Creator layout and live preview | Question bank/editor preview | Loud color blocks |
| **Nearpod** | Lesson flow and interactive moments | Future lesson flow | Slide-deck metaphors |
| **Linear** | Strong type hierarchy, whitespace, restrained controls, clear status | Teacher lists, detail pages, editors | Dark SaaS aesthetic |
| **Notion** | Information grouping, readable sectioning, low visual noise | Editors, content organization | Document/editor chrome when it does not fit |
| **Vercel Dashboard** | Quiet tables, compact status handling, strong alignment | Lists, filters, operational detail | Dense metric walls |

Decision rule: pick the reference that solves **this screen's job**, adopt its information architecture and
hierarchy, then render it with our tokens and components. Do not copy a product's visual identity.

## 11. Content and microcopy

- Sentence case everywhere (`Create activity`, not `Create Activity`).
- Verbs on buttons, nouns on navigation, results on toasts.
- One term per concept: **Activity**, **Assignment**, **Question bank**, **Topic**, **Draft / Published / Archived**, **Needs attention**. Never `Quiz` for Activity or `Test` for Assignment in the UI.
- Errors say what happened and how to fix it: `Total 10 cannot be divided equally among 3 sources. Choose a different total or distribution method.`
- Empty states state what belongs there and offer the next action.
- No filler (`Welcome to your amazing dashboard!`). Student copy is friendly and short; Teacher copy is neutral and precise.

---

## 12. Accessibility baseline

- Color contrast per 3.2; never color-only meaning.
- Every control is reachable and operable by keyboard; focus is always visible (6.3).
- Semantic HTML first (`button`, `a`, `table`, `label`); ARIA only to fill gaps. Icon-only controls have `aria-label`.
- Dialogs trap focus, close on ESC, return focus to the trigger.
- Form errors are associated with their field and announced; required state is not conveyed by color alone.
- Respect `prefers-reduced-motion`. Timers and auto-advancing content can be paused or extended where the learning goal allows.
- Images and media that carry meaning have text alternatives; audio questions offer a visible control.

---

## 13. Historical deviations and migration backlog

**Historical audit snapshot, not a fresh measurement on this branch.** Counts, contrast ratios,
legacy token names and navigation findings below predate the warm palette refresh;
re-audit before claiming any item still exists. In particular, mappings to
`danger-text`, `secondary-text`, or `secondary-light` are superseded by Section 3.

| Issue | Evidence | Fix |
|---|---|---|
| Raw palette utilities instead of tokens | `text-slate-400` ×103, `border-slate-200` ×88, `text-slate-500` ×48, `bg-slate-50` ×44, `text-rose-600` ×16 | Map to `neutral-*`, `border-border-color`, `background-app`, `danger-text` |
| Tailwind default type sizes | `text-xs` ×96, `text-sm` ×53 | Use `body-sm`, `body` |
| Arbitrary pixel sizes | `text-[11px]` ×10, `text-[10px]` ×5 | Use `label`, `caption` (or `body-sm` for sentences) |
| Mixed radii | `rounded-lg` ×75, `rounded-xl` ×66, `rounded-md` ×51, `rounded-2xl` ×29 | Apply the 3.7 mapping; `rounded-md` is 6px and is off-scale |
| `--radius-*` not registered in `@theme` | Utilities and tokens disagree | Map via 3.7; consider registering aliases in a dedicated PR |
| White text on `secondary`/`accent` fills | 2.43:1 / 2.15:1 (Button `teal`, `amber`; logo tile) | Set `--secondary-foreground` / `--accent-foreground` to `neutral-dark` |
| Nav active label `secondary-hover` at body size | 3.54:1 on `secondary-light` | Use `secondary-text` |
| Badge uses raw `emerald/slate/blue/violet/amber/rose` and 9px text | Content `Badge` | Rebuild on 3.4 tones and `label` size |
| Focus outline removed, border-only focus | Inputs use `outline-none focus:border-primary` | Visible focus ring (6.3) |
| Hand-rolled dialogs and modals | `fixed inset-0` forms | Use Radix `Dialog` (6.6) |
| Teacher nav contains `#` placeholders and a "Games" item; Dashboard always styled active | `teacher/layout.tsx` | 2.3 |
| No small-screen navigation in the Teacher shell | Sidebar is `hidden … lg:flex`, header has no menu | Add drawer navigation |
| Page padding owned inconsistently | Teacher `main` has `p-6`, Student `main` has none | Layout owns padding (5.1) |
| Colored glow shadows on primary buttons | `shadow-indigo-200` | Neutral shadows |
| All-caps tracked eyebrow above page titles | `uppercase tracking-[0.16em]` | Breadcrumb (5.2) |

### 13.1 Migration plan

1. **Token audit PR:** inventory current light/dark tokens and verify computed contrast; Section 3.3 is no longer a proposed CSS patch.
2. **Primitives PR:** `Badge`, `Input`, `Select`, `Textarea`, `Dialog`, `Alert`, `Table`, `PageHeader`, `EmptyState`, `Skeleton`, drawer nav, built only from tokens.
3. **Boy-scout rule:** any PR that touches a screen migrates that screen's raw colors, sizes and radii to tokens before merging.
4. **Guard:** add a CI check that fails on new raw palette utilities and arbitrary text sizes in `src/components` and `src/app`:

```bash
grep -rnE "(text|bg|border|ring)-(slate|gray|zinc|neutral|stone|red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink)-[0-9]{2,3}|text-\[[0-9]+px\]|rounded-md\b" src/components src/app
```

---

## 14. Rules for AI and automated UI generation

### MUST

- Read this document and the phase spec for the feature first.
- Write the Screen Brief (0.2) and pick one page type (5.3).
- Inspect the nearest existing screens and reuse their primitives.
- Use only tokens (Section 3) and the component rules (Section 6).
- Build the information hierarchy before styling it.
- Implement all five states (6.10), keyboard/focus behavior and responsive behavior.
- Keep Teacher and Student visually one product (same tokens/components), while respecting their different densities.
- Make the first viewport easy to scan: context, title, primary action, main content and important state.
- Prefer one dominant content area over multiple competing cards.

### MUST NOT

- Invent a palette, font pairing, radius scale or spacing scale.
- Use raw palette utilities, hex values, arbitrary text sizes, or `rounded-md`.
- Use saturated colors for decoration or give different options unrelated colors.
- Build a Teacher screen from a grid of rounded cards.
- Put a bordered/rounded container around every section just to create separation.
- Use multiple filled badges in the same row when simple metadata would be clearer.
- Compress text, controls or table rows solely to fit more information above the fold.
- Turn a page into a KPI wall without a stated question it answers.
- Mix Activity and Assignment concepts in one screen or form.
- Link navigation to `#` placeholders.
- Make Teacher UI look like a game, or Student UI look like an admin panel.
- Copy a reference product's visuals.

**AI visual sanity check before finishing:** remove one border, one color and one container from the screen.
If the hierarchy becomes clearer rather than worse, keep the simplification.

## 15. Definition of done for any UI change

- [ ] Screen Brief written; page type chosen from 5.3
- [ ] Follows the shell grid and page anatomy (5.1, 5.2)
- [ ] The first viewport passes the three-second scan test
- [ ] One dominant content area; no unnecessary card wall or nested containers
- [ ] Only tokens used: no raw colors, sizes or `rounded-md`
- [ ] Teacher uses `primary` as the main accent; `accent`/semantic colors appear only when meaningful
- [ ] Structural containers are flat/square unless a rounded surface is justified
- [ ] Shared primitives reused; no forked buttons, badges, inputs or dialogs
- [ ] Loading, empty, error, disabled and success states implemented
- [ ] Status shown with the 3.4 vocabulary; lifecycle and readiness are separate
- [ ] Contrast checked (3.2); meaning is never color-only
- [ ] Keyboard and visible focus verified; dialogs trap focus
- [ ] Works at `md` (Teacher) and 360px (Student); no sideways page scroll
- [ ] Copy follows Section 11 (sentence case, one term per concept)
- [ ] `npm run lint` and `npm run build` pass

## 16. Golden rule

> **Use references to decide how the product is structured, use tokens to decide how it looks, and use
> hierarchy before decoration. When in doubt, remove color, containers and radius before adding more.**

The result must feel like **one coherent E-Learning platform** across Teacher and Student.

## 17. Teacher refresh (October 2026)

The Teacher shell follows the warm Playful Classroom family as its restrained **Calm Classroom** variant:

- Use a compact 240px sidebar, a 64px top bar and a warm neutral page surface.
- Keep body copy at 14px, supporting text at 12px and page titles between 22px and 26px.
- Use Plus Jakarta Sans throughout the app. Headings are bold, but never oversized.
- The primary action color is shared LearnUp orange (`primary`). Use learning blue,
  reward amber and success green only for their documented semantic roles.
- Dashboard cards should answer one question each: classes, units, assignments and completion.
- Vietnamese labels are preferred in the Teacher workspace and use sentence case.
- Mobile navigation is a drawer; desktop navigation must expose the active route clearly.


## 18. Ink border + pop shadow visual language (2026-11-06, owner correction)

**Applies directly to Teacher and to legacy shared primitives.** ADR 0032 supersedes this as an app-wide Student identity. Student may still resolve shared `border-ink` and `shadow-pop` aliases through its scoped theme, but its geometry, palette, typography and material recipes come from Indie Illustrated Scrapbook and `components/student-ui`, not from the Teacher/Tactify direction. Never introduce `shadow-ink`.

- **Meaningful raised surfaces** (primary cards, activity tiles, key metrics, dialogs): `border-2 border-ink bg-card shadow-pop` with existing radius tokens. Prefer shared Card primitives where their API supports the variant.
- **Secondary/nested surfaces**: `border border-ink` or `border-2 border-ink` without another shadow. Do not place a strong shadow on each child of a shadowed parent.
- **Buttons/interactions**: primary CTAs may use `border-2 border-ink shadow-pop`, subtle pressed translation and visible focus rings; preserve disabled and reduced-motion behavior.
- **Tables/inputs/dense teacher content**: ink boundary where it communicates grouping, restrained background and elevation. Preserve focus, readability, density, and semantic error/selection states.
- **Navigation**: preserve shell dimensions, hierarchy and keyboard behavior; use ink outlines and pop elevation purposefully, not on every link.
- **Color**: Teacher keeps LearnUp orange for primary actions, learning blue for learning, amber for XP/Streak and semantic success/error colors. Student uses its scoped semantic mappings. No raw black, hex or random palettes in feature code.
- **Token truth**: `border-ink` and `shadow-pop` aliases are registered in `client-e-learning/src/app/globals.css` and resolve through the active workspace variables; do **not** introduce `shadow-ink` or `shadow-pop-ink`. Verify contrast and responsive behavior as screens migrate.
- **Migration**: update shared primitives first, then touched routes. Student Home, Profile, Units and Rewards follow the scoped system; remaining old Student styling is migration debt, not an alternate design.

```tsx
<div className="rounded-2xl border-2 border-ink bg-card p-5 shadow-pop">
  {/* Primary content */}
</div>
```

**Information hierarchy wins over decoration:** one dominant region per page and no nested shadow wall. Teacher remains restrained; Student may use larger playful emphasis.

### Student Gamification page ownership

- **Student Home** hosts the server-backed seven-day Streak widget (Monday–Sunday, Ho Chi Minh calendar), today indicator, longest streak and a separate minimal Level progress card. Home's main CTA stays Learning.
- **`/student/rewards`** is a live **Leaderboard** page, not a Streak/Level dashboard. XP/Streak rankings, Hall of Fame and recent terminal ActivitySessions come from authenticated read APIs; there is no mock fallback.
- No fake Freeze balance or five-minute learning target: Freeze is deferred, and a qualified day requires `ActivitySession.COMPLETED`, not elapsed learning minutes.
- Level is only the current XP-derived level and progress to the next threshold. No new level privileges, inventory or level-up XP.
