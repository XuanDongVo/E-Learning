# Vocabulary Learn / Review — Phase 02 Foundation (2026-11-10)

**Implemented boundary:** server-side FSRS scheduling and typed client transport. This phase
does **not** ship a Student Learn UI, practice activities, pronunciation assessment,
vocabulary mini-game changes, gamification XP/Streak, or CSV file importing.

## Persistence

- `student_vocabulary_progress`: unique `(student_id, word_id)`; one durable FSRS
  `Card.toJson()` per word and student, `due_at` as UTC timestamptz, review count,
  last review time. Rows are created only after an explicit rating; new ACTIVE
  vocabulary without a progress row is available for study immediately.
- `vocabulary_review_logs`: append-only event per real review, storing rating,
  UTC review/due time, the resulting card JSON, and library review log JSON.
  `request_id` is unique per student for retry safety; the original scheduled
  response is replayed for identical `(word, rating, requestId)`.
- Pin `io.github.open-spaced-repetition:fsrs:1.0.0` for scheduling; no custom
  calculation of intervals. Cards/review logs are serialized by that library.
- `ON DELETE RESTRICT` for a word referenced by vocabulary progress. Teacher
  delete now returns `409 VOCABULARY_WORD_HAS_PROGRESS` and prompts **Tạm ẩn**;
  no progress is erased by hard-deleting a used word. Inactive words are excluded
  from the Student queue but keep existing progress for later reactivation.

## Student API

Both endpoints require a valid Student JWT and resolve student ID from server auth.
Visibility exactly matches published Units of the student's ACTIVE-class Grade.

1. `GET /v1/student/vocabulary/units/{unitId}/cards`: ACTIVE Unit words ordered
   by displayOrder, with Flashcard content and `state` (`NEW`, `LEARNING`,
   `REVIEW`, `RELEARNING`), nullable `dueAt`, `reviewCount`, `due`. New cards are
   due without writing progress rows. Existing cards are due only when dueAt ≤ now.
2. `POST /v1/student/vocabulary/words/{wordId}/reviews` with body
   `{ "requestId": "uuid", "rating": "GOOD" }`. Ratings map directly to FSRS
   AGAIN/HARD/GOOD/EASY; response includes `state`, `reviewedAt`, `dueAt`, count.
   One review transaction locks its Student row, loads the previous FSRS card,
   rejects not-yet-due reviews with `409 VOCABULARY_REVIEW_NOT_DUE`, and writes
   the new card plus log atomically. The `requestId` is generated once per
   logical answer and reused on HTTP retry; using it with another word/rating
   returns `409 VOCABULARY_REVIEW_REQUEST_CONFLICT`.

## Error contract and FE

- Vocabulary validation errors use `AppException(ErrorCode, detail)` and API
  `{success:false,code,message,data:null}` with 400/404/409 as appropriate.
- Spring bean validation provides its first human-readable field message,
  malformed JSON returns a safe 400 message (not an internal 500).
- `AppError.message` on FE equals `ApiResponse.message` exactly, while
  `AppError.code` separately retains the stable code. Teacher modal, list,
  candidate search and delete/status actions display server messages.
- `emptyVocabularyRelatedTerms` is imported as a **runtime value** in the
  Teacher VocabularyWordModal, fixing the type-only import failure.

## Intentional limits / next phase

- Practice (MCQ / typing / pronunciation) and games **do not advance FSRS**.
- The Learn/Review UI must decide the submission moment and use one UUID per
  rating event; do not generate a new ID on a retry.
- Review results do not grant XP or affect Activity Streak.
- Manual re-practice before due is allowed in a future Practice UI but must not
  call this scheduling endpoint. For now scheduling submissions before due
  are rejected.
- No backfill for legacy Game sessions. No migration of earlier freeform state.
- Deleting an entire Unit with linked vocabulary progress would be restricted
  by the new foreign key. The current platform has no Unit hard-delete endpoint;
  any future Unit delete workflow must choose an explicit history policy.

## Verification

Focused backend tests cover new/due cards, first review, retry idempotency,
early-review conflict, existing normalization and AppException contracts.
Maven execution remains blocked if Spring Boot's parent POM cannot be resolved
from Maven Central; run the tests, TypeScript check and authenticated Postgres
integration checks on a network-connected developer/CI environment.
