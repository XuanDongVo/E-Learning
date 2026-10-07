# AI-Native Project Knowledge Base


Everything an AI agent (or a new developer) needs to work on this repo. Entry point: [`../AGENTS.md`](../AGENTS.md).

## Canonical structure

```text
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
```

Every path referenced by `AGENTS.md` or another normative document must exist on this branch. A broken reference is a knowledge-base defect and must be fixed before an agent relies on the affected document.

## Layers (read top → bottom; a higher layer wins on conflict)

| Layer | Folder | Answers | Changes when |
|---|---|---|---|
| Decisions | [`decisions/`](./decisions/README.md) | Why did we choose A over B? (ADR, never deleted) | A significant decision is made or reversed |
| Intent | [`intent/`](./intent/0001-core-platform.md) | What is the product for, what is in/out of scope, what is still undecided? | Scope or goals change |
| Design | [`domain/`](./domain/domain-model.md), [`plans/`](./plans/PHASES.md), [`ui/`](./ui/UI_ARCHITECTURE_GUIDELINES.md), [`architecture/`](./architecture/overview.md), [`design/`](./design/spec-status.md) | What exactly will the system do and how is it built? | A rule, entity, endpoint or screen changes |
| Build | [`PROGRESS.md`](./PROGRESS.md), [`checklists/`](./checklists/definition-of-done.md) | What is done, in progress, next? What blocks it? | Every task |

## Authority and conflict resolution

Use this precedence when two artifacts disagree:

1. Accepted ADRs for decisions.
2. Accepted product intent and explicit owner-approved open-question resolutions.
3. The active phase specification.
4. Domain and architecture contracts.
5. UI guidance.
6. PROGRESS for observed implementation state only.
7. Code for what is currently implemented.

If an artifact is marked superseded, do not use it as an executable requirement. Record the replacement decision or update the stale artifact.

## How to change something (top-down, never code first)

1. **Small rule change** → edit the rule in `domain/business-rules.md` (or the phase spec) → add/adjust its test → change code → update `PROGRESS.md`.
2. **New feature** → new `intent/NNNN-*.md` (or extend open questions) → update spec → plan → build.
3. **Reversing an old decision** → new ADR; mark the old one `Superseded by NNNN`. Never delete.
4. **Spec and code disagree** → stop, add a row to [`design/spec-status.md`](./design/spec-status.md) (drift register), ask the owner, then fix whichever side is wrong.

## Session routine for AI agents

- Start: read `PROGRESS.md`, then the files listed for your task in `AGENTS.md`.
- End: update `PROGRESS.md` (what changed, what is next, what you could not verify).
