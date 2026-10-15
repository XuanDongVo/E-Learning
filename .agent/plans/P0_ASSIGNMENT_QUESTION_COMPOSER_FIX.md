# P0 — Assignment Question Composer / Composition Boundary Fix

Status: **IN PROGRESS**  
Branch: `fix/assignment-p0-question-composer-main`  
Base: `main` at `2678e570a75a86a7664ee60c88097c6df7887f2e`

## Contract (must remain true)

- `QuestionComposer` / Question Engine owns question content, answer data, hint, explanation, media and question validation.
- `AssignmentQuestion` represents the Assignment-to-Question ownership association. It does not own ordering or placement.
- `AssignmentCompositionService` and the Builder own section/item/group placement, ordering, points, required and example flags.
- Creating an AssignmentQuestion must not implicitly create an AssignmentSection or AssignmentItem.
- Composition Save must not rewrite question content. Do not convert unsupported Matching/Cloze types to a lossy legacy payload.
- Keep database uniqueness constraints; fix conflicting write ownership instead of dropping constraints.

## Work items

- [x] Create this fix branch from `main`.
- [x] Remove implicit Section/Item creation from `AssignmentQuestionService.create()`; it now creates question records and AssignmentQuestion ownership rows only.
- [x] Route Builder question tools through the QuestionComposer dialog and save through the Assignment Question API.
- [x] On successful authoring, validate returned server question IDs and insert the persisted questions at the selected Composition target.
- [ ] Restrict PropertyPanel to Composition properties; question content edits must go through QuestionComposer.
- [x] Change Composition Save to persist Assignment metadata and the Composition tree only; it no longer rewrites question content.
- [x] Refactor PropertyPanel question content editing to delegate prompt/answers/hint/explanation/media to QuestionComposer; keep only Composition settings in the panel.
- [x] Define safe unlink semantics: Composition replacement removes stale AssignmentItem and detached AssignmentQuestion association rows without deleting the underlying Question record. The legacy explicit bulk-delete endpoint still deletes Question records and must not be used for Builder unlink.
- [x] Add frontend unit tests for ordering and local unlink; backend suite runs in CI. End-to-end browser coverage for Composer create/edit/reload and duplicate-submit remains a follow-up.
- [ ] Confirm the latest GitHub Actions run passes frontend lint/tests/build and backend tests. No browser E2E or live database migration validation has been run outside CI.

## Acceptance criteria

1. Creating a question in Composer returns a real persisted question ID and places it once at the requested Composition location.
2. Repeated Save/autosave creates no duplicate Question, AssignmentQuestion or AssignmentItem.
3. Reordering/moving items changes Composition only; it never mutates question content.
4. Editing prompt, options, answers, hint and explanation persists through QuestionComposer.
5. Removing an Assignment item does not silently delete a shared/original Question Bank record.
6. Matching/Cloze are either round-tripped by the canonical type-specific contract or explicitly blocked; never silently degraded.
7. Reload produces the same section/item/member order and does not resurrect removed items.

## Current known limitation

The branch routes new question creation and supported existing-question edits through QuestionComposer; Composition Save persists only Assignment metadata and the Composition tree. Removed questions are unlinked from Assignment without deleting their Question records, and detached questions are not resurrected on reload. Matching/Cloze remain explicitly blocked until the Assignment Question API supports lossless round-tripping. **P0 is not merge-ready until the latest CI run passes and browser E2E is completed.**
