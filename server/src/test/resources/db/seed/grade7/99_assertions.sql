-- Run after 01_foundation.sql, 02_questions.sql, 03_activities.sql,
-- 04_assignments.sql, 05_gamification_xp.sql, 06_streak_history.sql and 07_vocabulary.sql.
-- Failure raises an exception; read-only checks should not mutate data.
DO $assert$
DECLARE n INTEGER;
BEGIN
 SELECT count(*) INTO n FROM grades WHERE code IN ('GRADE_6','GRADE_7','GRADE_8','GRADE_9');
 IF n<>4 THEN RAISE EXCEPTION 'Four Grade records required, found %',n; END IF;

 SELECT count(*) INTO n FROM content_units u JOIN grades g ON g.id=u.grade_id
 WHERE g.code='GRADE_7' AND u.code LIKE 'G7-SEED-U%';
 IF n<>6 THEN RAISE EXCEPTION 'Expected 6 Grade 7 seed Units, found %',n; END IF;

 IF EXISTS(SELECT 1 FROM content_units u JOIN grades g ON g.id=u.grade_id
           WHERE g.code IN ('GRADE_6','GRADE_8','GRADE_9')) THEN
   RAISE EXCEPTION 'Non-Grade-7 Unit content remains in database';
 END IF;

 SELECT count(*) INTO n FROM content_question_banks b
 JOIN content_topics t ON t.id=b.topic_id JOIN content_sections s ON s.id=t.section_id
 JOIN content_units u ON u.id=s.unit_id
 WHERE u.code LIKE 'G7-SEED-U%';
 IF n<>12 THEN RAISE EXCEPTION 'Expected 12 Grade 7 banks, found %',n; END IF;

 SELECT count(*) INTO n FROM content_questions cq
 JOIN questions q ON q.id=cq.question_id
 JOIN content_question_banks b ON b.id=cq.question_bank_id
 JOIN content_topics t ON t.id=b.topic_id JOIN content_sections s ON s.id=t.section_id
 JOIN content_units u ON u.id=s.unit_id
 WHERE u.code LIKE 'G7-SEED-U%';
 IF n<>200 THEN RAISE EXCEPTION 'Expected 200 bank questions, found %',n; END IF;

 IF EXISTS(SELECT 1 FROM content_questions cq
 JOIN questions q ON q.id=cq.question_id WHERE q.type IN ('MATCHING','CLOZE')) THEN
   RAISE EXCEPTION 'Matching/Cloze found in a Question Bank';
 END IF;

 IF EXISTS(
   SELECT 1 FROM questions q JOIN content_questions cq ON cq.question_id=q.id
   WHERE q.content LIKE '[G7-SEED %'
     AND (q.type IN ('SINGLE_CHOICE','MULTIPLE_CHOICE') AND
       (SELECT COUNT(*) FROM question_options qo WHERE qo.question_id=q.id AND qo.is_correct)=0
      OR q.type IN ('TRUE_FALSE','FILL_IN_BLANK','TYPE_ANSWER') AND
       (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id=q.id)=0)
 ) THEN RAISE EXCEPTION 'Seed Question lacks an answer key'; END IF;

 IF EXISTS(
   SELECT 1 FROM (
    SELECT q.type,COUNT(*) n FROM content_questions cq
    JOIN questions q ON q.id=cq.question_id
    WHERE q.content LIKE '[G7-SEED %' GROUP BY q.type
   ) x WHERE x.n<>40
 ) THEN RAISE EXCEPTION 'Expected exactly 40 questions per supported bank type'; END IF;

 SELECT count(*) INTO n FROM activities a JOIN content_units u ON u.id=a.unit_id
 WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %';
 IF n<>20 THEN RAISE EXCEPTION 'Expected 20 seeded Activities, found %',n; END IF;

 IF EXISTS(
   SELECT 1 FROM activities a JOIN content_units u ON u.id=a.unit_id
   WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %'
   AND (a.mode<>'BOTH' OR a.time_limit_seconds<>20 OR a.lives<>3
     OR a.status<>'PUBLISHED')
 ) THEN RAISE EXCEPTION 'Activity settings mismatch'; END IF;

 IF EXISTS (
  SELECT 1 FROM activities a JOIN content_units u ON u.id=a.unit_id
  LEFT JOIN activity_selection_strategies st ON st.activity_id=a.id AND st.selection_strategy='RANDOM'
  WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %' AND st.activity_id IS NULL
 ) THEN RAISE EXCEPTION 'Activity RANDOM strategy missing'; END IF;

 SELECT count(*) INTO n FROM users WHERE email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$';
 IF n<>55 THEN RAISE EXCEPTION 'Expected 55 Grade 7 active fixture student accounts, found %',n; END IF;

 IF EXISTS (
   SELECT 1 FROM users u
   WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
   AND (SELECT count(*) FROM class_members cm
        JOIN classes c ON c.id=cm.class_id
        JOIN grades g ON g.id=c.grade_id
        WHERE cm.user_id=u.id AND cm.status='ACTIVE' AND g.code='GRADE_7')<>1
 ) THEN RAISE EXCEPTION 'Fixture student not in exactly one active Grade 7 class'; END IF;

 SELECT count(*) INTO n FROM assignment_questions aq
 JOIN assignments a ON a.id=aq.assignment_id
 WHERE a.name='G7-SEED Integrated Assessment';
 IF n<>20 THEN RAISE EXCEPTION 'Expected 20 Grade 7 Assignment-owned questions, found %',n; END IF;

 IF (SELECT count(DISTINCT q.type) FROM assignment_questions aq
 JOIN questions q ON q.id=aq.question_id
 JOIN assignments a ON a.id=aq.assignment_id
 WHERE a.name='G7-SEED Integrated Assessment')<>7 THEN
   RAISE EXCEPTION 'Assignment must cover all seven question types';
 END IF;

 IF EXISTS(SELECT 1 FROM content_questions cq JOIN questions q ON q.id=cq.question_id
           WHERE q.content LIKE '[G7-SEED ASSIGN %') THEN
    RAISE EXCEPTION 'Assignment-owned question linked to a bank';
 END IF;
END $assert$;

-- Optional report for manual verification.
SELECT 'units_grade7' AS metric,count(*) AS value FROM content_units WHERE code LIKE 'G7-SEED-U%'
UNION ALL
SELECT 'questions_bank_grade7',count(*) FROM content_questions cq JOIN questions q ON q.id=cq.question_id
 WHERE q.content LIKE '[G7-SEED %'
UNION ALL
SELECT 'activities_grade7',count(*) FROM activities a JOIN content_units u ON u.id=a.unit_id
 WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %'
UNION ALL
SELECT 'assignment_questions',count(*) FROM assignment_questions aq JOIN assignments a ON a.id=aq.assignment_id
 WHERE a.name='G7-SEED Integrated Assessment';


-- Additional post-V54 checks for optional Grade 7 gamification/vocabulary fixtures.
-- Execute only after 05, 06 and 07 have all completed.
DO $g7_game_assert$
DECLARE
  n integer;
  hcm_day date := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  SELECT COUNT(*) INTO n FROM student_gamification_profiles p JOIN users u ON u.id=p.student_id
  WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$';
  IF n<>55 THEN RAISE EXCEPTION 'Expected 55 Grade 7 gamification profiles; got %',n; END IF;

  IF EXISTS (
    SELECT 1 FROM student_gamification_profiles p
    JOIN users u ON u.id=p.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND p.lifetime_xp <> COALESCE(
        (SELECT SUM(x.amount) FROM xp_transactions x WHERE x.student_id=p.student_id),0)
  ) THEN RAISE EXCEPTION 'Grade 7 XP profile/transaction ledger mismatch'; END IF;

  IF EXISTS (
    SELECT 1 FROM student_gamification_profiles p JOIN users u ON u.id=p.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND p.current_level <> (
        SELECT MAX(lvl) FROM generate_series(1,100) AS lvl
        WHERE 10::bigint*(lvl-1)*(lvl+8) <= p.lifetime_xp
      )
  ) THEN RAISE EXCEPTION 'Grade 7 Level calculation mismatch'; END IF;

  IF EXISTS (
    SELECT 1 FROM student_gamification_profiles p JOIN users u ON u.id=p.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND (
        p.longest_streak < p.current_streak
        OR p.current_streak <> (
          SELECT count(*)::integer FROM student_learning_days d WHERE d.student_id=p.student_id
        )
        OR (p.last_qualified_date IS DISTINCT FROM (
          SELECT max(d.learning_date) FROM student_learning_days d WHERE d.student_id=p.student_id
        ))
      )
  ) THEN RAISE EXCEPTION 'Grade 7 Streak profile/day mismatch'; END IF;

  SELECT COUNT(*) INTO n FROM student_gamification_profiles p JOIN users u ON u.id=p.student_id
  WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
    AND p.current_streak > 0 AND p.last_qualified_date < hcm_day-1;
  IF n<>10 THEN RAISE EXCEPTION 'Expected 10 expired Streak fixtures; got %',n; END IF;

  SELECT COUNT(*) INTO n FROM student_gamification_profiles p JOIN users u ON u.id=p.student_id
  WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
    AND p.current_streak=0;
  IF n<>5 THEN RAISE EXCEPTION 'Expected 5 never-qualified Streak fixtures; got %',n; END IF;

  IF EXISTS (
    SELECT 1 FROM xp_transactions x JOIN users u ON u.id=x.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
      AND x.source_type='STREAK_BONUS' AND x.note='G7-SEED fixture: synthetic streak milestone'
      AND NOT EXISTS (
        SELECT 1 FROM student_learning_days d
        WHERE d.student_id=x.student_id
      )
  ) THEN RAISE EXCEPTION 'Streak milestone without learning days'; END IF;

  SELECT COUNT(*) INTO n
  FROM vocabulary_words v JOIN content_units cu ON cu.id=v.unit_id
  WHERE cu.code LIKE 'G7-SEED-U%';
  IF n<>120 THEN RAISE EXCEPTION 'Expected exactly 120 Grade 7 vocabulary words; got %',n; END IF;

  IF EXISTS (
    SELECT 1 FROM content_units cu
    WHERE cu.code LIKE 'G7-SEED-U%'
      AND (SELECT COUNT(*) FROM vocabulary_words v
           WHERE v.unit_id=cu.id AND v.status='ACTIVE')<>20
  ) THEN RAISE EXCEPTION 'Expected 20 ACTIVE vocabulary words per Grade 7 unit'; END IF;

  IF EXISTS (
    SELECT 1 FROM vocabulary_words v JOIN content_units cu ON cu.id=v.unit_id
    WHERE cu.code LIKE 'G7-SEED-U%'
    GROUP BY v.unit_id,lower(v.word) HAVING COUNT(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate Grade 7 vocabulary word within unit'; END IF;

  IF EXISTS (
    SELECT 1 FROM xp_transactions x JOIN users u ON u.id=x.student_id
    WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
    GROUP BY x.idempotency_key HAVING COUNT(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate fixture idempotency key'; END IF;
END $g7_game_assert$;

SELECT 'g7_gamification_profiles' AS metric,COUNT(*) AS value FROM student_gamification_profiles p
JOIN users u ON u.id=p.student_id
WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
UNION ALL
SELECT 'g7_xp_transactions',COUNT(*) FROM xp_transactions x JOIN users u ON u.id=x.student_id
WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
UNION ALL
SELECT 'g7_learning_days',COUNT(*) FROM student_learning_days d JOIN users u ON u.id=d.student_id
WHERE u.email ~ '^g7[.]seed[.]student[0-9]{2}@example[.]test$'
UNION ALL
SELECT 'g7_vocabulary',COUNT(*) FROM vocabulary_words v JOIN content_units cu ON cu.id=v.unit_id
WHERE cu.code LIKE 'G7-SEED-U%';
