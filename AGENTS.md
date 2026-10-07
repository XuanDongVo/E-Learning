# AGENTS.md

<!-- Single entry point for AI agents and humans. Lives at the repo root so every ./.agent link resolves. -->

English-learning platform for teachers and students (Grades 6–8): content (question banks), activities and games,
teacher assignments, attempts, analytics, XP and ranking.

- `client-e-learning/` — Next.js, React, TypeScript, Tailwind CSS
- `server/` — Spring Boot (Java 21), JPA, Flyway, PostgreSQL

**All project knowledge lives in [`.agent/`](./.agent/README.md).** This file is the entry point: read the files that
match your task before changing anything.

## Read first

| If your task is… | Read |
|---|---|
| Anything | [`.agent/PROGRESS.md`](./.agent/PROGRESS.md) (done / in progress / next, known issues), [`architecture/overview.md`](./.agent/architecture/overview.md) and [`.agent/architecture/engineering-rules.md`](./.agent/architecture/engineering-rules.md) |
| Why the product exists, what is in/out of scope | [`intent/0001-core-platform.md`](./.agent/intent/0001-core-platform.md), [`intent/open-questions.md`](./.agent/intent/open-questions.md) |
| What the spec says vs. what the code does | [`design/spec-status.md`](./.agent/design/spec-status.md) (drift register, rule traceability) |
| Attempts, answers, student runtime (Phase 7, draft) | [`plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md`](./.agent/plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md) |
| Domain model, entities, naming | [`domain/domain-model.md`](./.agent/domain/domain-model.md), [`domain/glossary.md`](./.agent/domain/glossary.md) |
| Business rules (attempts, scoring, XP, analytics) | [`domain/business-rules.md`](./.agent/domain/business-rules.md) |
| Questions or content | [`domain/question-model.md`](./.agent/domain/question-model.md) |
| A phase or module | [`plans/PHASES.md`](./.agent/plans/PHASES.md) and that phase's spec in `plans/` |
| Activities (Phase 4) | [`plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md`](./.agent/plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md) |
| Any UI, layout, color, component | [`ui/UI_ARCHITECTURE_GUIDELINES.md`](./.agent/ui/UI_ARCHITECTURE_GUIDELINES.md), [`ui/screens.md`](./.agent/ui/screens.md) |
| Frontend code | [`architecture/frontend.md`](./.agent/architecture/frontend.md) |
| Backend code, database, migrations | [`architecture/backend.md`](./.agent/architecture/backend.md) |
| An API call or a new endpoint | [`architecture/api-contract.md`](./.agent/architecture/api-contract.md) |
| Before saying "done" | [`checklists/definition-of-done.md`](./.agent/checklists/definition-of-done.md) |
| A past decision or a conflict | [`decisions/`](./.agent/decisions/README.md) |

Next.js in this repo has breaking changes. Read the matching guide in `client-e-learning/node_modules/next/dist/docs/`
before writing frontend code (see `client-e-learning/AGENTS.md`).

## Source of truth and conflicts

Order: accepted ADRs → `intent/` → the active phase spec → `domain/` → `ui/` and `architecture/`. The code is authoritative for what
exists today. **If two documents disagree, stop and ask**, then record the answer as an ADR in `.agent/decisions/`.

## Rules that always apply

- **Inspect before changing.** Search for existing components, services, types and routes; follow existing patterns.
- **Smallest change.** No unrelated refactors, renames or speculative abstractions.
- **One phase at a time.** Work module by module as a vertical slice (domain → backend → frontend → integration →
  validation). Stop at the phase boundary unless asked to continue.
- **Do not invent** entities, endpoints, request/response fields or business rules. The domain, API and UI must describe the same system.
  The concepts listed as "not core entities" in `domain-model.md` stay derived.
- **Activity and Assignment are independent** ([ADR 0001](./.agent/decisions/0001-activity-and-assignment-are-independent.md)).
- **Server is authoritative.** Validate and derive on the server; never trust client-sent ownership, correctness, readiness or counts.
- **Real APIs only.** No permanent mock data for a module whose backend contract exists.
- **Every data screen handles** loading, empty, error, disabled and success states.
- **UI uses tokens and shared components only.** No raw colors, arbitrary sizes or new visual styles.
- **No secrets** in code, logs or commits. Do not change authentication behavior unless the task requires it.
- **Git:** keep changes focused; never reset, delete or rewrite others' work; no force pushes.
- **Do not claim completion without validation.** Run what applies and say what you could not run.

## Commands

```bash
# frontend (client-e-learning/)
npm run lint
npm run build

# backend (server/)
./mvnw test
```

The API base URL is `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`).

## Final report

State briefly: what changed, which phase/module, files affected, API changes, validation performed, and any
remaining issue or assumption. Update `.agent/PROGRESS.md` and any `.agent` file whose facts changed.
