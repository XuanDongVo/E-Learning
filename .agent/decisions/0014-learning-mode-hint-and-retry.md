# 0014 — Learning mode: hint and retry
Status: Accepted; amended by 0016 for the formula-sheet portion
Date: 2026-10-07

## Decision

Applies to Activity runs in Learning Mode only.

1. A question accepts at most 3 answers in total: first answer plus up to 2 retries.
2. After retries are exhausted, the system shows the correct answer and the Question explanation, then the student continues.
3. Each Question may have one optional teacher-authored hint. If present, the student can request it and the server records hint_used.
4. Using a hint reduces part of the XP assigned later; the amount is a Phase 9 rule.
5. Hint usage does not change correctness.
6. Try Hard and Assignments have no hints and no retry.

## Formula/reference sheet amendment

The earlier formula/reference-sheet idea is retained as a future product direction but is not part of the current implementation contract. See ADR 0016. Do not add Topic.reference_sheet, formula-sheet APIs or formula-sheet UI until a later phase explicitly activates them.

## Consequences

Current data and API work only needs the optional Question hint. The hint is not part of the student question payload before it is requested.
