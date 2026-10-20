# Hybrid Question List Blueprint

## Status
- Implementation started on `refactor/teacher-content-ui-routing`.
- First iteration replaces only the question-list presentation inside Question Bank Detail.
- Question Editor, APIs, persistence, filtering, pagination, preview, and bulk-delete behavior remain out of scope for redesign.

## Goal
Combine a readable, content-first question list (Canvas-inspired) with practical question-bank administration controls (Moodle-inspired).

## Scope
### In scope
- Replace the dense HTML table with stacked question cards.
- Make the question prompt the primary visual element.
- Keep type, difficulty, and completeness visible as compact metadata.
- Keep select-one/select-page, preview, edit, delete, bulk delete, filters, and server pagination.
- Preserve the existing query/service contracts and existing preview dialog.
- Provide keyboard focus states and accessible labels for actions.

### Out of scope
- Question Editor layout, validation, autosave, and save behavior.
- Question schema, API, database, ordering semantics, or server pagination contract.
- New filters, import flow, question creation flow, and changes to Question Bank lifecycle.
- Changing question selection to span multiple server pages.

## List item contract
Each question card contains:
1. Selection checkbox.
2. Absolute row number based on current page and page size.
3. Full prompt with wrapping for long content.
4. Type, difficulty, and completeness badges.
5. Preview, Edit, and Delete actions.

Clicking the prompt opens the existing quick-preview dialog. Checkbox and action buttons remain separate controls and must not trigger the preview accidentally.

## Bulk management contract
- Select-all affects only the currently displayed server page, matching existing behavior.
- Bulk action bar remains visible when one or more questions are selected.
- Filters and pagination continue to use existing server query parameters.
- Existing delete confirmation and error handling remain in use.

## States
- Loading: visible loading message.
- Error: error text and Retry action.
- Empty: clear empty state with a suggestion to change filters or add a question.
- Selected: selected cards receive a visible border/background treatment.
- Long prompt: wraps without forcing the entire page to horizontal-scroll.

## Visual direction
- White cards, restrained neutral borders, compact badges.
- Strong readable prompt typography and generous vertical spacing.
- Metadata sits beneath the prompt; management actions are aligned at the right on wider screens.
- On narrow screens, keep controls usable and allow the prompt to wrap.

## Acceptance checklist
- [ ] Search, type, difficulty, and completeness filters still work.
- [ ] Page size and Previous/Next/page-number navigation still work.
- [ ] Select one and select all on the current page work.
- [ ] Bulk delete and single delete still use the existing confirmation dialog.
- [ ] Clicking prompt or Preview opens the existing preview dialog.
- [ ] Edit opens the existing Question Editor route with the current bank context.
- [ ] Question Editor remains unchanged.
- [ ] Loading, error/retry, and empty states are present.
- [ ] Long prompts wrap and do not create avoidable horizontal overflow.
- [ ] Build, lint, and manual browser checks pass before marking the blueprint complete.

## Implementation note
The first implementation replaces only the table-rendering block in `question-bank-detail.tsx`. It reuses the existing state, queries, mutations, badges, preview modal, delete dialog, and pagination controls. Do not refactor the rest of the component as part of this slice.
