# Question Pooling — Implementation Plan

**Status: PROPOSED — gated on approval of `QUESTION_POOLING_SPEC.md`**  
**Target branch:** `feature/phase-7-assigment`  
**Target phase:** Phase 7B, after base Assignment Composition is verified and before AssessmentAttempt runtime is considered complete.

## 1. Preconditions

Do not start this feature until:

- The owner has accepted the proposed Question Pool behavior and the decision is recorded in an ADR.
- The Scope A ActivitySession gate required by the active Phase 7 plan is recorded as passing, or the owner explicitly records an exception.
- The current branch HEAD, working tree, Composition DTOs/entities, assignment_items constraints, QuestionSpec persistence/readiness, and actual Flyway maximum have been re-audited.
- Base Composition create/read/update/reorder round trips have passing integration tests. Current implementation status is documented as unverified in `.agent/PROGRESS.md`; don't infer that wiring means it's complete.

Read first: ADR 0023–0026, `.agent/architecture/question-engine-v1.md`, `.agent/architecture/assignment-composition-v1.md`, the active Phase 7 spec, and the Question Pooling spec.

## 2. Vertical implementation slices

### Slice QP0 — Finalize contract

1. Resolve owner decisions in `QUESTION_POOLING_SPEC.md`.
2. Create a later accepted ADR. If the accepted Composition `POOL` discriminator or schema constraints need changing, explicitly record how backwards compatibility is preserved.
3. Update Composition/API/student runtime DTO schemas and UI blueprint in lockstep.
4. Record decisions and scope exclusions. Do not implement a global reusable pool, weighted selection, difficulty quotas, or Activity changes unless explicitly approved.

**Exit gate:** one normative definition for pool item/member, draw count, selection algorithm, point fairness, duplicate policy, snapshots, analytics, and student leakage.

### Slice QP1 — Persistence and Composition validation

1. Re-audit the existing relational schema and Composition implementation; reuse `assignment_items`/membership support if it can express a pool container and ordered candidate members without ambiguous constraints.
2. Add forward-only Flyway migrations only where required. Never edit applied migrations; choose the next unused migration number from the actual repository state immediately before authoring.
3. Persist the pool's container identity/configuration, `drawCount`, ordered candidate membership and candidate-level Assignment scoring fields.
4. Add server-side validation for range, readiness, Assignment ownership, uniqueness, no duplicate location, non-example members, equal aggregate points and part-point totals.
5. Ensure Draft save can retain an incomplete pool with actionable diagnostics while publish/readiness/start rejects an invalid pool.
6. Add API DTO mapper, persistence round-trip, backfill/constraint and authorization tests as applicable.

**Exit gate:** real Composition GET/PUT preserves the complete pool definition and rejects invalid published-ready configurations.

### Slice QP2 — Server-side selection and immutable attempt snapshot

1. Implement a small pure selection service that draws K candidate members without replacement and randomizes the selected order. Keep QuestionSpec grading semantics out of the randomizer.
2. Integrate draw with AssessmentAttempt creation in a transaction/idempotent start path.
3. Snapshot selected question content, item/part points, required/example policy, media references, QuestionSpec/schema/grading/normalization versions, pool/draw provenance, and exact selected order.
4. Make the generated selection durable before returning any student payload. Define rollback/recovery for a failed snapshot.
5. Ensure reload, answer autosave, submit, timeout and review only use the persisted snapshot. Never resample against live Composition.
6. Keep selection server-authoritative and prevent candidate lists, seeds, or selected IDs supplied by clients from affecting the official draw.

**Exit gate:** integration tests prove one persistent draw for an attempt under retry/concurrency and source-mutation scenarios.

### Slice QP3 — Builder authoring and preview

1. Add `QUESTION_POOL` as a distinct Composition container; do not overload the accepted Matching answer-pool block.
2. Add candidate selection/import from Question Bank as Assignment-owned copies, add/remove/reorder, draw count, equal-points diagnostics and pool summary.
3. Ensure pool candidate membership and other Assignment changes save through the real Composition API; test partial failures across question saves and Composition saves.
4. Add ephemeral Teacher Preview draws clearly distinguished from official attempts.
5. Implement loading, empty, invalid, error, locked, success, mobile/tablet, keyboard, and accessibility states. Avoid mock/localStorage persistence.

**Exit gate:** create → save → navigate away → reopen → change candidates/draw count → save → preview all round-trip.

### Slice QP4 — Student runtime, scoring and analytics

1. Expand the pool's K selected questions at its Composition location in the exact snapshot order.
2. Submit/time out using the existing automatic grading pipeline; compute possible points from selected candidates only.
3. Persist outcomes for selected questions/parts. Never classify unselected candidates as unanswered.
4. Add exposure counts and candidate accuracy denominators based on attempts where each candidate was actually selected.
5. Enforce the existing independent `show_score_after_submit` and `show_answers_after_submit` policies.
6. Add student DTO leakage and teacher-ownership/target-scope tests.

**Exit gate:** Builder → official start → refresh/autosave → submit/timeout → student result → teacher analytics behaves consistently with the saved draw.

## 3. Required test matrix

| Layer | Minimum coverage |
|---|---|
| Domain/unit | K/N bounds; unique candidates; no replacement; selected order; randomizer doesn't grade questions; deterministic test seam without a client-controlled seed |
| Persistence | Composition pool round-trip; member order; migration constraints; snapshot serialization/deserialization |
| Service/integration | start-vs-start concurrency; start rollback on snapshot failure; refresh/autosave/timeout do not resample; source Question Bank edits do not change an attempt |
| Readiness/security | incomplete candidate; foreign Assignment question; repeated candidate; used-outside-pool; unequal points; example member; student cannot supply chosen IDs; no unselected candidate leakage |
| Scoring/analytics | selected-only denominator; selected unanswered is counted unanswered; unselected is excluded; equal aggregate possible points; compound part points |
| Frontend | authoring/save/reload/reorder/remove; preview sample is not persisted; read-only after first attempt; responsive and keyboard interactions |
| Regression | Existing SINGLE_CHOICE, MULTIPLE_CHOICE exact-set, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER, CLOZE and MATCHING behavior remains unchanged |

Use real repository commands and report exact results. Do not mark test/build gates complete unless they were run in a configured environment.

## 4. Migration and rollout safeguards

- Keep ActivitySession and AssessmentAttempt separate; do not add a polymorphic Attempt.
- Keep Question Pooling as Composition behavior; do not add a QuestionSpec question type.
- Never edit applied Flyway migrations; recheck the true maximum immediately before creating a forward-only migration.
- Assignment remains hard-locked after the first attempt starts; pool membership/configuration edits require cloning.
- Never rebuild a past attempt from current Question/Composition rows.
- If the owner declines Question Pooling for this phase, leave the existing Composition and active Phase 7 contract unchanged and defer these slices. Do not implement a partial or ambiguously named `POOL` container.
