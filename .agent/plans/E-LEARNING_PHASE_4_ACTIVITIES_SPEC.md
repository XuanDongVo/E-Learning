# E-Learning — Phase 4: Activities

> **Numbering note (ADR 0004, 2026-10-07):** phase numbers 6 and above in this document use the **old** numbering. Old 6 (Attempts) = Phase 7, old 7 (Analytics) = Phase 8, old 8 (XP) = Phase 9, old 9 (Dashboard) = Phase 10, old 10 (Reports) = Phase 11. Phase 6 is now Student Management.

**Document type:** Canonical product + engineering specification  
**Status:** Revised source of truth for Phase 4 implementation  
**Last revised:** 2026-09-30  
**Scope:** Activity as a learning activity, ActivityBank, GameTemplate, activity placement/configuration, question distribution, question-selection strategy, Learning/Try Hard modes, preview, publish/readiness, student-use contract, and boundaries with later Assignment/Attempt/Analytics/XP phases.

> **Major architecture revision (2026-09-30):** `Activity` and `Assignment` are now two independent domain concepts with different purposes. `Activity` represents a learning/practice/game activity that is part of the learning experience. `Assignment` represents a teacher-assigned task or formal assessment, for example a monthly test. An Assignment does **not** contain or require an Activity, and an Activity does **not** become an Assignment through a wrapper relationship.

---

# 1. Current repository baseline

The repository already has the content hierarchy required to provide questions to Activities:

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

Current content rules:

- `QuestionBank` lifecycle is `DRAFT | PUBLISHED | ARCHIVED`.
- `Question` has no lifecycle status; readiness is derived from `is_complete`.
- A student-facing Activity may use only questions whose QuestionBank is `PUBLISHED` and whose question is `is_complete = true`.
- Supported question types:
  - `SINGLE_CHOICE`
  - `MULTIPLE_CHOICE`
  - `TRUE_FALSE`
  - `FILL_IN_BLANK`
  - `TYPE_ANSWER`
- Question difficulty is `EASY | MEDIUM | HARD`.
- Incomplete questions may remain stored for teacher editing and are not eligible for student play/practice.
- QuestionBank already exposes total-question and ready-question information.

Relevant repository evidence includes:

- `client-e-learning/AGENTS.md`
- `server/src/main/java/e_learning/server/content/questionBank/entity/QuestionBank.java`
- `server/src/main/java/e_learning/server/content/question/entity/Question.java`
- `server/src/main/java/e_learning/server/content/question/service/QuestionService.java`

Phase 4 currently does not exist as a real backend module. The student Assignment/Progress screens are placeholders and the Student Dashboard still has mock-driven data. Phase 4 must therefore establish a clean learning-activity layer without coupling it to the future Assignment implementation.

---

# 2. Product concept

## 2.1 Activity definition

An **Activity** is a learning interaction presented to a student as part of the course/learning experience.

Examples:

- `Past Simple Practice`
- `Vocabulary Quick Quiz`
- `Listen and Choose`
- `Past Simple Try Hard`
- `Chicken Shooter`
- `Memory Match`
- `Word Race`

An Activity answers:

> **“What should the student do to learn or practice this content, and how should the questions behave?”**

An Activity is therefore concerned with:

1. learning content/question sources;
2. question distribution;
3. question selection;
4. interaction mode;
5. optional game presentation;
6. repeatable learning behavior;
7. practice/game analytics and XP contracts in later phases.

An Activity is **not** a formal grading container.

## 2.2 Assignment definition

An **Assignment** is a teacher-assigned task, homework, quiz, or formal assessment with an explicit target and scheduling context.

Examples:

- `Monthly English Test — September`
- `Unit 1–3 Midterm Practice`
- `Homework Week 4`
- `Monthly Vocabulary Assessment`

An Assignment answers:

> **“What must this student/class complete, by when, and how is the result officially evaluated?”**

Assignment concerns include:

- target class/student(s);
- open/start date;
- due date;
- attempt policy;
- time limit;
- submission state;
- official score;
- teacher monitoring;
- later gradebook integration.

The current project requirement remains: **an Assignment has one allowed student attempt**. Unanswered questions are not marked wrong, but the total number of questions remains the denominator for the percentage score.

## 2.3 Activity and Assignment are independent

The canonical relationship is:

```text
                         ┌───────────────┐
                         │  QuestionBank │
                         └───────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
             ┌──────▼──────┐           ┌──────▼──────┐
             │   Activity  │           │  Assignment │
             └──────┬──────┘           └──────┬──────┘
                    │                         │
             learning flow             assessment flow
                    │                         │
             Activity run/            Assignment Attempt
              Practice run                  (1 attempt)
```

There is **no canonical Phase 4 relation**:

```text
Assignment → Activity
```

and no:

```text
Activity → Assignment
```

Both may consume the same QuestionBanks, but they have separate configuration and lifecycle rules.

## 2.4 Why this separation matters

Without the separation, every learning activity would inherit assessment concepts such as deadline, one-attempt policy, class targeting, and official grade status. That would make games and repeatable practice unnecessarily rigid.

With the separation:

- an Activity can be replayable;
- a game can be replayed without creating assignments;
- Learning Mode can be used without formal scoring;
- Try Hard can still be a game-like activity;
- an Assignment can be a monthly test with one attempt and a deadline;
- the same QuestionBank can feed both without making one object depend on the other.

---

# 3. Product positioning inside the course

## 3.1 Activity placement

> **Superseded by [ADR 0008](../decisions/0008-activity-belongs-to-unit.md) (2026-10-07):** an Activity belongs to a **Unit** (`activities.unit_id`), not a Topic. The text below is the original design and is kept for history; the tree and the `topic_id` field are no longer valid.

Because the current content tree ends at `Topic`, the first Phase 4 version should place an Activity under a `Topic`.

```text
Grade
  └── Unit
       └── Section
            └── Topic
                 ├── QuestionBank
                 ├── Activity
                 ├── Activity
                 └── Activity
```

Canonical Phase 4 field:

```text
activities.topic_id → topics.id
```

This gives the student a predictable learning flow:

```text
Unit
  → Section
    → Topic
      → Learning content
      → Activities
      → Questions / practice
```

If later the product needs Activities at Unit or Section level, that should be a deliberate future schema decision rather than silently changing the Phase 4 meaning of `topic_id`.

## 3.2 Activity is a reusable learning configuration

An Activity stores **configuration**, not a permanent list of selected question IDs.

Stored:

- source QuestionBanks;
- source order;
- distribution rules;
- selection strategy;
- mode;
- optional GameTemplate.

Not stored in the Activity aggregate:

- a random question list for a particular student run;
- current score;
- current timer;
- current lives;
- student answers;
- student attempt state.

Those runtime concerns belong to the future Attempt/run layer.

---

# 4. Core domain model

Phase 4 contains three core entities:

```text
Topic
  │
  └──< Activity
          │
          ├──< ActivityBank >── QuestionBank
          │                         │
          │                         └──< Question
          │
          └────── GameTemplate (optional)
```

There is deliberately **no** `Assignment` foreign key in `Activity`.

## 4.1 Entity: Activity

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | BIGINT | yes | Primary key |
| `topic_id` | BIGINT | yes | Topic where the Activity is placed |
| `name` | VARCHAR(150) | yes | Activity display name |
| `description` | VARCHAR(1000) | no | Teacher/student-facing description |
| `status` | ENUM | yes | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `distribution_mode` | ENUM | yes | `EQUAL`, `PERCENTAGE`, `FIXED_COUNT` |
| `total_questions` | INT | yes | Total number of questions for each run |
| `selection_strategy` | ENUM | yes | `RANDOM`, `WEAKNESS_PRIORITY` |
| `mode` | ENUM | yes | `LEARNING`, `TRY_HARD`, `BOTH` |
| `time_limit_seconds` | INT | no | Required only for Try Hard |
| `lives` | INT | no | Required only for Try Hard; default 3 |
| `game_template_id` | BIGINT | no | Optional presentation/game template |
| `created_at` | TIMESTAMP | yes | Audit timestamp |
| `updated_at` | TIMESTAMP | yes | Audit timestamp |
| `published_at` | TIMESTAMP | no | First/current publish timestamp according to implementation policy |

### Canonical decisions

1. Activity is owned by a teacher.
2. Activity belongs to exactly one Topic in Phase 4.
3. Activity has one aggregate status.
4. Activity can have one or more QuestionBank sources.
5. Activity does not store selected question IDs.
6. `total_questions` is configuration, not a cached ready count.
7. A published Activity must satisfy publish validation.
8. A published Activity may later become temporarily unavailable if its question sources change; it must not silently rewrite its own configuration.
9. Activity metadata can remain editable after publication, subject to ownership/security.
10. Assignment is not referenced by this entity.

## 4.2 Entity: ActivityBank

`ActivityBank` is an owned child of Activity.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | BIGINT | yes | Primary key |
| `activity_id` | BIGINT | yes | Parent Activity |
| `question_bank_id` | BIGINT | yes | Source QuestionBank |
| `display_order` | INT | yes | Stable source ordering |
| `percentage` | NUMERIC/INT | conditional | Used only by `PERCENTAGE` mode |
| `fixed_count` | INT | conditional | Used only by `FIXED_COUNT` mode |

### Constraints

- Unique `(activity_id, question_bank_id)`.
- `display_order >= 0`.
- `percentage > 0` when present.
- `fixed_count > 0` when present.
- `percentage` and `fixed_count` cannot both be used for the same ActivityBank row.
- In `EQUAL`, both are null.
- In `PERCENTAGE`, every source has a percentage and fixed count is null.
- In `FIXED_COUNT`, every source has a fixed count and percentage is null.
- A QuestionBank may be reused by many Activities.
- Deleting an Activity must cascade to its ActivityBank rows.
- Deleting an ActivityBank must not delete the QuestionBank or its Questions.

## 4.3 Entity: GameTemplate

GameTemplate is a catalog of reusable game/presentation types. It does not store per-student gameplay state.

### Fields

| Field | Type | Required |
|---|---|---:|
| `id` | BIGINT | yes |
| `code` | VARCHAR(80) | yes, unique | Machine-readable key |
| `name` | VARCHAR(150) | yes | Display name |
| `description` | VARCHAR(500) | no | Explain game behavior |
| `is_active` | BOOLEAN | yes | Whether teachers can select it |
| `created_at` | TIMESTAMP | yes |
| `updated_at` | TIMESTAMP | yes |

Phase 4 seed examples:

- `CHICKEN_SHOOTER`
- `MEMORY_MATCH`
- `SPACE_DEFENDER`
- `WORD_RACE`
- `BOMB_DEFUSE`
- `BOSS_BATTLE`

The exact UI mechanics of each game are not implemented in Phase 4. A GameTemplate is configuration metadata plus a stable code that future frontend game components can map to.

---

# 5. Enums

## 5.1 ActivityStatus

```java
DRAFT
PUBLISHED
ARCHIVED
```

Meaning:

- `DRAFT`: editable learning activity; not shown as an active student Activity.
- `PUBLISHED`: intended for student use.
- `ARCHIVED`: hidden from normal active use; retained for history/reference.

## 5.2 ActivityMode

```java
LEARNING
TRY_HARD
```

## 5.3 DistributionMode

```java
EQUAL
PERCENTAGE
FIXED_COUNT
```

## 5.4 SelectionStrategy

```java
RANDOM
WEAKNESS_PRIORITY
```

---

# 6. Activity semantics by mode

## 6.1 Learning Mode

Learning Mode is designed for understanding and repeated practice.

Canonical behavior:

- no mandatory time limit;
- no mandatory lives system;
- hints/guidance may be shown by the runtime UI;
- explanations may be shown after answering, subject to question configuration;
- student can repeat the Activity;
- failure is not a formal grading event;
- results may contribute to Practice analytics and XP under later contracts.

Server normalization:

```text
mode = LEARNING
→ time_limit_seconds = null
→ lives = null
```

The frontend must not preserve hidden Learning timer/lives values that the backend ignores.

## 6.2 Try Hard Mode

Try Hard is a challenge variant of Activity.

Canonical behavior:

- `time_limit_seconds` is required and must be `> 0` (**seconds per question**, [ADR 0015](../decisions/0015-try-hard-time-limit-per-question.md));
- `lives` is required and must be `>= 1`;
- default lives in the editor is 3;
- hints/guidance are unavailable by default;
- wrong answers may consume one life;
- reaching zero lives ends the run/game;
- the student can restart/replay the Activity according to the Activity runtime rules;
- Try Hard is still an Activity, not an Assignment.

Phase 4 does not define detailed game scoring formulas. The mode defines constraints and interaction intent; later runtime phases own actual score calculations.

## 6.3 Mode switching

In the editor:

- switching `TRY_HARD → LEARNING` clears timer/lives in the unsaved client state;
- switching `LEARNING → TRY_HARD` initializes the default timer/lives values;
- server validation repeats this normalization to prevent stale client values from being persisted.

---

# 7. Question source model

## 7.1 Source selector

An Activity can select one or more QuestionBanks from the existing hierarchy.

UI tree:

```text
Grade
└── Unit
    └── Section
        └── Topic
            └── QuestionBank
```

Only QuestionBanks that the teacher can legally read/use should be selectable.

For the first implementation, the source selector should show:

- QuestionBank name;
- status;
- total questions;
- ready questions;
- Topic path;
- selected/unselected state.

## 7.2 Eligible question rule

A question is eligible for a published Activity only if:

```text
QuestionBank.status == PUBLISHED
AND
Question.is_complete == true
```

No Activity-specific copy of question readiness is stored.

## 7.3 Source-level eligibility

A QuestionBank should not be considered a valid Activity source if:

- it does not exist;
- the teacher does not have access;
- it is `DRAFT`;
- it is `ARCHIVED`;
- it has zero ready questions.

A draft Activity may temporarily reference sources that are not currently publishable, but the publish action must fail until the source is valid.

## 7.4 Runtime revalidation

The server must re-evaluate source availability when:

- publishing an Activity;
- previewing an Activity;
- starting a future Activity run/Practice attempt.

Do not trust client-cached ready counts.

---

# 8. Distribution rules

Distribution answers:

> **“How many questions should come from each selected QuestionBank?”**

Selection strategy answers a different question:

> **“Which questions should be chosen inside that quota?”**

This separation is canonical and must remain intact.

## 8.1 EQUAL

Each selected QuestionBank receives the same quota.

```text
quota = total_questions / source_count
```

Canonical rule:

```text
total_questions % source_count == 0
```

must be true.

Example:

```text
Total = 20
Sources = 4

Bank A → 5
Bank B → 5
Bank C → 5
Bank D → 5
```

Invalid example:

```text
Total = 10
Sources = 3

10 % 3 != 0
```

The server must reject save/publish validation rather than silently assigning a remainder.

## 8.2 PERCENTAGE

Each source gets a positive percentage.

Rules:

- all selected sources must have a percentage;
- each percentage is greater than 0;
- total percentage must equal exactly 100;
- each source must receive at least one question after allocation.

### Largest-remainder allocation

For deterministic rounding:

1. Compute exact quota for each source:

```text
exact_i = total_questions × percentage_i / 100
```

2. Give each source `floor(exact_i)`.
3. Compute remaining slots:

```text
remaining = total_questions - sum(floor(exact_i))
```

4. Distribute remaining slots to the sources with the largest fractional remainders.
5. Ties are resolved by `display_order`, then `id`.

Example:

```text
Total = 10

A = 50% → 5.0 → 5
B = 30% → 3.0 → 3
C = 20% → 2.0 → 2
```

Example with rounding:

```text
Total = 7

A = 50% → 3.5
B = 30% → 2.1
C = 20% → 1.4

Floor: 3 + 2 + 1 = 6
Remaining: 1

A gets the additional slot because 0.5 is the largest remainder.

Final: A=4, B=2, C=1
```

If any source receives 0 after allocation, the configuration is invalid for Phase 4. Do not silently remove a source or allocate a hidden minimum.

## 8.3 FIXED_COUNT

Each source receives an explicit count.

Rules:

- every selected source must have `fixed_count >= 1`;
- total number of questions is derived as the sum of source counts;
- the UI should not ask the teacher to enter a second contradictory `total_questions` value in this mode;
- response can expose computed `total_questions` as read-only/derived.

Example:

```text
Bank A → 5
Bank B → 8
Bank C → 7

Total = 20
```

The server is the source of truth for total.

## 8.4 Distribution quota output

The domain service should expose a normalized result such as:

```json
{
  "totalQuestions": 20,
  "sources": [
    { "questionBankId": 10, "quota": 12 },
    { "questionBankId": 20, "quota": 8 }
  ]
}
```

This is a derived computation, not a persisted table of per-run questions.

---

# 9. Question selection strategies

Selection occurs **inside the already established source quotas**.

## 9.1 RANDOM

For every source:

1. load eligible questions;
2. verify available count >= source quota;
3. randomly choose without replacement;
4. combine selected questions according to the Activity's source order or runtime shuffle policy.

Randomness belongs to the runtime selection service, not the Activity database entity.

## 9.2 WEAKNESS_PRIORITY

This strategy tries to give the student more opportunities on questions where their historical performance indicates difficulty.

Canonical constraints:

- distribution quotas remain unchanged;
- weakness priority never moves questions between QuestionBanks;
- weakness priority is evaluated only among eligible questions in each source;
- questions with no history do not receive invented weakness scores;
- if insufficient performance history exists, fallback is `RANDOM` for that source.

A future implementation may rank candidate questions using metrics derived from prior student Answers, for example lower accuracy or higher failure frequency. The exact formula is intentionally deferred until the Analytics/Attempt phases exist.

### No fake analytics

Do not create a `StudentWeakness` entity in Phase 4 merely to make the UI work.

Before real answer history exists:

```text
WEAKNESS_PRIORITY
      ↓
no history
      ↓
RANDOM fallback
```

The UI must explain that the strategy becomes meaningful after the student has answer history.

---

# 10. Activity runtime contract

Phase 4 creates configuration; the actual student run is a later runtime concern.

At runtime, a future service should execute:

```text
Open Activity
   ↓
Load Activity
   ↓
Verify PUBLISHED
   ↓
Verify Topic/source access
   ↓
Recalculate quotas
   ↓
Check ready-question availability
   ↓
Select questions per strategy
   ↓
Create an immutable run/Attempt snapshot
   ↓
Student answers
```

Important:

- do not re-randomize the question set every time the student refreshes;
- do not trust frontend question IDs as authoritative for a real run;
- do not silently substitute questions from another QuestionBank when a source is short;
- do not reduce `total_questions` at runtime.

The final snapshot belongs to Phase 6.

---

# 11. Activity preview

Preview lets the teacher verify how the Activity behaves before publication.

Preview is **not** a student Attempt.

## 11.1 Preview rules

- read-only;
- no XP;
- no analytics history;
- no official score;
- no persistence of student answers;
- uses the real source pools;
- validates the same readiness/configuration rules used for publish;
- may select a deterministic sample for debugging, but random preview is also allowed;
- must support all current question types.

## 11.2 Preview with WEAKNESS_PRIORITY

The teacher has no student-specific weakness history.

Therefore preview must:

- show the strategy as configured;
- use random fallback when no weakness data exists;
- clearly state that actual student runs may prioritize different questions once history exists.

## 11.3 Preview response

The API should return:

- Activity summary;
- normalized distribution quotas;
- source availability;
- selected sample questions;
- mode configuration;
- game template metadata;
- readiness warnings/errors.

The response must never create an Attempt.

---

# 12. Publish/readiness rules

An Activity can be saved as DRAFT while incomplete.

An Activity can become `PUBLISHED` only if all required configuration and source rules pass.

## 12.1 Required publish conditions

### Basic

- name is not blank;
- name length <= 150;
- description length <= 1000;
- topic exists and is accessible;
- Activity has at least one source;
- Activity has no duplicate QuestionBank sources;
- status transition is allowed.

### Source eligibility

Every source must:

- exist;
- be accessible to the teacher;
- have `PUBLISHED` status;
- contain at least one ready question.

### Distribution validity

`EQUAL`:

- source count > 0;
- total questions >= 1;
- total questions divisible by source count.

`PERCENTAGE`:

- every source has percentage > 0;
- percentages sum exactly to 100;
- allocation produces >= 1 question for each source.

`FIXED_COUNT`:

- every source has fixed count >= 1;
- derived total >= 1.

### Question pool validity

For every source:

```text
ready_question_count >= allocated_quota
```

Do not compare only the global sum. A globally sufficient pool may still fail because one source is underfilled.

### Try Hard validity

- time limit > 0;
- lives >= 1.

### Game validity

- if a GameTemplate is provided, it must exist;
- it must be active;
- teacher must be allowed to select it.

## 12.2 Readiness response

A canonical readiness response should expose:

```json
{
  "ready": false,
  "errors": [
    {
      "code": "SOURCE_INSUFFICIENT",
      "questionBankId": 42,
      "required": 10,
      "available": 7
    }
  ],
  "warnings": []
}
```

This is derived state. It should not be persisted as an authoritative boolean.

---

# 13. Runtime invalidation after publication

Publishing is not a promise that the source QuestionBanks will remain unchanged forever.

A published Activity can become temporarily unavailable when:

- a source QuestionBank is unpublished;
- a source QuestionBank is archived;
- completed questions are changed to incomplete;
- questions are deleted and the pool becomes too small.

## 13.1 Required behavior

Do **not** automatically reduce the Activity's `total_questions`.

Do **not** automatically redistribute a missing quota to another source.

Do **not** silently publish a different configuration.

Instead:

```text
Activity remains PUBLISHED
        ↓
readiness = NOT_READY
        ↓
student start
        ↓
structured error: INSUFFICIENT_QUESTION_POOL
```

The teacher UI should show `Needs attention` and identify the affected source(s).

## 13.2 Example

Activity:

```text
Total = 20
A = 10
B = 10
```

QuestionBank A later drops from 10 ready questions to 6.

Result:

```text
Activity configuration remains 20 / A10 / B10
A availability = 6
Activity readiness = false
```

The teacher must fix the source/content or edit the Activity. The system must not silently become `A6/B14`.

---

# 14. Activity lifecycle

```text
DRAFT
  │
  ├── publish ──→ PUBLISHED
  │                  │
  │                  └── archive ──→ ARCHIVED
  │
  └──────────────────────────────────┘
```

## 14.1 Draft

Draft may be incomplete.

Examples:

- no sources yet;
- distribution invalid;
- source QuestionBank still draft;
- Try Hard timer missing;
- game template inactive.

A draft should remain editable so the teacher can finish configuration later.

## 14.2 Published

Published means:

- configuration passed publish validation;
- the Activity is eligible for normal student visibility/use;
- its current sources passed readiness at publish time.

Published does not mean the source pool can never change.

### Structural edit policy

Phase 4 should distinguish between safe metadata edits and configuration edits that could alter the learning experience.

Safe metadata after publication:

- `name`;
- `description`.

Structural fields:

- `topic_id`;
- sources;
- distribution mode;
- source percentages/counts;
- total questions;
- selection strategy;
- mode;
- timer;
- lives;
- game template.

For Phase 4 MVP, structural edits on a published Activity are allowed only when the Activity has no active student run dependency. Once future runtime/attempt records indicate that the Activity configuration is being referenced, structural edits must be locked or require a future versioning mechanism.

This rule is intentionally phrased around **student-run references**, not Assignment references, because Assignment is independent.

## 14.3 Archived

Archived means:

- not shown in active Activity lists by default;
- not startable as a new normal Activity run;
- retained for history/reference;
- source Questions/QuestionBank are not deleted.

Archiving an Activity must not archive its QuestionBanks.

---

# 15. Teacher end-to-end flow

## 15.1 Creation flow

```text
Teacher → Activities
        → New Activity
        → Select Topic
        → Basics
        → Question Sources
        → Distribution
        → Selection Strategy
        → Mode
        → Game (optional)
        → Preview
        → Save Draft / Publish
```

## 15.2 Editing flow

```text
Activities
   ↓
Activity Detail/Edit
   ↓
change configuration
   ↓
client validates for usability
   ↓
server validates canonical rules
   ↓
Save Draft or Publish
```

The client validation is for UX only. The server remains authoritative.

## 15.3 Reuse flow

The teacher can create multiple Activities from the same QuestionBank:

```text
Past Simple QuestionBank
    ├── Past Simple Learning
    ├── Past Simple Try Hard
    ├── Past Simple Memory Match
    └── Past Simple Vocabulary Race
```

This is one of the main reasons Activity must not be modeled as an Assignment wrapper.

## 15.4 Student learning flow

Later implementation should support:

```text
Student opens Topic
      ↓
sees published Activities
      ↓
opens Activity
      ↓
starts a Practice/Activity run
      ↓
answers questions
      ↓
sees result/feedback
      ↓
can repeat according to Activity behavior
```

The exact runtime object is finalized in Phase 6.

---

# 16. Backend architecture

Recommended package:

```text
server/src/main/java/e_learning/server/activity/
├── controller/
│   └── ActivityController.java
├── dto/
│   ├── ActivityResponse.java
│   ├── ActivityListResponse.java
│   ├── ActivityBankRequest.java
│   ├── ActivityBankResponse.java
│   ├── CreateActivityRequest.java
│   ├── UpdateActivityRequest.java
│   ├── UpdateActivityStatusRequest.java
│   ├── ActivityPreviewRequest.java
│   ├── ActivityPreviewResponse.java
│   ├── ActivityReadinessResponse.java
│   ├── ActivitySourceAvailability.java
│   └── DistributionAllocation.java
├── entity/
│   ├── Activity.java
│   ├── ActivityBank.java
│   └── GameTemplate.java
├── enums/
│   ├── ActivityStatus.java
│   ├── ActivityMode.java
│   ├── DistributionMode.java
│   └── SelectionStrategy.java
├── repository/
│   ├── ActivityRepository.java
│   ├── ActivityBankRepository.java
│   └── GameTemplateRepository.java
├── service/
│   ├── ActivityService.java
│   ├── ActivityValidationService.java
│   ├── ActivityReadinessService.java
│   └── ActivityDistributionService.java
└── selection/
    ├── QuestionSelectionStrategy.java
    ├── RandomSelectionStrategy.java
    └── WeaknessPrioritySelectionStrategy.java
```

## 16.1 Separation of responsibilities

### ActivityService

Owns aggregate operations:

- create;
- update;
- get detail;
- list;
- publish;
- archive;
- ownership checks;
- aggregate child replacement.

### ActivityValidationService

Validates configuration shape:

- topic;
- source uniqueness;
- distribution fields;
- mode-specific fields;
- GameTemplate state;
- status transition.

### ActivityReadinessService

Checks current source availability:

- QuestionBank status;
- ready question counts;
- per-source quota sufficiency.

### ActivityDistributionService

Computes normalized per-source quotas.

### Selection strategies

Only future runtime selection depends on them. Keep strategy interfaces independent from controller/DTO code.

---

# 17. Transaction boundaries

## 17.1 Create Activity

One transaction:

```text
validate topic + sources
       ↓
insert Activity
       ↓
insert ActivityBank rows
       ↓
commit
```

Do not partially save the aggregate.

## 17.2 Update Activity

One transaction:

```text
load Activity with ownership check
       ↓
validate request
       ↓
replace ActivityBank children
       ↓
update Activity fields
       ↓
commit
```

QuestionBanks remain untouched.

## 17.3 Publish

One transaction:

```text
load Activity
       ↓
validate configuration
       ↓
calculate quotas
       ↓
check current source readiness
       ↓
set PUBLISHED + published_at
       ↓
commit
```

Do not publish based only on the frontend readiness badge.

## 17.4 Archive

One transaction:

```text
ownership check
       ↓
status transition validation
       ↓
set ARCHIVED
       ↓
commit
```

No QuestionBank or Question delete occurs.

---

# 18. REST API contract

Base URL:

```text
/v1/activities
```

Phase 4 teacher-facing endpoints:

```text
GET    /v1/activities
POST   /v1/activities
GET    /v1/activities/{id}
PUT    /v1/activities/{id}
PATCH  /v1/activities/{id}/status
PATCH  /v1/activities/{id}/archive
POST   /v1/activities/{id}/preview
GET    /v1/activities/{id}/readiness
```

All require authenticated `TEACHER` role for Phase 4 authoring APIs.

Future student endpoints should be separated rather than overloading teacher APIs.

## 18.1 List

```http
GET /v1/activities?search=&status=&topicId=&mode=&gameTemplateId=&page=0&size=20
```

Response should include lightweight fields:

```json
{
  "content": [
    {
      "id": 101,
      "name": "Past Simple Practice",
      "topicId": 11,
      "topicName": "Past Simple",
      "sourceCount": 2,
      "totalQuestions": 20,
      "mode": "LEARNING",
      "selectionStrategy": "RANDOM",
      "gameTemplate": null,
      "status": "PUBLISHED",
      "readiness": "READY",
      "updatedAt": "2026-09-30T10:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

`readiness` is derived, not stored as a source-of-truth field.

## 18.2 Create

```http
POST /v1/activities
Content-Type: application/json
```

Example:

```json
{
  "topicId": 11,
  "name": "Past Simple Practice",
  "description": "Practice past simple forms.",
  "distributionMode": "EQUAL",
  "totalQuestions": 20,
  "selectionStrategy": "RANDOM",
  "mode": "LEARNING",
  "timeLimitSeconds": null,
  "lives": null,
  "gameTemplateId": null,
  "banks": [
    {
      "questionBankId": 100,
      "displayOrder": 0,
      "percentage": null,
      "fixedCount": null
    },
    {
      "questionBankId": 101,
      "displayOrder": 1,
      "percentage": null,
      "fixedCount": null
    }
  ]
}
```

The server determines readiness and canonical derived values.

## 18.3 Update

`PUT /v1/activities/{id}` replaces the editable aggregate configuration.

The same validation rules apply as creation.

## 18.4 Get detail

```http
GET /v1/activities/{id}
```

Detail includes:

- base metadata;
- Topic path;
- sources;
- source readiness;
- distribution config;
- computed allocations;
- selection strategy;
- mode;
- GameTemplate;
- status;
- editability flags.

## 18.5 Status

```http
PATCH /v1/activities/{id}/status
```

Example body:

```json
{ "status": "PUBLISHED" }
```

The server must reject illegal transitions and run full publish validation before `PUBLISHED`.

## 18.6 Archive

```http
PATCH /v1/activities/{id}/archive
```

This can be a convenience endpoint for UI action; internally it performs the same canonical archive transition rules.

## 18.7 Readiness

```http
GET /v1/activities/{id}/readiness
```

Useful for:

- detail page;
- list badge refresh;
- publish dialog;
- teacher troubleshooting.

## 18.8 Preview

```http
POST /v1/activities/{id}/preview
```

The server:

- verifies ownership;
- loads Activity;
- validates sources and distribution;
- computes quotas;
- selects sample questions;
- returns a non-persistent preview.

---

# 19. DTO rules

## CreateActivityRequest

Required shape:

```text
CreateActivityRequest
├── topicId
├── name
├── description?
├── distributionMode
├── totalQuestions?        // required except FIXED_COUNT may derive it
├── selectionStrategy
├── mode
├── timeLimitSeconds?
├── lives?
├── gameTemplateId?
└── banks[]
```

`banks[]` contains only configuration:

```text
questionBankId
 displayOrder
 percentage?
 fixedCount?
```

The client must not send:

- ready question counts as authoritative values;
- selected Question IDs;
- precomputed final allocations as authoritative values;
- readiness booleans as authoritative values;
- score;
- XP;
- student answer data.

## 19.1 Server source of truth

Server computes:

```text
ready count
quota allocation
readiness
publish eligibility
student eligibility
```

The UI may display optimistic calculations for feedback, but it must reconcile with the API response.

---

# 20. Error model

Use stable machine-readable error codes.

Suggested codes:

| Code | Meaning |
|---|---|
| `ACTIVITY_NOT_FOUND` | Activity does not exist |
| `ACTIVITY_FORBIDDEN` | Teacher does not own/have access |
| `INVALID_TOPIC` | Topic does not exist/is inaccessible |
| `NO_SOURCE_SELECTED` | Activity has no QuestionBank |
| `DUPLICATE_SOURCE` | Same QuestionBank selected twice |
| `SOURCE_NOT_FOUND` | QuestionBank missing |
| `SOURCE_FORBIDDEN` | Teacher cannot use source |
| `SOURCE_NOT_PUBLISHED` | Source is draft/archived |
| `SOURCE_EMPTY` | Source has no ready questions |
| `DISTRIBUTION_NOT_DIVISIBLE` | Equal distribution is impossible |
| `PERCENTAGE_INVALID` | Percentages invalid or not 100 |
| `ALLOCATION_ZERO` | A percentage source receives zero |
| `FIXED_COUNT_INVALID` | Fixed count is missing/non-positive |
| `INSUFFICIENT_QUESTION_POOL` | Required quota exceeds ready pool |
| `TRY_HARD_TIMER_REQUIRED` | Try Hard needs positive timer |
| `TRY_HARD_LIVES_REQUIRED` | Try Hard needs positive lives |
| `INVALID_GAME_TEMPLATE` | GameTemplate missing/inactive |
| `INVALID_STATUS_TRANSITION` | Status transition not allowed |
| `STRUCTURAL_EDIT_LOCKED` | Published structure is currently locked |
| `PREVIEW_NOT_READY` | Preview cannot be generated from current config |

Response example:

```json
{
  "code": "INSUFFICIENT_QUESTION_POOL",
  "message": "Activity cannot provide the configured number of questions.",
  "details": [
    {
      "questionBankId": 42,
      "required": 10,
      "available": 7
    }
  ]
}
```

---

# 21. Frontend routes

Use real Next.js routes:

```text
/teacher/activities
/teacher/activities/new
/teacher/activities/[id]
```

Recommended later student routes:

```text
/student/units/[unitId]/topics/[topicId]/activities
/student/activities/[id]
```

Do not place the main Activity authoring workflow inside the current Content page's local component state.

---

# 22. Frontend file structure

```text
client-e-learning/src/app/teacher/activities/
├── page.tsx
├── new/
│   └── page.tsx
└── [id]/
    └── page.tsx

client-e-learning/src/components/features/teacher/activities/
├── activity-list.tsx
├── activity-table.tsx
├── activity-filters.tsx
├── activity-editor.tsx
├── activity-editor-header.tsx
├── activity-summary-card.tsx
├── activity-topic-selector.tsx
├── activity-source-selector.tsx
├── activity-source-table.tsx
├── activity-distribution.tsx
├── activity-selection-strategy.tsx
├── activity-mode-selector.tsx
├── activity-game-selector.tsx
├── activity-preview.tsx
├── activity-readiness.tsx
├── publish-activity-dialog.tsx
├── archive-activity-dialog.tsx
├── locked-activity-banner.tsx
└── components/

client-e-learning/src/services/activity.service.ts
client-e-learning/src/types/activity.ts
```

Use the existing frontend patterns for TanStack Query, forms, Zod, toasts, dialogs, and loading states.

---

# 23. UI design — screen by screen

## Screen A — Activity List

### Purpose

Teacher sees Activities belonging to them.

### Header

```text
Activities                         [+ New Activity]
Create learning activities for your topics.
```

### Filters

- search;
- Topic;
- status;
- mode;
- GameTemplate.

### Table/card fields

| Field | Meaning |
|---|---|
| Name | Activity name |
| Topic | Placement |
| Sources | Number of QuestionBanks |
| Questions | Configured total |
| Mode | Learning/Try Hard |
| Strategy | Random/Weakness Priority |
| Game | None or template |
| Readiness | Ready/Needs attention |
| Status | Draft/Published/Archived |
| Updated | Last modification |
| Actions | View/Edit/Preview/Archive |

### Readiness badge

Use distinct concepts:

```text
PUBLISHED + READY
PUBLISHED + NEEDS ATTENTION
DRAFT
ARCHIVED
```

Do not show `Needs attention` as if it were a lifecycle status.

### Empty state

```text
No activities yet.
Create your first learning activity for a topic.
[Create Activity]
```

## Screen B — Create/Edit shell

Two-column desktop layout:

```text
┌───────────────────────────────────────────────────────────────┐
│ Activity name                             Save Draft  Preview │
├──────────────────────────────────────┬────────────────────────┤
│                                      │ Activity Summary       │
│ Main editor                          │                        │
│                                      │ Topic                  │
│ Basics                               │ Sources                │
│ Topic                                 │ Questions              │
│ Sources                               │ Distribution           │
│ Distribution                          │ Strategy               │
│ Strategy                              │ Mode                   │
│ Mode                                  │ Game                   │
│ Game                                  │ Readiness              │
│                                      │                        │
└──────────────────────────────────────┴────────────────────────┘
```

Footer actions on small screens:

```text
[Save Draft]       [Preview]       [Publish]
```

## Screen C — Basics

Fields:

- Activity name;
- Description;
- Topic selector.

Topic selector should show path:

```text
Grade 10 / Unit 3 / Section 2 / Past Simple
```

Validation is immediate but non-authoritative.

## Screen D — Question Sources

Source picker:

```text
Grade 10
└── Unit 3
    └── Section 2
        └── Past Simple
            ├── Regular Verbs
            │   ✓ 42 ready / 50 total
            └── Irregular Verbs
                ✓ 31 ready / 40 total
```

Source cards should show:

```text
Past Simple — Regular Verbs
PUBLISHED
42 ready / 50 total
[Select]
```

Draft/archive sources should be visibly disabled with a reason.

### Selected source panel

```text
Selected Question Banks

1. Regular Verbs       42 ready
2. Irregular Verbs     31 ready

[Remove]
```

Do not hide selected sources when the tree is filtered.

## Screen E — Distribution

Show three configuration cards:

```text
[ Equal ]        [ Percentage ]        [ Fixed Count ]
```

### EQUAL

```text
Total questions: [20]

Source                 Questions
Regular Verbs              10
Irregular Verbs            10

✓ Evenly distributed
```

If invalid:

```text
Total 20 cannot be divided equally among 3 sources.
Choose a different total or distribution method.
```

### PERCENTAGE

```text
Source                   %        Questions
Regular Verbs            60%      12
Irregular Verbs          40%       8
                         ───
                         100%
```

Show derived question counts, not only percentages.

### FIXED_COUNT

```text
Source                   Questions
Regular Verbs              12
Irregular Verbs             8
                            ──
Total                       20
```

Total is read-only/derived.

## Screen F — Selection Strategy

Two cards:

### Random

```text
🎲 Random
Choose eligible questions randomly within each source quota.
```

### Weakness Priority

```text
🎯 Weakness Priority
Prioritize questions that the student has historically struggled
with, while keeping each source quota unchanged.

No history → random fallback.
```

Show a small informational note:

> Weakness Priority becomes more useful after answer history exists.

## Screen G — Mode

### Learning

Card content:

```text
📚 Learning

Designed for learning and repetition.
• No time limit
• Feedback/hints may be available
• Replay encouraged
```

### Try Hard

```text
🔥 Try Hard

A challenge-oriented activity.

Time limit: [60] seconds
Lives:      [3]
```

No hidden timer/lives controls in Learning mode.

## Screen H — Game Template

Cards:

```text
[None]

[Chicken Shooter]
[Memory Match]
[Space Defender]
[Word Race]
[Bomb Defuse]
[Boss Battle]
```

Each card shows:

- icon/preview;
- name;
- short description;
- active/inactive state.

An inactive GameTemplate must be disabled.

Game selection must not create a separate question model.

## Screen I — Preview

Layout:

```text
┌──────────────────────────┬──────────────────────┐
│ Question preview         │ Activity config      │
│                          │                      │
│ Q 1 / 20                 │ Learning             │
│                          │ Random               │
│ [question content]       │ Regular 10           │
│                          │ Irregular 10         │
│ A. ...                   │ Game: None           │
│ B. ...                   │                      │
│ C. ...                   │                      │
│ D. ...                   │                      │
│                          │                      │
│ [Previous] [Next]        │                      │
└──────────────────────────┴──────────────────────┘
```
The preview must support all five question types and show realistic rendering:


- single choice;
- multiple choice;
- true/false;
- fill in blank;
- type answer.

Preview must have no:

- XP increment;
- official score save;
- student progression mutation;
- Assignment creation;
- Attempt creation.

## Screen J — Publish Dialog

Checklist:

```text
Publish Activity?

✓ Name
✓ Topic
✓ Sources
✓ Distribution
✓ Enough ready questions
✓ Mode configuration
✓ Game configuration

[Cancel] [Publish]
```

When invalid:

```text
Cannot publish yet

• Irregular Verbs needs 3 more ready questions.
• Try Hard needs a positive time limit.
```

Errors should be actionable and source-specific where possible.

## Screen K — Activity Detail

Activity detail should show:

```text
Past Simple Practice
Past Simple · Unit 3

Published · Ready

Sources
2 Question Banks

Rules
20 questions
Equal distribution
Random selection
Learning Mode
No game

[Edit] [Preview] [Archive]
```

Also show per-source readiness.

## Screen L — Published Activity needing attention

Example:

```text
⚠ Needs attention

This Activity is published but its current QuestionBank pool
cannot satisfy the configured quotas.

Regular Verbs: 6 / 10 ready

[Review Sources]
```

Do not automatically change the Activity configuration.

## Screen M — Locked structural state

When a future runtime reference makes structural editing unsafe:

```text
Some settings are locked

This Activity has student run history, so changing its
question sources or distribution could affect consistency.

Editable:
✓ Name
✓ Description

Locked:
🔒 Topic
🔒 Question Banks
🔒 Distribution
🔒 Question count
🔒 Selection strategy
🔒 Mode
🔒 Timer / Lives
🔒 Game
```

A future Activity versioning feature can relax this rule; do not invent versioning in Phase 4.

---

# 24. Responsive UI

## Desktop

- two-column editor;
- sticky summary panel;
- wide source tree/table;
- preview side panel.

## Tablet

- main editor + collapsible summary;
- source selector becomes stacked;
- distribution table remains horizontal if possible.

## Mobile

- single-column flow;
- fixed bottom action bar;
- summary becomes accordion;
- source cards instead of dense tables;
- preview questions use full width;
- destructive actions need confirmation.

Never hide configuration errors only inside hover tooltips on mobile.

---

# 25. Loading, empty, error, dirty states

## Loading

- skeleton list/table;
- skeleton source tree/cards;
- disabled save while initial data loads.

## Empty

Show empty states for:

- no Activities;
- no QuestionBanks in selected Topic;
- no search results.

Each state should provide the next relevant action.

## Error

Network/API errors:

- preserve current form values;
- show toast/banner;
- do not reset the editor;
- provide retry where reasonable.

## Unsaved changes

If user navigates away after editing:

```text
You have unsaved changes.
Leave without saving?
```

The dirty state must be based on form values, not only API mutation state.

---

# 26. Important business cases and failure cases

## Case 1 — No source selected

Draft may save.
Publish must fail with `NO_SOURCE_SELECTED`.

## Case 2 — Draft QuestionBank selected

Draft can preserve the selection.
Publish/readiness returns `SOURCE_NOT_PUBLISHED`.

## Case 3 — Archived QuestionBank

Same rule: not student-eligible.

## Case 4 — Duplicate QuestionBank

Reject request with `DUPLICATE_SOURCE`.

## Case 5 — Equal distribution not divisible

Example `10 questions / 3 sources`.
Reject with `DISTRIBUTION_NOT_DIVISIBLE`.

## Case 6 — Percentage sum != 100

Reject with `PERCENTAGE_INVALID`.

## Case 7 — Percentage rounding creates zero

Example allocation results in zero for a positive-percentage source.
Reject with `ALLOCATION_ZERO`.

## Case 8 — Fixed counts sum to zero

Reject with `FIXED_COUNT_INVALID`.

## Case 9 — One source has insufficient ready questions

Reject publish/readiness even when other sources have surplus.

## Case 10 — Question edited from complete to incomplete

Ready count drops immediately because eligibility is derived.
The Activity does not rewrite its configuration.

## Case 11 — QuestionBank unpublished after Activity publish

Activity becomes `PUBLISHED + NOT_READY`.
Student start is blocked with a structured source error.

## Case 12 — Weakness strategy without history

Use random fallback.
Do not fabricate weakness scores.

## Case 13 — Teacher preview with Weakness Priority

Use random fallback and explain why.

## Case 14 — Activity has mixed question types

Allowed.
Preview/runtime must render each question type correctly.

## Case 15 — Try Hard without timer

Reject publish/save validation for the required state.

## Case 16 — Learning with timer supplied

Normalize timer to null on server-side canonical update.

## Case 17 — Try Hard lives <= 0

Reject.

## Case 18 — Inactive GameTemplate selected

Reject publish and prevent selection when possible.

## Case 19 — Teacher edits another teacher's Activity

Return forbidden/not found according to existing security conventions.
Never leak ownership details.

## Case 20 — Published Activity gets structural change

If no student-run lock exists yet, allow and revalidate.
If runtime history/reference makes structural mutation unsafe, return `STRUCTURAL_EDIT_LOCKED`.

## Case 21 — Archive Activity with existing run history

Archive is allowed as a lifecycle action if no business rule explicitly forbids it.
Historical runs remain intact.

## Case 22 — Archive Activity that students currently see

The Activity stops appearing as an active new option, but historical records remain.

## Case 23 — Teacher deletes an Activity

For MVP prefer **archive instead of hard delete** once there is any runtime history/reference.
Hard delete can be restricted to a draft with no runtime records.

## Case 24 — Malicious QuestionBank ID

Server checks both existence and teacher authorization.

## Case 25 — Client lies about ready counts

Ignore client counts. Query the database and calculate readiness server-side.

## Case 26 — Concurrent QuestionBank change

A teacher may publish while another teacher/admin changes QuestionBank state.
Final server transaction must validate current committed state before publication.

## Case 27 — Pool changes while an Activity run is starting

The future runtime transaction must produce one authoritative question snapshot.
If the required pool is no longer sufficient, fail the start cleanly rather than creating a partial run.

## Case 28 — Student refreshes during an Activity run

Future Attempt/runtime layer restores the same snapshot; it must not select a new question set.

## Case 29 — Assignment asks to reuse the same QuestionBank

Allowed.
Assignment creates its own assessment configuration.
It does **not** attach itself to the Activity.

## Case 30 — Assignment is created for a topic that also has Activities

Allowed.
The two features coexist side-by-side.
The Assignment does not inherit Activity mode/game/lives/selection configuration.

## Case 31 — Teacher changes Activity game template

Only the Activity changes.
Any Assignment using the same QuestionBank is unaffected.

## Case 32 — Teacher changes Assignment deadline

Activity is unaffected.
This demonstrates the required domain separation.

---

# 27. Security rules

Phase 4 authoring endpoints are teacher-only.

Rules:

1. Teacher can access only their Activities.
2. `teacher_id` is derived from authenticated user, never trusted from request body.
3. Teacher must have access to the selected Topic.
4. Teacher must have access to each selected QuestionBank.
5. Preview enforces the same ownership checks as create/update.
6. Students cannot call teacher CRUD endpoints.
7. GameTemplate selection must validate server-side.
8. Readiness must not expose QuestionBank data that the teacher cannot access.
9. Do not leak whether another teacher owns a resource through detailed error messages.

Expected authorization shape:

```text
POST /v1/activities          TEACHER
PUT  /v1/activities/{id}     TEACHER + owner
PATCH ...                     TEACHER + owner
GET /v1/activities/{id}      TEACHER + owner
POST /preview                TEACHER + owner
```

Future student APIs must use student membership/access checks rather than teacher ownership.

---

# 28. Database migration — V11

Current migration history ends at V10.

Phase 4 starts with `V11__create_activity_tables.sql` or the repository's exact naming convention.

Suggested order:

```sql
CREATE TABLE activity_game_templates (...);
CREATE TABLE activities (...);
CREATE TABLE activity_banks (...);
```

## 28.1 Suggested columns

`activity_game_templates`:

```text
id BIGSERIAL PRIMARY KEY
code VARCHAR(80) NOT NULL UNIQUE
name VARCHAR(150) NOT NULL
description VARCHAR(500)
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

`activities`:

```text
id BIGSERIAL PRIMARY KEY
teacher_id BIGINT NOT NULL REFERENCES users(id)
topic_id BIGINT NOT NULL REFERENCES topics(id)
name VARCHAR(150) NOT NULL
description VARCHAR(1000)
status VARCHAR(30) NOT NULL
distribution_mode VARCHAR(30) NOT NULL
total_questions INT NOT NULL
selection_strategy VARCHAR(40) NOT NULL
mode VARCHAR(30) NOT NULL
time_limit_seconds INT
lives INT
game_template_id BIGINT REFERENCES activity_game_templates(id)
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
published_at TIMESTAMP
```

`activity_banks`:

```text
id BIGSERIAL PRIMARY KEY
activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE
question_bank_id BIGINT NOT NULL REFERENCES question_banks(id)
display_order INT NOT NULL
percentage INT
fixed_count INT
```

Recommended database constraints:

- unique `(activity_id, question_bank_id)`;
- positive `display_order` policy consistent with application numbering;
- `total_questions > 0`;
- percentage/check constraints where practical;
- fixed_count/check constraints where practical.

Mode-dependent constraints are still validated in service code because they span multiple fields.

## 28.2 Indexes

Recommended:

```text
activities(teacher_id, status)
activities(topic_id, status)
activities(updated_at)
activity_banks(activity_id, display_order)
activity_banks(question_bank_id)
```

Do not create indexes for speculative future analytics columns in Phase 4.

---

# 29. Seed GameTemplates

Seed stable codes such as:

```text
CHICKEN_SHOOTER
MEMORY_MATCH
SPACE_DEFENDER
WORD_RACE
BOMB_DEFUSE
BOSS_BATTLE
```

Example conceptual seed:

```text
CHICKEN_SHOOTER | Chicken Shooter | Shoot the correct answer
MEMORY_MATCH    | Memory Match    | Match related cards
SPACE_DEFENDER  | Space Defender  | Defend by answering correctly
WORD_RACE       | Word Race       | Race through vocabulary questions
BOMB_DEFUSE     | Bomb Defuse      | Defuse through correct answers
BOSS_BATTLE     | Boss Battle     | Beat a boss by answering questions
```

Do not include game-specific runtime state here.

---

# 30. Repository layer

## ActivityRepository

Responsibilities:

- find by id + owner;
- list by owner with filters;
- status filters;
- Topic filters;
- search by name;
- efficient pagination.

Avoid exposing generic unrestricted `findById` to service code when ownership-scoped access is expected.

## ActivityBankRepository

Responsibilities:

- load children by Activity;
- delete/replace children within Activity update;
- detect duplicate source pairs if needed.

## GameTemplateRepository

Responsibilities:

- lookup by id;
- list active templates;
- validate selected template is active.

## QuestionBank dependency

Activity services should depend on existing QuestionBank/Question repositories/services for:

- source ownership/access;
- QuestionBank status;
- ready count.

Do not duplicate Question completeness logic in Activity. Reuse the existing canonical `is_complete` field.

---

# 31. Service responsibilities in more detail

## 31.1 ActivityService

Public methods conceptually:

```java
create(CreateActivityRequest request, User teacher)
update(Long id, UpdateActivityRequest request, User teacher)
get(Long id, User teacher)
list(ActivityQuery query, User teacher)
changeStatus(Long id, ActivityStatus status, User teacher)
archive(Long id, User teacher)
preview(Long id, ActivityPreviewRequest request, User teacher)
getReadiness(Long id, User teacher)
```

## 31.2 ActivityValidationService

Should have focused validations such as:

```text
validateBasicFields
validateTopic
validateSources
validateDistribution
validateMode
validateGame
validateStatusTransition
```

Avoid putting every validation in the controller.

## 31.3 ActivityReadinessService

Should produce source-by-source results:

```text
questionBankId
status
readyCount
requiredCount
sufficient
```

Aggregate readiness is:

```text
all source validations pass
```

## 31.4 ActivityDistributionService

Pure logic preferred.

Methods:

```text
calculateEqual(total, sources)
calculatePercentage(total, percentages)
calculateFixedCounts(counts)
```

This service should be easy to unit test without a database.

---

# 32. Selection engine contract

Keep selection strategy behind an interface:

```java
public interface QuestionSelectionStrategy {
    SelectionStrategy type();

    List<Question> select(
        StudentContext student,
        Activity activity,
        ActivitySource source,
        int quota
    );
}
```

Phase 4 can implement:

```text
RandomSelectionStrategy
WeaknessPrioritySelectionStrategy
```

But the selection interface may not be actively used by the teacher CRUD APIs yet.

The important domain contract is:

```text
Activity config
   ↓
DistributionService
   ↓
per-source quotas
   ↓
SelectionStrategy
   ↓
question IDs for a single run
```

Question IDs belong to the run snapshot, not Activity configuration.

---

# 33. Activity Preview vs Activity Run

## Preview

Teacher only.

```text
POST /v1/activities/{id}/preview
```

No persistence of student state.

## Activity Run

Student-facing future operation.

Requirements:

- Activity must be PUBLISHED;
- Activity must currently be ready;
- quotas are recalculated;
- questions are selected once;
- a persistent run/Attempt snapshot is created;
- refresh/resume uses the same snapshot.

The future run may support repeatable attempts for Activity, unlike Assignment.

---

# 34. Contract with Phase 5 — Assignments

This section intentionally replaces the previous `Assignment → Activity` concept.

## 34.1 Assignment is a separate aggregate

Phase 5 should define something conceptually like:

```text
Assignment
├── teacher_id
├── target class/student(s)
├── name/description
├── start_at
├── due_at
├── time_limit
├── attempt_limit = 1
├── status
└── assessment/question-source configuration
```

An Assignment may use the same QuestionBanks used by Activities, but it has its own source/distribution rules.

## 34.2 No Activity reuse through Assignment

Do not implement:

```text
Assignment.activity_id
```

Do not implement:

```text
Assignment → Activity → QuestionBanks
```

unless a future product decision explicitly changes the domain model.

For the current product definition, a monthly test is an Assignment, not a special Activity.

## 34.3 Consequences

Changing an Activity must not change an Assignment.

Changing an Assignment must not change an Activity.

They share QuestionBank/Question content but have separate configuration and lifecycle.

## 34.4 Assignment and Activity side-by-side

Student Topic screen may show:

```text
Learn & Practice
├── Past Simple Learning
├── Past Simple Game
└── Past Simple Try Hard

Assigned Work
├── Homework Week 4
└── Monthly Test — September
```

This is the product-level separation users should understand.

---

# 35. Contract with Phase 6 — Attempts / Runtime

Phase 6 must support at least two kinds of student execution:

```text
Activity run
Assignment attempt
```

## Activity run

- potentially repeatable;
- learning feedback;
- may contribute XP;
- may be game-based;
- mode depends on Activity.

## Assignment attempt

- one attempt only;
- official score;
- due/start rules apply;
- unanswered questions remain unanswered but still count in denominator.

## 35.1 Snapshot rule

For either execution path, once a real run begins:

```text
Configuration
     ↓
selected question IDs
     ↓
AttemptQuestion snapshot
```

Later changes to Activity, Assignment, QuestionBank, or Question must not silently change an in-progress/historical run.

## 35.2 No re-selection on refresh

Refresh, reconnect, or resume:

```text
existing attempt/run
       ↓
load existing AttemptQuestion rows
```

Never:

```text
refresh
  ↓
randomly select new questions
```

---

# 36. Contract with Phase 7 — Analytics

Analytics should derive from actual student answers/runs.

Conceptual chain:

```text
Answer
  ↓
AttemptQuestion
  ↓
Question
  ↓
QuestionBank
  ↓
Topic
  ↓
analytics
```

For Activities, future analytics can include:

- attempts/runs;
- completion rate;
- question accuracy;
- average score;
- repeat count;
- game performance;
- topic learning progress.

Do not build a permanent `StudentWeakness` entity in Phase 4.

Weakness Priority can later consume the analytics layer rather than owning a duplicate truth source.

Assignment analytics can remain separate where official grading semantics differ.

---

# 37. Contract with Phase 8 — XP

Activity itself does not directly write XP transaction records during authoring.

Later runtime policy may define:

```text
Activity Run
   ↓
completion/result
   ↓
XPTransaction
```

The existing product requirement is that Practice contributes XP but with a smaller reward than Assignment outcomes where applicable.

Phase 4 only needs to preserve the information necessary for that later runtime calculation.

Assignment official score and XP must remain separate concepts.

---

# 38. State/data matrix

| Concern | Activity | Assignment | Future run/Attempt |
|---|---|---|---|
| Purpose | Learning/practice/game | Assigned task/assessment | One student execution |
| Deadline | No | Yes, when configured | Snapshot of applicable rule |
| Target class/student | Not required in Phase 4 | Yes | Student |
| Repeatable | Yes | No, one attempt | Multiple Activity runs possible |
| Game | Optional | Not implied | Runtime based on source config |
| Learning mode | Yes | No | Yes for Activity |
| Try Hard | Yes | No | Yes for Activity |
| Official grade | No | Yes | Assignment score |
| XP | Later runtime | Later policy | Calculated from result |
| Question sources | ActivityBank | Assignment source config | Snapshot IDs |
| Selected question IDs | No | No in configuration | Yes |
| Student answers | No | No | Yes |
| Readiness | Derived | Derived separately | Checked before start |
| Ownership | Teacher | Teacher | Student + target context |

This table is the canonical conceptual boundary.

---

# 39. Audit requirements for implementation

Before marking Phase 4 complete, verify the repository does not accidentally reintroduce Activity/Assignment coupling.

## Backend

Search for and prevent accidental fields such as:

```text
activity.assignment_id
assignment.activity_id
assignment.activity
ActivityAssignment
```

unless explicitly introduced by a later product decision.

Verify:

- V11 migration applied;
- entity relationships match this spec;
- enums match exactly;
- ownership checks are server-side;
- QuestionBank status/readiness is revalidated;
- distribution calculations are deterministic;
- no selected Question IDs are persisted in Activity.

## Frontend

Verify:

- Activity has its own navigation;
- create/edit is route-based;
- Activity UI does not display deadline/one-attempt fields;
- Assignment UI, when built later, does not inherit GameTemplate/mode/lives from Activity;
- readiness is shown as derived state;
- API values remain server authoritative.

## Product

Verify a user can understand the difference:

```text
Activity = “Do this to learn/practice.”
Assignment = “You are assigned this work/test and must submit it.”
```

---

# 40. Testing plan

## 40.1 Unit tests — distribution

Required:

1. Equal with divisible total.
2. Equal with non-divisible total → error.
3. Percentage exact allocation.
4. Percentage largest-remainder allocation.
5. Percentage sum != 100 → error.
6. Percentage allocation zero → error.
7. Fixed counts derive total.
8. Fixed count <= 0 → error.
9. Source order tie-break deterministic.

## 40.2 Unit tests — validation

Required:

1. No source.
2. Duplicate source.
3. Draft source.
4. Archived source.
5. Empty source.
6. Try Hard without timer.
7. Try Hard without lives.
8. Learning timer normalization.
9. Inactive GameTemplate.
10. Invalid status transition.
11. Topic access failure.

## 40.3 Unit tests — readiness

Required:

- source with sufficient ready count;
- source with insufficient ready count;
- one source sufficient, one insufficient;
- QuestionBank status changes;
- question completeness changes.

## 40.4 Integration tests

Required endpoints:

```text
POST /v1/activities
GET /v1/activities
GET /v1/activities/{id}
PUT /v1/activities/{id}
GET /v1/activities/{id}/readiness
POST /v1/activities/{id}/preview
PATCH /v1/activities/{id}/status
PATCH /v1/activities/{id}/archive
```

Verify aggregate persistence and child replacement atomically.

## 40.5 Security tests

- teacher can manage own Activity;
- teacher cannot manage another teacher's Activity;
- teacher cannot use inaccessible QuestionBank;
- student cannot call teacher CRUD;
- client cannot spoof `teacher_id`.

## 40.6 Frontend checks

```text
npm run lint
npm run build
```

Verify:

- list/filter/pagination;
- create/update;
- dirty state;
- preview;
- publish blocking;
- mobile action bar;
- loading/error states.

## 40.7 Regression checks

After Phase 4 implementation, current QuestionBank/Question functionality must still pass:

- question CRUD;
- completeness calculation;
- question media handling;
- bulk delete;
- QuestionBank publish/archive behavior.

---

# 41. Recommended implementation order

## Step 1 — V11 database

Create:

```text
activity_game_templates
activities
activity_banks
```

Seed GameTemplates.

## Step 2 — Domain

Implement:

```text
Activity
ActivityBank
GameTemplate
```

plus four enums.

## Step 3 — Repository

Implement ownership-scoped Activity repositories and source/template lookups.

## Step 4 — Distribution + validation

Build pure logic first so it can be thoroughly unit tested.

## Step 5 — Readiness

Connect source status/ready counts to computed quotas.

## Step 6 — CRUD API

Implement create/get/list/update.

## Step 7 — Publish/archive

Implement status transitions and full server validation.

## Step 8 — Preview API

Generate read-only previews using real eligible questions.

## Step 9 — Frontend list

Build `/teacher/activities`.

## Step 10 — Frontend editor

Build:

```text
new
[id]
```

with the full configuration flow.

## Step 11 — Source selector

Connect real Topic → QuestionBank data.

## Step 12 — Distribution UI

Mirror equal/percentage/fixed-count rules, but treat the server as authoritative.

## Step 13 — Strategy/mode/game UI

Add Random/Weakness, Learning/Try Hard, GameTemplate.

## Step 14 — Preview/publish UX

Connect readiness API and publish dialog.

## Step 15 — Tests/hardening

Add backend unit/integration/security tests and frontend lint/build.

## Step 16 — Stop at the Phase 4 boundary

Do **not** start Assignment implementation in the middle of Activity work.

Do **not** create AttemptQuestion/Answer tables merely to preview Activity.

Do **not** build the game engines before Activity configuration is stable.

---

# 42. Explicit non-goals for Phase 4

Phase 4 does not implement:

1. Assignment creation/targeting.
2. Monthly tests or formal assessments.
3. Deadline/reminder logic.
4. One-attempt enforcement for Assignment.
5. Student Attempt persistence.
6. Answer persistence.
7. Official score calculation.
8. Gradebook integration.
9. Student weakness data model.
10. XP transaction creation.
11. Ranking.
12. Game-specific question entities.
13. Full game runtime engines.
14. Activity versioning.
15. Student progress dashboards based on live Activity results.

These are later phases or future extensions.

---

# 43. Final Phase 4 completion gate

Phase 4 is complete only when all of the following are true.

## Backend

- [ ] V11 migration is applied successfully.
- [ ] `Activity` belongs to a Topic.
- [ ] `Activity` has no Assignment foreign key.
- [ ] `ActivityBank` stores QuestionBank sources only.
- [ ] `GameTemplate` is an optional catalog reference.
- [ ] All four enums exist.
- [ ] Create/update/get/list work.
- [ ] Publish/archive/status transitions work.
- [ ] Ownership is enforced.
- [ ] Source eligibility uses actual QuestionBank status and Question `is_complete`.
- [ ] Distribution logic is unit-tested.
- [ ] Readiness is derived, not trusted from the client.
- [ ] Preview works without creating an Attempt.
- [ ] No selected question IDs are persisted in Activity.
- [ ] Insufficient source pools do not silently redistribute questions.

## Frontend

- [ ] `/teacher/activities` exists.
- [ ] `/teacher/activities/new` exists.
- [ ] `/teacher/activities/[id]` exists.
- [ ] Topic selector exists.
- [ ] QuestionBank selector exists.
- [ ] Distribution editor exists.
- [ ] Selection strategy UI exists.
- [ ] Learning/Try Hard UI exists.
- [ ] Game selector exists.
- [ ] Preview exists.
- [ ] Publish dialog exists.
- [ ] Readiness errors are actionable.
- [ ] Dirty/loading/empty/error/mobile states exist.

## Architecture

- [ ] Activity and Assignment are independent.
- [ ] A monthly test can be modeled as an Assignment without creating an Activity.
- [ ] A game/practice can be modeled as an Activity without creating an Assignment.
- [ ] Reusing a QuestionBank in both does not couple the two objects.
- [ ] Activity configuration is separate from per-student runtime state.
- [ ] Future Assignment implementation does not need to modify the Activity aggregate.

## Quality

- [ ] `mvn test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No regression in QuestionBank/Question functionality.
- [ ] No mock data is used for the new Activity CRUD path.

---

# 44. Canonical architecture summary

The revised architecture is:

```text
                         CONTENT

Grade
  ↓
Unit
  ↓
Section
  ↓
Topic
  ├───────────────────────────────┐
  │                               │
  │                               │
QuestionBank(s)                 Activity(s)
  │                               │
  └──────→ Questions              ├── source: QuestionBank(s)
                                  ├── distribution
                                  ├── selection strategy
                                  ├── learning mode
                                  └── optional GameTemplate


                         ASSESSMENT

QuestionBank(s)
      │
      └──────────────→ Assignment(s)
                         ├── target class/student(s)
                         ├── open/due schedule
                         ├── one-attempt policy
                         ├── assessment configuration
                         └── official result


                         RUNTIME

Activity ───────────────→ Activity Run / Attempt
Assignment ─────────────→ Assignment Attempt
                              │
                              ├── AttemptQuestion
                              └── Answer
                                      │
                                      ├── Analytics
                                      └── XP policy
```

## The three sentences that define the architecture

> **Activity is something the student does to learn, practice, or play.**

> **Assignment is something the teacher assigns for completion or formal assessment.**

> **Attempt is the student's actual execution of one of those experiences.**

These definitions are the canonical product boundary for the rest of the project.

---
