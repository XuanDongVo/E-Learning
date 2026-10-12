# Question Model and Runtime Snapshot Contract

## Implemented baseline observed on 2026-10-12

Question types currently present: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK and TYPE_ANSWER.

Current persistence concepts:
- questions: shared question metadata, type, difficulty, optional hint, completeness flag and legacy matchingMode string.
- question_options: option key/content/is_correct; no explicit display_order column was found in the audited schema.
- question_answers: raw_value and normalized_value; no per-blank part key/index was found.
- question_media: media reference with display order.
- content_questions: ownership association for Question Bank.
- assignment_questions: Assignment ownership association sharing question_id as the Question key.

This describes current code/schema, not the accepted-but-not-yet-implemented QuestionSpec design. Current type-specific validation/persistence/grading behavior is spread across QuestionContentValidator, QuestionPersistenceService and ActivitySessionService.

## Implemented semantics / constraints

- Hint: one optional teacher-authored Question hint; nullable and max 500 characters. It does not affect completeness. Student hint retrieval is an explicit runtime action so hint usage can be recorded.
- Topic formula/reference sheet is deferred; it is not a current schema/API/UI contract.
- AssignmentQuestion has no position, topic_id or reorder contract. Product order is Composition section/item/member position; question_id ASC is only the deterministic legacy backfill order.
- Existing Multiple Choice grading uses exact set match; do not silently add partial credit.
- Current FILL_IN_BLANK storage has no blank/part key. Do not treat it as a general multi-blank Cloze representation.
- Teacher response contracts include answer/correctness data for authoring and must not be exposed directly by student runtime APIs.
- Question API hint mapping must be verified across all editor/create/bulk paths; an older editor path was observed to omit hint during mapping.

## Activity runtime — actual state vs target

ActivitySession start persists selected Question IDs/order and runtime flags, but the audited implementation retains a reference to the mutable Question row. It does **not** currently guarantee a durable full-content snapshot of prompt/options/answers/media/hint/explanation.
ADR 0021/0022 remain authoritative: no detailed Activity response payload/history is persisted. Accepted ADRs 0023/0025 require a full durable QuestionSnapshot while preserving the no-answer-history rule. Existing implementation has not yet delivered this guarantee. An Activity edit affects future sessions; already-started sessions keep their start snapshot.

## Accepted Question Engine target model (implementation pending)

See `.agent/architecture/question-engine-v1.md`:
- immutable type-specific QuestionSpec and QuestionSnapshot with content revision and snapshot schema version;
- RawAnswer -> validated answer -> GradeResult;
- handlers and registry for type-specific semantics;
- capability policy by Question Bank / Assignment / Activity / Assessment feature;
- separate TeacherQuestionView and StudentQuestionView;
- type-specific frontend authoring/validation/preview registry.

Architecture is accepted by ADR 0023, but handler/registry/snapshot implementation is not yet present. MATCHING and CLOZE are accepted target types and require a full vertical slice. Assignment Composition is separate and defined in .agent/architecture/assignment-composition-v1.md.


## Grading result

Each PartGrade contains stable partKey, status, earned/possible weight and optional normalizedSubmittedValue. Assignment persistence additionally records earned/possible points derived from Composition points. Normalized values support wrong-answer distribution but are never returned in an in-progress student DTO. Activity still does not persist detailed answer/part history.
