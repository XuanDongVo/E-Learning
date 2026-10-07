# 0014 — Learning mode: hint, retry and a per-Topic formula sheet (Khan Academy style)
Status: Accepted
Date: 2026-10-07
Decided by: project owner (follows the Khan Academy pattern researched in ADR 0013)

## Decision

Applies to **Activity runs in Learning mode only**. Try Hard (timer, 3 lives, no hints) and Assignments (one official attempt) have no hints and no retry.

1. **Retry.** A question accepts **at most 3 answers in total** (the first answer + up to 2 retries), as confirmed by the owner on 2026-10-07.
   When the retries are used up, the system shows the **correct answer and the question's `explanation`** and the student must press **Continue**.
2. **Hint.** Each question may have **one optional hint** (`Question.hint`). The student asks for it with a button; the server records `hint_used` when it is requested.
   If a question has no hint, no hint button is shown.
3. **Formula sheet.** Each **Topic** may have **one shared formula/grammar sheet** (`Topic.reference_sheet`), opened with an expandable button. Opening it is **not** a hint use and has no penalty.
4. **Effect of a hint.** Using a hint **reduces part of the XP** of that question. It does not change whether the answer is correct. The amount belongs to the central XP rules (Phase 9).
5. Each question stores: number of submissions (max 3), `first_answer_correct`, `final_correct`, `hint_used`. Weak-topic analytics use `first_answer_correct`.

## Assumptions (change only with a new ADR)

- A1 (resolved 2026-10-07): the owner confirmed 3 answers in total per question, i.e. 2 retries.
- A2: opening the formula sheet is free.
- A3: analytics use first-answer correctness, so retries do not hide a weak topic.

## Consequences

- New data: `questions.hint` (nullable, max 500 characters) and `topics.reference_sheet` (nullable text). Migration, content API fields and teacher authoring UI (task N3b).
- Because the question bank is large, hints and sheets are optional; a Learning run works without them.
- The student API must **not** send the hint with the question; it is returned by a dedicated request so `hint_used` is recorded by the server.
- The XP penalty amount is open (OQ-17), decided in the XP phase. Attempts must store `hint_used` so XP can use it.
- Supersedes the hint-free direction of [ADR 0013](./0013-learning-mode-v1-feedback.md).
