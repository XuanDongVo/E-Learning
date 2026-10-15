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
- [ ] Refactor PropertyPanel question content editing to use an edit-capable QuestionComposer flow (the legacy editor is still present and must not be treated as persisted).
- [ ] Define safe unlink/delete semantics so removing an item from an Assignment cannot accidentally delete a reusable Question Bank question.
- [ ] Add backend and frontend tests for create, edit, reorder, move/group, remove, save/autosave, reload, duplicate-submit and unsupported question types.
- [ ] Run backend tests, frontend lint/typecheck/build, migration validation and end-to-end browser checks.

## Acceptance criteria

1. Creating a question in Composer returns a real persisted question ID and places it once at the requested Composition location.
2. Repeated Save/autosave creates no duplicate Question, AssignmentQuestion or AssignmentItem.
3. Reordering/moving items changes Composition only; it never mutates question content.
4. Editing prompt, options, answers, hint and explanation persists through QuestionComposer.
5. Removing an Assignment item does not silently delete a shared/original Question Bank record.
6. Matching/Cloze are either round-tripped by the canonical type-specific contract or explicitly blocked; never silently degraded.
7. Reload produces the same section/item/member order and does not resurrect removed items.

## Current known limitation

The branch now routes question creation through QuestionComposer and keeps Composition Save from rewriting question content. However, PropertyPanel still contains the legacy content editor and existing-question edit mode has not yet been connected to QuestionComposer. Backend/frontend tests and builds have not been run, so **P0 is not complete and this branch is not yet ready to merge**.
