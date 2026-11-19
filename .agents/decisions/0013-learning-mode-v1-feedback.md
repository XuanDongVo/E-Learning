# 0013 — Learning mode v1: immediate feedback, explanation after a wrong answer
Status: Superseded by [ADR 0014](./0014-learning-mode-hint-and-retry.md) (2026-10-07). The evidence table below remains valid.
Date: 2026-10-07

## Context

The repo has no Learning-mode behaviour to follow: `Question` has an `explanation` field but no hint field and no formula content, and the
Phase 4 spec only says hints "may be shown". The owner asked to study how real products behave and follow them.

## Evidence (observations from help pages, product blogs and user communities; not official specifications)

| Product | What happens after a wrong answer |
|---|---|
| Duolingo | Tells the learner what was wrong and the correct answer; an "Explain my answer" button gives the reason ([blog](https://blog.duolingo.com/explain-my-answer-now-free)) |
| Quizlet Learn | Marks it wrong and makes the learner retype the correct answer to continue; "Give up" shows it; missed items return more often in the same session |
| Gimkit | Teachers asked to **force** students to see the correct answer because kids skipped it; the product added "Answer Review" ([thread](https://gimkit.nolt.io/112)) |
| Khan Academy | "Try again" plus a hints link; users report that using a hint counts the question as not answered correctly the first time, and teachers ask for a second try before hints ([support post](https://support.khanacademy.org/hc/hy/community/posts/360000358971/comments/360000139471)) |

Common pattern: **instant right/wrong feedback, the correct answer and the reason are shown, and the student cannot skip past them unseen.**

## Decision (v1)

In **Learning mode**, after every answer the student sees correct or incorrect at once. After a **wrong** answer the student sees the
**correct answer and the question's `explanation`** and must press **Continue** to move on. One answer per question: no retry, no hints in v1.
There is no timer and no lives. Every answer is recorded for analytics (first and only answer).

## Later (v2, needs new data)

Hint (`Question.hint`), an expandable formula sheet, and retry-after-hint (the owner's earlier idea), plus requeueing missed questions inside a run (Quizlet style).
If hints are added, decide whether using one counts as incorrect (Khan style) before building.

## Consequences

- No new Question fields in v1. `domain-model.md` and the glossary are updated: hints are not in v1.
- Try Hard stays as in Phase 4: timer, 3 lives, no hints.
