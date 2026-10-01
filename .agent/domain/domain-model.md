# Domain Model

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

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

> **Repository reality (verified in code and migrations V1–V11):** `Grade` and `Section` already exist and are
> part of the content hierarchy below, although they are missing from the numbered list. `ClassUnit` is in the
> agreed model but is **not implemented yet**. Assignment-related entities are defined by Phase 5; see
> [ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md).

Do not introduce additional core entities for concepts that are already represented by the existing model unless explicitly requested.

### Content hierarchy

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

A Grade contains Units, a Unit contains Sections, and a Section contains Topics.

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

#### Activity placement and mode

- An Activity is placed under exactly one **Topic** (`activities.topic_id`) and is owned by a teacher.
- An Activity stores **configuration only**: sources, distribution, selection strategy, mode, optional GameTemplate.
  It never stores selected question IDs or any per-student state (those belong to `AttemptQuestion`).
- `mode` is `LEARNING`, `TRY_HARD` or `BOTH`. **`BOTH` is the default**: the student chooses Learning or Try Hard
  when starting a run. A teacher may restrict an Activity to one mode.
- `BOTH` is a configuration value only. A run (Attempt) always has a concrete mode, `LEARNING` or `TRY_HARD`.
- Timer and lives apply only when Try Hard is offered; Learning-only Activities never store them.

#### Mode rules

Activity modes:

##### Learning Mode

- No time limit
- Hints available
- Explanations available

##### Try Hard Mode

- Time limit
- 3 lives by default
- No hints/guidance
- Wrong answers consume lives
- Game Over after the configured life limit is reached

The exact configured values must come from the Activity configuration rather than hardcoded UI values.

Game rules:

- A game uses the same Activity/question system.
- Do not build a second question model for games.

Full contract: [`plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md`](../plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md).

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

> Superseded model. See [ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md).

`Activity` and `Assignment` are **two independent concepts** that may read the same QuestionBanks.

```text
QuestionBank(s) ──→ Activity     → learning flow   → Activity run (Attempt)
QuestionBank(s) ──→ Assignment   → assessment flow → Assignment Attempt (one attempt)
```

- An **Assignment** is a teacher-assigned task or formal assessment (homework, monthly test) with a target,
  schedule, one allowed attempt and an official score.
- An Assignment does **not** contain, wrap, or reference an Activity. There is no `Assignment.activity_id` and no
  `Activity.assignment_id`.
- An Assignment has its own question-source/assessment configuration (defined by the Phase 5 spec).
- Assignment targets may be: Class, Student, Grade, All students (`AssignmentTarget`).

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
