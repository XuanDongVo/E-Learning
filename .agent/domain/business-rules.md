# Business Rules

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here; do not re-copy into AGENTS.md. -->

Single place for rules that more than one module depends on. A rule must not be re-implemented in components,
hooks, services and pages: it lives in one service/domain function and everything else displays its result.

## Activity vs. Assignment

```text
Activity   = "Do this to learn, practice or play."   repeatable, no deadline, no official grade
Assignment = "You must complete this by a date."      target, schedule, ONE attempt, official score
```

Decision and rationale: [ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md).

## Assignment attempt rules

Source: Phase 4 spec §2.2 and §34–35. These replace the former multi-attempt rules.

- An Assignment has **one** allowed student attempt. There is no retry, and "best score" does not apply.
- The attempt is a snapshot of the selected questions and their order; it is never re-randomized on refresh, resume or review.
- Unanswered questions are **not** counted as incorrect answers, but the **total number of questions stays the
  denominator** of the percentage score.
- An Assignment may have an open date, a due date and an optional time limit.
- Time limit: the server clock is authoritative and keeps running if the student leaves. At expiry the answers saved so far are auto-submitted and flagged **Timed out**; this counts as submitted ([ADR 0009](../decisions/0009-assignment-timeout-auto-submit.md)).
- Completed = submitted; no score threshold ([ADR 0006](../decisions/0006-assignment-completion-is-submission.md)).
- After submitting, the student sees the score and the correct answers with explanations immediately; there is no teacher "Release answers" step ([ADR 0011](../decisions/0011-student-sees-answers-after-submit.md)).
- The official score belongs to the Assignment attempt and is a different concept from XP.

### Open questions (decide in the Phase 5 spec, then record an ADR)

Status of rules that existed in the old multi-attempt model:

- ~~Late-submission policy~~ Decided: still accepted, labelled **Late**, no penalty ([ADR 0003](../decisions/0003-phase-5-assignment-contract.md))
- ~~Completion threshold~~ Decided: completed = submitted, no threshold ([ADR 0006](../decisions/0006-assignment-completion-is-submission.md))
- Exact target-field validation per `AssignmentTarget` type

Do not implement anything still listed without a decision.

## Activity runs and practice

### Practice rules

Practice is represented by an Activity/Attempt without an Assignment relationship.

- Practice results are saved.
- Practice contributes XP.
- Practice XP should be lower than Assignment XP according to the central XP rules.

Do not create a separate Practice entity.

Learning mode (Activity runs only): at most 3 answers per question (2 retries) after a wrong answer, then show the answer and explanation and require Continue; one optional hint per question (the server records `hint_used`, XP is reduced); one formula sheet per Topic, free to open ([ADR 0014](../decisions/0014-learning-mode-hint-and-retry.md)).

An unfinished Activity run is not saved or resumed; opening the Activity again starts a new random run ([ADR 0012](../decisions/0012-activity-run-not-resumable.md)).

---

Activity runs are repeatable and may contribute XP; they never create an official grade.

## Analytics

- Weak-topic analytics are derived from `Answer → Question → QuestionBank → Topic`; never from an Activity's total score.
- Do not present strong conclusions from tiny samples. The "minimum-data rule" and its centralized thresholds are
  defined under Phase 8 in [`plans/PHASES.md`](../plans/PHASES.md).
- Do not create a `StudentWeakness` entity.

## XP and ranking

XP history is stored in `XPTransaction`; ranking is computed dynamically (Grade 6/7/8, weekly/monthly) from those
transactions. Details: [`plans/PHASES.md`](../plans/PHASES.md) Phase 9 and [`domain/domain-model.md`](./domain-model.md).

## Calculations: single source of truth

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
