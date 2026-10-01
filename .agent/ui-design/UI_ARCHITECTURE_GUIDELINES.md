# UI Architecture Guidelines

**Status:** Source of truth for UI structure, color, typography, spacing and components  
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
3. **Tokens in `globals.css`** are the only allowed values (Section 3).
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

1. Clear hierarchy
2. Simple workflows (fewest steps to the goal)
3. Consistency (same problem → same pattern → same component)
4. Scalability (new features fit without redesign)
5. Educational usability (a teacher or a 12-year-old understands it without help)

**Visual structure is information.** A border, divider, badge, number or label must tell the user
something. If removing it loses no meaning, remove it.

---

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
      └── Activities            (placed under a Topic)
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
- **No top-level "Games" item.** A game is chosen inside an Activity (GameTemplate setting). Student-facing games appear under Activities.
- The active item is derived from the current route, not hard-coded.
- Labels are nouns, sentence case, one or two words: `Content`, `Activities`, `Assignments`.
- Depth is shown with breadcrumbs, never by adding more sidebar levels.

### 2.3.1 Student navigation (target)

```text
Home · Learning · Practice · Activities · Progress · Profile
```

Student navigation uses the same shell grid as Teacher (Section 5.1) and the same active-state rules.

---

## 3. Design tokens

Tokens live in `globals.css`. **Raw palette utilities are forbidden in feature code**
(`text-slate-400`, `bg-emerald-50`, `border-rose-300`, `#hex`, `rgb()`), as are arbitrary sizes
(`text-[11px]`, `h-[37px]`). Use a token or propose a new one (3.8).

### 3.1 Color roles

| Token | Value | Role | Use for |
|---|---|---|---|
| `primary` | `#4F46E5` | Action | Primary buttons, links, selected state, focus ring, progress |
| `primary-hover` | `#4338CA` | Action (hover/pressed) | Hover/active of primary |
| `primary-light` | `#EEF2FF` | Action (tint) | Selected row/option background, subtle emphasis |
| `secondary` | `#06B6D4` | Teacher shell identity | Logo tile, active-nav fill, informational highlight (fills and icons) |
| `secondary-light` | `#ECFEFF` | Secondary tint | Active-nav background, Learning-mode tint |
| `accent` | `#F59E0B` | Reward / attention | XP, streak, Try Hard, "needs attention" |
| `accent-light` | `#FEF3C7` | Accent tint | Warning banners, Try Hard tint, reward chips |
| `neutral-dark` | `#0F172A` | Text | Headings, body text, text on `accent`/`secondary` fills |
| `neutral-muted` | `#64748B` | Text | Secondary text, meta, table headers |
| `neutral-subtle` | `#94A3B8` | Decoration | Placeholder, disabled, decorative icons. **Never meaningful text** |
| `border-color` | `#E2E8F0` | Structure | Card borders, dividers (decorative, not a control boundary) |
| `background-app` | `#F8FAFC` | Surface (page) | App background |
| `card-bg` | `#FFFFFF` | Surface (raised) | Cards, dialogs, tables, inputs |

**Usage proportions** (per screen): neutrals ≥ 90%, one primary action color, `secondary`/`accent`
as small signals. A screen where color is the main thing a user notices is wrong.

**Primary vs. secondary vs. accent**

- `primary` means *you can act on this*. It is the same in Teacher and Student UI.
- `secondary` is the **Teacher shell identity** (logo, active navigation). It is not a second action color.
- `accent` is for **reward and attention** (XP, streaks, timers, "needs attention"). It is not a decorative highlight.

### 3.2 Contrast (measured, WCAG 2.1)

Text needs ≥ 4.5:1 (≥ 3:1 only for text ≥ 24px or ≥ 18.66px bold). UI component boundaries and icons need ≥ 3:1.

| Pair | Ratio | Verdict |
|---|---:|---|
| white on `primary` | 6.29 | Pass |
| `primary` on `primary-light` | 5.62 | Pass |
| `neutral-muted` on white / on background | 4.76 / 4.55 | Pass |
| `neutral-dark` on `accent` | 8.31 | Pass |
| `neutral-dark` on `secondary` | 7.35 | Pass |
| **white on `secondary`** | **2.43** | **Fail** |
| **white on `accent`** | **2.15** | **Fail** |
| `secondary-hover` on white / on `secondary-light` | 3.68 / 3.54 | Fail for body-size text |
| **`neutral-subtle` on white** | **2.56** | **Fail** (decoration only) |
| **`border-color` on white** | **1.23** | Fail as a control boundary (fine as a divider) |

Rules that follow:

- Text on a filled `secondary` or `accent` surface is **`neutral-dark`**, never white.
- Colored text uses the text variants in 3.3 (`secondary-text`, `accent-text`), never the fill color.
- Form controls use `border-input` (3.3), not `border-color`.
- Never convey meaning by color alone: pair it with an icon or a word (✓ Correct, ✗ Incorrect).

### 3.3 Proposed additions (add once, then use everywhere)

The current tokens have no semantic status colors, no readable text variants for `secondary`/`accent`,
and no control border. Feature code compensates with raw `slate/emerald/rose` utilities (Section 13).
Add the following to `globals.css`, with every value verified above or below.

```css
:root {
  /* Foreground on filled secondary/accent: dark text (white = 2.43 / 2.15, fails) */
  --secondary-foreground: #0F172A;
  --accent-foreground: #0F172A;

  /* Readable colored text on white / on *-light backgrounds */
  --secondary-text: #0E7490;   /* 5.36 on white, 5.15 on secondary-light */
  --accent-text: #92400E;      /* 7.09 on white, 6.37 on accent-light   */

  /* Semantic status */
  --success: #047857;          /* 5.48 on white, 5.21 on success-light; white on it 5.48 */
  --success-light: #ECFDF5;
  --danger: #DC2626;           /* 4.83 on white; white on it 4.83 */
  --danger-hover: #B91C1C;     /* 6.47 on white */
  --danger-light: #FEF2F2;
  --danger-text: #B91C1C;      /* 5.91 on danger-light */

  /* Form control boundary (>= 3:1 on card-bg and background-app) */
  --border-input: #8091A7;     /* 3.22 on white, 3.08 on #F8FAFC */
}

@theme {
  --color-secondary-text: var(--secondary-text);
  --color-accent-text: var(--accent-text);
  --color-success: var(--success);
  --color-success-light: var(--success-light);
  --color-danger: var(--danger);
  --color-danger-hover: var(--danger-hover);
  --color-danger-light: var(--danger-light);
  --color-danger-text: var(--danger-text);
  --color-border-input: var(--border-input);
}
```

`warning` is expressed with `accent-light` + `accent-text`. `info` is `primary-light` + `primary`.

### 3.4 Status vocabulary (one meaning, one color)

| Meaning | Where it appears | Fill/tint | Text | Icon |
|---|---|---|---|---|
| Draft | Content, Activity, Assignment | neutral (`background-app` + `border-color`) | `neutral-muted` | `FileEdit` |
| Published / Ready / Correct | lifecycle, readiness, answers | `success-light` | `success` | `CheckCircle2` |
| Archived | lifecycle | neutral | `neutral-muted` | `Archive` |
| Needs attention | **derived readiness**, not a lifecycle status | `accent-light` | `accent-text` | `AlertTriangle` |
| Error / Blocked / Incorrect | validation, failures | `danger-light` | `danger-text` | `XCircle` |
| Selected / Info | selection, informational notes | `primary-light` | `primary` | `Info` |

`Needs attention` must never appear in the same slot as `Draft/Published/Archived`: lifecycle and readiness are shown as two separate badges.

### 3.5 Typography

One family: **Plus Jakarta Sans** (`--font-jakarta`). One scale: the semantic names below.
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

**Radius.** The `--radius-*` variables are *not* registered in `@theme`, so the Tailwind utility
`rounded-md` is **6px**, not `--radius-md` (12px). Use this mapping and nothing else:

| Token | px | Tailwind utility | Use |
|---|---:|---|---|
| `radius-sm` | 8 | `rounded-lg` or `rounded-[var(--radius-sm)]` | Small buttons, chips, table-cell controls |
| `radius-md` | 12 | `rounded-xl` or `rounded-[var(--radius-md)]` | Inputs, default buttons, cards, list containers |
| `radius-lg` | 16 | `rounded-2xl` or `rounded-[var(--radius-lg)]` | Dialogs, large panels, large buttons |
| `radius-xl` | 20 | `rounded-[var(--radius-xl)]` | Student hero and game surfaces only |
| full | – | `rounded-full` | Badges, avatars, progress bars, pills |

Forbidden: `rounded-md` (6px), `rounded`, `rounded-3xl`. A nested element uses an equal or smaller radius than its container.

**Borders.** `1px border-border-color` for cards, tables and dividers. Controls use `border-border-input`. No double borders (a bordered card inside a bordered card).

**Elevation.** Flat by default; hierarchy comes from border and spacing, not shadow.

| Level | Utility | Use |
|---|---|---|
| 0 | none | Cards, tables, panels (border only) |
| 1 | `shadow-sm` | Hover on interactive cards, sticky headers |
| 2 | `shadow-md` | Dropdowns, popovers |
| 3 | `shadow-xl` | Dialogs |

Shadows are neutral. No colored glow shadows (`shadow-indigo-200`) in the Teacher UI.

**Motion.** 150–200ms, ease-out, for state changes caused by the user (hover, press, expand, confirm).
No entrance animations on page load or scroll in Teacher UI. Student UI may animate **feedback only**
(correct/incorrect, XP gained, level-up, life lost). Honor `prefers-reduced-motion`.

**Icons.** `lucide-react` only, default stroke. 16px (`h-4 w-4`) inline with text and in buttons;
20px (`h-5 w-5`) in navigation and card headers; 24px+ only in Student UI and empty states.
Icon-only controls require an `aria-label`. Do not put an icon on every heading or card.

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
| Teacher | Desktop | Tablet (≥ 768) | Compact: tables, filters, forms |
| Student | Phone / tablet | Phone (≥ 360) | Comfortable: larger targets, more space |

- Control heights: `sm` 32px (dense teacher tables), `default` 40px, `lg` 48px (Student primary actions and all touch screens).
- Touch targets: ≥ 40px on Teacher tablets, ≥ 44px on Student. Spacing between adjacent targets ≥ 8px.
- Below `lg`, navigation collapses into a drawer opened from the header. A shell with a hidden sidebar and no replacement is a bug.
- Wide content (tables, code) scrolls inside its own `overflow-x-auto` container. The page never scrolls sideways.
- Below `md`, tables degrade to stacked rows (name + status on the first line, meta below) or drop low-priority columns. Do not shrink text to fit.
- Never hide an error or required-field message in a hover tooltip.

---

## 5. Layout architecture

### 5.1 App shell (shared by Teacher and Student)

```text
┌────────────┬───────────────────────────────────────────┐
│            │ Header  64px  (title/context · user menu)  │
│ Sidebar    ├───────────────────────────────────────────┤
│ 256px      │ Main    padding 24px (16px below md)       │
│ (≥ lg)     │   content container, centered              │
└────────────┴───────────────────────────────────────────┘
```

- Sidebar: 256px, `card-bg`, 1px right border, 16px inner padding. Logo at top, grouped nav, account/switch at bottom.
- Header: 64px, `card-bg`, 1px bottom border.
- Main: `background-app`. **The layout owns the page padding** (24px, 16px below `md`); pages do not add their own outer padding.
- Content container: `max-w-7xl` (1280px), centered, `space-y-6` between regions.
- Nav item: 40px tall, `radius-md`, 20px icon, `body` 600. Active = `secondary-light` background + `secondary-text` label + `secondary` icon (Teacher) / `primary-light` + `primary` (Student). Inactive = `neutral-muted`, hover `background-app`.
- Teacher and Student shells share this grid. They differ in nav identity color and content density only.

### 5.2 Page anatomy

Every page follows the same top-to-bottom order:

```text
Breadcrumb (when depth > 1)
Page title (page-title)                        [Primary action]
Optional one-line description (body, muted)
────────────────────────────────────────────────────────────────
Toolbar (search · filters · view)  [lists only]
Content
Pagination / footer actions
```

- **One primary action per page region**, top-right of the header. Secondary actions are `outline` or `ghost`.
- A description explains the page in one sentence, or is omitted.
- No hero banners, welcome blocks or marketing copy on operational screens.

### 5.3 Page types

Every Teacher screen is exactly one of these. Pick the type, then use its template.

**A. List page** (Activities, Classes, Students, Assignments, Question banks)

```text
Header [+ Create]
Toolbar: search · status · domain filters
Table (default) or card grid (only for "places": classes, units)
Pagination
```

- Use a **table** when records share several comparable attributes (name, topic, status, updated). Use **cards** only for navigable "places" with 2–3 facts.
- Default sort: most recently updated. Archived items are hidden unless the status filter asks for them.
- Row click and the name link open the detail/editor. Row actions end the row (`⋯` menu: View, Edit, Preview, Archive).

**B. Detail page** (a class, a unit, an assignment)

```text
Breadcrumb · Title · Status badge(s) · Actions
Tabs (Overview · Content · Students · Results …)   ← Google Classroom / Canvas pattern
Tab content
```

**C. Editor page** (Activity editor, Question bank editor)

```text
Sticky header: Back · Name · lifecycle badge · [Save draft] [Preview] [Publish]
┌──────────────────────────────────────┬──────────────────┐
│ Main column (≤ 800px)                │ Summary rail      │
│  Section: Basics                     │ 320px, sticky     │
│  Section: Sources                    │  config at a      │
│  Section: Rules                      │  glance +         │
│  …                                   │  readiness        │
└──────────────────────────────────────┴──────────────────┘
```

- Sections are stacked with headings and dividers, **not** nested cards.
- The summary rail shows the saved configuration and **derived** readiness; below `lg` it becomes an accordion above the action bar.
- Below `lg`, actions move to a fixed bottom bar: `[Save draft] [Preview] [Publish]`.
- Dirty-state guard: leaving with unsaved edits asks `You have unsaved changes. Leave without saving?`. Dirty is computed from form values, not from mutation state.
- Publish is disabled while the form is dirty or unsaved, with the reason visible.
- The server is authoritative. Client checks are for usability; the UI reconciles with the API response.

**D. Dialog / confirm** (Section 6.6).

**E. Student flow** (Section 8): one task per screen, a single dominant action, progress always visible.

### 5.4 Cards: when and how

A card is a **single entity** or a **self-contained form group**. It is not a default wrapper.

- `card-bg`, 1px `border-border-color`, `radius-md`, padding 20px (`p-5`), no shadow.
- One level only. Never a card inside a card.
- No gradient fills, no colored left borders as decoration.
- A page of KPI cards is not a Teacher home page. Prefer a short task list ("Needs attention", "Recent activity") over a wall of stats.

---

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

Activity mode tones: **Learning** → `secondary-light` + `secondary-text`; **Try Hard** → `accent-light` + `accent-text`.
An Activity that offers both modes shows **two chips** (`Learning` `Try Hard`), not a third color or a "Both" chip.

### 6.3 Form controls

- Structure: label (`body`, 600) above the control, optional helper (`body-sm`, muted) below, error (`body-sm`, `danger-text`, with an icon) replacing the helper.
- Control: 40px tall, `radius-md`, `card-bg`, 1px `border-input`, `px-3`, `body`. Placeholder uses `neutral-subtle` and never carries required information.
- Focus: **visible ring** (`focus-visible:ring-2 ring-primary ring-offset-2`) in addition to the border change. Do not remove the outline without replacing it.
- Disabled: `neutral-subtle` text, `background-app` fill, and a reason when it is not obvious.
- Validate on blur and on submit, not on every keystroke. Keep all entered values after an error.
- Selection groups with 2–5 mutually exclusive options that need explanation use **selectable option rows** (radio semantics, `primary-light` + `primary` border when selected), not a dropdown. Example: Mode (Section 9.2), Distribution, Selection strategy.
- Numeric inputs show the unit next to the field (`seconds`, `%`, `questions`).

### 6.4 Table

- Container: `card-bg`, 1px border, `radius-md`, `overflow-hidden`; scroll wrapper inside.
- Header row: `background-app`, `label` text in `neutral-muted`, normal case. Rows: 48px minimum, `body`, bottom border `border-color`, hover `background-app`. No zebra striping.
- Primary column is a link (`body`, 600, `neutral-dark`). Secondary lines use `body-sm` muted.
- Numeric columns right-aligned with `tabular-nums`. Status columns use Badges. Actions column last, right-aligned.
- Sorting and filtering are explicit controls in the toolbar or header, never implicit.

### 6.5 Tabs, filters, pagination

- Tabs: underline style, `body` 600, active `primary` with a 2px underline; used for sibling views of the same object (Section 5.3 B).
- Filters: a single toolbar row, search first, then selects (40px, `radius-md`). Applied filters are visible; provide `Clear filters`.
- Pagination: `Previous` / `Next` + `Page x of y`, bottom-right of the list. Default page size 20.

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

Teacher UI is an **LMS / management system**. Its job is speed and clarity for people who do this daily.

### 7.1 Principles

- **Management and efficiency first.** Few clicks, dense but readable, keyboard-friendly.
- **Lists, tables, tabs, forms, filters.** Cards only where 5.4 allows.
- **Calm.** Neutral surfaces, one action color, status color only where it carries meaning.
- **Predictable.** The same task (create, edit, archive, publish) works the same way in every module.
- It must never look like a game: no confetti, mascots, big gradients, animated backgrounds, XP-style visuals.

### 7.2 Standard lifecycle UX

Content, Activities and Assignments share one lifecycle vocabulary:

```text
Draft → Published → Archived
```

- Buttons: `Save draft`, `Publish`, `Archive`. Archive is reversible in meaning ("hidden, history kept"); hard delete is a separate, rarer action.
- A publish dialog shows a **readiness checklist** computed by the server; failures are specific and actionable (`Irregular Verbs needs 3 more ready questions.`).
- Derived health (`Needs attention`) is a second badge, never a replacement for the lifecycle badge.

### 7.3 Teacher patterns by module

| Module | Page type | Notes |
|---|---|---|
| Dashboard | Task-first | "Needs attention", recent activity, quick links. Not a KPI wall. |
| Classes / Students | List → Detail with tabs | Detail tabs: Overview · Students · Assignments · Results |
| Content | Hierarchy browser | Grade → Unit → Section → Topic → Question bank, breadcrumb-driven |
| Activities | List + Editor (C) | Distribution, strategy, mode, game, preview, readiness |
| Assignments | List + Detail with tabs | Target, schedule, one-attempt policy, official results |
| Reports | Table + filters, then charts | Table first; a chart only when it answers a stated question |

---

## 8. Student UI

Student UI may be **more engaging** than Teacher UI. It uses the **same tokens, same shell grid and same components**, and spends a bounded *expressiveness budget*.

### 8.1 What may differ

| Allowed in Student UI | Not allowed |
|---|---|
| Larger type steps (`ui-2xl`, `display`) for scores and results | New fonts or type scales |
| `radius-lg` / `radius-xl` surfaces, 48px buttons | New radii |
| `accent` for XP, streaks, timers, rewards | New palette colors |
| Progress rings/bars, level and streak indicators | Decorative blobs, random gradients |
| Feedback animation (correct, wrong, XP gain, life lost) | Entrance animation on every element |
| Illustration in empty/result states | Stock-art backgrounds behind content |

Gradients: none in Teacher UI. In Student UI only on result/hero surfaces, built from palette tokens, never behind body text.

### 8.2 Flow rules

- **One task per screen**, one dominant action (48px), progress always visible.
- Mobile-first; thumb-reachable primary action at the bottom.
- Feedback is immediate, specific and kind. Explanations appear after answering in Learning Mode.
- Show *what to do next* at the end of every activity: Retry · Next activity · Back to topic.
- It must never look like an admin panel: no dense tables or filter bars on core learning screens.

### 8.3 Learning vs. Try Hard (same shell, different HUD)

| | Learning | Try Hard |
|---|---|---|
| Intent | Understand and repeat | Challenge |
| Tone color | `secondary` family | `accent` family |
| HUD | Progress only | Progress + timer chip + lives (hearts) |
| Hints / explanation | Available | Hidden |
| Failure | Not a formal event | Wrong answer costs a life; zero lives ends the run |

The page chrome, buttons, dialogs and result screen are identical; only the HUD and tone color change.
When an Activity offers both modes, the student chooses **before** starting, using two selectable option rows that state what each mode means. If only one mode is offered, skip the choice and show the mode as a chip.

### 8.4 Games

A game is an **experience layer on the Activity**, rendered inside a bounded game viewport.
Game art may use its own assets, but everything around it (start, pause, result, errors, buttons, dialogs) uses system components and tokens. A game never introduces its own question or result model.

---

## 9. Activity UI conventions (Phase 4)

### 9.1 Editor sections, in order

```text
Basics (name, description, topic)  →  Question sources  →  Distribution
→ Selection strategy  →  Mode  →  Game (optional)  →  Preview / Publish
```

- Topic shows a path: `Grade 10 / Unit 3 / Section 2 / Past Simple`.
- Sources: a Grade → Unit → Section → Topic browser plus bank rows showing `status`, `ready / total`. Draft or archived banks are visibly disabled with the reason. Selected sources stay visible when the browser is filtered.
- Distribution: three selectable options (`Equal`, `Percentage`, `Fixed count`). Show **derived question counts**, not only percentages. In `Fixed count` the total is read-only and derived.
- Strategy: `Random` / `Weakness priority`, with the note that weakness priority needs answer history and falls back to random until then.
- Game: `None` + template options; inactive templates are disabled.

### 9.2 Mode selector (default: both)

Three selectable option rows:

| Option | Meaning | Extra fields |
|---|---|---|
| **Learning and Try Hard** *(default)* | Students choose a mode when they start | Time limit, lives |
| Learning only | No timer, hints and explanations | none |
| Try Hard only | Timed challenge, no hints | Time limit, lives |

- Time limit (`seconds`) and lives appear only when Try Hard is offered; lives default to 3.
- Choosing `Learning only` clears and hides the timer and lives. Choosing a Try Hard option again restores defaults. The server repeats this normalization.
- The summary rail and the list show mode as chips (6.2).

### 9.3 Readiness and "Needs attention"

- Readiness is **derived** from the server; the UI never persists or edits it.
- Errors are source-specific and actionable, listed in the summary rail and repeated in the publish dialog.
- A published Activity with a short source stays published and shows a warning banner; the configuration is never silently changed.

### 9.4 Preview

Teacher preview is read-only, creates no attempt, awards no XP, and renders all five question types.
When the Activity offers both modes, a two-option toggle lets the teacher preview either one, mirroring the student's choice.

---

## 10. Reference architecture map

Use references to decide **structure and flow**, not to copy appearance.

| Reference | Borrow (pattern) | Apply to | Do not copy |
|---|---|---|---|
| **Google Classroom** | Class-centric tabs (Stream · Classwork · People · Grades); simple work lists grouped by topic | Class detail, assignment lists | Its brand visuals, colored class-card headers |
| **Canvas** | Persistent left course navigation; Assignments and Gradebook structure; per-submission review | Assignments (Phase 5), Gradebook, Reports | Dense legacy chrome |
| **Khan Academy** | Unit → lesson hierarchy; progress/mastery framing; calm teacher dashboard | Student Learning/Units, Progress | Its illustration style |
| **Schoology** | Folder-style organization of materials | Content (Unit/Section/Topic) management | Social-feed UI |
| **Quizizz** | Quiz library, game-settings panel, assign-with-schedule, per-question reports | Activity editor settings, Activity reports | Playful chrome on teacher screens |
| **Kahoot** | Creator layout: question list · editor · settings; live preview | Question bank editor, Activity preview | Loud color blocks |
| **Nearpod** | Lesson flow mixing content and interactive moments | Future lesson flow | Slide-deck metaphors |

Decision rule: pick the reference that solves **this screen's job**, adopt its *information architecture*, then render it with our tokens and components.

---

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

## 13. Known deviations in the current code (measured)

Measured on the current `client-e-learning/src`. These are the reasons screens look inconsistent today.

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

1. **Tokens PR:** add 3.3, fix the two foreground tokens. No component changes.
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
- Implement all five states (6.10) and keyboard/focus behavior.
- Keep Teacher and Student visually one product (same shell, tokens, components).
- Prefer simple, functional layouts that extend to future features.

### MUST NOT

- Invent a palette, font pairing, radius scale or spacing scale, or apply a "design direction" that departs from this file.
- Use raw palette utilities, hex values, arbitrary text sizes, or `rounded-md`.
- Add cards inside cards, decorative gradients, blobs, glow shadows, entrance animations, or an icon on every item.
- Turn a page into a dashboard of KPI cards without a stated question it answers.
- Mix Activity and Assignment concepts in one screen or form.
- Link navigation to `#` placeholders.
- Make Teacher UI look like a game, or Student UI look like an admin panel.
- Copy a reference product's visuals.

---

## 15. Definition of done for any UI change

- [ ] Screen Brief written; page type chosen from 5.3
- [ ] Follows the shell grid and page anatomy (5.1, 5.2)
- [ ] Only tokens used: no raw colors, sizes or `rounded-md` (grep in 13.1 is clean)
- [ ] Shared primitives reused; no forked buttons, badges, inputs or dialogs
- [ ] Loading, empty, error, disabled and success states implemented
- [ ] Status shown with the 3.4 vocabulary; lifecycle and readiness are separate
- [ ] Contrast checked (3.2); meaning is never color-only
- [ ] Keyboard and visible focus verified; dialogs trap focus
- [ ] Works at `md` (Teacher) and 360px (Student); no sideways page scroll
- [ ] Copy follows Section 11 (sentence case, one term per concept)
- [ ] `npm run lint` and `npm run build` pass

---

## 16. Golden rule

> **Use references to decide how the product is structured, and the tokens to decide how it looks.
> If a choice is not in this document or in `globals.css`, propose it, document it, then use it everywhere.**

The result must feel like **one coherent E-Learning platform** across Teacher and Student.