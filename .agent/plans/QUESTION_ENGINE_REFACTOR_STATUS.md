# Question Engine Refactor Status

## Status

**Completed:** folder/package refactor on `feature/phase-7-assigment`.

## Result

The legacy flat package `server/src/main/java/e_learning/server/question/engine/` was reorganized into:

- `engine/core` — orchestration and handler contracts.
- `engine/model` — canonical question/input models.
- `engine/result` — validation and grading results.
- `engine/types/choice` — SINGLE_CHOICE and MULTIPLE_CHOICE.
- `engine/types/truefalse` — TRUE_FALSE.
- `engine/types/text` — FILL_IN_BLANK, TYPE_ANSWER and shared text matching rules.
- `engine/types/compound` — MATCHING and CLOZE.

Tests were moved under the same responsibility-oriented structure.

`QuestionSpecMapper` is now the explicit persistence-to-engine boundary and imports the canonical `engine.model` / `engine.types` contracts.

## Important invariants

- This is a structural refactor, not a product-rule change.
- Canonical question text is `content`, not `prompt`.
- Engine result objects do not know Assignment points or score visibility.
- MATCHING/CLOZE remain target engine types but are still rejected by the persistence mapper until their relational persistence model is implemented.
- UI wording containing “prompt” is presentation copy and is not a domain-contract violation.

## Validation state

No CI status is currently reported for the refactor commit. A full backend compile/test run is required before treating this refactor as green.

Recommended next validation:

1. Compile backend.
2. Run all Question Engine tests.
3. Run `QuestionSpecMapper` / Question persistence tests.
4. Search for stale imports of `e_learning.server.question.engine.*`.
5. Search for stale `.prompt` field/API references.
6. Only then continue to the next Question Engine integration step.
