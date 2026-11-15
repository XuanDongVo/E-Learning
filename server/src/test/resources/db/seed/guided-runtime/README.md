# Guided runtime UI fixture

Run `01_guided_runtime.sql` only against a disposable development or test database **after** Flyway V60 and the Grade 7 seed files `01_foundation.sql`, `02_questions.sql`, and `03_activities.sql`.

The fixture creates one published `G7-GUIDED-RUNTIME` Learning Activity in Grade 7 Unit 1. Its three READY Guided Reasoning questions collectively cover:

- Guided steps: Single Choice, True/False and Type Answer.
- Hint enabled and disabled states.
- Retry enabled state.
- Final questions: Single Choice, True/False and Type Answer.

It is idempotent by its tagged question content and activity/bank names. Do not run it against production or a shared database.
