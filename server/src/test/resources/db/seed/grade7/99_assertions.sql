-- Run after 00_reset_legacy_demo.sql, 01_foundation.sql,
-- 02_questions.sql, 03_activities.sql and 04_assignments.sql.
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
