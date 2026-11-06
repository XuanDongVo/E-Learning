# Activity XP v2.2 foundation — 2026-11-06
- Owner accepted A–D: Question difficulty snapshot, one PRACTICE ledger per Session and per-question breakdown, GAME_OVER question XP only, ABANDONED zero.
- Concurrency clarification: requests may run simultaneously; XP may not be duplicated or lost.
- Flyway V50 and nullable entity audit fields prepared. QuestionSnapshot v2 stores difficulty; historical v1 is readable for gameplay and not auto-awarded.
- Skeleton service/calculator contracts are deliberately NOT integrated into ActivitySession runtime. No XP will be awarded as a side effect of this commit.
- Release verification pending: database preflight & migration, Maven compile/tests, concurrency integration tests and authenticated E2E. Connector source inspection is not runtime execution.
