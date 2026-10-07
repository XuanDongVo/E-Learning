# Decisions (ADR)

One short file per significant product or architecture decision. An accepted ADR **overrides** any other document
that disagrees with it. If a document disagrees with an ADR, fix the document in the same change.

Naming: `NNNN-short-title.md`. Never delete an ADR; supersede it with a new one.

Template:

```md
# NNNN — Title
Status: Proposed | Accepted | Superseded by NNNN
Date: YYYY-MM-DD

## Context
## Decision
## Consequences
```

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-activity-and-assignment-are-independent.md) | Activity and Assignment are independent | Accepted |
| [0002](./0002-adopt-ui-guidelines-and-tokens.md) | Adopt the UI guidelines and design tokens | Accepted |
| [0003](./0003-phase-5-assignment-contract.md) | Phase 5 assignment contract | Accepted |
| [0004](./0004-phase-numbering.md) | Phase numbering (Student Management vs Attempts) | Accepted |
| [0005](./0005-one-teacher-many-classes.md) | One teacher, many classes | Accepted |
| [0006](./0006-assignment-completion-is-submission.md) | Assignment completion means submitted | Accepted |
| [0007](./0007-student-visibility-own-grade.md) | Students see only their own grade | Accepted |
| [0008](./0008-activity-belongs-to-unit.md) | An Activity belongs to a Unit | Accepted |
| [0009](./0009-assignment-timeout-auto-submit.md) | Assignment time-out auto-submits | Accepted |
| [0010](./0010-assignment-targets-class-or-grade.md) | Assignment targets are CLASS or GRADE | Accepted |
| [0011](./0011-student-sees-answers-after-submit.md) | Student sees score and answers right after submitting | Accepted |
| [0012](./0012-activity-run-not-resumable.md) | Unfinished Activity run is not saved or resumed | Accepted |
| [0013](./0013-learning-mode-v1-feedback.md) | Learning mode v1: feedback and explanation after a wrong answer | Superseded by 0014 |
| [0014](./0014-learning-mode-hint-and-retry.md) | Learning mode: hint, retry, per-Topic formula sheet | Accepted |
| [0015](./0015-try-hard-time-limit-per-question.md) | Try Hard time limit is per question | Accepted |


## Supersession rule

An accepted ADR remains historical record even when superseded. The latest accepted ADR wins for the affected decision. Active specs must remove or explicitly quarantine superseded requirements; an inline note saying that a later ADR wins is not sufficient if the old requirement remains in an executable section.

## Current decision chain

- ADR 0001 establishes Activity and Assignment independence.
- ADR 0003 defines the Assignment contract and defers Excel import/reorder until their contracts are finalized.
- ADR 0004 establishes current phase numbering: Phase 6 = Student Management; Phase 7 = Attempts and Answers.
- ADR 0010 limits Assignment targets to CLASS or GRADE.
- ADR 0011 supersedes the former Release Answers gate: students see score and answers after submission.
- ADR 0013 is superseded by ADR 0014 for Learning Mode feedback/hint/retry behavior.
