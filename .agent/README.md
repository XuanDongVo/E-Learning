# AI-Native Project Knowledge Base

Entry point: AGENTS.md.

## Canonical structure

Required Phase 7B plan: `.agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md`

.agent/
├── README.md
├── PROGRESS.md
├── intent/
├── decisions/
├── domain/
├── architecture/
│   ├── question-engine-v1.md (accepted target architecture; see ADR 0023)
│   └── assignment-composition-v1.md (accepted product model; see ADR 0024)
├── plans/
├── design/
├── ui/
└── checklists/

Every path referenced by AGENTS.md or another normative document must exist on this branch.

## Authority

1. Accepted ADRs.
2. Accepted product intent and explicit owner decisions.
3. Active phase specification.
4. Domain and architecture contracts.
5. UI guidance.
6. PROGRESS.md for implementation state only.
7. Code for what is currently implemented.

When an ADR changes a previous rule, create a later ADR and remove the old executable requirement from active specs. Historical ADRs remain for traceability.

## Current canonical decisions

Question Engine v1 is accepted by ADR 0023 (D1–D8); implementation is not yet delivered. Assignment Composition is accepted by ADR 0024 and `.agent/architecture/assignment-composition-v1.md`.

- Activity belongs to Unit, not Topic.
- Activity and Assignment are independent.
- Activity can offer Learning, Try Hard or both; when both are available, the student chooses the concrete mode at start.
- Activity can expose multiple question-selection strategies. When multiple are configured, the student chooses one at start; the selected strategy is stored on ActivitySession.
- Try Hard time_limit_seconds is per question, not per Activity run. Practice has no timer.
- Assignment owns AssignmentQuestion records. AssignmentQuestion has no position field; canonical order belongs to Composition sections/items/members per ADR 0024. Legacy records are backfilled in question_id ascending order.
- Assignment has one attempt. Assignment time_limit_seconds applies to the whole attempt.
- Assignment answer visibility after submit is controlled by show_answers_after_submit, default true. There is no Release Answers workflow.
- Activity lifecycle: DRAFT -> PUBLISHED only when READY; DRAFT -> ARCHIVED; PUBLISHED -> ARCHIVED; ARCHIVED -> DRAFT. ARCHIVED cannot go directly to PUBLISHED.
- GameTemplate is deferred. It is a presentation concern and is not a current Activity dependency, entity or API.
- Learning Mode is shown as Practice in student UI: no timer, one retry and optional teacher-authored Question hint. The shared Topic formula/reference sheet is intentionally deferred; do not add it to the current implementation contract.
- Question Bank and Assignment share canonical QuestionSpec semantics but retain independent ownership/runtime. Student views must not expose correctness/accepted/normalized answers before permitted reveal. Assignment Composition is a separate ordered model.

## Required Phase 7B planning input

Before writing Phase 7B code, read `.agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md` together with ADR 0023–0026, `.agent/architecture/question-engine-v1.md`, `.agent/architecture/assignment-composition-v1.md` and the active Phase 7 spec. ADR 0023 is Accepted, ADR 0025 governs Assignment lock/Activity update semantics, and ADR 0026 governs automatic Assignment scoring and score visibility. Assignment locks after its first attempt starts and must be cloned to change; Activity edits remain allowed and apply to future sessions while existing sessions retain their snapshot.

Start by reading PROGRESS.md and the task-relevant ADR/spec/domain files.
Before coding, resolve contradictions top-down through ADRs and active specs.
At the end of a task, update PROGRESS.md with what was changed and what was not verified.


Assignment score contract: each scored question defaults to 1 point and can be customized per Assignment item. Assignment is automatically graded on submit/timeout; there is no manual grading workflow. `show_score_after_submit` (default TRUE) controls immediate score display; `show_answers_after_submit` independently controls answer/explanation visibility. Composition order comes from persisted section/item/member positions, never question_id order except for legacy backfill.
