# Grade 7 development seed — 2026-2027

This seed is **Grade 7 only**. Grade records `GRADE_6`, `GRADE_7`, `GRADE_8`, `GRADE_9` remain available, but **only Grade 7 has curriculum/demo content** after reset.

## Scope

| Content | Expected |
| --- | ---: |
| Grade records | 4 |
| Grade 7 units | 6 |
| Grade 7 sections | 18 |
| Grade 7 topics | 6 |
| Grade 7 question banks | 12 |
| Question bank questions | 200 (40 per basic type) |
| Grade 7 published Activities | 20 |
| Activity mode | BOTH (LEARNING, TRY_HARD) |
| Try Hard timer | 20 seconds **per question** |
| Try Hard lives | 3 |
| Assignment-owned question records | 20 (10 basic, 5 MATCHING, 5 CLOZE) |
| Assignments | 1 integrated PUBLISHED, 1 future DRAFT |
| Active seed student accounts | 55, distributed across three Grade 7 classes |
| Synthetic XP history | MANUAL transactions across Today / Week / Month / historical periods |
| Gamification profiles | 55, lifetime XP and Level reconciled to committed ledger |
| Streak fixture | 40 active runs, 10 expired runs, 5 without history; milestone bonuses |
| Vocabulary | 120 real Grade 7 words (20 per unit) |

No MATCHING or CLOZE question belongs to a Question Bank. The Activity readiness/selection services explicitly exclude these two types.

MIXED is an **Activity question_difficulty setting**, not a Question difficulty. The 200 bank questions have only EASY, MEDIUM and HARD difficulties; 20 Activities cover EASY, MEDIUM, HARD and MIXED.

## Database prerequisites

**Never run the reset against production, a shared database or a database with meaningful student data.** Make a backup and use a dedicated disposable database.

Apply Flyway migrations up to **V54** first. **If Flyway V54 has already run, do not create or replay any new migration**: the three new SQL files below are manually executed dev/test fixtures under `src/test/resources`, not Flyway migrations. The `V39_1__bootstrap_legacy_assignment_classes.sql` migration exists to allow fresh database initialization with historical Grade 6–8 Assignment demo migrations, which would otherwise fail when V40 tries to resolve class recipients.

Important: This intermediate-version migration is designed for a **fresh database**. Existing databases that have already migrated beyond V39 may require a separate migration plan. Do not enable Flyway `outOfOrder` in production to force it through.

The legacy seed migrations (`V6`, `V9`, `V16`, `V20`, `V22`, `V39`) are intentionally left intact, respecting immutable Flyway history. The reset script below clears their demo content after Flyway finishes.

## Execute (PowerShell / Windows, `psql` on PATH)

From the repository root, after Spring Boot has successfully migrated a **disposable dev database**, set the connection string for the **same database**:

```powershell
$env:PGURL = "postgresql://postgres:123456@localhost:5432/e_learning"

$root = "server/src/test/resources/db/seed/grade7"
$files = @(
  "00_reset_legacy_demo.sql", # DANGEROUS: new disposable DB ONLY
  "01_foundation.sql",
  "02_questions.sql",
  "03_activities.sql",
  "04_assignments.sql",
  "05_gamification_xp.sql",
  "06_streak_history.sql",
  "07_vocabulary.sql",
  "99_assertions.sql"
)
foreach ($name in $files) {
  psql "$env:PGURL" -X -v ON_ERROR_STOP=1 -f "$root/$name"
  if ($LASTEXITCODE -ne 0) { throw "Seed stopped at $name (exit $LASTEXITCODE)" }
}
```

Run the same commands in a disposable test DB only. **Do not run the reset script again if students have started Activities or Assignments.** In particular, `00_reset_legacy_demo.sql` TRUNCATES almost every public table. The non-reset scripts use seed-specific identifiers, but they are not an automated migration tool for editing existing questions or populated attempts.

If a SQL file fails, execution stops with a nonzero status. The final assertions validate counts, type boundaries, Student membership, Activity settings and the new gamification/vocabulary fixture consistency. No SQL is executed automatically just because these files exist in the repository.

## Add XP / Streak / Vocabulary to an existing Grade 7 dev DB (Flyway V54 already applied)

Use **only a dedicated dev/test database** where the original 55 fixture accounts and the six G7-SEED units already exist. **Do not run 00_reset_legacy_demo.sql.** Never run this against production or shared datasets.

```powershell
$env:PGURL = "postgresql://postgres:YOUR_DEV_PASSWORD@localhost:5432/e_learning_dev"
$root = "server/src/test/resources/db/seed/grade7"
$files = @(
  "05_gamification_xp.sql",
  "06_streak_history.sql",
  "07_vocabulary.sql",
  "99_assertions.sql"
)
foreach ($name in $files) {
  psql "$env:PGURL" -X -v ON_ERROR_STOP=1 -f "$root/$name"
  if ($LASTEXITCODE -ne 0) { throw "Seed stopped at $name (exit $LASTEXITCODE)" }
}
```

- `05` creates synthetic MANUAL XP transactions with stable fixture keys. It refreshes their timestamps on rerun so TODAY/WEEK/MONTH remain populated. No ActivitySession is fabricated.
- `06` builds consecutive learning days, qualifying/expired streaks and milestone bonuses with the **real** `STREAK_BONUS:<studentId>:<runStartDate>:<milestone>` idempotency-key convention. It then recomputes `lifetime_xp` and `current_level` from the committed ledger using the XP v2.2 level threshold `10*(level-1)*(level+8)`.
- `07` inserts 20 active words per unit, skipping words already present in the same unit. Text, Vietnamese meaning, example sentence, translation and difficulty are supplied. Audio/images are NULL until real media exists.
- `99` checks profile/ledger reconciliation, current and expired streak distribution, Level calculation, and vocabulary counts/uniqueness.
- Re-run **05 then 06 then 07 then 99, in order**, to refresh relative dates. Do not run only 05 as that temporarily leaves `lifetime_xp` snapshots stale; do not run only 06 if XP needs refreshing.
- Preflight in 05/06 **refuses to proceed** if fixture students have real Activity or Vocabulary Game sessions, non-fixture XP, or an unrelated nonzero gamification profile. Those are signals to create a fresh disposable dev database, **not** to bypass the guard.
- Streak dates in this fixture are **synthetic** and are *not proof* of completed ActivitySessions. Consequently, Recent Activity stays empty. Run real gameplay for integration testing instead. Do not claim these milestones were earned by live interactions.
- Current streaks use Asia/Ho_Chi_Minh; a stored historical run may be expired, yielding an effective streak of 0 while retaining `longest_streak`.
- Before running, back up any data you care about. These fixtures are intentionally not automatic Flyway scripts and will not execute when Spring Boot starts.

## Things this seed intentionally does not manufacture

- It does not insert completed ActivitySessions or AssessmentAttempts. MANUAL XP and synthetic Streak fixtures are provided **only** for visual QA. Test the real Activity XP/reward workflow and Recent Activity separately with integration tests.
- It does not claim WEAKNESS_PRIORITY works: the current selection service chooses randomly regardless of strategy. Seeded Activities configure RANDOM only.
- It does not turn MATCHING/CLOZE into an Activity format.
- It does not provide a reliable demo password. The seed reuses the original repository's BCrypt demo hash; configure fixture credentials securely before login testing.
- It does not verify runtime behavior of the Assignment compound renderers. The integrated Assignment is a *test fixture* and must pass end-to-end verification before student-facing deployment.

## Validate by UI

Log into a Grade 7 student, open Student Units: you should see 6 Units. Each Unit lists 3 or 4 published Activities (20 total). Every Activity offers Learning and Try Hard. Try Hard's timer is 20 seconds per question. Grade 6, 8 and 9 have no Units in this seed.

In the Teacher UI, review the Grade 7 Question Banks (12 banks, 200 questions, 5 types) and the Grade 7 integrated Assignment (20 owned questions including five MATCHING and five CLOZE). Verify all questions have a correct answer, and that the integrated Assignment can start, autosave, submit and display permitted answers.

### Implementation references

- Backend: `activity/service/ActivityReadinessService.java`
- Backend: `activitysession/selection/ActivityQuestionSelectionService.java`
- Compatibility: `db/migration/V39_1__bootstrap_legacy_assignment_classes.sql`
- Seed: `server/src/test/resources/db/seed/grade7/*.sql`
