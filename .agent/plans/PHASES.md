# Implementation Phases

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

Scope and dependency order of the project. Current status lives in [`../PROGRESS.md`](../PROGRESS.md).
Implement **one phase at a time**; stop at the phase boundary unless explicitly told to continue.

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
Grade
  ↓
Unit
  ↓
Section
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
- Section list/detail and create/edit Section
- Topic list/detail
- Create/edit Topic
- QuestionBank list/detail
- Create/edit QuestionBank
- Question list with server-side pagination and search
- Create/edit Question
- Question preview for teachers
- Question completeness handling

Question rules, validation and the content completion gate: [`domain/question-model.md`](../domain/question-model.md).

### Phase 4 — Activities

Source of truth: [`plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md`](./E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md).

Scope (summary only; the spec wins on any detail):

- Activity list, create/edit, publish/archive
- ActivityBank management (question sources) and question distribution (`EQUAL`, `PERCENTAGE`, `FIXED_COUNT`)
- Question selection strategy (`RANDOM`, `WEAKNESS_PRIORITY`)
- Mode configuration: `LEARNING`, `TRY_HARD`, `BOTH` (**default `BOTH`**: the student chooses)
- Optional GameTemplate, preview, readiness

Activity completion gate: a teacher can create an Activity from real QuestionBanks, configure distribution, mode and
game, preview it, save it, reload it and retrieve the persisted configuration through the API.

### Phase 5 — Assignments

An Assignment is **independent of Activity** ([ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md)).
The detailed Phase 5 spec has not been written yet; write it in `plans/` before implementing.

Implement:

- Assignment list
- Create Assignment
- Select the question sources/assessment configuration (an Assignment may reuse QuestionBanks; it does not select an Activity)
- Select an `AssignmentTarget`
- Start and due dates, optional time limit
- Assignment detail
- Assignment progress shell

Assignment target types: `CLASS`, `STUDENT`, `GRADE`, `ALL`.

Assignment flow:

```text
Question sources → Select target → Configure schedule/settings → Review → Assign
```

Open questions for the Phase 5 spec (these rules were written for the old multi-attempt model): late-submission
policy, completion threshold, and target-field rules. See [`domain/business-rules.md`](../domain/business-rules.md).

Do not invent a new entity for assignment questions, and never add `Assignment.activity_id`.

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

> **Updated by [ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md):** an Assignment has a **single**
> attempt. "Retry" and "Best score handling" above therefore apply to repeatable **Activity runs** only, and their exact
> rules belong in the Phase 6 spec. Assignment and practice rules live in
> [`domain/business-rules.md`](../domain/business-rules.md). The question snapshot contract is in
> [`domain/question-model.md`](../domain/question-model.md).

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

Teacher navigation and the core workflow moved to [`ui/screens.md`](../ui/screens.md).

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
