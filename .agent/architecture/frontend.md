# Frontend Architecture and Rules

Use TypeScript, central types, services and query keys. Do not invent API fields or endpoints.

## Activity UI
- Unit scope.
- Draft may be saved incomplete.
- Publish requires READY.
- Multiple strategies are configured on Activity; student runtime choice is separate.
- Try Hard says seconds per question.
- Practice has no timer.
- No whole-Activity timer.
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
ActivitySession stores concrete Activity mode and selection_strategy.
ActivitySessionQuestion.position is runtime sequence metadata only.
AssessmentAttempt is a separate Assignment runtime contract.

Follow UI_ARCHITECTURE_GUIDELINES.md for tokens, accessibility and responsive behavior.


## Question authoring synchronization

Current Question Bank and Assignment forms share some visual controls but have separate payload/draft conversion paths; do not assume their serialization is already single-source-of-truth.

Target proposed by ADR 0023:
- Use a TypeScript discriminated union for per-type draft/spec handling, with common prompt/difficulty/explanation/hint/media metadata separated from type-specific fields.
- Resolve per-type authoring, validation and preview rules through one registry/configuration rather than proliferating type switches.
- Reuse mapping rules between Question Bank and Assignment while keeping feature endpoints and question ownership separate.
- Keep teacher preview and student runtime projections separate; student models never carry correctness/accepted answer data before allowed reveal.
- Make option order explicit in contract and persistence.
- Verify hint read/write round trips through every create/edit/bulk path; the audited code contains older hint mapping drift.

This target is a proposal, not an instruction to begin refactoring before Owner review of ADR 0023 D1–D6.
