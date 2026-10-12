# Question Engine Architecture v1

**Status: ACCEPTED — implementation deferred until Phase 7 gates are met**  
**Audit branch:** feature/phase-7-assigment  
**Migration baseline observed:** V30  
**Scope:** Question definition, validation, answer parsing, grading, persistence mapping, runtime snapshots, Assignment/Activity integration and frontend authoring.

> This document records the accepted target architecture after a code-and-ADR audit. D1–D8 were accepted on 2026-10-12; ADR 0025 further specifies that formal Assignment submissions are teacher-reviewed rather than automatically graded in v1. Implementation plan: `.agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md`. A fresh migration audit is still required. Existing accepted product ADRs remain authoritative.

## 1. Goals

- Keep one canonical set of question semantics across Question Bank, Activity and Assignment.
- Make type-specific behavior extensible without type-specific branches spreading into feature services.
- Separate authored definitions, untrusted input, validated answers, grading results, storage representation and runtime snapshots.
- Preserve the independent ActivitySession and AssessmentAttempt lifecycles.
- Prevent student APIs from leaking correct answers, accepted answers, normalized answers or explanations before an approved reveal point.
- Retain existing behavior for the five implemented types unless an explicit decision changes it.

## 2. Findings from the current repository

The current question types are SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK and TYPE_ANSWER.

The current domain uses Question, QuestionOption, QuestionAnswer and QuestionMedia. QuestionContentValidator and QuestionPersistenceService branch on type. ActivitySessionService contains answer-checking and correct-answer reveal branches. QuestionResponseMapper creates a teacher-oriented response with correctness/accepted-answer data.

ActivitySessionQuestion currently stores a live Question reference, runtime order and interaction state. It freezes selected IDs/order, not all question content. Runtime content, options, hint, explanation and answers are read from mutable Question rows.

Question Bank and Assignment authoring each transform the shared form draft into API payloads. The shared UI component does not yet make the data contracts single-source-of-truth. Option order is not persisted explicitly in question_options; QuestionAnswer has no per-blank key/index. Consequently the current FILL_IN_BLANK implementation must not be assumed to support a general multi-blank Cloze structure.

Migrations V1–V30 exist in this branch. V21 created the shared Question core and type constraint; V23 removed Assignment question position/topic fields; V27 added hint; V28 created ActivitySession tables; V30 added Activity difficulty.

## 3. Target domain contracts

### 3.1 QuestionCommon

Shared metadata used by every spec: prompt, difficulty, optional explanation, optional hint and ordered media references. Type-specific normalization/grading settings belong inside the relevant type spec rather than as unstructured settings on every Question.

### 3.2 QuestionSpec

QuestionSpec is the canonical immutable domain representation. Use a Java 21 sealed interface and immutable subtype records, for example:

- SingleChoiceSpec: ordered choices and the correct choice key.
- MultipleChoiceSpec: ordered choices and expected correct-key set.
- TrueFalseSpec: expected boolean value.
- FillInBlankSpec: preserve current accepted-alternative semantics until the product owner confirms a different contract.
- TypeAnswerSpec: accepted text alternatives and explicit matching policy.
- Future MatchingSpec: items, expected pairs and matching/scoring policy.
- Future ClozeSpec: ordered text segments/blanks, accepted alternatives per blank and per-part scoring policy.

Do not introduce Matching or Cloze into code or schema until their authoring, grading, media and persistence contracts are agreed.

### 3.3 QuestionSnapshot

QuestionSnapshot wraps a QuestionSpec with source identity/provenance, source content revision and snapshot schema version. These versions have distinct meanings:

- contentRevision: which authored version was captured.
- schemaVersion: how to interpret/deserialize the snapshot structure.

Snapshot factory/assembler receives a fully loaded spec and metadata. It does not query repositories. A runtime snapshot is only truly immutable when persisted and then used for both display and grading.

### 3.4 Answer states

- RawAnswer: untrusted client input converted at the API boundary; the domain does not depend on Jackson JsonNode.
- ValidatedAnswer: type-specific, structurally valid answer.
- AnswerParseResult: either a ValidatedAnswer or structured validation issues.
- GradeResult: normalized score plus per-part results.

Definition validation, answer parsing/validation and grading are separate operations. Only a successful parse result can be passed to the grading operation.

### 3.5 GradeResult

~~~java
record GradeResult(
    BigDecimal scoreFraction,
    List<PartGrade> parts
) {}

record PartGrade(
    String partKey,
    PartStatus status,
    BigDecimal earnedWeight,
    BigDecimal possibleWeight,
    Optional<NormalizedAnswerValue> normalizedSubmittedValue
) {}

enum PartStatus {
    CORRECT,
    PARTIALLY_CORRECT,
    INCORRECT,
    UNANSWERED
}
~~~

Invariants: scoreFraction is in [0,1]; part possible weights sum to 1; each earned weight is between 0 and its possible weight; score fraction equals the sum of earned weights. CORRECT means full credit; PARTIALLY_CORRECT means positive but not full credit; INCORRECT and UNANSWERED both earn zero but remain distinct. `PartStatus` is limited to these four outcomes. `PENDING_REVIEW` is an Assignment review-lifecycle state, not a Question Engine PartStatus. For Assignment, normalized input is captured by the type-aware normalizer when an answer is accepted/saved; this operation does not grade correctness.

This result shape supports part-level analysis. It does not silently change current scoring: existing Multiple Choice remains exact-set/all-or-nothing unless a separately approved policy says otherwise. Persisting detailed Activity answer or part history remains outside ADR 0021/0022 unless an Owner decision changes that scope.

## 4. Question Engine interfaces

This is the accepted target contract, not yet an implemented Java API:

~~~java
interface QuestionEngine {
    DefinitionValidation validateDefinition(QuestionSpec spec);

    AnswerParseResult parseAndValidate(
        QuestionSnapshot snapshot,
        RawAnswer rawAnswer
    );

    GradeResult grade(
        QuestionSnapshot snapshot,
        ValidatedAnswer answer
    );

    StudentQuestionView toStudentView(QuestionSnapshot snapshot);
    TeacherQuestionView toTeacherView(QuestionSpec spec);
}

interface QuestionTypeHandler {
    QuestionType type();
    DefinitionValidation validateDefinition(QuestionSpec spec);
    AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer rawAnswer);
    GradeResult grade(QuestionSpec spec, ValidatedAnswer answer);
    StudentQuestionView toStudentView(QuestionSpec spec);
    TeacherQuestionView toTeacherView(QuestionSpec spec);
}
~~~

A handler may use typed spec/answer subtypes internally. The typed registry boundary owns safe resolution; do not spread unchecked casts across feature services.

DefinitionValidation must distinguish invalid structure, incomplete-but-saveable authoring data and ready/complete content. Preserve the current distinction between Draft authoring and publish/runtime readiness.

## 5. Classes and ownership

| Component | Responsibility | Must not do |
|---|---|---|
| QuestionEngine | Capability check, handler resolution and semantic operation delegation | Query DB or manage feature lifecycle |
| QuestionTypeHandler implementations | Type-specific definition validation, answer parsing, grading and projections | Use JPA/repositories or HTTP DTOs |
| QuestionTypeHandlerRegistry | Resolve one handler per type; fail startup on duplicate/missing registrations | Contain a giant type switch |
| QuestionCapabilityPolicy | Decide which question types are enabled for Question Bank, Assignment and Activity | Duplicate type semantics |
| QuestionSnapshotFactory | Build snapshot from loaded spec plus provenance/version metadata | Query persistence |
| QuestionPersistenceAdapter | Load/save the current aggregate representation | Own grading/business interaction rules |
| QuestionSpecMapper | Map JPA aggregate to/from canonical spec | Be reused as a student response mapper |
| QuestionTypePersistenceCodec + registry | Encapsulate type-specific child-row mapping if needed | Leak persistence logic into handlers |
| QuestionBankAuthoringService | Bank ownership, CRUD, authoring flow | Reimplement per-type validation |
| AssignmentQuestionService | Assignment-owned copy, editability and deterministic ordering | Reimplement per-type validation/grading |
| ActivitySessionService | Session lifecycle, selection, retry, lives, timers, hints and aggregate score | Implement type-specific answer checking |
| AssessmentAttemptService (Phase 7B) | Formal attempt lifecycle, saved answers, official score/review | Become a polymorphic runtime shared with Activity |

## 6. Class diagram

~~~mermaid
classDiagram
    direction TB
    class QuestionSpec { <<sealed interface>> }
    class QuestionCommon
    class QuestionSnapshot {
      +sourceQuestionId
      +contentRevision
      +schemaVersion
      +spec
      +provenance
    }
    class QuestionEngine {
      +validateDefinition(spec)
      +parseAndValidate(snapshot, raw)
      +grade(snapshot, validated)
      +toStudentView(snapshot)
      +toTeacherView(spec)
    }
    class QuestionTypeHandler { <<interface>> }
    class QuestionTypeHandlerRegistry { +get(type) }
    class QuestionCapabilityPolicy { +isAllowed(type, usage) }
    class GradeResult { +scoreFraction +parts }
    class ActivitySessionService
    class AssignmentQuestionService
    class QuestionBankAuthoringService
    class QuestionSnapshotFactory
    class QuestionPersistenceAdapter
    class QuestionTypePersistenceCodecRegistry

    QuestionSpec --> QuestionCommon
    QuestionSnapshot --> QuestionSpec
    QuestionEngine --> QuestionTypeHandlerRegistry
    QuestionEngine --> QuestionCapabilityPolicy
    QuestionTypeHandlerRegistry o--> QuestionTypeHandler
    QuestionTypeHandler --> GradeResult
    ActivitySessionService --> QuestionEngine
    AssignmentQuestionService --> QuestionEngine
    QuestionBankAuthoringService --> QuestionEngine
    ActivitySessionService --> QuestionSnapshotFactory
    QuestionSnapshotFactory --> QuestionSpec
    QuestionPersistenceAdapter --> QuestionTypePersistenceCodecRegistry
    QuestionPersistenceAdapter --> QuestionSpec
~~~

## 7. Dependency rules

~~~text
REST/API DTOs
    -> Feature application services
        -> QuestionEngine
            -> CapabilityPolicy
            -> HandlerRegistry
                -> QuestionTypeHandlers (pure domain logic)

Persistence Adapter
    -> SpecMapper / PersistenceCodecRegistry
        -> JPA Entities / Repositories
~~~

1. Handlers and domain contracts do not import Spring, JPA entities, repositories, controllers or Jackson JsonNode.
2. Question Engine has no database dependency.
3. Feature services may orchestrate the engine but may not own type-specific semantics.
4. Persistence adapters translate between the relational model and QuestionSpec.
5. Teacher and student projections are distinct contracts. A mapper containing isCorrect, rawValue or normalizedValue is teacher-only.
6. Question semantics are shared; database ownership is not. Assignment-owned questions remain separate copies from Question Bank questions.

## 8. Design patterns

| Pattern | Use | Reason |
|---|---|---|
| Strategy | QuestionTypeHandler, per-type persistence codec | Encapsulate per-type behavior |
| Registry | Handler/codec registries | Resolve implementation without giant switches |
| Adapter | Persistence adapter and HTTP DTO mapper | Isolate domain from storage/API |
| Policy | Capability policy | Enable a type selectively by feature |
| Immutable value object / Snapshot | QuestionSpec, QuestionSnapshot | Freeze semantics and runtime version |
| Separate projections | Teacher and student view mappers | Prevent answer leakage |
| Composition | Common metadata composed into type specs | Reuse without excessive inheritance |

Do not add Visitor, Chain of Responsibility, event bus, UniversalQuestion<T> or a large abstract base class in v1. Add an abstract base only if real shared algorithms emerge.

## 9. Runtime and feature contracts

### ActivitySession

ADR 0021/0022/0025 remain in force: ActivitySession is repeatable practice, independent from AssessmentAttempt and does not persist detailed student answer history. At session creation, select questions, load specs, construct snapshots and persist the selected full snapshot/order in one transaction. Existing sessions continue to use their saved snapshot after Activity/source edits; sessions started after an edit use the newest saved configuration and content.

This full-content snapshot requirement is accepted but not yet implemented; current code stores a live Question FK plus order/runtime flags only. The runtime cannot yet guarantee content immutability after source edits.

The student response must not include correctness flags, accepted answers, normalized answer values, or explanations before the applicable runtime reveal. A hint is retrieved through its explicit runtime action so usage can be recorded.

### AssignmentQuestion and AssessmentAttempt

Assignment owns a distinct Question row through AssignmentQuestion (@MapsId). A future copy-from-bank flow must deep-copy the source spec and its child data; it must not point Assignment ownership at the same content Question row.

AssessmentAttempt is deferred to Phase 7B and uses its own immutable question snapshots and persisted answers. Its official review must obey show_answers_after_submit. Do not introduce a shared polymorphic Attempt table.

### Student vs teacher view

Teacher view can contain correctness and accepted-answer fields for authoring. Student view has only information needed to render and answer. The current Question content response is teacher-oriented and must not be reused as a student DTO.

## 10. Frontend authoring target

- Replace the broad one-shape DraftQuestion with a TypeScript discriminated union aligned with type-specific semantics.
- Keep common prompt/difficulty/explanation/hint/media metadata shared.
- Define one per-type authoring/validation/preview definition and resolve it through a frontend registry.
- Share API-to-draft and draft-to-API mapping between Question Bank and Assignment; feature endpoints and ownership remain separate.
- Keep teacher preview and student preview projections separate.
- Make option key/order explicit in the API/storage contract.
- Fix current hint contract gaps: content CreateQuestionRequest omits hint, content response mapping does not consistently return it, and the older edit flow can fail to restore/send it.

## 11. Migration boundary

Current latest is V30. No existing migration may be modified.

| Migration workstream (version assigned after fresh audit) | Change boundary | Status |
|---|---|---|
| Question option order | Add question_options.display_order, backfill existing options deterministically, then enforce stable order | Accepted requirement; migration not created |
| Question content revision | Add Question content revision/version used by snapshot provenance | Accepted requirement; migration not created |
| Activity snapshot storage | Add durable snapshot storage to ActivitySession question rows and provenance/schema-version metadata | Accepted requirement; migration not created |
| Future type migration | Update ck_questions_type and add type-specific relational children as needed | Only with first approved new type |
| Phase 7B migrations | Separate AssessmentAttempt, snapshot questions and persisted answers/results | Deferred |

For legacy IN_PROGRESS ActivitySessions, abandon the sessions before enforcing full snapshot support, per accepted D4/ADR 0025. Do not reconstruct a historical snapshot from current mutable content.

Keep the current relational tables. Do not migrate all authored Question content to JSONB solely for uniformity. JSONB is a candidate for immutable runtime snapshot payloads; complex future types may need normalized relational child tables.

## 12. Implementation and test order

1. Add characterization tests for all five existing types.
2. Finalize contracts and invariants in this proposal.
3. Implement the five handlers with parity tests.
4. Add registries, startup validation and capability policy.
5. Extract persistence adapter/mappers/codecs from QuestionPersistenceService.
6. Add persisted option order, revision and snapshot storage through new migrations.
7. Move Activity runtime semantics to snapshots while preserving its existing no-answer-history contract.
8. Unify frontend question serialization/validation/preview definitions for Question Bank and Assignment.
9. Add type-handler contract tests, persistence round-trip tests, student leakage tests and Activity runtime integration tests.
10. Implement new types only as vertical slices across domain, persistence, capability, authoring UI, preview, runtime projection and tests.
11. Start AssessmentAttempt only after Scope A gates pass and the Owner authorizes Phase 7B.

The repository currently has only ServerApplicationTests on the backend and no dedicated frontend authoring tests. Test coverage is a required part of this work, not an optional follow-up.

## 13. Accepted decisions (D1–D8)

- **D1 — Partial credit:** accepted. Preserve existing types' scoring; new types may have explicit partial-credit rules.
- **D2 — Fill-in-blank semantics:** accepted. Preserve FILL_IN_BLANK and implement multi-blank CLOZE separately.
- **D3 — Wire format:** accepted. Use one discriminated QuestionSpec across backend/frontend and adapt demo types; keep Composition separate.
- **D4 — Activity snapshot:** accepted. Persist complete durable snapshots; abandon legacy IN_PROGRESS sessions before enforcement, without reconstructing history.
- **D5 — Part-level analytics:** accepted. Activity remains aggregate-only; Assignment part outcomes are persisted under D7.
- **D6 — Runtime media:** accepted. Images and alt text in v1; audio deferred.

### D7 — AssessmentAttempt part results
Persist per-part status, earned/possible points and optional normalized submitted value for Assignment analytics. Normalized values remain internal and never appear in in-progress student payloads.

### D8 — Assignment scoring
Use Composition item/part points. Score = earned points / possible points × 100; examples excluded. MANUAL keeps official score pending until finalized; readiness rejects zero possible points.

Assignment Composition is defined in ADR 0024 and `.agent/architecture/assignment-composition-v1.md`. Re-audit migrations before implementation; never modify V1–V30.
