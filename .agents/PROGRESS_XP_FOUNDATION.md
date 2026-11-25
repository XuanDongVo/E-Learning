# Activity XP v2.2 foundation — 2026-11-06
- Owner accepted A–D: Question difficulty snapshot, one PRACTICE ledger per Session and per-question breakdown, GAME_OVER question XP only, ABANDONED zero.
- Concurrency clarification: requests may run simultaneously; XP may not be duplicated or lost.
- Flyway V50 and nullable entity audit fields prepared. QuestionSnapshot v2 stores difficulty; historical v1 is readable for gameplay and not auto-awarded.
- Skeleton service/calculator contracts are deliberately NOT integrated into ActivitySession runtime. No XP will be awarded as a side effect of this commit.
- Release verification pending: database preflight & migration, Maven compile/tests, concurrency integration tests and authenticated E2E. Connector source inspection is not runtime execution.

## Policy sign-off (2026-11-06; documentation-only milestone)
- Owner accepted final XP table, Hint-over-Retry precedence, v2.1 five-Level scaling with 20% floor, zero XP for wrong/timeout, regular replay without decay or cap.
- Owner accepted Completion Bonus for all-wrong COMPLETED, `N = totalQuestions` selected at start, no legacy auto-backfill, initial Result-only XP UI, and GAME_OVER not counting streak.
- Documentation: canonical v2.2 spec, ADR 0029 addendum, business rules, skeleton plan sync and new staged implementation plan.
- **No XP Engine implementation or runtime activation in this documentation milestone.** Flyway/compilation/concurrency/E2E validation of eventual engine remains pending.
