# AGENTS.md

## Project Overview

This project is a Next.js web application for an English learning platform.

The application provides:
- Lessons
- Practice activities
- Assignments
- Questions and answers
- Learning progress
- XP / rewards
- User authentication
- Practice and assignment results

The project must prioritize maintainability, consistency, correctness, and a clear separation of concerns.

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- REST API
- Backend API is handled separately from the frontend
- Use the existing libraries and patterns already present in the project

Do not introduce a new library unless it is necessary and there is no suitable existing solution.

---

## Core Development Rules

### 1. Inspect Before Changing

Before modifying code:

- Inspect the existing implementation.
- Search for similar components, hooks, services, and utilities.
- Follow existing project patterns.
- Do not create duplicate implementations.

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

### 3. TypeScript

Use TypeScript strictly.

Rules:
- Avoid `any`.
- Prefer explicit types for API responses and important data structures.
- Reuse existing types when available.
- Do not duplicate the same type in multiple files.
- Put shared types in the existing shared type location.

When an API response changes, update all affected types and usages.

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
- Avoid putting API/business logic directly into reusable UI components

### hooks/
- Reusable client-side React hooks
- UI/business logic that needs React state or lifecycle

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
- business rules
- complex state management
- large amounts of JSX

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
- Invent request fields or response fields.

Before implementing an API integration:
- Search the existing service layer.
- Check the backend contract if available.
- Reuse existing request/response types.

If the API contract is unclear, inspect the repository before making assumptions.

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

---

## Forms and Validation

Use the existing form and validation libraries/patterns in the project.

Validation should exist where appropriate.

Never rely only on client-side validation for security-sensitive operations.

Reuse existing validation schemas/components instead of creating duplicates.

---

## Error Handling

Every API-dependent feature must handle:
- Loading state
- Success state
- Error state
- Empty state when applicable

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
- Retry actions when appropriate

Avoid unnecessary loading spinners for instant/local operations.

---

## Assignment Rules

The application contains Assignment and Practice functionality.

Assignment behavior must remain consistent with the existing business requirements.

Important:
- Each Assignment can only be attempted once.
- Assignment time limits are optional.
- Assignment score uses the total number of questions as the denominator.
- Unanswered questions are not counted as incorrect answers, but they still reduce the final percentage because the denominator remains the total number of questions.
- Practice results are saved.
- Practice contributes XP.
- Practice gives less XP than Assignment.

Do not modify these rules unless explicitly requested.

---

## XP and Progress

Do not duplicate XP calculation logic across components.

XP-related business rules should have a single source of truth.

When modifying XP behavior:
- Find the existing implementation first.
- Update the central logic.
- Check all features that depend on XP.

Do not hardcode XP values in UI components.

---

## UI and Design

Follow the existing design system.

Prefer existing:
- Buttons
- Inputs
- Dialogs
- Cards
- Tables
- Typography
- Toasts
- Icons

Do not introduce a new visual style for one feature.

Maintain:
- Consistent spacing
- Consistent typography
- Responsive behavior
- Accessibility

Do not use arbitrary colors or styles when an existing design token/component already exists.

---

## Accessibility

Interactive elements must be accessible.

Examples:
- Buttons must be real `<button>` elements.
- Inputs must have labels or accessible names.
- Images should have appropriate `alt` text.
- Dialogs must be keyboard accessible.
- Do not rely on color alone to communicate meaning.

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

---

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

Do not claim a task is complete if validation was not performed.

---

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

## Before Finishing a Task

Verify:

- The requested feature works.
- Existing behavior is preserved.
- No unnecessary files were changed.
- No duplicate logic was introduced.
- No debug logs remain.
- TypeScript/ESLint/tests/build pass when applicable.
- The implementation follows the existing architecture.

In the final response, briefly report:
- What changed
- Files affected
- Validation performed
- Any remaining issue or assumption