# Ordering runtime QA fixture

Run `01_ordering_runtime.sql` only against a disposable development or test
database after:

1. Flyway migrations through V63.
2. Grade 7 seed files `01_foundation.sql`, `02_questions.sql`, and
   `03_activities.sql`.

The idempotent fixture creates one published Question Bank in Grade 7 Unit 1,
plus two published Activities:

- `G7-ORDERING-CLASSIC`: `BOTH` mode, four Ordering Questions, 45 seconds per
  Try Hard Question and three lives.
- `G7-ORDERING-GUIDED`: `LEARNING` mode, one READY Guided Definition whose
  Final Question is Ordering.

Coverage:

- WORD, PHRASE and SENTENCE rendering.
- Multiple accepted orders.
- Duplicate visible content with different item keys.
- Eight long SENTENCE items for mobile and keyboard QA.
- Final hint, Guided Step gate, retry, runtime answer and Review projection.

The script does not create users or sessions. Use the Grade 7 Student accounts
from the foundation seed and start the Activities through the real Student API/UI.
Do not run this fixture against production or a shared database.

