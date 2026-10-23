# AI-Native Project Knowledge Base

**Start here:** [00 — Knowledge Base Index](./00-INDEX.md).

## Required reading sequence

1. `00-INDEX.md` — reading order, authority, naming and lifecycle policy.
2. `CURRENT_STATE.md` — actual implementation state and known gaps.
3. `PROGRESS.md` — latest work and verification record.
4. Product intent and open owner questions.
5. Accepted ADRs, in numerical order; read the ADR index first.
6. Domain and architecture contracts relevant to the task.
7. `plans/PHASES.md` and the active phase specification.
8. One active task plan, if one exists.
9. Relevant UI blueprint and Definition of Done checklist.

## Authority rules

- Accepted ADRs record approved product decisions. An accepted decision is not proof of implementation.
- Code and migrations are the final evidence of what exists.
- `CURRENT_STATE.md` records implementation status; correct it after inspecting code when it is stale.
- `PROGRESS.md` records work and validation evidence; it must not redefine product rules.
- Dated audits and superseded plans are historical evidence, not active instructions.
- When a decision changes, add a later ADR; do not rewrite history or renumber existing ADRs.
- Never claim build/test/browser validation passed unless it was run against the exact commit being reported.

## Current canonical decisions

- Activity belongs to Unit; Activity and Assignment are independent.
- Activity may offer Practice (backend `LEARNING`), Try Hard, or both. If multiple selection strategies are configured, the student chooses at start and the concrete strategy is stored on ActivitySession.
- Practice has no timer, one retry and an optional teacher-authored Question hint. Try Hard timing is per question.
- Draft Activities may be incomplete; publishing requires server-side READY validation.
- GameTemplate and Topic formula/reference sheets are deferred.
- AssignmentQuestion is an ownership association without product-order position. Composition section/item/member positions define Assignment order; `question_id ASC` is only the legacy backfill order.
- Assignment time limit applies to the whole formal attempt.
- `show_score_after_submit` and `show_answers_after_submit` are independent settings. Assignment scoring/attempt runtime must not be described as implemented until verified in code.
- Question Engine architecture is accepted and structurally implemented, but end-to-end persistence, runtime, snapshot and authoring parity are incomplete.
- Current Teacher Content routes are under `/teacher/content/...`.

## Phase 7B gate

Before implementing formal Assignment attempts, read `plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md`, ADR 0023–0026, `architecture/question-engine-v1.md`, `architecture/assignment-composition-v1.md`, and the current Phase 7 spec. Verify Scope A and re-audit the current maximum Flyway migration first.

At the end of each substantial task, update `PROGRESS.md` with changed files, exact verification results, and what remains unverified.
