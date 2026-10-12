# 0023 — Question Engine architecture

**Status: Proposed — pending Owner approval**  
**Date:** 2026-10-12  
**Scope:** Shared Question semantics and integration boundary across Question Bank, Activity and Assignment.

## Context

The current implementation contains type-specific behavior in multiple shared services:

- QuestionContentValidator branches on QuestionType.
- QuestionPersistenceService branches when persisting options and answers and normalizing values.
- ActivitySessionService branches for correctness and correct-answer reveal.
- QuestionResponseMapper returns authoring data that includes correctness and accepted-answer details.
- Question Bank and Assignment authoring serialize the same broad draft using separate paths.
- ActivitySessionQuestion currently points to a mutable Question entity and does not persist a full content snapshot.

As a result, adding a question type requires touching multiple existing services and DTOs, and runtime behavior is vulnerable to source-question edits unless immutable snapshots are persisted.

## Proposed decision

Introduce a shared Question Engine with:

1. Immutable, type-specific QuestionSpec domain contracts.
2. QuestionSnapshot wrapping a spec, source/content provenance and snapshot schema version.
3. QuestionTypeHandler Strategy implementations for definition validation, answer parsing/validation, grading and view projection.
4. A registry that resolves one handler per type, plus a capability policy by feature.
5. Persistence adapter/mappers and optional per-type persistence codecs. Handlers must never access JPA or repositories.
6. Explicitly distinct TeacherQuestionView and StudentQuestionView contracts.
7. GradeResult with normalized score and per-part results.
8. Separate ActivitySession and AssessmentAttempt runtime aggregates; no polymorphic Attempt.
9. A type-aware frontend authoring/validation/preview registry and shared API serialization rules.

The full proposal, class diagram, dependency rules, pattern mapping and migration boundary are documented in [Question Engine Architecture v1](../architecture/question-engine-v1.md).

## Constraints inherited from accepted ADRs

- Activity and Assignment remain independent (ADR 0001).
- Assignment owns Question rows through AssignmentQuestion; ordering is question_id ascending and no AssignmentQuestion.position is introduced (ADRs 0003, 0018).
- Activity belongs to Unit and runtime selection strategy is chosen at run start when required (ADRs 0008, 0017).
- ActivitySession and AssessmentAttempt remain separate runtime concepts (ADR 0021).
- Activity Practice continues to allow at most two submissions per question and does not persist detailed answer history (ADR 0022).
- Hint remains optional; Topic formula/reference sheet is deferred (ADR 0016).
- Assignment review remains controlled by show_answers_after_submit (ADR 0019).
- Existing scoring semantics must not silently change.

## Decisions still requiring Owner resolution

- D1: preserve existing scoring and define separate partial-credit rules for new types.
- D2: confirm the boundary between current FILL_IN_BLANK and future CLOZE.
- D3: confirm a discriminated type-specific wire contract.
- D4: approve durable full-content snapshots for ActivitySession.
- D5: decide whether per-part Activity results may be persisted in future analytics.
- D6: confirm media rendering requirements in Activity student runtime.

## Migration rules

- Current baseline is V30 on the audited branch.
- Never modify or delete V1–V30.
- Any schema changes must be incremental new migrations, sequenced only after rechecking the latest migration immediately before implementation.
- V31/V32/V33 in the architecture document are proposed boundaries, not committed version decisions.
- No implementation or migration is authorized by this Proposed ADR alone.

## Consequences if accepted

- Implement the five existing type handlers before adding new types.
- Add contract and security tests before removing existing type-specific logic.
- Treat Question Engine as domain/application logic; keep feature lifecycle and access policies in their feature services.
- Update the current .agent knowledge base before beginning implementation, keeping this ADR and the architecture document aligned.
