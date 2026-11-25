# Vocabulary Content Enhancement — Phase 01 (2026-11-10)

**Scope:** Teacher content authoring only. No CSV Import, FSRS, Student Learn, Student Practice, Game XP, or new game engine changes.

## Accepted data contract

- `vocabulary_words.related_terms` is a non-null JSONB value with three arrays:
  `wordFamilies`, `synonyms`, and `antonyms`.
- Each entry has `term` (required, up to 120 characters), optional `meaningVi`
  (up to 255), and optional `VocabularyPartOfSpeech` enum.
- Maximum 20 entries per group. The backend trims/collapses whitespace and removes
  case-insensitive duplicates **within** a group, preserving the first entry and its order.
- The same related term may appear in different VocabularyWords and/or groups.
- Related Terms are inline value objects, not JPA entities: no separate ID, foreign
  key, FSRS card, Unit count, Activity question, or automatic VocabularyWord creation.
- Search candidates are **copy-only**. Selecting an existing word copies its
  term/meaning/part of speech into the draft; changing its source later does not
  alter the copy.
- On create, absent `relatedTerms` becomes empty arrays. On update, an omitted
  `relatedTerms` preserves existing data (legacy client support); explicit empty
  arrays clear the stored data. Responses always contain all three arrays.
- Existing Unit duplicate-word checks and game/runtime behavior are unchanged.

## Teacher screen brief

User: Teacher.
Goal: Add/edit Unit vocabulary with complete Flashcard reference content.
Page type: shared Unit vocabulary list plus edit/create Dialog.
Primary action: Save VocabularyWord.
States: list/search loading, empty, error/retry; dialog form validation and save,
candidate search loading/empty/error, upload progress/error, live front/back preview.

## Implemented API

- `GET /v1/content/vocabulary/search?unitId={id}&q={text}&limit={n}`:
  Teacher-only through `/v1/content/**` role filter; searches ACTIVE vocabulary in
  the source Unit's Grade, only word text, case insensitive. `q` length 2–100;
  limit capped at 20; returns IDs for display/context, but selection does not link.
- Existing create/update/bulk/list/get Vocabulary endpoints include `relatedTerms`.
  Quick paste import remains unchanged; **file CSV Import is deferred**.
- Existing Media upload endpoint supplies the image URL used by the Teacher
  editor and preview; removing the image removes the reference only.

## Boundaries and follow-up

- No VocabularyWord is automatically created by adding synonyms, antonyms, or
  word families. Use the normal Teacher add-word flow to make a learnable word.
- `exampleSentence` and `exampleMeaningVi` remain part of VocabularyWord and
  appear on the back of the Teacher Flashcard preview; no separate Example mode.
- Generic Media upload makes READY media immediately; an upload followed by a
  canceled edit may leave an unattached asset. Image removal does not delete
  Media because another consumer may reference that asset.
- Before FSRS progress, review hard-deletion of words and ON DELETE CASCADE game
  answers as a separate data-retention decision.
