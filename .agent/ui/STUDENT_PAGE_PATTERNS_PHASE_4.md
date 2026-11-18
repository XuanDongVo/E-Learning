# Student Page Patterns — Phase 4 implementation

**Date:** 2026-11-19  
**Branch:** `feature/guided-reasoning-v1`  
**Authority:** `STUDENT_PAGE_ARCHETYPES.md` + ADR 0032; source implementation is not a new visual theme.

## Architecture and responsibilities

Only four shared **presentation** patterns were added under `client-e-learning/src/components/student-ui/patterns/`:

| Component | Purpose | Does NOT do |
|---|---|---|
| `StudentPageHeading` | Semantic H1 by default (configurable heading level for nested previews), eyebrow, description, optional artwork and actions | Force a kraft hero, choose image/mascot, make API requests |
| `StudentBackLink` | Accessible, locale-aware contextual back navigation | Browser-history logic, infer parent route |
| `StudentCollectionPanel` | Compose toolbar, results and optional footer inside quiet paper surface; aria-live is opt-in (default off) | Fetch data, apply filters, choose list/grid, own pagination |
| `StudentCollectionEmptyState` | Optional original SVG + existing `RegionState` with truthful empty message and recovery action | Invent a record, confuse loading/error with empty, remove needed copy |

The **components accept React slots, not domain-specific props**. They compose existing `PaperSurface`, `StudentDataList`, `StudentListPagination`, `RegionState`, `StudentIllustration` and the Student scoped typography rules. No generic framework for all eight archetypes is introduced.

## Actual adoption

| Feature | Adoption | Domain behavior preserved |
|---|---|---|
| Activity History | Back link, heading, collection panel + empty state | Period/mode/status filters, per-activity history API, reset, page, review links |
| Vocabulary Word Library | Back link, heading, collection panel + empty state | Status tabs, debounce search, pagination, FSRS due labels and review routes |
| Units Index | Heading + empty/filtered-empty states | Unit API, card grid, search, loading/error states |
| Student Assignment hero | Heading with optional count/visual | Todo count semantics and assignment actions remain in feature |
| Vocabulary Review | Contextual back link only | Review and FSRS interactions untouched |
| Unit Detail | Contextual back link only | Sections/topics/activities, cover and all detail behavior unchanged |

**Not migrated:** Learning Hub (custom Hub story), Unit Detail main hero (data cover), Assessment/Activity runtime (immersion), Game (needs its own play pattern), Profile/Insights (identity/data visual). Do not force these into collection or the same hero.

## Preferred usage

```tsx
<StudentBackLink href="/student/vocabulary">Quay lại</StudentBackLink>
<PaperSurface as="section" variant="kraft" emphasis="feature" className="p-5">
  <StudentPageHeading
    eyebrow="Từ vựng"
    title="Kho từ"
    description="Tìm và ôn lại những từ đã học."
    artwork={<StudentIllustration id="illustration.word-collection" decorative />}
    artworkClassName="hidden sm:block"
  />
</PaperSurface>
<StudentCollectionPanel toolbar={<FeatureOwnedFilters />}>
  {loading ? <RegionState variant="loading" /> :
    error ? <RegionState variant="error" /> :
    items.length === 0 ? <StudentCollectionEmptyState title="Không có từ" /> :
    <StudentDataList>{/* feature-owned mapped rows */}</StudentDataList>}
</StudentCollectionPanel>
```

This snippet is **illustrative**: no `FeatureOwnedFilters` exists in the repo. Never paste it as a complete page. List paging, retry handlers, search and real metrics remain in feature code.

## QA and release gates

- Every screen has exactly one H1 and a real primary action or clear collection purpose.
- Decorative image is optional; high-focus screens may omit it. Meaningful content pictures retain accessible alt.
- On 360/390px and desktop, buttons and filters remain reachable; avoid overflow, doubled scroll, excessive live-region announcements and duplicate decoration. Use `ariaLive="polite"` only when feature-state changes warrant announcements. Lab sample headings use `as="h3"` to retain a single document H1.
- Maintain existing Student state distinctions: loading vs error vs no data vs filtered-empty, including reset action when appropriate.
- The Design Lab `/vi/student/design-lab` includes a **Page Patterns** preview (Hub / Collection / Detail) with fixed, clearly labeled fixtures; available only in Next.js development mode.
- Regression: Student navigation, Vocabulary pagination/debounce, Activity History filters and Teacher UI; run `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` locally.
- No claims of a successful runtime/browser/CI run are made by this document.

## Next phase

Phase 5 should review screenshots of these reference screens, refine spacing and visual density (no wholesale template replacement), and migrate remaining pages by archetype *only when actual reuse is demonstrated*.
