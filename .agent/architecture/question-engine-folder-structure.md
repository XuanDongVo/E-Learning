# Question Engine — Folder Responsibilities

## Purpose

The Question Engine is a pure domain layer for question-definition validation, answer parsing/validation, and automatic grading. It must not contain persistence entities, Spring repositories, HTTP DTOs, Assignment scoring policy, or Activity/Assignment orchestration.

## Canonical structure

```text
server/src/main/java/e_learning/server/question/engine/
├── core/
│   ├── QuestionEngine.java
│   ├── QuestionTypeHandler.java
│   ├── QuestionTypeHandlerRegistry.java
│   └── AbstractQuestionTypeHandler.java
├── model/
│   ├── QuestionSpec.java
│   ├── RawAnswer.java
│   ├── ValidatedAnswer.java
│   └── AnswerParseResult.java
├── result/
│   ├── DefinitionValidation.java
│   ├── GradeResult.java
│   ├── PartGrade.java
│   ├── PartStatus.java
│   └── NormalizedAnswerValue.java
└── types/
    ├── choice/
    │   ├── SingleChoiceSpec.java
    │   ├── SingleChoiceHandler.java
    │   ├── MultipleChoiceSpec.java
    │   └── MultipleChoiceHandler.java
    ├── truefalse/
    │   ├── TrueFalseSpec.java
    │   └── TrueFalseHandler.java
    ├── text/
    │   ├── FillInBlankSpec.java
    │   ├── FillInBlankHandler.java
    │   ├── TypeAnswerSpec.java
    │   ├── TypeAnswerHandler.java
    │   ├── TextAnswerHandler.java
    │   └── MatchingMode.java
    └── compound/
        ├── MatchingSpec.java
        ├── MatchingAnswer.java
        ├── MatchingHandler.java
        ├── ClozeSpec.java
        ├── ClozeAnswer.java
        └── ClozeHandler.java
```

## Folder rules

### `core/`
Owns engine orchestration and handler contracts only.
- `QuestionEngine` is the public facade.
- `QuestionTypeHandler` is the per-type contract.
- `QuestionTypeHandlerRegistry` resolves a handler by `QuestionType`.
- `AbstractQuestionTypeHandler` contains only reusable engine mechanics.

Do not put question-type-specific rules here.

### `model/`
Owns canonical engine input/output-boundary models that are independent of any specific question type.
- `QuestionSpec` is the canonical question definition consumed by the engine.
- `RawAnswer` represents untrusted submitted input.
- `ValidatedAnswer` represents parsed/validated input.
- `AnswerParseResult` represents parsing/validation success or errors.

`QuestionSpec` uses `content` as the canonical question text field. Do not introduce `prompt` as a domain/API field.

### `result/`
Owns engine grading/validation results.
- `DefinitionValidation` describes whether a definition is invalid, incomplete, or ready.
- `GradeResult` is the normalized grading result.
- `PartGrade` stores per-part correctness/normalized submission data for analytics.
- `PartStatus` is engine-level status only.
- `NormalizedAnswerValue` contains normalized submitted values.

`result/` must not know Assignment points, AssignmentQuestion, AssessmentAttempt, or score-visibility policy. Assignment maps `GradeResult` to its own point model.

### `types/`
Owns behavior and data models specific to a question type.
- `choice/`: SINGLE_CHOICE and MULTIPLE_CHOICE.
- `truefalse/`: TRUE_FALSE.
- `text/`: FILL_IN_BLANK and TYPE_ANSWER plus shared text matching rules.
- `compound/`: MATCHING and CLOZE, including their part-level answer structures.

A type handler must implement the engine contract and must not access repositories or persistence entities.

## Dependency direction

```text
QuestionSpecMapper / application services
                |
                v
             engine
                |
        +-------+-------+
        |       |       |
      core    model   result
                ^       ^
                |       |
              types ---+
```

Persistence is outside the engine. `QuestionSpecMapper` converts `Question` persistence data into `QuestionSpec`; the engine never maps entities itself.

## Testing structure

Tests should mirror the production structure:

```text
server/src/test/java/e_learning/server/question/engine/
├── core/QuestionEngineTest.java
└── types/
    ├── choice/ChoiceHandlerTest.java
    ├── truefalse/TrueFalseHandlerTest.java
    ├── text/FillInBlankHandlerTest.java
    └── text/TypeAnswerHandlerTest.java
    └── compound/MatchingHandlerTest.java
    └── compound/ClozeHandlerTest.java
```

## Refactor guardrails

1. This refactor changes package/folder boundaries, not question semantics.
2. Preserve existing validation, parsing, normalization, and grading behavior when moving files.
3. `QuestionSpecMapper` is the only persistence-to-engine translation boundary.
4. `MATCHING` and `CLOZE` may remain unsupported by the current persistence mapper until their persistence schema is implemented; the engine package may still define their contracts and handlers.
5. UI wording such as “question prompt” is presentation copy and does not require renaming unless it represents a field/API contract.
