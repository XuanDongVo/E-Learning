# Frontend Architecture and Rules

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

## TypeScript

Use TypeScript strictly.

Rules:

- Avoid `any`.
- Prefer explicit types for API responses and important data structures.
- Reuse existing types when available.
- Do not duplicate the same type in multiple files.
- Put shared types in the existing shared type location.
- API response changes must update all affected types and usages.

Domain concepts should use the agreed names consistently:

- `Activity`
- `ActivityBank`
- `QuestionBank`
- `Attempt`
- `AttemptQuestion`
- `XPTransaction`
- `AssignmentTarget`

Do not introduce parallel names for the same concept.

---

## Project Architecture

Follow the existing project structure.

Recommended responsibilities:

### app/

- Pages
- Layouts
- Route-level UI
- Server Components where appropriate

### components/

- Reusable UI components
- Feature components
- No direct business/API logic in generic reusable components when a service/hook layer is appropriate

### hooks/

- Reusable client-side React hooks
- UI/business logic requiring React state or lifecycle

### services/

- API communication
- Request/response handling
- API-specific logic

### types/

- Shared TypeScript types
- API models
- Domain models

### utils/

- Pure utility functions
- No React-specific logic unless required

Do not create a new top-level directory when an existing directory already has the correct responsibility.

---

## Components

Prefer reusable components when the same UI or behavior appears more than once.

Before creating a new component:

1. Search existing components.
2. Reuse or extend an existing component when appropriate.
3. Create a new component only when it has a clear responsibility.

Keep components focused.

Do not create huge components containing:

- API requests
- Business rules
- Complex state management
- Large amounts of JSX

Separate responsibilities when necessary.

---

## Server vs Client Components

Use Server Components by default when possible.

Use `"use client"` only when the component requires:

- React state
- Event handlers
- Browser APIs
- Client-side hooks
- Client-side interaction

Do not add `"use client"` unnecessarily.

---

## API Rules

All API communication must follow the existing service/API architecture.

Do not:

- Call backend APIs directly from random UI components if a service already exists.
- Duplicate API request logic.
- Hardcode API URLs inside components.
- Invent API endpoints.
- Invent request fields.
- Invent response fields.

Before implementing an API integration:

- Search the existing service layer.
- Check the backend contract if available.
- Reuse existing request/response types.
- Inspect the repository if the API contract is unclear.

If the backend contract does not support a requested feature, do not silently invent a frontend-only implementation that pretends it is persisted.

---

## Authentication

Do not change authentication behavior unless the task explicitly requires it.

Do not:

- Bypass authentication.
- Store sensitive authentication data in unsafe client-side storage.
- Duplicate authentication logic.
- Implement a second authentication mechanism.

Reuse the project's existing authentication flow.

---

## State Management

Use the project's existing state-management approach.

Do not introduce a new global state solution for a small feature.

Prefer:

- Local state for local UI state.
- Existing server-state/data-fetching solution for server data.
- Existing global state only when data must truly be shared.

Avoid unnecessary global state.

Server state should not be duplicated as independent client-side sources of truth.

---

## Forms and Validation

Use the existing form and validation libraries/patterns in the project.

Validation should exist where appropriate.

Never rely only on client-side validation for security-sensitive operations.

For configuration-heavy forms, validate business rules such as:

- Activity question count > 0
- Percentage distribution totals 100%
- Fixed-count distribution totals the Activity question count
- Try Hard time limit is valid when enabled
- Assignment completion threshold is between 0 and 100
- Target fields match the selected AssignmentTarget type

Reuse existing validation schemas/components instead of creating duplicates.

---

## Error Handling

Every API-dependent feature must handle, where applicable:

- Loading state
- Success state
- Error state
- Empty state
- Retry action

Do not silently ignore API errors.

Do not expose raw internal errors to users.

Use the project's existing error-handling and notification patterns.

---

## Loading and UX

User-facing asynchronous operations should provide appropriate feedback.

Examples:

- Loading indicators
- Disabled submit buttons
- Empty states
- Error messages
- Retry actions
- Optimistic feedback only when safe

Avoid unnecessary loading spinners for instant/local operations.

Do not block the entire page when only a small section is loading unless necessary.

---

## Performance

Avoid unnecessary:

- Client Components
- Re-renders
- API requests
- Duplicate data fetching
- Large client-side bundles

Do not optimize prematurely.

Only introduce memoization, caching, dynamic imports, or complex optimization when there is a clear reason.

For dashboard/report screens, prefer server-side aggregation APIs when appropriate rather than downloading large raw datasets to the browser.

---

## UI, accessibility and responsive behavior

The former "UI and Design", "Accessibility" and "Responsive Web" sections are superseded by
[`ui/UI_ARCHITECTURE_GUIDELINES.md`](../ui/UI_ARCHITECTURE_GUIDELINES.md) (see
[ADR 0002](../decisions/0002-adopt-ui-guidelines-and-tokens.md)). Follow that document for tokens, layout,
components, accessibility and responsive rules.

## Conventions observed in the current frontend

- API calls go through `request()` in `src/services/api.service.ts`; failures throw `ApiError`
  (an `Error` subclass with `code` and `details`).
- Domain services live in `src/services/` (content services under `src/services/content/`), TanStack Query keys in
  `src/services/query-keys.ts`, shared types in `src/types/`.
- Design tokens live in `src/app/globals.css`; toasts use Sonner.
- Pages are Server Components that render client feature components; in this Next.js version `params` is a
  `Promise` (`await params`, or `use(params)` in a client page).

