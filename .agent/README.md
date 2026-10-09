# AI-Native Project Knowledge Base

Entry point: AGENTS.md.

## Canonical structure

.agent/
├── README.md
├── PROGRESS.md
├── intent/
├── decisions/
├── domain/
├── architecture/
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

- Activity belongs to Unit, not Topic.
- Activity and Assignment are independent.
- Activity can offer Learning, Try Hard or both; when both are available, the student chooses the concrete mode at start.
- Activity can expose multiple question-selection strategies. When multiple are configured, the student chooses one at start; the selected strategy is stored on ActivitySession.
- Try Hard time_limit_seconds is per question, not per Activity run. Practice has no timer.
- Assignment owns AssignmentQuestion records. AssignmentQuestion has no position field and there is no reorder API or UI. The server returns questions deterministically by question_id ascending.
- Assignment has one attempt. Assignment time_limit_seconds applies to the whole attempt.
- Assignment answer visibility after submit is controlled by show_answers_after_submit, default true. There is no Release Answers workflow.
- Activity lifecycle: DRAFT -> PUBLISHED only when READY; DRAFT -> ARCHIVED; PUBLISHED -> ARCHIVED; ARCHIVED -> DRAFT. ARCHIVED cannot go directly to PUBLISHED.
- GameTemplate is deferred. It is a presentation concern and is not a current Activity dependency, entity or API.
- Learning Mode is shown as Practice in student UI: no timer, one retry and optional teacher-authored Question hint. The shared Topic formula/reference sheet is intentionally deferred; do not add it to the current implementation contract.

## How agents work

Start by reading PROGRESS.md and the task-relevant ADR/spec/domain files.
Before coding, resolve contradictions top-down through ADRs and active specs.
At the end of a task, update PROGRESS.md with what was changed and what was not verified.
