# Phase 7B — Remaining Implementation Plan

**Audit date:** 2026-10-23  
**Branch:** `refactor/teacher-content-ui-routing`  
**Canonical state:** `.agent/CURRENT_STATE.md`

## Already implemented

The original V30→V33 migration plan is historical and must not be followed literally. The current branch already contains V31–V42 and the corresponding implementation slices:

- V31: question content revision and explicit option display order.
- V32: ActivitySession snapshot metadata/payload storage.
- V33: Assignment Composition sections/items, ordering and deterministic legacy backfill.
- V34–V42: subsequent Assignment/question/recipient/time-limit changes.
- Question Engine specs/handlers/registry for seven question types.
- Assignment Builder backend persistence integration and canonical Builder routing.
- Server-side Assignment publish readiness validation.

Never recreate these migrations. Re-audit the migration directory before any new schema change; current maximum is **V42**.

## Gate A — current-system verification

Before implementing new AssessmentAttempt functionality:

1. Run backend tests and Flyway validation against V42.
2. Run frontend lint, tests, typecheck/build and relevant browser checks.
3. Verify ActivitySession snapshot completeness, legacy IN_PROGRESS handling, snapshot-only runtime behavior and answer leakage boundaries.
4. Verify Question Engine persistence round-trip and handler parity.
5. Record exact results in `.agent/PROGRESS.md`.

Gate A is not passed until these checks are actually executed.

## B1 — AssessmentAttempt

Implement the formal Assignment runtime as a separate aggregate:

- States: `IN_PROGRESS`, `SUBMITTED`, `TIMED_OUT`.
- One official attempt per student per Assignment.
- Immutable attempt snapshot of Composition order, QuestionSpecs, relevant grading/normalization versions, media, points/required/example flags, timing and visibility settings.
- Server-authoritative whole-attempt timer.
- Persist answers with idempotent autosave/submit.
- Timeout auto-submits saved answers.
- Enforce published/open/due/target/current-class access on the server.

## B2 — Assignment hard lock

Once the first AssessmentAttempt starts, reject authoring changes affecting the attempt contract: Assignment metadata, targets/schedule, Composition/order, owned question content/membership, points/required/example flags and review settings.

- Enforce the lock server-side and transaction-safely.
- Closing/archiving may prevent future starts but must not mutate historical snapshots.
- Amendments use cloning to an independent Assignment.

## B3 — Automatic scoring and review

- Submit/timeout automatically grades from the immutable attempt snapshot.
- Use canonical Question Engine semantics; no manual grading and no AUTO/MANUAL selector.
- Persist earned/possible points, percentage and per-part status/earned/possible results.
- Persist optional normalized submitted values internally.
- `show_score_after_submit` controls score visibility.
- `show_answers_after_submit` independently controls answer/explanation visibility.
- Examples are excluded from the score denominator.

## B4 — Analytics/export

After persisted attempts/results exist:

- Per-student status/score and class average.
- Correct/partial/incorrect/unanswered outcomes with explicit denominators.
- Most-missed questions.
- Normalized submitted-answer distributions where applicable.
- CSV/Excel export.
- Teacher ownership/target-scope/privacy enforcement.

## Question Engine remaining boundary

The Question Engine is real code, not a proposal, but integration is incomplete:

- ActivitySessionService still contains type-specific answer checking/reveal branches.
- MATCHING/CLOZE have specs/handlers/factory/DTO support, but complete persistence round-trip, authoring, preview/runtime and invariant validation are not verified end-to-end.
- Selector/snapshot-assembler tests and full student leakage tests remain required.
- Composition remains separate from QuestionSpec semantics.

## Activity snapshot boundary

`ActivitySessionQuestion` currently stores both a live `Question` relation and snapshot fields. The snapshot payload is the intended runtime source, but documentation must not claim complete historical immutability until rollout and integration tests prove it.

## Definition of done

- AssessmentAttempt exists and enforces one official attempt.
- Immutable attempt snapshot drives display/grading/reveal.
- Autosave, idempotent submit and whole-attempt timeout are server-authoritative.
- Assignment hard lock is enforced after first attempt; clone is the amendment path.
- Automatic weighted scoring and per-part results are persisted.
- Score and answer visibility are independent and enforced server-side.
- Analytics/export use persisted real attempt results.
- Backend/frontend/browser validation is executed and exact results are recorded.
