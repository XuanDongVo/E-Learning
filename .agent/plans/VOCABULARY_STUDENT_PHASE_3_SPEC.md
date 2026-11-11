# Vocabulary Phase 03 — Student Learn / Practice / Review UI (2026-11-10)

## Learn refactor (2026-11-11) — supersedes the original Learn/Practice flow below

### Learn action-area UX update — desktop and mobile

- The shared Study Session starts each mode with Chưa nhớ/Đã thuộc hidden. WORD unlocks after Flashcard reveal; Multiple Choice after an answer; Typing after checking a nonempty entry (editing resets the unlock); Pronunciation after listening to a sample, receiving speech recognition, or explicitly confirming self-practice. No browser microphone support is required to proceed.
- Entering a different mode, including reselecting the current mode, resets its pending interaction and hides the action buttons. `Chưa nhớ` advances to the next mode, wrapping Pronunciation → WORD. `Đã thuộc` replaces the **same action area** with the four-choice rating panel; Back restores Chưa nhớ/Đã thuộc without creating another rating surface below.
- Mobile mode tabs allow horizontal scrolling at narrow widths. Action buttons are two equal columns, and rating buttons use a 2×2 mobile/4-column desktop grid. These changes are Student-theme-scoped and do not change Browse, Teacher or Review behavior.

- Browse remains unchanged. Learn operates only on NEW words. Review operates only on already-studied words with `due=true`.
- Learn has four freely selectable modes for the **same current word**: Word/Flashcard, Multiple Choice, Typing Recall, Pronunciation. `Chưa nhớ` advances WORD → MULTIPLE_CHOICE → TYPING → PRONUNCIATION → WORD; manual tab selection is allowed.
- `Đã thuộc` only opens the four-choice rating panel. `Học lại` queues the word locally without calling FSRS, and advances to another word. `HARD`/`GOOD`/`EASY` alone record the backend review, then advance after success.
- Learn's dynamic queue contains all NEW Unit words, plus up to five unique retry words. When five retries are outstanding, cycle retries; otherwise take new words first. Neither a timer nor a mandatory number of completed practice modes is involved. A lone retry word can recur; each pass resets its mode to WORD. Persist transient ordering in sessionStorage and reconcile with server progress.
- Initial FSRS graduation policy is HARD +6h, GOOD +12h, EASY +1d. The backend applies the initial due time and persists the full library Card state; subsequent reviews use Java-FSRS. `GET /v1/student/vocabulary/words/{wordId}/review-preview` previews the four ratings without writing progress. The client never invents schedule timestamps.
- `AGAIN` remains available in Review and continues to be persisted through backend FSRS. Its future reset policy is deferred.
- The retired standalone `vocabulary-flashcard.tsx` and `vocabulary-practice.tsx` were replaced by the shared hub Flashcard and inline mode components. Teacher UI, Unit Games, Activity and XP are unaffected.

The original Learn/Practice behavior described below is historical context, not the active Learn contract.

## Phase 03 UI refresh — independent library, unchanged vocabulary ownership

- Canonical entry `/student/vocabulary` is a standalone Student Library; Unit
  detail contains only a lightweight link, not the entire vocabulary experience.
- `GET /v1/student/vocabulary/overview` returns published, Grade-visible Unit
  collection summaries and ACTIVE word new/due/learned counts. The student
  cannot enumerate out-of-Grade vocabulary. The library has loading, error,
  empty, search and due-filter states; Unit cards link to the existing FSRS flow.
- Canonical Unit route `/student/vocabulary/units/{unitId}` includes Browse/Learn/
  Review/Games. Old `/student/units/{unitId}/vocabulary` remains functional for
  compatibility; no deletion or redirect is needed.
- Browse is a compact, single-column, searchable word list, not a two-column
  stack of large paper cards. Optional thumbnails occupy space only for words
  with images. The Flashcard reverse displays the illustration in a 2/5-width
  column beside text on desktop, above text on mobile; text-only cards use
  the full reading width, without empty image placeholder. Broken images fall
  back to text-only rather than implying media exists.
- Teacher management keeps its existing admin UI. No `VocabularyEntry`/
  `VocabularyCollection` schema refactor is introduced yet; Unit ownership is
  still the current persisted model. Activity/Game XP and FSRS are independent.
- Grade 7 `07_vocabulary.sql` is updated to uppercase enum values (V55) and
  adds a curated subset with UK/US IPA, JSONB related terms, and bundled sample
  illustrations. 120-word fixtures and no-image scenarios remain; no DB row
  deletion or truncation. A later CSV-import feature remains separate.

## Screen briefs

**Student Unit Detail**
- User: Student
- Goal: find Vocabulary from an already-visible Unit
- Page type: Unit detail
- Primary action: Open Vocabulary Notebook
- States: existing Unit loading/empty/error and new Unit-scoped link

**Unit Vocabulary Notebook**
- User: Student
- Goal: browse vocabulary, self-rate learning, review due cards, play Unit games
- Page type: Student learning flow
- Primary action: Learn recommended card (other tabs remain available)
- States: loading, Unit access/API error + retry, no ACTIVE words, no due words,
  preview before due, pending rating, failed rating with same requestId retry, saved rating

## Product boundaries and flow

Entry: `/student/units/{unitId}` → `/student/units/{unitId}/vocabulary`.
Visuals use the **Student Indie Illustrated Scrapbook** contract via Student-only
layout theme and `components/student-ui`. Teacher CRUD/modal styling is unchanged.

- **Xem từ**: all ACTIVE words, meaning, state/new/due/next schedule label; choose
  any word for its Flashcard. For an early word, viewing or practicing is allowed
  but self-rating does not submit a review before due.
- **Học**: recommended due reviewed cards first, then never-rated new cards;
  students can explicitly choose another eligible card. Flashcard front shows word,
  POS, UK/US IPA + browser speech synthesis; flip shows meaning, image, example,
  optional word family / synonyms / antonyms.
- **Đã nhớ**: choose HARD/GOOD/EASY based on memory strength; backend's Java-FSRS
  calculates `dueAt`. No manual interval buttons or local FSRS scheduling.
- **Chưa nhớ**: opens optional self-practice (multiple choice, typing recall,
  browser speech recognition) with the answer side hidden. The student can
  record AGAIN once; practice correctness alone never writes FSRS progress.
- **Ôn tập**: only learned and due cards, same self-rating mechanism; empty due
  queue explicitly shows a completed state. Refresh checks for newly due cards.
- **Chơi**: Bubble Pop / Word Rain link to existing per-Unit game runner, require
  US/UK accent choice and offer PRACTICE/CHALLENGE; no FSRS side effects.

## Business and resilience rules

- Source of truth: `GET /v1/student/vocabulary/units/{unitId}/cards`; nothing
  derives mastery from game results/Activity, XP or Streak. New = no progress;
  reviewed = not NEW; due = server field. "Đã bắt đầu học" is not a claim of mastery.
- `POST /v1/student/vocabulary/words/{wordId}/reviews` sends a generated UUID
  **once** per logical rating; HTTP retry reuses that payload. The response is
  followed by cache refresh; if it fails, FE displays the server's message and
  offers retry of the same request or explicit discard.
- Multiple choice uses other ACTIVE Unit meanings as distractors (unique meaning),
  unavailable when fewer than 2 distinct choices. Typing evaluates case- and
  whitespace-insensitive exact English word, not synonyms.
- Browser speech recognition is **optional**, may rely on browser speech services
  and microphone permission, and only compares transcribed text; it does **not**
  grade phonetic pronunciation quality. Unsupported browsers can use MC/typing.
- Teacher-created relatedTerms are display-only, not independently learnable
  cards and not practice answers. Teacher remains in its existing admin visual
  system. Student route imports no Teacher UI or styles.

## Acceptance / manual verification

1. Unit with no ACTIVE words: helpful empty state; game buttons disabled.
2. Fresh student: all words NEW, due, no progress until explicit rating.
3. Flip front/back; verify US/UK listen, IPA, optional image/example/terms.
4. Wrong MC/typing answer reveals correction but does **not** advance FSRS.
5. Chưa nhớ → practice → AGAIN; due moves to next schedule per backend.
6. Đã nhớ → HARD/GOOD/EASY; confirms result and card leaves due queue.
7. Refresh/reload resumes persisted progress; early preview cannot submit.
8. Simulate network failure after review: retry uses same requestId, not new log.
9. Microphone denied or recognition unavailable: accessible fallback, no fake score.
10. Game US/UK requirement and PRACTICE/CHALLENGE URL values; no XP/streak
    coupling introduced by vocabulary Learn/Review.
11. Student mobile widths 375/768/1024/1440 and keyboard focus/contrast;
    Teacher form/UI must remain visually unchanged.

## Out of scope

- Teacher CSV import, Activity/Gamification refactor, full Game Hub visual migration,
  speech-pronunciation scoring beyond transcript matching, XP for Flashcard,
  offline FSRS synchronization, scheduled push notifications.
