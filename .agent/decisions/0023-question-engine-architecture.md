# 0023 — Question Engine architecture

**Status: Accepted**  
**Date:** 2026-10-12  
**Decided by:** project owner

## Decision
Adopt .agent/architecture/question-engine-v1.md with D1–D8 accepted. Assignment order/item/block composition is defined by ADR 0024. ADR 0026 supersedes ADR 0025's former teacher-review policy: Assignment submissions are automatically graded in v1.

- **D1 scoring:** preserve existing five types; Multiple Choice remains exact-set/all-or-nothing. Partial credit only for new types with explicit partial-credit rules.
- **D2 semantics:** preserve FILL_IN_BLANK single-answer-position/accepted-alternative behavior; CLOZE is a separate multi-blank compound type. MATCHING is compound.
- **D3 wire contract:** one canonical discriminated QuestionSpec union across backend/frontend/Question Bank/Assignment/Activity. Align demo types to it; Composition remains separate. Map TEXT_INPUT to TYPE_ANSWER, passage/multi-text blanks to CLOZE, pool/matching rows to MATCHING; TRUE_FALSE has its own discriminant.
- **D4 Activity snapshots:** persist full immutable QuestionSnapshot for each selected session question. Do not persist Activity answer/part history. Abandon legacy IN_PROGRESS sessions before enforcement; do not reconstruct history from mutable Questions.
- **D5 analytics:** Activity remains aggregate-only. Assignment part outcomes are persisted under D7.
- **D6 media:** image plus meaningful alt text and safe asset references in v1; audio deferred.
- **D7 AssessmentAttempt:** persist submitted answers, normalized submitted values captured at answer intake, and Question Engine-calculated per-part outcomes (part key, status, earned/possible points, normalization/snapshot provenance). Support correct/partial/incorrect/unanswered counts and normalized wrong-answer distributions. Submission/timeout is automatically graded from the immutable snapshot; there is no pending-review state. Normalized values are never exposed in in-progress student DTOs.
- **D8 Assignment scoring:** points live on Composition items/parts, not shared Question Bank Questions. Each scored question defaults to 1 point, customizable per Assignment item. Compound-question part points default to equal split; teachers may adjust them while preserving the aggregate item total. Server calculates earned points from Question Engine score fractions; percentage = total earned points / total possible scored points × 100. Preserve raw points and percentage; round only for display. Examples are zero-point and excluded. Readiness rejects zero possible scored points. ADR 0026 adds `show_score_after_submit`, independent of `show_answers_after_submit`.

## Architecture boundaries
QuestionSpec is immutable type-specific content; QuestionSnapshot includes provenance/revision/schema version. RawAnswer, ValidatedAnswer and GradeResult are separate. QuestionTypeHandler/registry own type semantics and do not use repositories/JPA/Jackson JsonNode. TeacherQuestionView and StudentQuestionView are separate. ActivitySession and AssessmentAttempt remain separate aggregates. AssignmentComposition owns order and Assignment scoring flags. Characterize current semantics before refactoring.

## Migration rule
Audited baseline was V30. This documentation decision adds no migration. Never edit V1–V30. Re-audit before implementation and create incremental migrations for option order/revision, Activity snapshots, Composition/scoring, AssessmentAttempt snapshots/answers and part grades.
