-- G7-SEED: synthetic learning-day history and streak milestone XP.
-- Run AFTER 05_gamification_xp.sql. Requires Flyway V54 or later.
-- For disposable DEV/TEST databases only; never claim these are real completed Activities.
BEGIN;

DO $preflight$
BEGIN
  IF (SELECT count(*) FROM users
      WHERE email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
        AND role='STUDENT' AND status='ACTIVE') <> 55 THEN
    RAISE EXCEPTION 'G7-SEED Streak requires all 55 active students';
  END IF;

  IF EXISTS (
    SELECT 1 FROM activity_sessions s JOIN users u ON u.id=s.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
  ) OR EXISTS (
    SELECT 1 FROM vocabulary_game_sessions s JOIN users u ON u.id=s.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
  ) THEN
    RAISE EXCEPTION 'Refusing to reseed streak with real Activity/Game sessions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM xp_transactions x JOIN users u ON u.id=x.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND NOT (
        (x.source_type='MANUAL' AND x.idempotency_key LIKE 'G7-SEED:XP:%'
         AND x.note='G7-SEED fixture: synthetic XP')
        OR (x.source_type='STREAK_BONUS'
         AND x.note='G7-SEED fixture: synthetic streak milestone')
      )
  ) THEN
    RAISE EXCEPTION 'Refusing to reseed streak: non-fixture XP exists';
  END IF;

  IF (SELECT count(DISTINCT u.id)
      FROM users u JOIN xp_transactions x ON x.student_id=u.id
      WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
        AND x.idempotency_key LIKE 'G7-SEED:XP:%'
        AND x.note='G7-SEED fixture: synthetic XP') < 48 THEN
    RAISE EXCEPTION 'Run 05_gamification_xp.sql first';
  END IF;
END $preflight$;

-- No non-fixture session exists by preflight. Refresh only fixture-student days.
DELETE FROM student_learning_days d USING users u
WHERE d.student_id=u.id
  AND u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$';

DELETE FROM xp_transactions x USING users u
WHERE x.student_id=u.id
  AND u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
  AND x.source_type='STREAK_BONUS'
  AND x.note='G7-SEED fixture: synthetic streak milestone';

-- 01-05: 14..30, 06-15: 7..13, 16-30: 3..6,
-- 31-40: 1..2, 41-50: expired historical runs, 51-55: no history.
CREATE TEMP TABLE g7_seed_streaks ON COMMIT DROP AS
WITH base AS (
  SELECT u.id AS student_id,
         substring(u.email FROM 'student([0-9]+)')::integer AS n,
         (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS today
  FROM users u
  WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
)
SELECT student_id,n,today,
       CASE
         WHEN n<=5 THEN 14+(n*4)%17
         WHEN n<=15 THEN 7+(n-6)%7
         WHEN n<=30 THEN 3+(n-16)%4
         WHEN n<=40 THEN 1+(n-31)%2
         WHEN n<=50 THEN 3+(n-41)%12
         ELSE 0
       END AS run_length,
       CASE
         WHEN n<=40 THEN today-(n%2)
         WHEN n<=50 THEN today-3-(n%6)
         ELSE NULL::date
       END AS last_day
FROM base;

INSERT INTO student_learning_days(student_id,learning_date,qualifying_session_count)
SELECT s.student_id, s.last_day-g.offset_day, 1
FROM g7_seed_streaks s
CROSS JOIN LATERAL generate_series(0, s.run_length-1) AS g(offset_day)
WHERE s.last_day IS NOT NULL
ON CONFLICT(student_id,learning_date) DO NOTHING;

-- Match StudentStreakPolicy.awardKey(studentId, runStart, milestone)
-- so the Streak UI can correctly display awarded milestone state.
INSERT INTO xp_transactions(
  student_id,activity_session_id,source_type,source_id,
  amount,earned_at,idempotency_key,policy_version,note
)
SELECT s.student_id,NULL,'STREAK_BONUS',NULL,m.xp,
       (((s.last_day - (s.run_length-m.days))::timestamp + interval '12 hours')
          AT TIME ZONE 'Asia/Ho_Chi_Minh')
          AT TIME ZONE current_setting('TimeZone'),
       'STREAK_BONUS:' || s.student_id || ':' ||
          (s.last_day - (s.run_length-1))::text || ':' || m.days,
       'STREAK_V1','G7-SEED fixture: synthetic streak milestone'
FROM g7_seed_streaks s
CROSS JOIN (VALUES(3,10),(7,20),(14,40),(30,80)) AS m(days,xp)
WHERE s.run_length >= m.days
ON CONFLICT(idempotency_key) DO NOTHING;

-- The profile is a snapshot of the committed ledger. The current streak
-- is stored as the last run length; API effectiveStreak() makes expired runs 0.
-- Updating existing fixture profiles does not modify student_profiles.avatar_key.
INSERT INTO student_gamification_profiles(
  student_id,lifetime_xp,current_level,current_streak,longest_streak,last_qualified_date
)
SELECT s.student_id,0,1,0,0,NULL
FROM g7_seed_streaks s
ON CONFLICT(student_id) DO NOTHING;

WITH balances AS (
 SELECT s.student_id,s.run_length,s.last_day,
        COALESCE(SUM(x.amount),0)::bigint AS xp
 FROM g7_seed_streaks s
 LEFT JOIN xp_transactions x ON x.student_id=s.student_id
 GROUP BY s.student_id,s.run_length,s.last_day
), leveled AS (
 SELECT b.*,
        (SELECT MAX(lvl)
         FROM generate_series(1,100) AS lvl
         WHERE (10::bigint*(lvl-1)*(lvl+8)) <= b.xp) AS lvl
 FROM balances b
)
UPDATE student_gamification_profiles p
SET lifetime_xp = b.xp,
    current_level = b.lvl,
    current_streak = b.run_length,
    longest_streak = b.run_length,
    last_qualified_date = b.last_day,
    updated_at = CURRENT_TIMESTAMP
FROM leveled b
WHERE p.student_id=b.student_id;

COMMIT;
