# 0037 — Vocabulary library, due review and relearning

Status: Accepted
Date: 2026-11-18
Decided by: project owner

## Context

Vocabulary review progress is already stored per Student and VocabularyWord.
V65 added `needs_relearning`, and the current review service preserves the
immutable AGAIN log while resetting the active card so the word returns to Learn.
The older Phase 03 document still described this reset policy as deferred.

The new Student Vocabulary Library must list learned, due and waiting words
across every vocabulary source visible to the Student. Today every
VocabularyWord belongs to a Unit. A later vocabulary domain may introduce
Collection or another source, so Library and FSRS behavior must not make Unit
the permanent owner abstraction.

## Decision

1. A learned word has Student FSRS progress and `needs_relearning = false`.
   DUE is learned with `due_at <= serverNow`; WAITING is learned with
   `due_at > serverNow`. Therefore `learnedCount = dueCount + waitingCount`.
2. Review AGAIN keeps the append-only review log, resets the active FSRS card,
   sets `needs_relearning = true`, and returns the word to the existing Learn
   flow. It does not re-enter the current Review queue.
3. The Library browse APIs are paginated. The Due Review queue is a separate,
   non-paginated snapshot containing every accessible DUE word at its server
   `asOf`, ordered by `dueAt ASC, wordId ASC`.
4. “Review now” always reviews the complete DUE snapshot. Browse pagination,
   search text and current source presentation do not narrow the queue.
5. The snapshot is fixed in the client for that Review pass. Rating/refetch
   changes do not add, remove or repeat queue items. Reloading starts a new
   server-authoritative snapshot; no durable ReviewSession entity is introduced.
6. Vocabulary owns a shared Student access-policy boundary used by Library reads,
   queue reads, preview and rating writes. Its current implementation delegates
   to the published-Unit/current-Grade rule. Callers must not embed Unit-only
   authorization rules.
7. FSRS progress remains keyed by `(student_id, word_id)` and is independent of
   source presentation. Current Unit metadata may be projected as an origin, but
   this ADR does not introduce Collection, a polymorphic owner or a new database
   entity. Any future Collection domain requires its own accepted design.
8. A stale snapshot conflict such as `VOCABULARY_REVIEW_NOT_DUE` must not retry
   forever. The client may skip that item and continue or refresh the queue.
   Transport/unknown-outcome retries reuse the same request ID.

## Consequences

- The existing V65 behavior is the accepted AGAIN contract and the Phase 03
  deferral is removed.
- Review Queue cannot be implemented by fetching only the first DUE page or by
  concatenating browse pages in the browser.
- No Unit filter is part of the initial cross-source Library contract. Source
  filtering can be added only after a source-neutral filter contract is agreed.
- The current Unit notebook remains available; the cross-source Library and its
  queue are additional read flows over the same progress ledger.
- An unusually large DUE set produces a large response by explicit product
  choice. Performance and payload size must be measured, but the server must not
  silently truncate the queue.
