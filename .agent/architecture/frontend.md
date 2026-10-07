# Frontend Architecture and Rules

Use TypeScript, central types, services and query keys. Do not invent API fields or endpoints.

## Activity UI
- Unit scope.
- Draft may be saved incomplete.
- Publish requires READY.
- Multiple strategies are configured on Activity; student runtime choice is separate.
- Try Hard says seconds per question.
- No whole-run timer.
- No GameTemplate control in current scope.

## Assignment UI
- Server order only.
- No position/reorder controls.
- Whole-attempt time limit.
- show_answers_after_submit setting.
- No Release Answers UI.

## Question/Topic UI
- Question Editor has one optional Hint field, max 500 characters.
- Topic formula/reference sheet is deferred; no current field/UI.

## Runtime
Attempt stores concrete Activity mode and selection_strategy.
AttemptQuestion.position is runtime sequence metadata only.

Follow UI_ARCHITECTURE_GUIDELINES.md for tokens, accessibility and responsive behavior.
