
#!/bin/sh
set -eu

echo "======================================"
echo "    E-LEARNING DATABASE SEED RUNNER"
echo "======================================"

# Only allow explicitly approved disposable test databases
if [ "${SEED_CONFIRM:-}" != "DISPOSABLE_TEST_DB" ]; then
  echo "ERROR: Seed requires explicit confirmation."
  echo "Set SEED_CONFIRM=DISPOSABLE_TEST_DB"
  exit 1
fi

echo "Database: ${PGDATABASE}"
echo "Checking PostgreSQL connection..."

pg_isready -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE"

echo "Checking Flyway migration..."


for file in \
  00_reset_legacy_demo.sql \
  01_foundation.sql \
  02_questions.sql \
  03_activities.sql \
  04_assignments.sql \
  05_gamification_xp.sql \
  06_streak_history.sql \
  07_vocabulary.sql \
  99_assertions.sql
do
  echo "--------------------------------------"
  echo "Executing: $file"

  psql \
    -X \
    -v ON_ERROR_STOP=1 \
    --single-transaction \
    -f "/seed/sql/$file"

  echo "Completed: $file"
done

echo "======================================"
echo " SEED COMPLETED SUCCESSFULLY"
echo "======================================"
