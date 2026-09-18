# AGENTS.md

## Project Overview

This project is a Next.js web application for an internal English learning platform for teachers and students (Grades 6–8).

The product combines:

- Unit-based English learning content
- Reusable question banks
- Practice activities
- Game-based activities
- Teacher assignments
- Student attempts and results
- Learning analytics
- XP and grade-level ranking
- User authentication

The project must prioritize:

- Maintainability
- Correctness 
- Consistency
- Clear separation of concerns
- Reusable domain concepts
- End-to-end feature completeness
- Alignment between database/domain, backend API, frontend UI, and business rules

The frontend must not invent domain concepts that do not exist in the agreed architecture.
The UI, API, and database/domain model must describe the same system.

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- REST API
- Backend API is handled separately from the frontend
- PostgreSQL is the application database

Use the existing libraries and patterns already present in the project.

Do not introduce a new library unless it is necessary and there is no suitable existing solution.

---

## Core Domain Architecture

The current agreed domain model contains these entities:

1. User
2. Class
3. ClassMember
4. Unit
5. ClassUnit
6. Topic
7. QuestionBank
8. Question
9. GameTemplate
10. Activity
11. ActivityBank
12. Assignment
13. AssignmentTarget
14. Attempt
15. AttemptQuestion
16. Answer
17. XPTransaction

Do not introduce additional core entities for concepts that are already represented by the existing model unless explicitly requested.

### Content hierarchy

```text
Unit
  ↓
Topic
  ↓
QuestionBank
  ↓
Question
```

A Unit contains Topics.

Examples of Topics may include:

- Grammar
  - Past Simple
  - Comparative
  - Superlative
- Vocabulary
  - Food
  - Jobs
  - Places

A Topic may have multiple QuestionBanks.

Example:

```text
Past Simple
├── Basic
├── Review
└── Advanced
```

Do not assume one QuestionBank per Topic.

### Activity architecture

```text
Activity
  ↓
ActivityBank
  ↓
QuestionBank
  ↓
Question
```

An Activity is a reusable exercise configuration.

An Activity may combine multiple QuestionBanks and therefore multiple Topics, such as Grammar + Vocabulary.

`ActivityBank` represents which QuestionBanks an Activity uses and how questions are distributed from those sources.

Do not rename or replace this concept with unrelated concepts such as `ActivityQuestion`, `GameQuestion`, or `PracticeQuestion`.

### Game architecture

```text
GameTemplate
      ↓
   Activity
      ↓
QuestionBank / Question
```

A GameTemplate is a gameplay/UI template such as:

- Chicken Shooter
- Memory Match
- Space Defender
- Word Race
- Bomb Defuse
- Boss Battle

A game does not create a separate question system.

Games use the same Activity, QuestionBank, Question, Attempt, and Answer flow.
The game changes presentation/gameplay, not the underlying question/result model.

### Assignment architecture

```text
Activity
  ↓
Assignment
  ↓
AssignmentTarget
```

An Assignment is an Activity assigned by a teacher.

Assignment targets may be:

- Class
- Student
- Grade
- All students

### Attempt architecture

```text
Attempt
  ↓
AttemptQuestion
  ↓
Answer
```

An Attempt represents one actual run of an Activity by a student.

`AttemptQuestion` stores the exact set and order of questions selected for that attempt.

Do not randomize the question set again after the Attempt has been created.

### Analytics architecture

Weak-topic and performance analytics are derived from answer history:

```text
Answer
  ↓
Question
  ↓
QuestionBank
  ↓
Topic
  ↓
Performance statistics
```

Do not create a `StudentWeakness` core entity unless explicitly requested.

### XP and ranking architecture

XP history is stored in `XPTransaction`.

Ranking is calculated from XP transactions and the student's current grade context.

Current ranking requirements:

- Ranking by Grade 6, Grade 7, or Grade 8
- Weekly ranking
- Monthly ranking

Do not create a `Ranking` core entity unless explicitly requested.

Class-level ranking is not part of the current requirement.

### Concepts that are NOT core entities

Do not create these as separate entities unless explicitly requested:

- Practice
- Ranking
- StudentWeakness
- BestScore
- Completion
- GameQuestion
- AssignmentQuestion
- LearningMode
- TryHardMode
- School

These concepts are represented by existing entities, fields, relationships, or derived queries.

---

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

### Module progress tracking

For multi-phase implementation, track progress conceptually as:

```text
[ ] Phase 0 — Foundation
[ ] Phase 1 — Authentication and Users
[ ] Phase 2 — Classes
[ ] Phase 3 — Content
[ ] Phase 4 — Activities
[ ] Phase 5 — Assignments
[ ] Phase 6 — Attempts and Answers
[ ] Phase 7 — Analytics
[ ] Phase 8 — XP and Ranking
[ ] Phase 9 — Teacher Dashboard
[ ] Phase 10 — Reports and Final Polish
```

Complete one phase before moving to the next unless explicitly requested otherwise.

---

## Implementation Order

Use this default implementation order for the application.

### Phase 0 — Application Foundation

Implement:

- Design system
- Shared UI components
- Application layout
- Teacher sidebar
- Header
- Page container
- Responsive layout
- Shared loading states
- Shared empty states
- Shared error states
- Shared notifications/toasts

Do not implement business modules here.

---

### Phase 1 — Authentication and Users

Implement:

- Login
- Authentication/session handling
- Current user
- User role handling
- Protected routes
- Teacher access control

Reuse the existing authentication mechanism.

Do not create a second authentication system.

---

### Phase 2 — Classes

Implement:

- Class list
- Create/edit class
- Class detail
- Class members
- Student list within a class
- Basic class information

Domain entities:

```text
Class
ClassMember
User
```

Do not implement assignment analytics here.
Those depend on later phases.

---

### Phase 3 — Content

Implement the content hierarchy completely:

```text
Unit
  ↓
Topic
  ↓
QuestionBank
  ↓
Question
```

Implement:

- Unit list
- Unit detail
- Create/edit Unit
- Topic list/detail
- Create/edit Topic
- QuestionBank list/detail
- Create/edit QuestionBank
- Question list
- Create/edit Question
- Question preview
- Question archive/status handling

MVP question types:

- Multiple Choice
- True / False
- Fill in the Blank
- Type Answer

Do not add extra question types unless explicitly requested.

Question-specific content should use the agreed question data model rather than introducing separate tables for every question type.

Content completion gate:

Teacher must be able to create a Unit, Topic, QuestionBank, and Question, reload the page, and retrieve the saved data through the real API.

---

### Phase 4 — Activities

Implement:

- Activity list
- Create/edit Activity
- Question source selection
- ActivityBank management
- Question distribution
- Question selection strategy
- Learning Mode configuration
- Try Hard Mode configuration
- Optional GameTemplate configuration
- Activity preview

Activity distribution modes:

- `EQUAL`
- `PERCENTAGE`
- `FIXED_COUNT`

Question selection strategies:

- `RANDOM`
- `WEAKNESS_PRIORITY`

Activity modes:

#### Learning Mode

- No time limit
- Hints available
- Explanations available

#### Try Hard Mode

- Time limit
- 3 lives by default
- No hints/guidance
- Wrong answers consume lives
- Game Over after the configured life limit is reached

The exact configured values must come from the Activity configuration rather than hardcoded UI values.

Game rules:

- A game uses the same Activity/question system.
- Do not build a second question model for games.

Activity completion gate:

Teacher must be able to create an Activity from real QuestionBanks, configure distribution/modes/game, preview it, save it, reload it, and retrieve the persisted configuration through the API.

---

### Phase 5 — Assignments

Implement:

- Assignment list
- Create Assignment
- Select an Activity
- Select AssignmentTarget
- Optional deadline
- Late submission configuration
- Completion threshold
- Assignment detail
- Assignment progress shell

Assignment target types:

- `CLASS`
- `STUDENT`
- `GRADE`
- `ALL`

Assignment flow:

```text
Activity
  ↓
Select target
  ↓
Configure deadline/settings
  ↓
Review
  ↓
Assign
```

Do not invent a new entity for assignment questions.

---

### Phase 6 — Attempts and Answers

This phase powers real student work.

Implement:

- Start Attempt
- Select stable questions
- Create AttemptQuestion records
- Resume Attempt
- Submit Answer
- Save answers
- Calculate score
- Persist result
- Retry
- Best score handling
- Learning Mode
- Try Hard Mode
- Timer where configured
- Lives where configured
- Late attempt handling
- Result display

Attempt flow:

```text
Activity / Assignment
  ↓
Create Attempt
  ↓
Select questions
  ↓
AttemptQuestion
  ↓
Answer
  ↓
Score
  ↓
Result
```

`AttemptQuestion` must preserve the exact question set and order used by that attempt.

Do not randomize the question set again on refresh, resume, or review.

### Assignment attempt rules

The current business rules are:

- An Assignment can be attempted multiple times.
- There is no one-attempt-only restriction.
- Full attempt history must be preserved.
- The student's best score counts.
- Students may retry after reaching the completion threshold.
- Completion is achieved when the best score is greater than or equal to the assignment completion threshold.
- The default completion threshold is 80%.
- Assignment time limits are optional.
- Assignment deadlines are optional.
- If a deadline exists and the student completes after it, the attempt is marked late.
- A student who is already working when the deadline passes may continue when late submission is allowed.
- Do not automatically hard-lock or auto-submit an attempt solely because the assignment deadline passes unless explicitly requested.
- Unanswered questions are not counted as incorrect answers.
- The final percentage still uses the total number of questions as the denominator.

### Practice rules

Practice is represented by an Activity/Attempt without an Assignment relationship.

- Practice results are saved.
- Practice contributes XP.
- Practice XP should be lower than Assignment XP according to the central XP rules.

Do not create a separate Practice entity.

---

### Phase 7 — Analytics

Analytics depend on completed Attempt/Answer data.

Implement:

- Student performance
- Topic performance
- Class performance
- Assignment performance
- Weak-topic analysis
- Recent performance
- Attempt history
- Question performance where useful

Weak-topic analytics must be derived from:

```text
Answer
  ↓
Question
  ↓
QuestionBank
  ↓
Topic
```

The fact that an Activity mixes Grammar and Vocabulary must NOT prevent accurate Topic statistics.

Example:

```text
Activity: Unit 2 Review

Past Simple       20%
Comparative       20%
Superlative       20%
Food              40%
```

Student answers must still be attributable to the underlying Topics through the Question relationships.

Do not calculate a student's weakness from the total Activity score alone.

Do not create a `StudentWeakness` entity.

### Minimum-data rule for analytics

Do not present a strong conclusion from an extremely small sample.

The UI should distinguish between:

- Insufficient data
- Available performance data

The exact thresholds should be centralized rather than duplicated in individual UI components.

---

### Phase 8 — XP and Ranking

Implement XP after Attempt/Answer behavior is stable.

XP data source:

```text
XPTransaction
```

XP calculation rules must have a single source of truth.

Do not hardcode XP values in random UI components.

Ranking requirements:

- Grade 6
- Grade 7
- Grade 8
- Weekly
- Monthly

Ranking is calculated dynamically from XP transactions and student grade context.

Do not create a Ranking entity for the current scope.

Do not add class-level ranking unless explicitly requested.

---

### Phase 9 — Teacher Dashboard

Build the Teacher Dashboard only after the underlying modules provide real data.

The dashboard is an aggregation layer, not the source of business logic.

Teacher Dashboard should be able to summarize:

- Classes
- Students
- Active assignments
- Activities
- Assignment progress
- Students needing attention
- Class performance
- Grade ranking
- Recent activity

Do not create fake metrics just to fill dashboard cards.

Every dashboard metric must map to a real source or clearly display that data is unavailable.

### Teacher navigation

The current Teacher information architecture is:

```text
Dashboard
Classes
Content
  ├── Units
  └── Question Banks
Activities
Games
Assignments
Students
Reports
Ranking
Settings
```

The navigation may be implemented as a sidebar on desktop and a responsive drawer on mobile web.

### Teacher core workflow

```text
CONTENT
Unit → Topic → QuestionBank → Question
                ↓
ACTIVITY
QuestionBanks → Activity → Distribution → Mode/Game → Preview
                ↓
ASSIGNMENT
Activity → Target → Deadline → Assign
                ↓
TRACKING
Assignment → Progress → Student → Attempts
                ↓
ANALYTICS
Student → Topic Performance → Weak Topics
                ↓
PRACTICE
Weak Topic → New Activity
```

This workflow is the main Teacher product loop.

---

### Phase 10 — Reports and Final Polish

Implement after the core flow works:

- Class reports
- Student reports
- Topic reports
- Assignment reports
- Responsive refinement
- Accessibility refinement
- Performance refinement
- UX polish
- Consistency checks

Reports should reuse analytics services and types instead of implementing separate calculation logic.

---

## Teacher UI Screen Structure

When implementing Teacher screens, use the agreed screen structure unless the user explicitly requests a change.

```text
TCH-00 Login
TCH-01 Dashboard
TCH-02 Classes
TCH-03 Class Detail
TCH-04 Units
TCH-05 Unit Detail
TCH-06 Topic Detail
TCH-07 Question Bank
TCH-08 Question Editor
TCH-09 Activities
TCH-10 Activity Builder
TCH-11 Activity Preview
TCH-12 Assignments
TCH-13 Create Assignment
TCH-14 Assignment Detail
TCH-15 Student Detail
TCH-16 Weak Topics
TCH-17 Attempts
TCH-18 Game Library
TCH-19 Reports
TCH-20 Grade Ranking
TCH-21 Settings
```

These are UI screens, not separate database entities.

---

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

## UI and Design

Follow the existing design system.

The Teacher UI should use the same visual language as the existing student experience when applicable.

General design direction:

- Clean educational SaaS UI
- Light background
- White cards
- Soft blue/purple primary accents
- Rounded cards
- Subtle shadows
- Clear typography hierarchy
- Compact but readable data tables
- Consistent iconography
- Responsive web layout
- Teen/student-friendly but professional teacher interface

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
- Consistent radius/shadows
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
- Focus states must be visible.
- Do not rely on color alone to communicate meaning.
- Tables should remain understandable to keyboard and screen-reader users.

---

## Responsive Web

This is a responsive web application, not a native mobile application.

Desktop:

- Dashboard-style layout
- Sidebar navigation
- Content max-width appropriate to the screen

Mobile web:

- Sidebar becomes a drawer/menu
- Cards and tables adapt to narrow screens
- Touch targets remain usable
- Avoid dense desktop-only layouts

Do not introduce a separate mobile application architecture unless explicitly requested.

---

## Analytics and Business Logic

Business calculations must have a single source of truth.

Do not duplicate calculation logic between:

- Components
- Hooks
- Services
- Pages

Examples include:

- Score calculation
- Best score
- Completion status
- XP calculation
- Ranking calculation
- Topic accuracy
- Assignment progress

The UI should display calculated values from trusted service/domain logic.

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

### Module validation gate

Before moving to the next module, confirm:

```text
[ ] Real backend contract verified
[ ] Frontend integrated with backend
[ ] No permanent mock data
[ ] Loading handled
[ ] Error handled
[ ] Empty state handled when applicable
[ ] Validation handled
[ ] TypeScript passes
[ ] ESLint passes
[ ] Relevant tests pass
[ ] Build passes when applicable
[ ] Responsive behavior checked
```

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
- The implementation matches the agreed domain architecture.
- No UI-only fields were invented that have no domain/API meaning.
- No backend-only fields are exposed without a clear UI purpose.
- No unnecessary files were changed.
- No duplicate logic was introduced.
- No debug logs remain.
- TypeScript/ESLint/tests/build pass when applicable.
- The implementation follows the existing architecture.
- The module completion gate is satisfied before moving to the next module.

In the final response, briefly report:

- What changed
- Current module/phase completed
- Files affected
- API changes
- Validation performed
- Any remaining issue or assumption

When a multi-module request is intentionally not fully implemented because the current phase is incomplete, explicitly state which phase was completed and stop there.

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

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
