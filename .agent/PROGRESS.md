# Project Progress

Audit date: 2026-10-12
Branch: feature/phase-7-assigment
Audited application baseline before documentation changes: c2a98fd9101d7b6613e5c2af6090eff8d189715e

## Current stage
- Phase 6 Student Management: DONE.
- Phase 7 Scope A ActivitySession: present in code; configured validation run still required.
- Phase 7 Scope B AssessmentAttempt + Assignment Composition: contract accepted, implementation not started/not verified.
- Question Engine: architecture accepted in ADR 0023; implementation not yet delivered.
- Assignment Composition: product model accepted in ADR 0024; demo is product prototype. Current localStorage/seed persistence remains prototype-only.

## Accepted contracts
- Activity and Assignment have separate aggregates; no polymorphic Attempt table.
- Activity uses ActivitySession and does not persist detailed answer/part history.
- Full immutable Activity question snapshots are required. Before enforcing snapshots, abandon legacy IN_PROGRESS sessions; never reconstruct historical snapshots from mutable live content.
- Question Engine D1–D8 accepted: preserve existing scoring; CLOZE separate from FILL_IN_BLANK; one QuestionSpec union; durable Activity snapshots; separate Activity/Assignment analytics; image-first media; persist Assignment part results and normalized submitted values; weighted Assignment points.
- Assignment Composition is ordered sections/items/blocks/groups. Composition owns ordering; AssignmentQuestion remains position-free.
- Assignment-specific points, required and isExample do not mutate shared Question Bank content. Assignment submissions are automatically graded; there is no manual grading or AUTO/MANUAL selector. Each scored question defaults to 1 point, customizable per Assignment item.
- Assignment analytics support correct/partial/incorrect/unanswered and normalized wrong-answer distributions.
- Readiness blocks publishing if total possible scored points is zero. `show_score_after_submit` defaults true and independently controls immediate score display from `show_answers_after_submit` answer/explanation visibility.
- Existing Assignments backfill to one section in question_id ascending order with defaults 1 point/required/not-example unless explicit values exist. After backfill, Composition positions—not question_id—define product order.

## Implementation gaps
- Existing Question types have distributed validation/persistence/grading logic; handlers/registry are not implemented.
- question_options has no explicit display_order in the audited schema.
- ActivitySessionQuestion still references mutable Question content; full snapshots are not implemented.
- Older authoring paths omit hint in mapping and require round-trip tests/fixes.
- AssignmentService status transition does not currently enforce readiness; AssignmentQuestionService edit guard does not lock by AssessmentAttempt.
- AssessmentAttempt is not implemented; dedicated Question Engine/Attempt tests were not found.
- Demo uses localStorage/seed; production must use APIs and canonical QuestionSpec + Composition.

## Migration rules
- Never edit Flyway migrations V1–V30.
- Re-audit actual latest migration before choosing the next version; do not assume V31–V33 remain available.
- Documentation acceptance does not mean code, tests, lint, TypeScript or builds pass.

## Next gates
1. Read `.agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md` and re-run Scope A tests in configured environment.
2. Write Phase 7B implementation/migration plan from current schema baseline.
3. Add characterization tests for existing Question types.
4. Implement QuestionSpec/handlers/registry and demo adapters using the accepted Phase 7B plan.
5. Implement Composition persistence/API and deterministic legacy backfill. Assignment hard-locks after first attempt; clone to change.
6. Implement AssessmentAttempt snapshots, saved answers, timeout, automatic weighted scoring and score/answer display settings.
7. Implement per-part analytics/export and tests for readiness, locking, scoring, leakage and ordering.

This file tracks implementation state and does not claim the above work is done.
