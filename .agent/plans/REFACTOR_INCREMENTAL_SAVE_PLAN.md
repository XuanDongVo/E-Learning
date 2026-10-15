# Refactor & Incremental Save Plan

Status: **PLANNED — implementation must follow this document**
Branch: `fix/assignment-p0-question-composer-main`
Scope: Assignment Builder authoring, autosave, Question Engine persistence, Assignment Composition persistence, and removal of `AssignmentQuestionComposerDialog`.

## 1. Objective

Replace the dialog-dependent authoring flow with an inline-first Builder while preserving a single canonical source for question content and a separate source for assignment placement. Standardize autosave so edits are not dropped, stale responses do not overwrite newer local work, and retries do not create duplicate records.

This plan is the implementation contract. Do not delete the dialog until all required responsibilities have moved and the acceptance checks pass.

## 2. Non-negotiable ownership boundaries

1. **Question Engine owns question content**: type-specific definition, prompt, options, accepted answers, matching/cloze structure, hint, explanation, media, difficulty, and question-level validation.
2. **AssignmentQuestion owns the Assignment ↔ Question association**. It must not own ordering or placement. Creating this association must not implicitly create sections or composition items.
3. **Assignment Composition owns placement**: sections, items, group membership, ordering/position, points, required/example flags, and block payloads.
4. **Composition save must never rewrite question content.** Never serialize through a legacy question payload if it would lose type-specific data.
5. **Stable identities**: keep a local Builder item ID while editing. Store the canonical server Question ID and Composition item ID as separate fields. Never derive a new server ID from a local temporary ID.
6. **No duplicate writes on retry**: if a Question was created but a later association/composition step failed, retry using the stored server ID and resume the missing step.
7. Keep database uniqueness constraints. Fix write ownership and retry/idempotency rather than weakening constraints.

## 3. Target user experience

- The teacher adds a question from the Builder and edits it directly in the Canvas/inline editor.
- Text edits update the Builder store immediately. They are not blocked by an open dialog.
- The save indicator has explicit states: **Unsaved changes → Saving → Saved**, or **Save failed — retry available**.
- Autosave runs after a short idle period (target debounce: 1.2 seconds) and uses the same coordinator as Ctrl/Cmd+S and Save Draft.
- The teacher can continue editing while a save is in flight. The UI must preserve those edits and save the newest revision afterward.
- A save failure retains the local draft and gives an actionable error; it must not silently reset to the last server response.
- A page-leave warning is shown only while the latest local revision is not durably saved. It must not claim “Saved” while a newer revision remains pending.

## 4. Target architecture

### 4.1 Builder store — local draft and revision tracking

Keep the Zustand store as the local source of truth for the open Builder session.

Required state/behavior:
- `revision`: increment on every user-visible mutation.
- `savedRevision`: revision confirmed by persistence; never advance it past a revision that was not saved.
- `saveStatus`, `saveError`, `lastSavedAt`.
- Stable local IDs for sections/items, plus independent server IDs for Questions and Composition items.
- A single serialized save coordinator. Concurrent save requests join/queue the current pipeline; they must not return early and lose a request.
- Capture an immutable snapshot and its revision at the start of each save.
- When a response returns, merge only server-generated identity/metadata into the latest draft if the draft changed during the request. Do not replace the newer draft with the stale snapshot response.
- If the current revision is newer than the persisted revision, immediately schedule/perform another pass.
- A failed pass must leave the latest local draft intact and expose a retry path. Do not mark the current revision saved.

**Implementation note:** audit the current `revision`/`savedRevision` implementation carefully. Dirty-state and status UI must be derived from revision equality or an equivalent correct invariant; comparing a stale server snapshot alone is insufficient if it can label newer edits as saved.

### 4.2 Question authoring/persistence coordinator

Create a small service/coordinator separate from React components. Its job is to persist Question content and return stable server identity; it must not own visual UI state.

For each question:
1. Validate the local draft for its question type.
2. If `serverQuestionId` is absent, create through the canonical Question Engine API.
3. If `serverQuestionId` exists, update that Question through the same canonical API.
4. Validate the response and persist the returned `serverQuestionId`, server type/revision and any required media identity into the local item **without changing its local item ID**.
5. Ensure the AssignmentQuestion association exists when required by the API contract. Use an idempotent create/upsert contract or first check for an existing association; do not create a duplicate on retry.
6. Only after the Question identity and required association are confirmed may Composition reference the Question ID.

Do not put network requests inside keystroke-level store mutations. Debounce per-question writes and serialize writes for the same Question so older responses cannot win over newer content.

### 4.3 Composition persistence

- Continue using the Composition API as the authoritative writer for section/item/group placement, ordering and Composition settings.
- Before writing Composition, ensure all included new/changed Questions have canonical server IDs.
- Persist only Composition fields in the Composition request. Question prompt/answers/hint/explanation/media must not be duplicated into this request.
- The current Composition endpoint uses a tree-shaped PUT. Treat it as a **whole-tree replacement** unless backend code/tests prove otherwise. Do not describe it as item-level incremental persistence.
- First deliver reliable incremental **Question content** saves plus a serialized Composition-tree save. A true item-level Composition PATCH/upsert API is a separate follow-up only if performance or conflict requirements justify the added backend contract.
- Preserve explicit unlink semantics: removing an Assignment item unlinks it from this Composition/Assignment association as specified by the backend contract; it must not delete a reusable Question Bank record by accident.
- Keep stable order based on section/item/member position; do not reintroduce a competing `AssignmentQuestion.position` source of truth.

### 4.4 Save coordinator ordering

For a save pass, use this order:

1. Snapshot current revision.
2. Validate the draft and identify changed/new Questions.
3. Persist changed/new Question content through the Question Engine.
4. Persist/confirm required AssignmentQuestion associations.
5. Serialize and persist the Composition tree and Assignment metadata.
6. Merge server-generated IDs/metadata into the current store without overwriting edits made after the snapshot.
7. Mark only the snapshot revision as saved.
8. If a newer revision exists, immediately run another pass.

The implementation may optimize unchanged Question writes using per-question content snapshots/hashes, but it must not skip required association or Composition updates.

## 5. Remove `AssignmentQuestionComposerDialog` safely

The dialog must be removed only after its responsibilities have explicit replacements.

### Responsibilities to migrate

- Create a Question for every supported question type.
- Edit an existing Question without changing its identity.
- Map the canonical Question Engine DTO to/from the Builder's type-specific model losslessly.
- Preserve hint, explanation, media, answer correctness, accepted answers, Matching pairs/pool, and Cloze segments/blanks.
- Validate payloads and display actionable server errors.
- Return persisted server IDs to the store.
- Prevent duplicate submission and duplicate Question/association creation on retries.
- Preserve insertion target behavior (section, group/member, and insertion order) for newly created questions.
- Handle edit/cancel without leaking partial changes into the saved server Question.

### Removal checklist

- [ ] Search all imports, render sites, store state/actions, tests, stories and route-level references to `AssignmentQuestionComposerDialog`.
- [ ] Move required authoring logic into a non-UI service/coordinator and inline editor controls.
- [ ] Make inline option controls fully functional (including correct-answer selection); remove dead/commented handlers.
- [ ] Verify every supported question type has complete edit controls and lossless DTO mapping. Do not silently coerce unsupported types to Text Input.
- [ ] Ensure `PropertyPanel` edits Composition properties only; there must not be a second conflicting question-content editor.
- [ ] Ensure new questions are persisted before Composition references them.
- [ ] Remove dialog imports, JSX, obsolete store state/actions and obsolete types only after all call sites are migrated.
- [ ] Delete the dialog file only after the repository-wide reference search returns no live references.
- [ ] Add/adjust tests before deleting the file.

## 6. Autosave rules and edge cases

- Debounce: target 1.2 seconds after the latest edit; one pending debounce timer per Builder session.
- Manual save: flushes the same queue immediately; never creates a parallel request pipeline.
- Edit while saving: preserve the edit, then persist the newer revision.
- Multiple edits during one save: coalesce to the latest snapshot rather than queueing every keystroke.
- Failure: keep dirty state, keep draft data, expose error and retry. A later edit may trigger a new attempt.
- Duplicate submit: lock/serialize create for a given local draft and reuse the server ID once returned.
- Reload: persisted question content and Composition placement reconstruct the same Builder state.
- Delete/unlink: the next Composition save removes the item from placement without unintended deletion of the underlying reusable Question.
- Navigation: warn if the latest revision is pending or failed; no warning only when the latest revision is confirmed saved.
- Autosave disabled: do not run background persistence; manual save still uses the same coordinator.
- Preview: switching modes must not silently discard pending changes.

## 7. API and backend contract audit required before implementation

Confirm and document these contracts from controller, service, DTO, and tests before writing the coordinator:

- [ ] Canonical create/update endpoints for each Question type and the exact DTOs accepted.
- [ ] Whether the API uses one polymorphic definition payload or separate type-specific payloads.
- [ ] Whether create returns a durable Question ID and whether create is idempotent.
- [ ] How AssignmentQuestion association creation is performed and how an existing association is detected.
- [ ] Whether Composition PUT replaces the full tree, how nested group members are represented, and how omitted items are unlinked.
- [ ] Transaction/rollback boundaries across Question, association and Composition requests. Treat client calls as non-atomic unless the backend guarantees otherwise.
- [ ] Media identity and upload completion requirements before Question persistence.
- [ ] Validation/error response shape and which errors are retryable.
- [ ] Supported Question types in the UI versus backend. Matching/Cloze must be round-tripped losslessly or explicitly disabled until supported.

If multiple HTTP requests cannot be made atomic, the coordinator must be resumable and idempotent. Do not pretend a failed multi-request save is a single transaction.

## 8. Implementation sequence

### Step 0 — Baseline and API audit
- Record the target branch HEAD and CI status.
- Map the current dialog's create/edit/mapping responsibilities.
- Trace Question Engine endpoints, AssignmentQuestion association service and Composition PUT semantics.
- Produce a type-support matrix for Single Choice, Multiple Choice, True/False, Text Input, Matching and Cloze.
- No dialog deletion in this step.

**Exit gate:** endpoint/DTO/ownership matrix reviewed; known unsupported types are explicit.

### Step 1 — Autosave correctness
- Audit revision/savedRevision, dirty derivation and Header status rendering.
- Ensure the serialized coordinator never drops a save request.
- Ensure server responses cannot overwrite newer local edits.
- Add unit tests for edit-during-save, repeated save calls, failure/retry and status transitions.

**Exit gate:** tests prove newest revision is eventually saved and local edits survive stale responses.

### Step 2 — Canonical Question persistence
- Implement the Question authoring/persistence coordinator.
- Use type-safe request builders and response parsers.
- Persist/merge server IDs into stable local items.
- Add per-question debounce/serialization and retry behavior.
- Keep Composition out of the Question content update path.

**Exit gate:** create/edit/retry/reload works for every enabled type without duplicate Question records.

### Step 3 — Composition save integration
- Save changed Questions and required associations before the Composition tree.
- Persist sections/items/groups/order/points/required/example settings separately.
- Ensure Composition serialization never rewrites Question content.
- Verify unlink/reorder/move operations and stale-item cleanup semantics.

**Exit gate:** reload reproduces the same tree and item order; retries do not duplicate rows.

### Step 4 — Inline editor parity and dialog removal
- Complete all inline editor controls and type-specific editors.
- Keep `PropertyPanel` for Composition properties only.
- Move insertion-target, validation and error display behavior to Builder/coordinator.
- Remove dialog JSX, imports, store fields/actions, and finally the dialog file.
- Run a repository-wide reference search.

**Exit gate:** no live dialog references; all supported create/edit paths work through inline Builder UI.

### Step 5 — End-to-end verification
- Run frontend lint, unit tests and production build.
- Run backend Maven tests against PostgreSQL.
- Run browser E2E for the flows in Section 9.
- Record exact commit SHA and test results in this plan and the relevant phase progress file.

**Exit gate:** all required checks pass; no merge based on lint/build alone.

## 9. Required regression tests

### Autosave/store
- [ ] A single edit saves after the debounce.
- [ ] Many rapid edits coalesce into the latest save.
- [ ] Ctrl/Cmd+S during an active save causes a follow-up pass, not a dropped request.
- [ ] An edit during an active save remains in the store and is saved in a later pass.
- [ ] A stale response never overwrites newer prompt/options/order/settings.
- [ ] A failed request leaves the draft dirty and retryable.
- [ ] Status never says Saved when current revision exceeds saved revision.
- [ ] Autosave disabled suppresses background saves but manual Save works.

### Question Engine
- [ ] Create each enabled type and confirm the returned server ID is retained.
- [ ] Edit prompt, options, correctness, accepted answers, hint, explanation and media; reload and compare.
- [ ] Matching/Cloze definition round-trips without loss when enabled.
- [ ] Retry after Question create succeeds but Composition save fails creates no duplicate Question.
- [ ] Duplicate submit is prevented for the same local draft.

### Composition
- [ ] Add one question and add a batch of questions; each appears exactly once.
- [ ] Reorder within a section, move between sections, and move in/out of a group.
- [ ] Edit points/required/example flags and verify Question content is unchanged.
- [ ] Unlink an item and reload; it does not reappear and the reusable Question is not accidentally deleted.
- [ ] Empty sections and block/group membership serialize consistently.
- [ ] Assignment metadata and Composition tree save without duplicate-key conflicts.
- [ ] Browser refresh after a confirmed save reconstructs the same Builder.

## 10. Definition of done

- [ ] Question content has one canonical persistence path through Question Engine.
- [ ] Composition has one canonical persistence path through the Composition API.
- [ ] Autosave is debounced, serialized, revision-aware, resumable and retryable.
- [ ] No stale response can overwrite newer local work.
- [ ] New Question IDs and Composition IDs remain stable across retries/reloads.
- [ ] No duplicate Question, AssignmentQuestion or AssignmentItem is created by repeated saves.
- [ ] All enabled question types round-trip losslessly.
- [ ] `AssignmentQuestionComposerDialog` and all obsolete references are removed.
- [ ] Frontend lint, tests, production build, backend tests and required browser E2E pass.
- [ ] This plan records the final commit and evidence; no step is marked complete without verification.

## 11. Current implementation notes

The branch already contains a Builder save queue/revision tracking and a debounced autosave update. Treat these as **initial changes, not proof that the whole plan is complete**. In particular, verify dirty-state derivation, whether the Composition save returns stale snapshots, and whether the current UI reflects a pending newer revision correctly.

The existing `P0_ASSIGNMENT_QUESTION_COMPOSER_FIX.md` records the current ownership contract and notes that browser E2E remains a follow-up. This plan expands that work into an ordered implementation sequence; it does not supersede backend contract checks or E2E acceptance.

## 12. Implementation rule

Work one step at a time. For each step:
1. Inspect the exact branch HEAD and relevant files.
2. Make the smallest cohesive change.
3. Add tests with the change.
4. Run the applicable checks and inspect failures.
5. Update this plan with evidence and commit SHA.
6. Proceed only when the step's exit gate is satisfied.

Do not delete `AssignmentQuestionComposerDialog` as a standalone cleanup commit before Step 4's prerequisites pass.
