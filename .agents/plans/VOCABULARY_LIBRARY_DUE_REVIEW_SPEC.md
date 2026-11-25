# Vocabulary Library and Due Review — implementation specification

Date: 2026-11-18  
Status: Backend and Client phases implemented; browser/build verification open  
Authority: ADR 0037

## 1. Scope

Add a cross-source Student word Library with Learned, Due and Waiting views and
an all-DUE Review pass. Reuse the existing FSRS ledger, Flashcard, rating API and
Student visual system. Do not create another scheduling algorithm, duplicate
Flashcard/Rating components, or introduce a Collection entity in this slice.

Existing `/student/vocabulary` Unit overview and Unit notebook behavior remain.
The new routes are:

- `/student/vocabulary/words` — cross-source word Library.
- `/student/vocabulary/review` — all-DUE snapshot Review.

## 2. Canonical classification

The server evaluates one `Instant now` per request:

```text
LEARNED = progress exists AND needsRelearning = false
DUE     = LEARNED AND dueAt <= now
WAITING = LEARNED AND dueAt > now
```

Words with `needsRelearning = true` appear as NEW in the existing Learn flow and
in none of the three Library sets. Only ACTIVE vocabulary accessible through the
Student vocabulary access policy is visible.

The word label “Learned” means “has an active FSRS schedule”, not mastered.
Student copy must make that distinction clear.

## 3. Backend contract

All responses use the standard `ApiResponse` envelope. Student ID comes only
from JWT. Browse pages use the repository's established 1-based API convention.

```text
GET /v1/student/vocabulary/words/summary
GET /v1/student/vocabulary/words/learned?page=1&size=20&search=
GET /v1/student/vocabulary/words/due?page=1&size=20&search=
GET /v1/student/vocabulary/words/waiting?page=1&size=20&search=
GET /v1/student/vocabulary/review-queue
```

`summary` returns `{ learnedCount, dueCount, waitingCount, asOf }` and must
satisfy `learnedCount = dueCount + waitingCount`.

The three browse APIs return `PageResponse<StudentVocabularyLibraryWordResponse>`,
not `PageResponse<List<...>>`. Search matches normalized word and Vietnamese
meaning, escapes wildcard characters and does not affect Review Queue scope.
Rows use deterministic `dueAt ASC, wordId ASC` ordering.

The initial contract deliberately has no `unitId` filter. Current Unit context
is projected as `origin: { type: "UNIT", id, code, name }` display metadata,
not the permanent access/ownership abstraction. `origin.type` may be extended
only after the corresponding vocabulary source domain is accepted.

`review-queue` is not paginated and must not be truncated. It returns:

```text
asOf
totalDue
items: full StudentVocabularyCardResponse[]
```

Items contain all existing Flashcard and FSRS fields needed for Review without
per-word detail requests. `totalDue` equals `items.length` for the snapshot.

### Access boundary

Introduce one Vocabulary-owned Student access policy used by:

- Library summary and browse queries;
- Review Queue;
- review preview;
- mark/unmark where applicable;
- rating writes.

Today the policy accepts ACTIVE words in PUBLISHED Units belonging to the Grade
of the Student's ACTIVE class. It may delegate to `StudentUnitService`, but
Library and Review services must depend on the vocabulary policy rather than
repeating or permanently exposing the Unit rule.

Do not introduce Collection, nullable owner columns or polymorphic foreign keys
in this implementation. A future source can extend the access policy and origin
projection after its domain contract is accepted; FSRS remains word-based.

### AGAIN and concurrency

Review AGAIN follows ADR 0037/V65: append log, reset active card, set
`needsRelearning`, complete the current queue item, and return it to Learn.

Every logical rating creates one UUID and reuses it only for retry. A stale queue
may receive `VOCABULARY_REVIEW_NOT_DUE` if another tab already reviewed the word;
the client offers skip/refresh rather than endlessly retrying the same conflict.

## 4. Backend phase — implemented 2026-11-18

1. Correct the existing controller/service skeleton signatures and pagination.
2. Add the vocabulary access-policy boundary and migrate existing preview/write
   checks to it without changing the current Unit visibility result.
3. Implement summary and the three stable paginated queries.
4. Implement the complete full-detail Review Queue query without N+1 reads.
5. Reuse existing `ErrorCode` and standard error envelope. Add a new code only
   for a distinct recoverable business state; an empty queue is success, not an
   error.
6. Measure query plans before adding an index. Do not add a speculative migration.
7. Test classification boundaries, relearning exclusion, access, inactive words,
   search escaping, stable pagination, the summary invariant, full queue size,
   full Flashcard projection, idempotent retry and stale-snapshot conflict.

Backend gate result: production compile, focused Vocabulary tests (17/17) and
Spring application-context/PostgreSQL startup test pass. The full backend suite
still has six pre-existing unrelated failures in Assignment publish-readiness
fixtures and one ActivitySession Ordering strict-stub case.

## 5. Client phase — implemented 2026-11-18

1. Add typed Library/Queue services and a central vocabulary query-key factory.
2. Load Summary and only the selected tab. Other tabs fetch when selected and
   remain cached by a query identity containing status, page, size and debounced
   search.
3. Use `SkeletonList` for list loading, `RegionState` for list error/empty with
   retry, `FullPageState` only when the route shell cannot render, and the shared
   feedback primitives for operations.
4. Keep feature copy in `messages/{locale}/student/vocabulary.json`. Resolve
   errors by code through `getAppErrorMessage` and
   `messages/{locale}/error.json`; do not use raw backend text as primary copy.
5. Create a Review container holding the fixed queue IDs and completed IDs. It
   reuses `VocabularyFlashcard`, `VocabularyRatingPanel` and the rating mutation.
   It has only Browse and Review views; no Learn tab and no Browse Mark action.
6. Do not reuse `VocabularyBrowseTab` wholesale: it owns Unit-local filtering and
   Mark mutations. Reuse/extract its presentational children so the cross-source
   read-only flow does not inherit Unit behavior.
7. After a successful rating, mark Vocabulary Summary, Library pages, Unit cards,
   overview and progress caches stale. Queue membership stays frozen until the
   pass completes.
8. Completion shows one result for the whole pass. There is no per-word saved
   screen and no extra Continue click after a successful rating.
9. Verify loading, empty, error, disabled and success states plus keyboard/touch
   behavior at 375, 768, 1024 and 1440px.

Implemented routes use the existing Indie Illustrated Scrapbook surfaces:

- `/student/vocabulary/words` provides Summary counts, lazy Learned/Due/Waiting
  lists, debounced word/meaning search, pagination and explicit region states.
- `/student/vocabulary/review` holds one non-refetching queue snapshot, offers
  read-only Browse and Review views, advances immediately after a saved rating,
  skips stale `VOCABULARY_REVIEW_NOT_DUE` rows and reports one pass result.
- The shared Review session creates one request UUID per logical rating and
  reuses it on retry. Global Review invalidates Library, Summary, overview and
  progress caches without invalidating queue membership; the existing Unit flow
  keeps its deliberately disabled progress invalidation.

## 6. Error-message ownership

- Server: stable `ErrorCode`, HTTP status and safe fallback message.
- Client error source of truth: `messages/vi/error.json` and
  `messages/en/error.json`, selected by `AppError.code`.
- Generic state/action labels: `messages/{locale}/feedback.json`.
- Vocabulary page copy: `messages/{locale}/student/vocabulary.json`.

All existing `VOCABULARY_*` codes used by this flow must be present in both
error catalogs before the Client phase is complete.

## 7. Validation gate

- Backend focused tests and `./mvnw test` when dependencies are available.
- Frontend affected-file ESLint, TypeScript/production build and responsive QA.
- Authenticated checks for a fresh Student, due/waiting boundary, AGAIN returning
  to Learn, a multi-Unit queue, all-DUE count beyond one browse page, retry with
  the same request ID, stale multi-tab review and no accessible vocabulary.

Client validation on 2026-11-18: both locale catalogs parse as JSON and focused
ESLint reports 0 errors (three pre-existing warnings in the Unit overview).
`tsc --noEmit` reaches only the stale generated `.next` reference to the removed
`tree-preview` route. The Browse mark/unmark mutation result mismatch was fixed
by normalizing its unused success result to `void`. Per owner direction, no Client
build, Server test rerun or authenticated viewport/browser pass was performed.
