-- Grade 7 Assignment demo. Owns 20 Question rows; none belong to Question Banks.
-- Ten cloned basic questions + five MATCHING + five CLOZE.
-- Requires Grade 7 foundation/questions; manual execution after Flyway V52.
BEGIN;

INSERT INTO assignments(grade_id,academic_year,class_ids,name,description,status,start_at,due_at,
 time_limit_minutes,show_answers_after_submit,show_score_after_submit,show_points_per_question)
SELECT g.id,'2026-2027',
       (SELECT jsonb_agg(c.id ORDER BY c.id) FROM classes c
        WHERE c.name LIKE 'G7-SEED-7A%' AND c.academic_year='2026-2027'),
       'G7-SEED Integrated Assessment',
       'Grade 7 test assessment with all seven question types and a shared matching pool.',
       'PUBLISHED',TIMESTAMP '2026-09-01 00:00:00',TIMESTAMP '2027-07-31 23:59:00',
       30,TRUE,TRUE,TRUE
FROM grades g WHERE g.code='GRADE_7'
ON CONFLICT(grade_id,academic_year,name) DO NOTHING;

INSERT INTO assignments(grade_id,academic_year,class_ids,name,description,status,start_at,due_at,
 time_limit_minutes,show_answers_after_submit,show_score_after_submit,show_points_per_question)
SELECT g.id,'2026-2027',
       (SELECT jsonb_agg(c.id ORDER BY c.id) FROM classes c
        WHERE c.name LIKE 'G7-SEED-7A%' AND c.academic_year='2026-2027'),
       'G7-SEED Future Draft',
       'Draft-only assignment fixture; not visible to students.',
       'DRAFT',TIMESTAMP '2027-08-01 00:00:00',TIMESTAMP '2027-08-31 23:59:00',
       20,FALSE,FALSE,FALSE
FROM grades g WHERE g.code='GRADE_7'
ON CONFLICT(grade_id,academic_year,name) DO NOTHING;

CREATE TEMP TABLE g7assignment AS
SELECT a.id FROM assignments a JOIN grades g ON g.id=a.grade_id
WHERE g.code='GRADE_7' AND a.name='G7-SEED Integrated Assessment'
 AND a.academic_year='2026-2027';

-- Clone ten bank questions into independent Assignment-owned Questions.
CREATE TEMP TABLE g7basic AS
SELECT row_number() OVER(ORDER BY q.id)::integer AS ordinal,q.id AS source_id,
 q.type,q.difficulty,q.content,q.explanation,q.hint,q.matching_mode
FROM questions q JOIN content_questions cq ON cq.question_id=q.id
WHERE q.content LIKE '[G7-SEED %'
ORDER BY q.id LIMIT 10;

INSERT INTO questions(type,difficulty,content,explanation,hint,is_complete,matching_mode,content_revision)
SELECT b.type,b.difficulty,'[G7-SEED ASSIGN BASIC '||lpad(b.ordinal::text,2,'0')||'] '||b.content,
 b.explanation,b.hint,TRUE,b.matching_mode,1
FROM g7basic b
WHERE NOT EXISTS(SELECT 1 FROM questions q
 WHERE q.content='[G7-SEED ASSIGN BASIC '||lpad(b.ordinal::text,2,'0')||'] '||b.content);

INSERT INTO question_options(question_id,option_key,content,is_correct,display_order)
SELECT target.id,source.option_key,source.content,source.is_correct,source.display_order
FROM g7basic b
JOIN questions target ON target.content='[G7-SEED ASSIGN BASIC '||lpad(b.ordinal::text,2,'0')||'] '||b.content
JOIN question_options source ON source.question_id=b.source_id
ON CONFLICT(question_id,option_key) DO NOTHING;

INSERT INTO question_answers(question_id,raw_value,normalized_value)
SELECT target.id,source.raw_value,source.normalized_value
FROM g7basic b
JOIN questions target ON target.content='[G7-SEED ASSIGN BASIC '||lpad(b.ordinal::text,2,'0')||'] '||b.content
JOIN question_answers source ON source.question_id=b.source_id
WHERE NOT EXISTS(SELECT 1 FROM question_answers qa
 WHERE qa.question_id=target.id AND qa.raw_value=source.raw_value);

-- Matching: each Question selects one stable ID from a shared POOL (A-E).
CREATE TEMP TABLE g7words(ordinal int,word text,description text) ON COMMIT DROP;
INSERT INTO g7words VALUES
 (1,'hobby','an activity you enjoy in your free time'),
 (2,'vegetable','a plant eaten as food'),
 (3,'volunteer','a person who helps without being paid'),
 (4,'museum','a place where objects of art or history are displayed'),
 (5,'helmet','a protective covering worn on the head');

INSERT INTO questions(type,difficulty,content,explanation,hint,definition,is_complete,matching_mode,content_revision)
SELECT 'MATCHING','MEDIUM','[G7-SEED ASSIGN MATCH '||w.ordinal||'] Choose the definition for "'||w.word||'".',
 'Match the word to the corresponding definition in the shared Answer Pool.',NULL,
 jsonb_build_object('matching',jsonb_build_object('poolId','g7-seed-vocab-pool',
     'correctEntryId',chr(64+w.ordinal)))::text,TRUE,'CASE_INSENSITIVE_TRIM',1
FROM g7words w
WHERE NOT EXISTS(SELECT 1 FROM questions q
 WHERE q.content='[G7-SEED ASSIGN MATCH '||w.ordinal||'] Choose the definition for "'||w.word||'".');

-- Cloze: two blanks per Question with stable keys and two segments + final segment.
INSERT INTO questions(type,difficulty,content,explanation,hint,definition,is_complete,matching_mode,content_revision)
SELECT 'CLOZE','HARD','[G7-SEED ASSIGN CLOZE '||n||'] Complete both missing words in the text.',
 'Present Simple vocabulary and subject agreement.',NULL,
 jsonb_build_object('cloze',
  jsonb_build_object('caseSensitive',false,
    'segments',jsonb_build_array(jsonb_build_object('text','Mai '),jsonb_build_object('text',' a book and '),jsonb_build_object('text',' English every day.')),
    'blanks',jsonb_build_array(jsonb_build_object('key','b1','acceptedAnswers',jsonb_build_array('reads')),
                               jsonb_build_object('key','b2','acceptedAnswers',jsonb_build_array('studies')))))::text,
 TRUE,'CASE_INSENSITIVE_TRIM',1
FROM generate_series(1,5) n
WHERE NOT EXISTS(SELECT 1 FROM questions q WHERE q.content='[G7-SEED ASSIGN CLOZE '||n||'] Complete both missing words in the text.');

-- The additional questions remain Assignment-owned, never Question Bank-owned.
INSERT INTO assignment_questions(question_id,assignment_id)
SELECT q.id,(SELECT id FROM g7assignment)
FROM questions q
WHERE q.content LIKE '[G7-SEED ASSIGN %'
ON CONFLICT(question_id) DO NOTHING;

INSERT INTO assignment_sections(assignment_id,position,title,instructions,title_vi,instructions_vi)
SELECT ga.id,1,'Part 1: Core Questions','Answer all ten basic questions.',
 'Phần 1: Câu hỏi cơ bản','Trả lời 10 câu hỏi cơ bản.'
FROM g7assignment ga
ON CONFLICT(assignment_id,position) DO NOTHING;

INSERT INTO assignment_sections(assignment_id,position,title,instructions,title_vi,instructions_vi)
SELECT ga.id,2,'Part 2: Matching and Cloze','Use the shared pool then complete each cloze passage.',
 'Phần 2: Ghép cặp và điền đoạn văn','Chọn từ nhóm đáp án và điền vào đoạn văn.'
FROM g7assignment ga
ON CONFLICT(assignment_id,position) DO NOTHING;

-- First section: ten scoreable questions; position is deterministic.
INSERT INTO assignment_items(assignment_id,section_id,position,item_type,question_id,possible_points,is_required,is_example)
SELECT ga.id,s.id,b.ordinal,'QUESTION',q.id,1,TRUE,FALSE
FROM g7basic b CROSS JOIN g7assignment ga
JOIN assignment_sections s ON s.assignment_id=ga.id AND s.position=1
JOIN questions q ON q.content='[G7-SEED ASSIGN BASIC '||lpad(b.ordinal::text,2,'0')||'] '||b.content
WHERE NOT EXISTS(SELECT 1 FROM assignment_items ai WHERE ai.assignment_id=ga.id AND ai.question_id=q.id);

-- Second section: one shared POOL with five MATCHING children.
INSERT INTO assignment_items(assignment_id,section_id,position,item_type,question_id,possible_points,is_required,is_example,block_payload)
SELECT ga.id,s.id,1,'POOL',NULL,0,TRUE,FALSE,
 jsonb_build_object('title','Grade 7 Definition Pool','poolKey','g7-seed-vocab-pool',
  'entries',(SELECT jsonb_agg(jsonb_build_object('id',chr(64+w.ordinal),'text',w.description)
                              ORDER BY w.ordinal) FROM g7words w))
FROM g7assignment ga JOIN assignment_sections s ON s.assignment_id=ga.id AND s.position=2
WHERE NOT EXISTS(SELECT 1 FROM assignment_items i
 WHERE i.section_id=s.id AND i.position=1 AND i.parent_item_id IS NULL);

INSERT INTO assignment_items(assignment_id,section_id,parent_item_id,position,item_type,
 question_id,possible_points,is_required,is_example)
SELECT ga.id,s.id,p.id,w.ordinal,'QUESTION',q.id,1,TRUE,FALSE
FROM g7words w CROSS JOIN g7assignment ga
JOIN assignment_sections s ON s.assignment_id=ga.id AND s.position=2
JOIN assignment_items p ON p.section_id=s.id AND p.position=1 AND p.parent_item_id IS NULL AND p.item_type='POOL'
JOIN questions q ON q.content='[G7-SEED ASSIGN MATCH '||w.ordinal||'] Choose the definition for "'||w.word||'".'
WHERE NOT EXISTS(SELECT 1 FROM assignment_items i WHERE i.assignment_id=ga.id AND i.question_id=q.id);

-- Cloze questions are standalone items after the shared POOL.
INSERT INTO assignment_items(assignment_id,section_id,position,item_type,question_id,possible_points,is_required,is_example)
SELECT ga.id,s.id,n+1,'QUESTION',q.id,2,TRUE,FALSE
FROM generate_series(1,5) n CROSS JOIN g7assignment ga
JOIN assignment_sections s ON s.assignment_id=ga.id AND s.position=2
JOIN questions q ON q.content='[G7-SEED ASSIGN CLOZE '||n||'] Complete both missing words in the text.'
WHERE NOT EXISTS(SELECT 1 FROM assignment_items i WHERE i.assignment_id=ga.id AND i.question_id=q.id);

DO $verify$
DECLARE
 total integer;
 types integer;
 compound_in_bank integer;
BEGIN
 SELECT COUNT(*) INTO total FROM assignment_questions aq JOIN g7assignment ga ON ga.id=aq.assignment_id;
 SELECT COUNT(DISTINCT q.type) INTO types FROM assignment_questions aq
 JOIN g7assignment ga ON ga.id=aq.assignment_id JOIN questions q ON q.id=aq.question_id;
 SELECT COUNT(*) INTO compound_in_bank FROM content_questions cq JOIN questions q ON q.id=cq.question_id
 WHERE q.content LIKE '[G7-SEED %' AND q.type IN ('MATCHING','CLOZE');
 IF total<>20 OR types<>7 OR compound_in_bank<>0 THEN
   RAISE EXCEPTION 'Assignment fixture mismatch: questions %, types %, compound in banks %',
      total,types,compound_in_bank;
 END IF;
 IF (SELECT count(*) FROM assignment_items i JOIN g7assignment ga ON ga.id=i.assignment_id
     WHERE i.item_type='QUESTION')<>20 THEN
   RAISE EXCEPTION 'Expected 20 scored Assignment items';
 END IF;
END $verify$;
COMMIT;
