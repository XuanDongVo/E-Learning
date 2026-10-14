# Question Engine Refactor Status

## Status

**Question Engine package refactor:** completed structurally on `feature/phase-7-assigment`.

**Runtime boundary refactor:** in progress; Activity question selection and immutable snapshot assembly have been separated from the session lifecycle service.

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

## Additional runtime boundary changes

- `ActivityQuestionSelectionService` (`activitysession/selection`) owns selection/allocation/shuffling of questions for a new session.
- `ActivityQuestionSnapshotAssembler` (`activitysession/snapshot`) owns construction and deserialization of immutable question snapshots.
- `ActivitySessionService` orchestrates lifecycle and delegates those two responsibilities. It still owns answer/timeout/hint/finish/result transitions; those should not be split further without tests that characterize current behavior.
- No new test file was found for the snapshot assembler or selector at the paths checked. Add focused tests before considering this boundary fully validated.

## Validation state

No CI status is currently reported for the refactor commit. A full backend compile/test run is required before treating this refactor as green.

Recommended next validation:

1. Compile backend after package moves and dependency extraction.
2. Run all Question Engine tests.
3. Add/run selector and snapshot assembler tests, including snapshot immutability and unavailable question pools.
4. Run `QuestionSpecMapper` / Question persistence tests.
5. Search for stale imports of `e_learning.server.question.engine.*` and the old snapshot assembler package.
6. Search for stale `.prompt` field/API references.
7. Only then continue with API DTO boundaries or AssessmentAttempt scoring.
