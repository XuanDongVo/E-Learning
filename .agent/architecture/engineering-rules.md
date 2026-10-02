# Engineering Rules

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

Cross-cutting rules for every change (frontend and backend).

## Core Development Rules

### 1. Inspect Before Changing

Before modifying code:

- Inspect the existing implementation.
- Search for similar components, hooks, services, and utilities.
- Follow existing project patterns.
- Inspect the relevant backend contract when available.
- Inspect existing types before creating new ones.
- Inspect route structure before creating new routes.

Do not assume an architecture or API that has not been verified in the repository.

---

### 2. Minimal Changes

Make the smallest change required to complete the task.

- Do not refactor unrelated code.
- Do not rename files unnecessarily.
- Do not reorganize folders unless required.
- Do not rewrite working code without a clear reason.
- Do not add speculative abstractions.

A feature should not become an excuse for a large refactor.

---

## Module-Based Development Workflow

All multi-feature work must follow a module-by-module vertical-slice workflow.

Do NOT:

- Build the entire frontend first and the backend later.
- Build the entire backend first and the frontend later.
- Implement several unrelated modules at the same time.
- Jump directly to Dashboard because it is visually prominent.
- Create permanent mock data for a module that already has a real backend contract.

For each module, work end-to-end:

```text
Inspect
  ↓
Database / Domain alignment
  ↓
Backend API
  ↓
Frontend UI
  ↓
API integration
  ↓
Validation
  ↓
Testing
  ↓
Module completion
```

A module is not complete when only the UI or only the API is finished.

### Module completion requirements

For the current module, complete the relevant parts of:

- Domain/database alignment
- Backend service/API
- Frontend UI
- API integration
- Loading state
- Empty state when applicable
- Error state
- Validation
- Success feedback
- Relevant tests/checks
- Responsive behavior for affected screens

Use real API integration when the backend contract exists.

Temporary development stubs are allowed only when explicitly necessary and must be isolated and removed before the module is considered complete.

### One module at a time

When a task covers multiple modules:

1. Identify the current phase.
2. Implement only the current phase and direct dependencies.
3. Validate the phase.
4. Stop at the phase boundary unless the user explicitly asks to continue.

Do not automatically implement the next phase after a phase is complete.

## Dependencies

Before installing a dependency:

1. Check whether the project already has an equivalent solution.
2. Prefer the existing stack.
3. Add a dependency only when it provides clear value.
4. Do not install libraries just for convenience.

Never update unrelated dependencies during a feature implementation.

---

## Environment Variables

Do not hardcode:

- API URLs
- Secret keys
- Tokens
- Credentials

Use the existing environment-variable mechanism.

Never commit secrets.

Do not expose server-only secrets to client-side code.

---

## Git Rules

Keep changes focused.

Do not:

- Reset unrelated changes.
- Delete user work.
- Rewrite git history.
- Force push.
- Modify unrelated files.

Before finishing:

- Check changed files.
- Remove unnecessary changes.
- Ensure no debug code remains.

---

## Validation

After making changes, validate the implementation.

At minimum, run the relevant checks available in the project:

- TypeScript check
- ESLint
- Tests
- Production build when appropriate

For UI changes:

- Check affected pages/components.
- Check loading, error, empty, and success states.
- Check responsive behavior.
- Check keyboard/accessibility behavior where applicable.

Do not claim a task is complete if required validation was not performed.

## Debugging Rules

When debugging:

1. Reproduce the problem.
2. Identify the root cause.
3. Make the smallest fix.
4. Validate the fix.
5. Check for regressions.

Do not patch symptoms when the root cause can be identified.

Do not add random retries, timeouts, or conditions just to hide an error.

---

## Execution Rule for Multi-Module Requests

When the user asks for a large feature such as:

- "Build the Teacher Dashboard"
- "Implement the whole Teacher side"
- "Build all admin/teacher modules"

do NOT interpret that as permission to implement every module in one pass.

First inspect the repository and determine the current phase.

Then implement the next incomplete phase using the module-by-module workflow.

Use the dependency order:

```text
Foundation
  ↓
Authentication
  ↓
Classes
  ↓
Content
  ↓
Activities
  ↓
Assignments
  ↓
Attempts / Answers
  ↓
Analytics
  ↓
XP / Ranking
  ↓
Teacher Dashboard
  ↓
Reports / Polish
```

Do not skip ahead because a later screen is visible in a design reference.

Do not create fake APIs, fake database fields, or fake persistent behavior to bypass unfinished dependencies.

If the user explicitly asks to work on a later module before its dependencies are complete, explain the dependency and keep any temporary implementation clearly isolated from the production flow.

---

## Documentation and Handoff

Keep implementation-specific notes close to the relevant code when necessary.

Do not create duplicate documentation that contradicts this file.

When a business rule changes, update the appropriate source-of-truth documentation and the affected implementation together.

The database/domain model, backend API contract, frontend types, and UI must remain synchronized.

---

<!-- BEGIN:nextjs-agent-rules -->
