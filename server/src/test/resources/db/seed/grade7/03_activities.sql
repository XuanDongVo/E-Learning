-- Grade 7: 20 published Activities, ALL support both Learning and Try Hard.
-- Try Hard: 20 seconds PER QUESTION, 3 lives. No MATCHING/CLOZE in bank sources.
-- Requires 01_foundation.sql and 02_questions.sql. PostgreSQL / Flyway V52+.
BEGIN;
CREATE TEMP TABLE g7activity(unit_code text,name text,display_order integer,difficulty text,total_questions integer,distribution_mode text) ON COMMIT DROP;
INSERT INTO g7activity VALUES
 ('G7-SEED-U01','G7-SEED EASY 01',1,'EASY',5,'FIXED_COUNT'),
 ('G7-SEED-U01','G7-SEED MEDIUM 01',2,'MEDIUM',5,'FIXED_COUNT'),
 ('G7-SEED-U01','G7-SEED HARD 01',3,'HARD',5,'FIXED_COUNT'),
 ('G7-SEED-U01','G7-SEED MIXED 01',4,'MIXED',8,'EQUAL'),
 ('G7-SEED-U02','G7-SEED EASY 02',1,'EASY',5,'FIXED_COUNT'),
 ('G7-SEED-U02','G7-SEED MEDIUM 02',2,'MEDIUM',5,'FIXED_COUNT'),
 ('G7-SEED-U02','G7-SEED HARD 02',3,'HARD',5,'FIXED_COUNT'),
 ('G7-SEED-U02','G7-SEED MIXED 02',4,'MIXED',8,'EQUAL'),
 ('G7-SEED-U03','G7-SEED EASY 03',1,'EASY',5,'FIXED_COUNT'),
 ('G7-SEED-U03','G7-SEED MEDIUM 03',2,'MEDIUM',5,'FIXED_COUNT'),
 ('G7-SEED-U03','G7-SEED MIXED 03',3,'MIXED',8,'EQUAL'),
 ('G7-SEED-U04','G7-SEED EASY 04',1,'EASY',5,'FIXED_COUNT'),
 ('G7-SEED-U04','G7-SEED HARD 04',2,'HARD',5,'FIXED_COUNT'),
 ('G7-SEED-U04','G7-SEED MIXED 04',3,'MIXED',8,'EQUAL'),
 ('G7-SEED-U05','G7-SEED MEDIUM 05',1,'MEDIUM',5,'FIXED_COUNT'),
 ('G7-SEED-U05','G7-SEED HARD 05',2,'HARD',5,'FIXED_COUNT'),
 ('G7-SEED-U05','G7-SEED MIXED 05',3,'MIXED',8,'EQUAL'),
 ('G7-SEED-U06','G7-SEED EASY 06',1,'EASY',5,'FIXED_COUNT'),
 ('G7-SEED-U06','G7-SEED HARD 06',2,'HARD',5,'FIXED_COUNT'),
 ('G7-SEED-U06','G7-SEED MIXED 06',3,'MIXED',8,'EQUAL');

INSERT INTO activities(unit_id,name,description,display_order,status,distribution_mode,total_questions,mode,time_limit_seconds,lives,question_difficulty,published_at)
SELECT u.id,s.name,'Grade 7 ' || s.difficulty || ' practice. Choose Learning or Try Hard.',
 s.display_order,'PUBLISHED',s.distribution_mode,s.total_questions,'BOTH',20,3,s.difficulty,CURRENT_TIMESTAMP
FROM g7activity s JOIN content_units u ON u.code=s.unit_code
ON CONFLICT(unit_id,name) DO UPDATE SET
 description=EXCLUDED.description,display_order=EXCLUDED.display_order,
 status='PUBLISHED',distribution_mode=EXCLUDED.distribution_mode,total_questions=EXCLUDED.total_questions,
 mode='BOTH',time_limit_seconds=20,lives=3,question_difficulty=EXCLUDED.question_difficulty;

-- RANDOM is supported by the current selection implementation. Do not claim
-- WEAKNESS_PRIORITY until the actual algorithm has been implemented.
INSERT INTO activity_selection_strategies(activity_id,selection_strategy)
SELECT a.id,'RANDOM' FROM g7activity s
JOIN content_units u ON u.code=s.unit_code
JOIN activities a ON a.unit_id=u.id AND a.name=s.name
ON CONFLICT(activity_id,selection_strategy) DO NOTHING;

-- Single-bank difficulty Activities use 5 Questions, 2-bank MIXED use 4+4.
-- FIXED_COUNT 5 from A; EQUAL 4 from each bank.
INSERT INTO activity_banks(activity_id,question_bank_id,display_order,percentage,fixed_count)
SELECT a.id,qb.id,CASE WHEN qb.name='G7-SEED Bank A' THEN 0 ELSE 1 END,
       NULL,CASE WHEN s.difficulty='MIXED' THEN NULL ELSE 5 END
FROM g7activity s
JOIN content_units u ON u.code=s.unit_code
JOIN activities a ON a.unit_id=u.id AND a.name=s.name
JOIN content_sections cs ON cs.unit_id=u.id AND cs.name='Vocabulary'
JOIN content_topics t ON t.section_id=cs.id AND t.name='G7-SEED Core Practice'
JOIN content_question_banks qb ON qb.topic_id=t.id
 AND (qb.name='G7-SEED Bank A' OR (s.difficulty='MIXED' AND qb.name='G7-SEED Bank B'))
ON CONFLICT(activity_id,question_bank_id) DO UPDATE
 SET display_order=EXCLUDED.display_order,percentage=NULL,fixed_count=EXCLUDED.fixed_count;

DO $verify$
DECLARE n integer;
BEGIN
 SELECT COUNT(*) INTO n FROM activities a JOIN content_units u ON u.id=a.unit_id
 WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %';
 IF n <> 20 THEN RAISE EXCEPTION 'Expected 20 seeded Activities, found %',n; END IF;
 IF EXISTS(
   SELECT 1 FROM activities a JOIN content_units u ON u.id=a.unit_id
   WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %'
     AND (a.mode<>'BOTH' OR a.time_limit_seconds<>20 OR a.lives<>3 OR a.status<>'PUBLISHED')
 ) THEN RAISE EXCEPTION 'Grade 7 Activity mode/timer/lives configuration invalid'; END IF;
 IF EXISTS(
   SELECT 1 FROM activities a
   JOIN content_units u ON u.id=a.unit_id
   JOIN activity_banks ab ON ab.activity_id=a.id
   JOIN content_questions cq ON cq.question_bank_id=ab.question_bank_id
   JOIN questions q ON q.id=cq.question_id
   WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %'
     AND q.type IN ('MATCHING','CLOZE')
 ) THEN RAISE EXCEPTION 'Compound questions are not allowed in Grade 7 Activities'; END IF;
 -- Verify every published Activity can select enough COMPLETE questions
 -- at the configured difficulty from every source bank.
 IF EXISTS(
   SELECT 1 FROM activities a
   JOIN content_units u ON u.id=a.unit_id
   JOIN activity_banks ab ON ab.activity_id=a.id
   WHERE u.code LIKE 'G7-SEED-U%' AND a.name LIKE 'G7-SEED %'
     AND (SELECT count(*) FROM content_questions cq JOIN questions q ON q.id=cq.question_id
          WHERE cq.question_bank_id=ab.question_bank_id AND q.is_complete
            AND q.type IN ('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','FILL_IN_BLANK','TYPE_ANSWER')
            AND (a.question_difficulty='MIXED' OR q.difficulty=a.question_difficulty)
         ) < CASE WHEN a.question_difficulty='MIXED' THEN 4 ELSE 5 END
 ) THEN RAISE EXCEPTION 'Activity source lacks enough complete questions for its difficulty'; END IF;
END $verify$;
COMMIT;
