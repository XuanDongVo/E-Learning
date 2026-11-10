# Project Progress

## Vocabulary Phase 03 refresh — Student Library + Grade 7 fixture (2026-11-10)

- Added standalone `/student/vocabulary` Library, searchable/filterable published
  Unit collections and authenticated `/v1/student/vocabulary/overview` summary
  counts (ACTIVE only; NEW and due reviewed cards distinguished). Canonical
  learning route is `/student/vocabulary/units/{unitId}`; old route still works.
- Unit Detail now only links to the vocabulary module. Browse is a compact
  searchable word list; the Flashcard reverse has tailored with-image/text-only
  layouts and broken-image fallback. Student scrapbook theme and Teacher admin
  styles remain isolated. FSRS review scheduling and game rules are unchanged.
- Updated Grade 7 `07_vocabulary.sql` to comply with enum constraint and added
  curated demo IPA, related terms and local illustrations for a subset of words.
  No DELETE/TRUNCATE/data-reset action was performed; teacher-edited nonempty
  fields are preserved on fixture re-run.
- Verify Next.js/ESLint, Maven focused tests, real Postgres seed execution and
  device UI once project dependencies/services are available.

## Vocabulary Phase 03 — Student Notebook UI (2026-11-10)

- Added Unit detail entry and `/student/units/{unitId}/vocabulary` with four
  Student-only surfaces: Xem từ, Học, Ôn tập, Chơi. Uses the canonical Indie
  Illustrated Scrapbook primitives and scoped CSS; no Teacher visual changes.
- Implemented UK/US Flashcard with optional image, examples and related terms;
  due-first recommended Learn queue, self-chosen word previews and due-only Review.
- Self-rating HARD/GOOD/EASY/AGAIN writes exclusively to Phase 02 FSRS API with
  stable requestId retries, server error messages and cache refresh. MC/typing/
  optional browser speech-recognition practice is deliberately non-scheduling.
- Unit game links require explicit US/UK and preserve existing game modes and
  runner. No changes to Game Hub, Activity XP or Gamification.
- Static source review and `git diff --check` done. Next.js dependencies are
  unavailable here, so TS/ESLint/build, live browser and device/voice checks
  remain necessary before deployment. See `plans/VOCABULARY_STUDENT_PHASE_3_SPEC.md`.


## Vocabulary Learn / Review — Phase 02 backend foundation (2026-11-10)

- Pinned Java-FSRS 1.0.0 and added Flyway V57: per-student/word cards (full FSRS
  JSON + due UTC) and immutable review events with unique request UUIDs.
- Added Student-only Unit-card listing and server-authoritative due-review API,
  active-class Grade/Unit publication checks, student-level request serialization,
  replay-safe rating idempotency and early-review conflict protection.
- Teacher hard-deletion of words already studied is blocked with an explanatory
  409; inactive words remain historically tracked but disappear from study cards.
- Replaced Vocabulary `IllegalArgumentException` with typed `AppException` codes,
  improved field-validation messages, exposed exact API messages in the FE,
  fixed `emptyVocabularyRelatedTerms` value import, and added error toasts.
- Typed FE transport is ready for a future Student Learn / Practice / Review UI.
  No CSV files, Game XP, Activity, Gamification, or UI learning workflow changed.
- `git diff --check` passes. Focused Maven tests remain blocked by unavailable
  Spring Boot 4.1.1 parent POM network resolution. JS dependencies must be
  installed before typecheck/lint; Postgres Flyway verification pending.


## Vocabulary Content Enhancement — Phase 01 (2026-11-10)

- Extended `VocabularyWord` with structured non-null JSONB `relatedTerms` in
  Flyway V56, keeping existing rows and the UK/US and enum foundation intact.
- Added typed value objects, nested request validation and server normalization
  (empty lists, whitespace, max 20/group, max lengths, case-insensitive dedup
  within each group). Missing data in legacy update requests does not erase
  existing Related Terms; explicit empty lists clear them.
- Added Teacher-only `GET /v1/content/vocabulary/search` for copy-only candidate
  suggestions from ACTIVE words in the same Grade. No auto-creation or links.
- Updated shared Teacher Vocabulary create/edit form with Word Family, Synonyms,
  Antonyms, inline search/manual addition, meaning and POS editing, Media image
  upload/removal, UK/US listen buttons, and live two-sided Flashcard preview.
- Added focused backend tests for normalization, response mapping, update
  preservation, explicit clear, and candidate search contract.
- CSV file import, Student Learn/Practice, FSRS, and Game/Gamification changes
  remain deferred. Existing quick-paste input still works.
- Validation: `git diff --check` passes. Maven tests could not start because
  Maven Central parent POM is unavailable in the executor; ESLint is unavailable
  because frontend node_modules are not installed. Run both and verify the
  Teacher layout at mobile/tablet/desktop in an installed environment before merge.


## Vocabulary foundation: typed metadata, US/UK pronunciation and game selection (2026-11-10)

- Based on `feature/question-bank-csv-import-phase1`, isolated on
  `feature/vocabulary-uk-us-enums-game-accent` before starting the future Learn/Review/FSRS work.
- Vocabulary now has distinct optional `pronunciationUk` and `pronunciationUs` IPA
  values and typed Java enums for `partOfSpeech`, `difficulty` and `status`.
  Create/update/bulk, teacher response, filters, game DTOs, UI types and word editor
  use the same values. Legacy audio URL columns remain for backward compatibility;
  spoken audio in this feature uses the browser's speech synthesis.
- Flyway V55 adds IPA fields, a constrained US/UK session accent and a stable set
  of word IDs for each game session; existing word classes are normalized to
  uppercase before enforcing their enum constraint. The old unclassified
  `pronunciation` database column remains intact; IPA cannot be safely labeled
  UK or US without verifying the original source. Populate new IPA variants via
  teacher content editing as reference data becomes available.
- Game select now requires an explicit US/UK pronunciation choice; the accent is
  sent to/persisted by the session and used for synthesized speech and IPA
  rendering in Bubble Pop, Word Rain and the result screen. Device voice quality
  depends on available local/browser voices; no audio uploads required.
- `UnitVocabularySection` now reads the paginated API correctly (removed
  undeclared variables), handles errors and out-of-range pages, shows both IPA
  variants and warns based on **active** vocabulary count rather than total count.
- Finish-game processing uses the session's initial word IDs instead of the
  current ACTIVE list. Legacy in-progress sessions fall back to the previous
  lookup. Unknown/duplicate submitted answer IDs are rejected.
- Validation: `git diff --check` passes. Maven compile is blocked because this
  execution environment cannot resolve Spring Boot parent POM from Maven Central;
  frontend dependencies are not installed, so typecheck/lint/build cannot run
  here. Database migration requires review against any existing nonstandard
  `part_of_speech` strings before production deployment.
- Not included yet: vocabulary flashcards, spaced repetition/FSRS, synonym and
  antonym models, pronunciation scoring, or a new Game Hub architecture.

## Teacher Assignment portfolio summary (2026-11-09)

- Replaced the Assignment list's placeholder Summary Cards with a real,
  authenticated API: `GET /v1/teacher/assignments/summary`.
- The server now owns open Assignment, finalized delivery (`SUBMITTED` plus
  `TIMED_OUT`), overdue incomplete delivery, due-delivery denominator, and result
  rate calculations. Distinct `Assignment × active Student` deliveries prevent
  duplicate counting across target classes; Drafts are excluded.
- The Assignment list read is now scoped to target classes owned by the
  authenticated Teacher. No Assignment owner column or database migration was
  introduced.
- Teacher Assignment UI now shows `Đang mở`, `Đã có kết quả`,
  `Chưa hoàn thành quá hạn`, and `Tỷ lệ có kết quả`, with independent loading,
  error/retry, zero-data, and success states. The list remains usable when the
  summary request fails.
- Summary Cards retain the current Teacher layout while using semantic status
  tokens and non-interactive card behavior. Vietnamese and English copy are
  updated; no demo values remain.
- Per-Assignment overdue monitoring now also marks an `IN_PROGRESS` Attempt as
  overdue once the Assignment due time is reached.
- Validation: focused backend summary tests pass 2/2 through Surefire; frontend
  TypeScript and focused ESLint pass. Maven's compiler lifecycle emits a local
  `Cannot close compiler resources` failure after writing classes, so the focused
  test was executed from the emitted test classes. Production build and
  authenticated PostgreSQL E2E remain pending.

## Teacher Content UI improvement — Phase 3 (2026-11-09)

- Refined the existing Teacher Content visual system without changing its
  information architecture: Unit, Section, and Topic detail headers now share
  the same responsive title, metadata, primary edit action, and lifecycle menu
  hierarchy using approved semantic tokens.
- Unit Sections and Section Topics now use consistent flat list surfaces,
  typography, dividers, status treatment, and 40px action targets. Rows retain
  pointer/drag behavior and are now keyboard reachable with Enter/Space
  navigation and visible focus states.
- Breadcrumbs now horizontally scroll with bounded/truncated items instead of
  clipping the current location on narrow screens. Unit tabs remain keyboard
  operable and horizontally scrollable on mobile.
- Topic Question Banks now use the same responsive list language and a shared
  portal Dialog for creation, replacing the fixed custom overlay while keeping
  the existing form, mutation, validation, and error behavior.
- Unit Vocabulary and the Teacher Navbar Vocabulary page were normalized to the
  same semantic palette, button hierarchy, spacing, and responsive grids. Word
  and bulk-import dialogs are viewport-bounded and scroll internally so their
  controls remain reachable on short/mobile screens.
- Source-level viewport review covered 375px, 768px, and 1440px behavior: page
  headers/actions wrap, selector grids step from one to two/three/four columns,
  list metadata collapses below desktop, dialog content is height-bounded, and
  wide vocabulary tables scroll only inside their region.
- No backend/API contract, database schema, route, authorization behavior,
  content lifecycle, Vocabulary–Unit relationship, Activity rule, or Student UI
  changed. Teacher styling remains isolated from the Student scrapbook system.
- Validation: focused ESLint has 0 errors and one pre-existing
  `react-hooks/set-state-in-effect` warning in `VocabularyWordModal`; full
  TypeScript (`tsc --noEmit`) passes; `git diff --check` passes with line-ending
  warnings only. Per owner request, no production build or screenshots were run.

## Teacher Content UI improvement — Phase 2 (2026-11-09)

- Unit Detail now has three accessible tabs: `Nội dung` (default), `Từ vựng`,
  and `Tổng quan`. Keyboard Left/Right/Home/End navigation is supported and the
  tab bar remains horizontally usable on narrow layouts.
- The Content tab retains Section create/navigation/reorder behavior. The Overview
  tab displays only existing Unit fields: description, grade, code, lifecycle,
  hierarchy counts, display order, and persisted timestamps.
- Unit Vocabulary and Navbar Vocabulary continue to render the same
  `UnitVocabularySection` and call the same Unit-scoped CRUD API. A canonical query
  root now invalidates every search/status variant for the Unit after mutations.
- Vocabulary management now covers loading, query error/retry, filtered empty,
  initial empty, success, background refetch, per-item pending, mutation error, and
  success-toast states. Search/status filters and bulk import remain available.
- Vocabulary create/edit still reuse the existing form and validation. API errors
  keep the form open with its entered data. Delete now uses the shared AlertDialog,
  stays open on API failure, and cannot submit repeatedly while pending.
- Unit, Section, and Topic entity/list mutation failures now surface dismissible
  banners while preserving the existing CRUD forms and values.
- No API endpoint, request/response type, database schema, route, authorization,
  Activity rule, Vocabulary–Unit relationship, or Student UI changed. The current
  Vocabulary API is an unpaginated Unit-scoped list, so no pagination UI was added.
- Validation: focused ESLint passes with zero findings and `git diff --check`
  passes (line-ending normalization warning only). Full TypeScript reaches the
  changed files without Phase 2 errors but remains blocked by pre-existing
  Assignment Builder errors outside this phase. Production build was not run per
  explicit owner request; no screenshots were produced.

## Teacher Content UI improvement — Phase 1 (2026-11-09)

- Added a shared, responsive Teacher Content breadcrumb and explicit parent links
  for Unit, Section, and Topic detail routes. Breadcrumb labels use fetched entity
  names and locale-aware application links; no history-based navigation is used.
- Unit Detail now presents Sections as its primary list and no longer duplicates
  the Unit Activity list. Existing Section CRUD/reorder and Unit Vocabulary CRUD
  remain available; Vocabulary is kept below Sections until Phase 2 introduces tabs.
- Section Detail now resolves and displays its parent Unit, keeps Topics as the
  primary content, and distinguishes Topic loading/error/empty states.
- Topic Detail now resolves its full Unit/Section path, keeps Question Banks as the
  primary content, and replaces the full Activity list with a compact reference
  count derived from Activity Question Bank links.
- Topic Activity navigation truthfully opens the Unit-filtered Activities view.
  The Activities workspace now resolves the requested Unit's grade before loading
  Units, so direct `?unitId=` links work outside the default grade. Topic filtering
  remains unsupported and is stated in the UI.
- No backend endpoint, API contract, database schema, Activity business rule,
  Vocabulary behavior, authorization behavior, or Student UI changed.
- Validation: focused ESLint passes with zero findings; `git diff --check` passes.
  Full TypeScript is blocked by pre-existing Assignment Builder and stale
  `.next` route-type errors outside Phase 1. Production build is unverified because
  SWC native-cache access requires an out-of-sandbox run and approval was declined.

## Teacher Content UI improvement — Phase 0 audit (2026-11-09)

- Audited the Unit, Section, Topic, Question Bank, Activities, and Vocabulary
  frontend flows plus their existing Spring Boot contracts. No application code,
  API contract, database schema, route, or business rule changed in this phase.
- Confirmed the canonical hierarchy is already represented by the current APIs:
  Unit → Section → Topic → Question Bank. Vocabulary belongs to one Unit;
  Activities belong to one Unit and reference Question Banks through ActivityBank.
- The shared `UnitVocabularySection` already powers both Unit Detail and the
  Navbar Vocabulary route, using the same CRUD service and Unit-scoped query key.
- Phase 1 remains gated. Its frontend scope is breadcrumb/parent navigation for
  Unit, Section, and Topic; removal of the duplicated Unit Activity list; and a
  compact Topic Activity reference while preserving Question Banks as the main
  Topic content.
- Known constraint: Activities can be filtered by Unit, not by Topic. Topic-related
  counts can be derived from returned Activity banks, but navigation must not claim
  a Topic-filtered Activities view. No backend change is required for Phase 1.
- Audit validation was static source/contract inspection only; no build, lint,
  tests, screenshots, or runtime mutations were performed.

## Container deployment and local configuration (2026-11-08)

- Added a Compose stack for PostgreSQL, Spring Boot, Next.js and Nginx; only Nginx publishes port 80, and `/v1/*` is reverse-proxied to the backend.
- Added production deployment instructions and an Nginx request-size limit suitable for existing media uploads.
- Spring Boot defaults to the `dev` profile and imports an ignored `.env.dev` from either the repository or `server/` working directory, enabling direct IntelliJ runs without committed local values.
- Removed committed fallback database, JWT and Cloudinary credentials. Production now fails fast when its required environment is missing; `.env.prod` remains ignored and Compose is started with `--env-file .env.prod`.

## Dedicated login portals and Landing logout (2026-11-08)

- Logout now routes every protected UI back to Landing (`/`) through the shared AuthGuard; the former generic `/login` redirect is removed.
- AuthGuard routes unauthenticated Teacher and Student routes to their respective login portals while preserving safe `next` and session-reason parameters.
- The shared login endpoint now accepts an expected role. Teacher/Student portals send it, and role mismatch returns `LOGIN_ROLE_MISMATCH` before cookies/tokens are issued.
- Simplified Landing route configuration to use the canonical `UserRole` and wired CTA destinations to the current AuthProvider user when available, including the root Landing route.

## Landing Page — CSS Token Isolation & Global Style Protection (2026-11-08)
  - Restored base `--ink: #4f3e34` and `--font-display: "Plus Jakarta Sans", sans-serif;` to prevent styling regressions in Teacher and Student interfaces.
  - Introduced dedicated `--landing-page-ink: #261E19` and scoped `--ink: var(--landing-page-ink, #261E19)` strictly inside `.parchment-surface`.
  - Defined dedicated `--font-landing-page-display: "Patrick Hand", cursive, sans-serif;`, `--font-landing-hand`, and `--font-landing-mono` in `@theme inline`.
  - Migrated all Landing Page components (`Navbar`, `Scene01HeroBook`, `Scene02ExploreWorld`, `Scene03PlayPractice`, `Scene04RewardsScrapbook`, `Scene06FinalPage`) to use `font-landing-page-display`, `font-landing-hand`, and `font-landing-mono`.
  - Removed all redundant landing CSS variables from `:root` and scoped them into `.parchment-surface`.
  - Scoped all custom landing classes (`.notebook-lines`, `.ink-border`, `.hand-drawn-card`, `.washi-tape*`, `.animate-*`) strictly under `.parchment-surface` to eliminate any possible leakage into Teacher or Student UI.
  - Restored `bg-[#F8FAFC]` to the root `<body>` in `src/app/layout.tsx` to maintain original background color consistency for Teacher and auth routes.
- Validation: `npm run build` compiled cleanly with 0 errors across all routes.

## Landing Page — The Learning Storybook & Lucide Icon Refactor (2026-11-08)
- Implemented The Learning Storybook interactive landing page in `client-e-learning/src/app/page.tsx` and root layout `src/app/layout.tsx`.
- Refactored all landing components (`Navbar`, `Scene01HeroBook`, `Scene02ExploreWorld`, `Scene03PlayPractice`, `Scene04RewardsScrapbook`, `Scene06FinalPage`) to use consistent `lucide-react` icons and removed casual/system Unicode emojis per team feedback.
- Cleaned up visual clutter to focus on content, hand-drawn scrapbook art, and genuine platform capabilities (Grade/Unit/Topic exploration, Learning & Try Hard modes, Bubble Pop & Word Rain games, XP/Streak rewards).
- Frontend validation: `npm run build` completed with 0 errors. Backend database V54 Flyway migration checksum reconciled with main branch.
## Teacher interface localization audit (2026-11-08)

- Localized the shared Teacher navigation/header chrome and the primary Classes,
  Activities, Assignments, and Grades screens with paired English/Vietnamese
  message catalogs; Dashboard and Vocabulary remain outside this change by owner
  request.
- Removed hard-coded labels from the Activities list/table, Assignments overview,
  assignment creation guide/status list, and Class overview, including accessible
  labels, empty/error states, filters, and notifications.
- Registered the new Grades message namespace in the locale request loader. No API,
  domain, route, or database behavior changed.
- Validation: all touched JSON catalogs parse successfully and `git diff --check`
  is clean. Lint, TypeScript, Vitest, and build were not run per owner request.

## Absolute seven-day Auth/Session lifecycle (2026-11-08)

- Added an absolute session deadline fixed at login; access/refresh rotation cannot
  extend the seven-day session, and legacy refresh tokens retain their existing
  expiry as the transition deadline.
- Protected resources now accept only ACCESS tokens and re-check current account
  status before controllers. INACTIVE accounts receive `ACCOUNT_INACTIVE`, auth
  cookies are cleared, and refresh cannot issue replacement tokens.
- Logout now clears cookies without requiring a valid access token. Spring Security
  authentication/authorization failures use the standard API envelope.
- The frontend now performs one single-flight refresh and one replay for 401s,
  coordinates refresh across tabs with Web Locks, broadcasts session termination,
  clears account-scoped cache/transient runtime state, and preserves a clear login
  reason.
- No database migration or endpoint was added. Maven tests, frontend Vitest, lint,
  TypeScript, and build were explicitly skipped at owner request; runtime/browser
  validation remains required before release.
- Added localized frontend messages for network failures and stale requests that
  finish after their authentication session has ended.

## Student Profile edit navigation (2026-11-08)

- The Profile hero's `Chỉnh sửa` action now switches to the Personal tab, enables editing, and scrolls the tab region into view.
- Smooth scrolling respects the user's reduced-motion preference; profile data and API behavior are unchanged.

## Student UI standardization — Units branch + Rewards (2026-11-07)

- Standardized `/student/units`, `/student/units/:unitId`, `/student/units/:unitId/activities`, the immersive Activity route wrapper, and `/student/rewards` with the scoped Indie Illustrated Scrapbook roles and shared Student recipes.
- Corrected the nested Activity list route to read `unitId` from its path parameter rather than an optional duplicate query parameter; Activity APIs, mode selection, runtime scoring and result behavior are unchanged.
- Units and Activity discovery preserve live data, filters and loading/error/empty states without invented progress, lock, duration or recommendation data.
- Rewards retains the authenticated XP/Streak Top 50, personal standing, honors and terminal ActivitySession feed. Its Student-only podium derives from the same ranking data; generated third-party avatars were removed and honor loading/error/empty states were added.
- Centralized Units/Rewards layout, filters, cards, podium and ranking geometry in `styles/student/`; feature files contain no raw palette utilities, arbitrary sizes or default Tailwind type scale.
- Updated the active route/design contracts and added `ui/STUDENT_REWARDS_BLUEPRINT.md` so documentation no longer describes live Rewards as mock/sample data.
- Validation: TypeScript passes; focused ESLint passes with zero findings; full ESLint passes with zero errors and 56 existing warnings; static feature token/type guard and `git diff --check` are clean.

## Student UI standardization — Home + Profile reference routes (2026-11-07)

- Standardized `/student` and `/student/profile` as the first Indie Illustrated Scrapbook reference routes without changing their APIs, queries, Profile tabs or server-authored data.
- Consolidated Student typography roles, paper/tape variants, controls, fields, progress and portal dialog treatment under `styles/student/` and `components/student-ui`.
- Removed page-local raw colors and arbitrary type/radius/shadow values from both reference routes; StudentShell remains the owner of outer page padding.
- Profile avatar selection now uses the shared accessible Dialog primitive; the existing guardian email validation and Home shared SkeletonList change were preserved.
- Aligned active UI/frontend documentation with the implemented scoped theme. Remaining Student routes are explicitly migration debt, not an alternate visual system.
- TypeScript (`tsc --noEmit`) passes. Focused ESLint passes with zero errors and three DiceBear `<img>` optimization warnings; full ESLint passes with zero errors and 59 existing warnings. Production build is blocked before application compilation by the environment's unavailable SWC native binding/cache permissions, and authenticated viewport/browser verification remains pending because browser-control access was not granted.

## Student profile fidelity restoration and avatar persistence (2026-11-07)

- Restored all four originally designed Profile tabs (`overview | learning | streak | personal`), polaroid avatar picker, KPI cards, calendar, activity history and private guardian editing.
- Replaced Profile `MOCK` statistics and identity with existing Student profile/gamification/streak/assignment APIs and a new student-owned session learning-overview API; no fabricated progress.
- Added `student_profiles.avatar_key` (V54) with migration backfill from existing gamification avatar key where available; added validated `PATCH /v1/student/profile/avatar` and profile response `avatarKey`.
- Avatar update synchronizes an existing gamification avatar record without resetting personal/guardian data. Student Navbar now displays the same stored avatar key.
- Guardian detail remains collapsed by default, shows only primary/first record, permits editing, and preserves the other records in full-collection PUT updates.
- Validation: source checks and GitHub commit consistency only. Authenticated browser, database migration and frontend/backend compile/runtime tests still needed before release.



## Student Profile + typography consistency (2026-11-07)

- Aligned Student Home display typography to the calmer visual scale used by the Student Profile reference (30–36px page headings; 22–26px section headings).
- Codified Student-specific typography roles in `.agent/ui/INDIE_ILLUSTRATED_SCRAPBOOK_DESIGN_SYSTEM.md` and `styles/student/typography.css`; restored canonical Patrick Hand/Caveat/Nunito/Courier Prime roles while preserving the latest CSS material updates.
- Added a server-backed Student Profile at `/student/profile`. The old `/student/profile/[id]` demo route now renders the same real profile instead of mock data.
- Guardian details are hidden by default behind an accessible eye toggle. A single primary/first guardian is exposed for editing; all other stored guardians are preserved in the PUT payload because the backend performs collection replacement.
- Saving updates the existing student-profile endpoint; the view is refreshed from the server. Email and class data remain read-only.
- Authenticated browser and full frontend build/E2E checks remain pending.



## Indie Scrapbook Student theme + Home preview (2026-11-07)

- Introduced Student-only scoped semantic tokens, paper/ink texture, typography, visual primitives and reduced-motion rules; Teacher base palette/components remain unchanged.
- Reworked Student Home presentation (hand-drawn heading, paper hero, taped notebook list, polaroid mascot, paper Assignment note) without changing real Unit API queries, Streak/Level API rules or navigation contracts.
- Streak/Level visuals now use sketch meters; backend-authored XP/Streak values remain authoritative.
- Theme extends to root-mounted portals through CSS `body:has(.student-theme)` while the Student route is mounted (modern-browser requirement); Sonner remains semantically shared.
- Source-level review completed; frontend lint/build and authenticated browser comparison require execution in the project environment. No backend, Teacher UI or API change.



## Student visual governance (documentation only — 2026-11-07)

- Owner approved Indie Illustrated Scrapbook as the exclusive Student visual design; Teacher appearance stays unchanged (ADR 0032).
- Added canonical Student visual design document and aligned agent entry point, frontend-design skill, UI architecture, Student Learning Hub blueprint, frontend architecture, ADR index and documentation checklists.
- Superseded only legacy Student visual decisions; retained Streak/Level, Activity and Assignment business rules.
- **No CSS, component, UI runtime, backend or API implementation performed.** Scoped Student theme implementation and browser validation remain follow-up work.



**Updated:** 2026-11-06
**Branch:** `feature/student-gamification`
**Canonical state:** `.agent/CURRENT_STATE.md`

## UI correction (2026-11-06)

- Owner selected **border-ink + shadow-pop** (not shadow-ink) as the application-wide outlined visual pattern. Student Home now owns a compact real-data weekly Streak calendar and simple XP-based Level card; Rewards is Leaderboard-only preview. Week dates are delivered by the Streak API. Freeze and minute-based goals remain deferred. Verification pending.

## Current stage

- **Interactive E-Learning Landing Page — "The Learning Storybook" (Saltwake Inspired):**
  - Integrated complete animated storybook experience in `client-e-learning/src/components/landing/*` and `client-e-learning/src/app/page.tsx`.
  - **Scene 01 Hero Book:** 3D mouse parallax tilt (`perspective(1200px)`), rich emerald leather cover with golden typography, layered page turn physics, pop-up 3D papercraft landscape with rolling hills, rotating Knowledge Lighthouse, floating vocabulary hot-air balloon, and interactive 4-chapter timeline scrubber (`0.0 -> 1.0`).
  - **Scene 02 Explore World:** Hand-drawn dashed trail, wobbly wooden signposts tilting on hover, interactive Learning Mode vs Try Hard Mode preview switcher with heart counters and hints, and prominent scrapbook note for independent Activity vs Assignment concept.
  - **Scene 03 Play & Practice:** Interactive Bubble Pop sandbox (popping bubbles with paper star confetti, word polaroid cards, and reset) + Word Rain night lotus pond (luminous raindrop selection with water chime audio, glowing lotus blossoms, and ripple wave physics).
  - **Scene 04 Rewards Scrapbook:** Interactive XP progress bar with `+25/+50 XP` buttons that level up dynamically, weekly streak calendar with interactive rubber stamp thud interaction, and 3-tier podium with bobbing crowns and medals.
  - **Scene 06 Final Page:** Open horizon illustration with student adventurer, minimal footer, and direct CTAs into actual student/teacher login routes.
  - **Custom Ink Cursor & Web Audio API:** Smooth cursor trailing ink bead with splash ripple on click, and pure browser Web Audio API sound synthesis (`sound-effects.ts`) for page turns, bubble pops, water chimes, and stamp thuds with an in-navbar sound toggle.
  - Verified clean with `npm run build` (0 errors) and `npm run dev` (`HTTP 200 OK`).

- **Student Vocabulary Mini-Games (Bubble Pop & Word Rain):** Complete vertical slice
  implemented and UX-revamped based on student user feedback. Includes database migrations (`V53__create_vocabulary_and_game_tables.sql`
  and `V54__seed_vocabulary_words.sql`), Spring Boot JPA entities, repositories,
  services, and REST controllers (`/v1/student/game/*`). Frontend features a dedicated Game tab in student navbar,
  Grade/Unit selector Hub, wide responsive mode selector modal, and immersive Fullscreen runners.
  - **Bubble Pop (Space Word Shooter Pacing & Bubble Sizing Tuning):** Limited on-screen bubbles to 4-5 bubbles to eliminate clutter, reduced falling speed to a gentle ~0.34-0.46 px/frame for comfortable reading, enlarged bubble radius to 48-52px (~96-104px diameter) with large 16px/17px bold typography. Implemented organic continuous bubble flow: when the target word is resolved (shot or reaches bottom), only the target bubble is recycled while all surrounding distractor bubbles continue their natural descent without abrupt disappearance or mid-air morphing; fresh distractors and the next target word enter smoothly from the top.
  - **Word Rain (Enchanted Lotus Pond & Zero-Lag 60FPS Overhaul):** Completely eliminated all expensive `ctx.shadowBlur` Gaussian convolution calls across high-DPI canvases, replacing them with lightweight multi-pass layered strokes and hardware-accelerated radial gradients. Added delta-time physics interpolation for silky smooth, stutter-free movement. Slowed fall speed to a relaxed ~28-35s per drop so students have ample time to read and type comfortably without rush. Transformed the visual experience from a dark empty box into an enchanting, poetic night pond scene: fluffy animated rain clouds at the top with gentle drizzle, crescent moon & starry sky, luminous crystal dewdrops with high-contrast Vietnamese prompts and glowing golden letter pearl slots, click-to-lock drop targeting support, living lotus pond with animated undulating water waves, floating emerald lotus leaves (lá sen) and blooming pink lotus flowers (hoa sen), celebratory rainbow water fireworks upon word completion, and floating `+XP` / combo score banners.
  - **Teacher Vocabulary Management & Game Sync (Vertical Slice Complete):**
    - **Backend:** Implemented `TeacherVocabularyService` and `TeacherVocabularyController` (`/v1/content/units/{unitId}/vocabulary`) secured with `hasRole('TEACHER')`. Supports listing words with status/search filters, single word CRUD with IPA pronunciation and difficulty levels, bulk creation (`/bulk`), status toggling (`/status`), and ordering (`/order`).
    - **Frontend:** Integrated `UnitVocabularySection` into teacher Unit Detail (`/teacher/content/units/[unitId]`). Features word count badge, low-count warning for mini-game readiness (< 4 words), search/status tabs, inline TTS pronunciation audio test, active/inactive toggle switch, `VocabularyWordModal` for single word editing, and `BulkImportVocabularyModal` for 1-click batch import from formatted text (`word - meaning`).
    - **Student Game Integration:** Dynamic bidirectional sync: teacher changes to unit vocabulary immediately invalidate student game caches and reflect in real-time in student Game Hub and mini-game sessions.
    - Verified clean with `mvn test-compile` (0 errors) and `next build` (0 errors).
  - **Game Navigation & Replay Fixes:**
    - Fixed `removeChild` error on `/student/game/...`: Added `<meta name="google" content="notranslate" />` and `translate="no"` across root `layout.tsx`, added game route to `StudentShell` immersive routes (bypassing `StudentNavbar`), and protected `GameRunner` loading states.
    - Fixed Replay button modal dismissal: Updated `onReplay` in both `BubblePopGame` and `WordRainGame` to immediately clear `result` state (`setResult(null)`) and incremented `gameKey` in `GameRunner` to cleanly remount and re-initialize a fresh session.
  - **Game Selection Modal Scaling Correction:** Fixed CSS conflict where `dialog.tsx`'s default `sm:max-w-sm` was overriding caller max-width due to direct package `"cn"` imports bypassing `tailwind-merge`. Updated `src/lib/utils.ts` and `dialog.tsx` to use proper `twMerge(clsx(...))`, applied explicit `style={{ maxWidth: '860px', width: '94vw' }}` with `!max-w-[860px]` and `whitespace-nowrap` on action buttons, ensuring the modal is spacious, widescreen, and perfectly scaled across mobile and desktop.
  - **Word Rain (Dreamy Night Pond):** Poetic lo-fi nighttime rain aesthetic with diagonal drizzle patterns, moonlit nebulae, drifting firefly embers, crystalline dewdrop glass capsules, animated water ripple rings upon landing, and water chime audio.
  - Protected against browser extension translation DOM mutation crashes (`notranslate`, `translate="no"`).
  - Backend compile (`mvn test-compile`) and frontend Turbopack build (`npm run build`) verified clean.

- Student leaderboard read queries now use Spring Data JPA native-query projections; the previous JDBC template dependency was removed from this service. Backend compilation is pending a Java-enabled environment.
- Gamification backend code is organized by feature packages: `xp`, `streak`, `level`, `leaderboard`, and `profile`; profile, streak, level, and leaderboard endpoints now have separate controllers/services while preserving existing routes.
- **Student Streak/Level v1 source:** accepted milestone policy (3/7/14/30 → 10/20/40/80 XP), daily completion service, ledger/Level integration, authenticated read APIs, and live Rewards overview added. No Leaderboard live data or Streak Freeze. Validation pending.

- **Activity XP Engine Phases 1–4:** calculator, session audit, atomic terminal
  settlement, persisted result receipt and Activity Result UI implemented
  behind the default-off new-session rollout flag. Phase 5 deployment and
  release verification remain pending.

- **Student Learning Hub stages 1–3:** brief/nav contract, Home replacement,
  and Units/Unit Detail UI refinement on `feature/student-gamification`.
- Phase 7 Scope B AssessmentAttempt: on `main` (finalize path present).
- **Phase 8 Teacher Assignment Analysis: implementation code complete on this branch.**

## Streak/Level work log (2026-11-06)

- Added ADR 0030 and implementation plan; reused V49 Streak/ledger tables without schema changes.
- New `StudentStreakPolicy` and `StudentStreakService` attach `COMPLETED` transitions to one-per-day qualification and fixed STREAK_BONUS ledger. UI reads own profile and Streak from authenticated API; leaderboard remains mock and is visibly labeled.
- Added pure calendar/milestone unit tests and service tests for same-day idempotency, three-day bonus/Level advancement, and reset. PostgreSQL concurrency and authenticated E2E are outstanding.
- Maven test attempt blocked before compilation: Spring Boot 4.1.1 parent POM unavailable due Maven Central DNS/network restrictions. Frontend project dependencies are not installed in this shell; lint/type/build remain unverified.

## Activity XP work log (2026-11-06)

- Implemented the pure `ActivityXpCalculator` for the accepted v2.2 outcome
  matrix, strict resolved-outcome mapping, Level multiplier, per-award HALF_UP
  scaling, completion bonus and Level thresholds.
- Normalized the stored timeout outcome to `TIMEOUT`; legacy interaction-based
  timeout variants were never active and are superseded by ADR 0029.
- Added deterministic, database-free unit coverage for the complete matrix,
  Hint precedence, invalid outcome states, bonus/Level boundaries, overflow and
  per-question rounding.
- Validation: focused calculator suite passes (11/11). Full backend suite runs
  56 tests with 51 passing; five pre-existing
  `AssignmentServicePublishReadinessTest` cases fail because their test
  `service` fixture is null, outside this Phase 1 change.
- Phase 2 captures `ACTIVITY_XP_V2_2`, official Level and multiplier only for
  newly eligible sessions when `ACTIVITY_XP_ENABLED=true`; default remains off.
- New selected questions must have schema-v2 frozen Difficulty. Resolved
  questions persist outcome/base/final XP once; unresolved Learning retries and
  legacy sessions remain unaudited. Hint now shares the Session write lock used
  by Answer/Timeout.
- Profile first-create uses conflict-safe insert plus row lock; concurrent starts
  serialize on the Student and lock active Sessions before the profile to match
  the Phase 3 lock order.
- Phase 2 focused validation passes 30/30 across calculator, snapshot eligibility,
  profile/policy capture, question audit and ActivitySession wiring. Full suite
  was intentionally not run for this phase.
- Phase 3 now settles eligible `COMPLETED`/`GAME_OVER` sessions atomically under
  Session → profile locks, persists one positive PRACTICE ledger entry, updates
  Lifetime XP/Level, and durably finalizes zero/ABANDONED receipts without a
  reward row. V52 stores immutable Lifetime XP/Level-after receipt snapshots.
- Phase 4 extends the existing read-only Activity Result response with the
  persisted reward receipt and optional question audit. The student result UI
  displays committed question XP, completion bonus, total XP and Level change;
  loading, network error, abandoned and legacy/no-reward states are explicit.
- Restored the complete Practice runtime palette by replacing orphaned
  `practice-*` utilities in the runner and its directly rendered components
  with shared global semantic tokens (`learning`, `accent`, status, surface,
  border and elevation tokens). Layout and behavior are unchanged.
- The rollout remains disabled by default, so only sessions started with
  `ACTIVITY_XP_ENABLED=true` become eligible; historical sessions are not
  backfilled. Phase 5 migration preflight, rollout and operational checks remain.
- Per explicit request, no Phase 3/4 tests, build or lint were run. These phases
  are implemented but require the Phase 5 validation matrix before release.

## Teacher Analysis work log

- Spec + decisions locked (roster, duration, bands, accuracy).
- Backend overview / students / questions / attempt review.
- FE modular analysis UI + review sheet + Results entry from list.
- Removed sample result view; cleaned legacy DTO names.
- Docs synced (`CURRENT_STATE`, this file, `PHASES`, plan 11).

## Student Learning Hub work log (2026-11-05)

- Added `ui/STUDENT_LEARNING_HUB_BLUEPRINT.md` with Screen Briefs and real-API boundaries.
- Replaced `/student` DashboardView entry with a Learning Hub driven by
  `/v1/student/units`. No fictitious progress, recommendations or resume.
- Updated Student `Units` navigation label to `Learning` without changing URL.
- Simplified Unit explorer and Unit Detail hierarchy; preserved Section/Topic
  filtering and Activity routes; removed index-based Unit accent rotation.
- No backend endpoint, DTO, auth, Assignment runtime or Rewards contract changed.
- Validation in the local branch snapshot: `npm run build` passed;
  `npm run lint` passed with 53 pre-existing warnings (0 errors); focused
  changed-file lint had 0 errors (Navbar retains its existing effect warning);
  `git diff --check` passed. Standalone `npx tsc --noEmit` is blocked by
  missing Practice illustration imports (`practice-garden.jpg`,
  `practice-mascot.png`) outside this change. Authenticated browser/API E2E
  and viewport screenshot review remain open.

## Verification

- Frontend global page layout refactor completed on this branch: TeacherLayout and StudentShell now own the standard `1440px` page container; only the two Student runtime routes use immersive `h-dvh` rendering.
- Student rewards leaderboard presentation was refined with a clearer streak-first hierarchy, responsive current-student summary, accessible disabled states for unavailable ranking criteria, and token-only feature styling. It remains explicitly backed by presentation-only mock gamification data.
- Leaderboard UI static checks and `git diff --check` pass; focused ESLint, TypeScript, build, and browser-width verification could not be run because this shell has no Node.js runtime in `PATH`.
- `client-e-learning`: TypeScript and production build pass. Full ESLint remains blocked by pre-existing errors in the assignment result page and autosave hook; focused changed-file lint has no errors.
- Owner should run local E2E against graded attempts and visually verify 375px, 768px, and 1440px layouts.
- Teacher DataTable refactor added a generic React/TypeScript core at `client-e-learning/src/components/ui/data-table/data-table.tsx`.
- Student result view now consumes the expanded server result DTO, has no mock/demo fallback, and uses localized, split review components.
- Frontend state audit and migration started: page-level loading uses `FullPageState`, list/table regions use matching skeletons, and region error/empty states use `RegionState`. The migration matrix is in `.agent/frontend-state-audit.md`.
- Shared frontend formatting utilities now live under `client-e-learning/src/utils/format/`; date/time, score, duration, and initials consumers use the barrel exports instead of local/type/mock helpers.
- StudentTable, ActivityWorkspace, Assignment Analysis class comparison/classes/sections/students tables now use the shared column/pagination presentation while retaining feature-owned renderers and behavior.
- Expandable question analysis rows and content import preview remain specialized tables because their nested row interaction is not representable by the minimal DataTable column contract without changing behavior.
- Teacher class student management is now split into a query/mutation hook, roster table, and add/transfer/remove dialogs. The add-student query uses `noClass=true` with a fixed fetch size and intentionally has no pagination UI.

## Leaderboard work (2026-11-06)

- Connected Student Rewards UI to real read-only XP/Streak ranking endpoints with 50 displayed students, deterministic self rank including out-of-top-50 card; time filters on XP only.
- Replaced mock Honors with 2 server-backed honors (lifetime XP, longest Streak), and recent activity with terminal ActivitySessions.
- No ranking table migration. Runtime PostgreSQL verification, backend Maven, frontend lint/build, and authenticated E2E not yet run.
