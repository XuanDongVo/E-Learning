-- G7-SEED: synthetic XP for the existing 55 Grade 7 fixture students.
-- Run manually AFTER Flyway V54 and after 01_foundation.sql.
-- All timestamps are relative to the current Asia/Ho_Chi_Minh calendar.
-- This fixture contains NO fabricated ActivitySession rewards/receipts.
-- Safe to re-run ONLY while fixture students have no real activity/game attempts.
BEGIN;

DO $preflight$
BEGIN
  IF (SELECT count(*) FROM users
      WHERE email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
        AND role = 'STUDENT' AND status = 'ACTIVE') <> 55 THEN
    RAISE EXCEPTION 'G7-SEED XP requires all 55 ACTIVE Grade 7 fixture students';
  END IF;

  IF EXISTS (
    SELECT 1 FROM activity_sessions s JOIN users u ON u.id = s.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
  ) OR EXISTS (
    SELECT 1 FROM vocabulary_game_sessions s JOIN users u ON u.id = s.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
  ) THEN
    RAISE EXCEPTION 'Refusing to reseed G7 XP: fixture students have actual Activity or Vocabulary Game sessions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM xp_transactions x JOIN users u ON u.id = x.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND NOT (
        (x.source_type = 'MANUAL'
          AND x.idempotency_key LIKE 'G7-SEED:XP:%'
          AND x.note = 'G7-SEED fixture: synthetic XP')
        OR (x.source_type = 'STREAK_BONUS'
          AND x.note = 'G7-SEED fixture: synthetic streak milestone')
      )
  ) THEN
    RAISE EXCEPTION 'Refusing to reseed G7 XP: non-fixture XP ledger entries exist';
  END IF;

  IF EXISTS (
    SELECT 1 FROM student_gamification_profiles p JOIN users u ON u.id = p.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND (p.lifetime_xp > 0 OR p.current_streak > 0 OR p.longest_streak > 0)
      AND NOT EXISTS (
        SELECT 1 FROM xp_transactions x WHERE x.student_id = p.student_id
          AND x.idempotency_key LIKE 'G7-SEED:XP:%'
          AND x.note = 'G7-SEED fixture: synthetic XP'
      )
  ) THEN
    RAISE EXCEPTION 'Refusing to overwrite G7 profile progress without existing seed ledger';
  END IF;
END $preflight$;

-- Delete only our named synthetic MANUAL entries so reruns refresh Today/Week/Month.
DELETE FROM xp_transactions x USING users u
WHERE x.student_id = u.id
  AND u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
  AND x.source_type = 'MANUAL'
  AND x.idempotency_key LIKE 'G7-SEED:XP:%'
  AND x.note = 'G7-SEED fixture: synthetic XP';

WITH seed_students AS (
  SELECT u.id AS student_id,
         substring(u.email FROM 'student([0-9]+)')::int AS ordinal
  FROM users u
  WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
),
clock AS (
  SELECT CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' AS now_hcm
),
amounts AS (
  SELECT s.student_id, s.ordinal, b.bucket, b.amount, b.earned_hcm
  FROM seed_students s CROSS JOIN clock c
  CROSS JOIN LATERAL (
    VALUES
      ('TODAY',
        CASE WHEN s.ordinal <= 48 THEN 8 + ((s.ordinal * 37) % 180) ELSE 0 END,
        c.now_hcm),
      ('WEEK',
        CASE WHEN s.ordinal <= 52 THEN 20 + ((56 - s.ordinal) * 7) + ((s.ordinal * 19) % 90) ELSE 0 END,
        LEAST(c.now_hcm, date_trunc('week', c.now_hcm) + interval '12 hours')),
      ('MONTH',
        CASE WHEN s.ordinal <= 53 THEN 80 + ((s.ordinal * 47) % 410) ELSE 0 END,
        LEAST(c.now_hcm, date_trunc('month', c.now_hcm) + interval '12 hours')),
      ('HISTORY',
        CASE WHEN s.ordinal <= 50 THEN (56 - s.ordinal) * 40 + ((s.ordinal * 23) % 75) ELSE 0 END,
        date_trunc('day', c.now_hcm) - interval '45 days' + interval '12 hours')
  ) b(bucket, amount, earned_hcm)
)
INSERT INTO xp_transactions (
  student_id, activity_session_id, source_type, source_id,
  amount, earned_at, idempotency_key, policy_version, note
)
SELECT a.student_id, NULL, 'MANUAL', NULL, a.amount,
       (a.earned_hcm AT TIME ZONE 'Asia/Ho_Chi_Minh')
           AT TIME ZONE current_setting('TimeZone'),
       'G7-SEED:XP:' || lpad(a.ordinal::text, 2, '0') || ':' || a.bucket,
       'G7_SEED_V1', 'G7-SEED fixture: synthetic XP'
FROM amounts a WHERE a.amount > 0
ON CONFLICT (idempotency_key) DO NOTHING;

COMMIT;
