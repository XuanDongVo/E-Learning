-- Grade 6 all-question-types + shared-content integration seed.
-- Target: PostgreSQL after Flyway V38.
-- Run manually in a disposable/test database with psql:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f server/src/test/resources/db/seed/grade6_all_question_types_assignment.sql
-- Idempotent by (grade_level, academic_year, name). This REPLACES the seed-owned content of this named assignment.
-- The generated classroom image is a placeholder assetId; replace it with an uploaded media asset before student-facing use.
-- Current schema limitation notes are at the end of this file.

BEGIN;

CREATE TEMP TABLE seed_assignment ON COMMIT DROP AS
WITH upserted AS (
    INSERT INTO assignments
        (grade_level, academic_year, name, description, status, start_at, due_at,
         time_limit_seconds, show_answers_after_submit, show_score_after_submit,
         show_points_per_question, created_at, updated_at)
    VALUES
        (6, '2026-2027', 'Mid-term Vocabulary Check — All Question Types',
         'Grade 6 integration seed covering all seven question types and shared Assignment content blocks.',
         'DRAFT', NULL, TIMESTAMP '2027-01-31 23:59:00',
         2700, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (grade_level, academic_year, name)
    DO UPDATE SET
        description = EXCLUDED.description,
        status = 'DRAFT',
        start_at = EXCLUDED.start_at,
        due_at = EXCLUDED.due_at,
        time_limit_seconds = EXCLUDED.time_limit_seconds,
        show_answers_after_submit = EXCLUDED.show_answers_after_submit,
        show_score_after_submit = EXCLUDED.show_score_after_submit,
        show_points_per_question = EXCLUDED.show_points_per_question,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id
)
SELECT id FROM upserted;

-- Save and remove the previous contents of this seed assignment only.
CREATE TEMP TABLE seed_old_question_ids ON COMMIT DROP AS
SELECT aq.question_id
FROM assignment_questions aq
JOIN seed_assignment sa ON sa.id = aq.assignment_id;

DELETE FROM assignment_items
WHERE assignment_id = (SELECT id FROM seed_assignment);

DELETE FROM assignment_questions
WHERE assignment_id = (SELECT id FROM seed_assignment);

-- Do not delete a shared question if it is also referenced by a content question bank.
DELETE FROM questions q
USING seed_old_question_ids old
WHERE q.id = old.question_id
  AND NOT EXISTS (SELECT 1 FROM content_questions cq WHERE cq.question_id = q.id);

DELETE FROM assignment_targets
WHERE assignment_id = (SELECT id FROM seed_assignment);

INSERT INTO assignment_targets (assignment_id, target_type, class_id)
SELECT id, 'GRADE', NULL FROM seed_assignment;

CREATE TEMP TABLE seed_question_data (
    seed_key TEXT PRIMARY KEY,
    question_type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    hint TEXT,
    matching_mode VARCHAR(30) NOT NULL DEFAULT 'CASE_INSENSITIVE_TRIM',
    definition JSONB,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    complete BOOLEAN NOT NULL DEFAULT TRUE
) ON COMMIT DROP;

INSERT INTO seed_question_data
(seed_key, question_type, difficulty, content, explanation, hint, matching_mode, definition, options, answers, complete)
VALUES
('example_sc', 'SINGLE_CHOICE', 'EASY',
 'Example (not scored): Which word means “a place where students learn”?',
 'School is the place where students learn.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL,
 '[{"content":"school","isCorrect":true},{"content":"kitchen","isCorrect":false},{"content":"hospital","isCorrect":false},{"content":"station","isCorrect":false}]',
 '[]', TRUE),

('gap_fib', 'FILL_IN_BLANK', 'EASY',
 'Complete the sentence: We borrow books from the school ____.',
 'A library is a place where people can borrow books.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"library"}]', TRUE),

('pronunciation', 'TYPE_ANSWER', 'MEDIUM',
 'Pronunciation: In the word “fi̲sh̲”, the underlined letters “sh” make which sound? Type the two-letter spelling.',
 'The letters sh represent the /ʃ/ sound.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"sh"}]', TRUE),

('tf_vocab_1', 'TRUE_FALSE', 'EASY',
 'A “subject” is something students study at school.',
 'True. English, Maths and Science are school subjects.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"TRUE"}]', TRUE),

('tf_vocab_2', 'TRUE_FALSE', 'EASY',
 'A “library” is a place where students usually cook lunch.',
 'False. A library is for reading and borrowing books.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"FALSE"}]', TRUE),

('mc_multi_1', 'MULTIPLE_CHOICE', 'MEDIUM',
 'Choose TWO places you may find in a school.',
 'A library and a laboratory are places in a school.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL,
 '[{"content":"library","isCorrect":true},{"content":"laboratory","isCorrect":true},{"content":"waterfall","isCorrect":false},{"content":"desert","isCorrect":false}]',
 '[]', TRUE),

('mc_multi_2', 'MULTIPLE_CHOICE', 'MEDIUM',
 'Choose TWO things you should bring to an English lesson.',
 'A notebook and a dictionary can help you learn English.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL,
 '[{"content":"notebook","isCorrect":true},{"content":"dictionary","isCorrect":true},{"content":"pillow","isCorrect":false},{"content":"frying pan","isCorrect":false}]',
 '[]', TRUE),

('hint_play', 'TYPE_ANSWER', 'EASY',
 'Complete the sentence: I often ____ football after school.',
 'The verb is “play”.',
 '(play)', 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"play"}]', TRUE),

('rewrite_nam', 'TYPE_ANSWER', 'MEDIUM',
 'Rewrite the sentence beginning with: “→ Nam''s favourite subject …” Original: Nam likes English best.',
 'Nam''s favourite subject is English.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"Nam''s favourite subject is English"},{"rawValue":"Nam’s favourite subject is English"}]', TRUE),

('three_blanks', 'CLOZE', 'MEDIUM',
 'Complete all three gaps: My name ___ Mai. I ___ in Grade 6. I ___ English.',
 'The answers are is, am, and like.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"cloze":{"caseSensitive":false,"segments":[{"text":"My name "},{"text":" Mai. I "},{"text":" in Grade 6. I "},{"text":" English."}],"blanks":[{"key":"b1","acceptedAnswers":["is"]},{"key":"b2","acceptedAnswers":["am"]},{"key":"b3","acceptedAnswers":["like"]}]}}'::jsonb,
 '[]', '[]', TRUE),

('free_writing', 'TYPE_ANSWER', 'MEDIUM',
 'Free writing (teacher marks by hand): Write 4–5 sentences about your favourite school subject and explain why you like it.',
 'Teacher-marked writing is not supported by the current automatic question-scoring model; this is an incomplete draft placeholder.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]', '[]', FALSE),

('notice_tf_1', 'TRUE_FALSE', 'EASY',
 'Library notice: Students may borrow two books at a time. Statement: Students may borrow two books at a time.',
 'True, according to the shared library notice.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]', '[{"rawValue":"TRUE"}]', TRUE),

('notice_tf_2', 'TRUE_FALSE', 'EASY',
 'Library notice: The library is open from 8:00 a.m. to 4:00 p.m. Statement: The library closes at 2:00 p.m.',
 'False. The notice says the library closes at 4:00 p.m.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]', '[{"rawValue":"FALSE"}]', TRUE),

('notice_tf_3', 'TRUE_FALSE', 'EASY',
 'Library notice: Return books by Friday. Statement: Students should return books by Friday.',
 'True, according to the shared library notice.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]', '[{"rawValue":"TRUE"}]', TRUE),

('image_sc', 'SINGLE_CHOICE', 'EASY',
 'Look at the shared classroom picture. Which object is used to write on the board?',
 'A marker is used to write on a whiteboard.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL,
 '[{"content":"marker","isCorrect":true},{"content":"pillow","isCorrect":false},{"content":"spoon","isCorrect":false},{"content":"toothbrush","isCorrect":false}]',
 '[]', TRUE),

('image_mc', 'MULTIPLE_CHOICE', 'MEDIUM',
 'Look at the shared classroom picture. Choose TWO objects students can use for writing.',
 'A pencil and a pen are used for writing.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL,
 '[{"content":"pencil","isCorrect":true},{"content":"pen","isCorrect":true},{"content":"plate","isCorrect":false},{"content":"suitcase","isCorrect":false}]',
 '[]', TRUE),

('image_type', 'TYPE_ANSWER', 'EASY',
 'Look at the shared classroom picture. What do students sit on? Type one word.',
 'Students sit on chairs.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]', '[{"rawValue":"chairs"},{"rawValue":"chair"}]', TRUE),

('reading_sc', 'SINGLE_CHOICE', 'EASY',
 'Reading: “Mai''s New School”. What is the name of Mai''s new school? Passage: Mai is happy at Greenfield School. Her classroom is bright, and her new friends are kind.',
 'The passage says her school is Greenfield School.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL,
 '[{"content":"Greenfield School","isCorrect":true},{"content":"River School","isCorrect":false},{"content":"Hill School","isCorrect":false},{"content":"Sun School","isCorrect":false}]',
 '[]', TRUE),

('reading_tf', 'TRUE_FALSE', 'EASY',
 'Reading: “Mai''s New School”. Statement: Mai''s classroom is bright.',
 'True. The passage says the classroom is bright.',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]', '[{"rawValue":"TRUE"}]', TRUE),

('reading_type', 'TYPE_ANSWER', 'MEDIUM',
 'Reading: “Mai''s New School”. Why is Mai happy? Answer with a short phrase based on the passage.',
 'She has kind new friends (and a bright classroom).',
 NULL, 'CASE_INSENSITIVE_TRIM', NULL, '[]',
 '[{"rawValue":"her new friends are kind"},{"rawValue":"she has kind new friends"},{"rawValue":"her classroom is bright"}]', TRUE),

('weekend_cloze', 'CLOZE', 'MEDIUM',
 'Fill-in passage — “My Weekend”: On Saturday, I ___1___ football with my friends. We ___2___ lunch at home. In the afternoon, I ___3___ my homework. On Sunday, I ___4___ my grandparents.',
 'Suggested answers: play, have, do, visit. The intended UI mix is three dropdown blanks and one typed blank.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"cloze":{"caseSensitive":false,"segments":[{"text":"On Saturday, I "},{"text":" football with my friends. We "},{"text":" lunch at home. In the afternoon, I "},{"text":" my homework. On Sunday, I "},{"text":" my grandparents."}],"blanks":[{"key":"b1","acceptedAnswers":["play"]},{"key":"b2","acceptedAnswers":["have"]},{"key":"b3","acceptedAnswers":["do"]},{"key":"b4","acceptedAnswers":["visit"]}]}}'::jsonb,
 '[]', '[]', TRUE),

('match_example', 'MATCHING', 'EASY',
 'Example (not scored): Match “library” to the correct entry in the shared A–F answer pool.',
 'Library is the place where students can borrow books.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"matching":{"poolId":"grade6-school-pool","correctEntryId":"A"}}'::jsonb, '[]', '[]', TRUE),

('match_2', 'MATCHING', 'EASY',
 'Match “laboratory” to the correct entry in the shared A–F answer pool.',
 'A laboratory is a room used for science experiments.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"matching":{"poolId":"grade6-school-pool","correctEntryId":"B"}}'::jsonb, '[]', '[]', TRUE),

('match_3', 'MATCHING', 'EASY',
 'Match “canteen” to the correct entry in the shared A–F answer pool.',
 'A canteen is a place where students can buy or eat food.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"matching":{"poolId":"grade6-school-pool","correctEntryId":"C"}}'::jsonb, '[]', '[]', TRUE),

('match_4', 'MATCHING', 'EASY',
 'Match “playground” to the correct entry in the shared A–F answer pool.',
 'A playground is an outdoor area where students play.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"matching":{"poolId":"grade6-school-pool","correctEntryId":"D"}}'::jsonb, '[]', '[]', TRUE),

('match_5', 'MATCHING', 'EASY',
 'Match “timetable” to the correct entry in the shared A–F answer pool.',
 'A timetable shows lesson times and order.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"matching":{"poolId":"grade6-school-pool","correctEntryId":"E"}}'::jsonb, '[]', '[]', TRUE),

('match_6', 'MATCHING', 'EASY',
 'Match “uniform” to the correct entry in the shared A–F answer pool.',
 'A uniform is a set of clothes worn by members of a school.',
 NULL, 'CASE_INSENSITIVE_TRIM',
 '{"matching":{"poolId":"grade6-school-pool","correctEntryId":"F"}}'::jsonb, '[]', '[]', TRUE);

CREATE TEMP TABLE seed_question_ids (seed_key TEXT PRIMARY KEY, question_id BIGINT NOT NULL) ON COMMIT DROP;

DO $seed$
DECLARE
    r RECORD;
    v_question_id BIGINT;
    v_option JSONB;
    v_answer JSONB;
    v_index INTEGER;
    v_normalized TEXT;
BEGIN
    FOR r IN SELECT * FROM seed_question_data ORDER BY seed_key LOOP
        INSERT INTO questions
            (type, difficulty, content, explanation, hint, definition, is_complete,
             matching_mode, content_revision, created_at, updated_at)
        VALUES
            (r.question_type, r.difficulty, r.content, r.explanation, r.hint,
             CASE WHEN r.definition IS NULL THEN NULL ELSE r.definition::text END,
             r.complete, r.matching_mode, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id INTO v_question_id;

        INSERT INTO seed_question_ids(seed_key, question_id) VALUES (r.seed_key, v_question_id);
        INSERT INTO assignment_questions(question_id, assignment_id, topic_id)
        VALUES (v_question_id, (SELECT id FROM seed_assignment), NULL);

        v_index := 0;
        FOR v_option IN SELECT value FROM jsonb_array_elements(r.options) LOOP
            v_index := v_index + 1;
            INSERT INTO question_options(question_id, option_key, content, is_correct, display_order)
            VALUES (v_question_id, chr(64 + v_index), v_option->>'content',
                    COALESCE((v_option->>'isCorrect')::boolean, FALSE), v_index);
        END LOOP;

        FOR v_answer IN SELECT value FROM jsonb_array_elements(r.answers) LOOP
            v_normalized := btrim(v_answer->>'rawValue');
            IF r.matching_mode <> 'CASE_SENSITIVE_TRIM' THEN
                v_normalized := lower(v_normalized);
            END IF;
            INSERT INTO question_answers(question_id, raw_value, normalized_value)
            VALUES (v_question_id, btrim(v_answer->>'rawValue'), v_normalized);
        END LOOP;
    END LOOP;
END
$seed$;

CREATE TEMP TABLE seed_section_ids (section_key TEXT PRIMARY KEY, section_id BIGINT NOT NULL) ON COMMIT DROP;
INSERT INTO assignment_sections (assignment_id, position, title, instructions, title_vi, instructions_vi)
VALUES
((SELECT id FROM seed_assignment), 1, 'Part 1 — Vocabulary & Sounds', 'Answer the vocabulary and pronunciation questions.', 'Phần 1 — Từ vựng và âm', 'Trả lời các câu hỏi từ vựng và phát âm.'),
((SELECT id FROM seed_assignment), 2, 'Part 2 — Multiple Choice & Writing', 'Some questions have more than one correct answer.', 'Phần 2 — Trắc nghiệm và viết', 'Một số câu hỏi có nhiều hơn một đáp án đúng.'),
((SELECT id FROM seed_assignment), 3, 'Part 3 — Shared School Library Notice', 'Read the notice once, then answer all three questions below it.', 'Phần 3 — Thông báo thư viện dùng chung', 'Đọc thông báo một lần rồi trả lời ba câu hỏi bên dưới.'),
((SELECT id FROM seed_assignment), 4, 'Part 4 — Classroom Picture', 'Look carefully at the shared classroom picture before answering.', 'Phần 4 — Hình ảnh lớp học', 'Quan sát hình ảnh lớp học dùng chung trước khi trả lời.'),
((SELECT id FROM seed_assignment), 5, 'Part 5 — Reading: Mai''s New School', 'Read the passage and answer the three questions.', 'Phần 5 — Bài đọc: Trường mới của Mai', 'Đọc đoạn văn rồi trả lời ba câu hỏi.'),
((SELECT id FROM seed_assignment), 6, 'Part 6 — Fill-in Passage: My Weekend', 'Complete the four numbered gaps.', 'Phần 6 — Điền vào đoạn văn: Cuối tuần của tôi', 'Hoàn thành bốn chỗ trống được đánh số.'),
((SELECT id FROM seed_assignment), 7, 'Part 7 — Matching A–F', 'Use the shared answer pool A–F for all six matching questions.', 'Phần 7 — Nối A–F', 'Dùng nhóm đáp án A–F chung cho cả sáu câu nối.')
RETURNING title, id;

-- Map section titles to stable keys for later item inserts.
INSERT INTO seed_section_ids(section_key, section_id)
SELECT CASE title
         WHEN 'Part 1 — Vocabulary & Sounds' THEN 'vocab'
         WHEN 'Part 2 — Multiple Choice & Writing' THEN 'writing'
         WHEN 'Part 3 — Shared School Library Notice' THEN 'notice'
         WHEN 'Part 4 — Classroom Picture' THEN 'image'
         WHEN 'Part 5 — Reading: Mai''s New School' THEN 'reading'
         WHEN 'Part 6 — Fill-in Passage: My Weekend' THEN 'weekend'
         WHEN 'Part 7 — Matching A–F' THEN 'matching'
       END, id
FROM assignment_sections
WHERE assignment_id = (SELECT id FROM seed_assignment);

CREATE TEMP TABLE seed_item_data (
    item_key TEXT PRIMARY KEY,
    section_key TEXT NOT NULL,
    position INTEGER NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    question_key TEXT,
    parent_key TEXT,
    possible_points NUMERIC(8,2) NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_example BOOLEAN NOT NULL DEFAULT FALSE,
    block_payload JSONB
) ON COMMIT DROP;

INSERT INTO seed_item_data
(item_key, section_key, position, item_type, question_key, parent_key, possible_points, is_required, is_example, block_payload)
VALUES
('example_sc_item','vocab',1,'QUESTION','example_sc',NULL,0,TRUE,TRUE,NULL),
('gap_fib_item','vocab',2,'QUESTION','gap_fib',NULL,1,TRUE,FALSE,NULL),
('pronunciation_item','vocab',3,'QUESTION','pronunciation',NULL,1,TRUE,FALSE,NULL),
('tf_vocab_1_item','vocab',4,'QUESTION','tf_vocab_1',NULL,1,TRUE,FALSE,NULL),
('tf_vocab_2_item','vocab',5,'QUESTION','tf_vocab_2',NULL,1,TRUE,FALSE,NULL),

('mc_multi_1_item','writing',1,'QUESTION','mc_multi_1',NULL,2,TRUE,FALSE,NULL),
('mc_multi_2_item','writing',2,'QUESTION','mc_multi_2',NULL,2,TRUE,FALSE,NULL),
('hint_play_item','writing',3,'QUESTION','hint_play',NULL,1,TRUE,FALSE,NULL),
('rewrite_nam_item','writing',4,'QUESTION','rewrite_nam',NULL,1,TRUE,FALSE,NULL),
('three_blanks_item','writing',5,'QUESTION','three_blanks',NULL,3,TRUE,FALSE,NULL),
('free_writing_item','writing',6,'QUESTION','free_writing',NULL,5,TRUE,FALSE,NULL),

('library_notice_block','notice',1,'INSTRUCTIONS',NULL,NULL,0,TRUE,FALSE,
 '{"text":"SCHOOL LIBRARY NOTICE\\n1. Students may borrow two books at a time.\\n2. The library is open from 8:00 a.m. to 4:00 p.m.\\n3. Please return all books by Friday."}'::jsonb),
('notice_tf_1_item','notice',1,'QUESTION','notice_tf_1','library_notice_block',1,TRUE,FALSE,NULL),
('notice_tf_2_item','notice',2,'QUESTION','notice_tf_2','library_notice_block',1,TRUE,FALSE,NULL),
('notice_tf_3_item','notice',3,'QUESTION','notice_tf_3','library_notice_block',1,TRUE,FALSE,NULL),

('classroom_media_block','image',1,'MEDIA',NULL,NULL,0,TRUE,FALSE,
 '{"assetId":"seed:grade6-classroom-image-pending","altText":"A bright Grade 6 classroom with desks, chairs, a whiteboard, a marker, pencils and books.","caption":"Look at the classroom and identify the objects."}'::jsonb),
('image_sc_item','image',1,'QUESTION','image_sc','classroom_media_block',1,TRUE,FALSE,NULL),
('image_mc_item','image',2,'QUESTION','image_mc','classroom_media_block',2,TRUE,FALSE,NULL),
('image_type_item','image',3,'QUESTION','image_type','classroom_media_block',1,TRUE,FALSE,NULL),

('reading_passage_block','reading',1,'PASSAGE',NULL,NULL,0,TRUE,FALSE,
 '{"title":"Mai''s New School","text":"Mai is happy at Greenfield School. Her classroom is bright and has large windows. Her new friends are kind and helpful. She enjoys English because her teacher uses stories and games. At lunchtime, Mai and her friends read in the school library."}'::jsonb),
('reading_sc_item','reading',1,'QUESTION','reading_sc','reading_passage_block',1,TRUE,FALSE,NULL),
('reading_tf_item','reading',2,'QUESTION','reading_tf','reading_passage_block',1,TRUE,FALSE,NULL),
('reading_type_item','reading',3,'QUESTION','reading_type','reading_passage_block',2,TRUE,FALSE,NULL),

('weekend_cloze_item','weekend',1,'QUESTION','weekend_cloze',NULL,4,TRUE,FALSE,NULL),

('matching_pool_block','matching',1,'POOL',NULL,NULL,0,TRUE,FALSE,
 '{"title":"Answer Pool A–F","poolKey":"grade6-school-pool","entries":[{"id":"A","text":"A place to borrow books"},{"id":"B","text":"A room for science experiments"},{"id":"C","text":"A place to buy or eat food"},{"id":"D","text":"An outdoor area for play"},{"id":"E","text":"A plan showing lesson times"},{"id":"F","text":"Clothes worn as part of school dress"}]}'::jsonb),
('match_example_item','matching',1,'QUESTION','match_example','matching_pool_block',0,TRUE,TRUE,NULL),
('match_2_item','matching',2,'QUESTION','match_2','matching_pool_block',1,TRUE,FALSE,NULL),
('match_3_item','matching',3,'QUESTION','match_3','matching_pool_block',1,TRUE,FALSE,NULL),
('match_4_item','matching',4,'QUESTION','match_4','matching_pool_block',1,TRUE,FALSE,NULL),
('match_5_item','matching',5,'QUESTION','match_5','matching_pool_block',1,TRUE,FALSE,NULL),
('match_6_item','matching',6,'QUESTION','match_6','matching_pool_block',1,TRUE,FALSE,NULL);

CREATE TEMP TABLE seed_item_ids (item_key TEXT PRIMARY KEY, item_id BIGINT NOT NULL, section_id BIGINT NOT NULL) ON COMMIT DROP;

-- Insert root items first so shared blocks exist before their child questions.
INSERT INTO assignment_items
(assignment_id, section_id, parent_item_id, position, item_type, question_id, possible_points, is_required, is_example, block_payload)
SELECT (SELECT id FROM seed_assignment), ss.section_id, NULL, d.position, d.item_type,
       q.question_id, d.possible_points, d.is_required, d.is_example, d.block_payload
FROM seed_item_data d
JOIN seed_section_ids ss ON ss.section_key = d.section_key
LEFT JOIN seed_question_ids q ON q.seed_key = d.question_key
WHERE d.parent_key IS NULL
ORDER BY ss.section_id, d.position
RETURNING id, section_id;

-- Re-select root item IDs by deterministic section/position/type/question association.
INSERT INTO seed_item_ids(item_key, item_id, section_id)
SELECT d.item_key, i.id, i.section_id
FROM seed_item_data d
JOIN seed_section_ids ss ON ss.section_key = d.section_key
JOIN assignment_items i
  ON i.assignment_id = (SELECT id FROM seed_assignment)
 AND i.section_id = ss.section_id
 AND i.parent_item_id IS NULL
 AND i.position = d.position
 AND i.item_type = d.item_type
 AND (
      (d.item_type = 'QUESTION' AND i.question_id = (SELECT question_id FROM seed_question_ids WHERE seed_key = d.question_key))
      OR (d.item_type <> 'QUESTION')
 )
WHERE d.parent_key IS NULL;

-- Child questions under the shared instructions, media, passage and answer-pool blocks.
INSERT INTO assignment_items
(assignment_id, section_id, parent_item_id, position, item_type, question_id, possible_points, is_required, is_example, block_payload)
SELECT (SELECT id FROM seed_assignment), parent.section_id, parent.item_id, d.position, d.item_type,
       q.question_id, d.possible_points, d.is_required, d.is_example, d.block_payload
FROM seed_item_data d
JOIN seed_item_ids parent ON parent.item_key = d.parent_key
JOIN seed_question_ids q ON q.seed_key = d.question_key
WHERE d.parent_key IS NOT NULL
ORDER BY parent.item_id, d.position;

INSERT INTO seed_item_ids(item_key, item_id, section_id)
SELECT d.item_key, i.id, i.section_id
FROM seed_item_data d
JOIN seed_item_ids parent ON parent.item_key = d.parent_key
JOIN seed_question_ids q ON q.seed_key = d.question_key
JOIN assignment_items i
  ON i.assignment_id = (SELECT id FROM seed_assignment)
 AND i.section_id = parent.section_id
 AND i.parent_item_id = parent.item_id
 AND i.position = d.position
 AND i.item_type = 'QUESTION'
 AND i.question_id = q.question_id
WHERE d.parent_key IS NOT NULL;

-- Assertions: exactly 7 canonical question types represented, 27 questions, and four shared blocks.
DO $check$
DECLARE
    v_question_count INTEGER;
    v_type_count INTEGER;
    v_shared_block_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_question_count
    FROM assignment_questions WHERE assignment_id = (SELECT id FROM seed_assignment);

    SELECT COUNT(DISTINCT q.type) INTO v_type_count
    FROM assignment_questions aq JOIN questions q ON q.id = aq.question_id
    WHERE aq.assignment_id = (SELECT id FROM seed_assignment);

    SELECT COUNT(*) INTO v_shared_block_count
    FROM assignment_items
    WHERE assignment_id = (SELECT id FROM seed_assignment)
      AND item_type IN ('INSTRUCTIONS','MEDIA','PASSAGE','POOL');

    IF v_question_count <> 27 THEN
        RAISE EXCEPTION 'Expected 27 questions but found %', v_question_count;
    END IF;
    IF v_type_count <> 7 THEN
        RAISE EXCEPTION 'Expected all 7 question types but found %', v_type_count;
    END IF;
    IF v_shared_block_count <> 4 THEN
        RAISE EXCEPTION 'Expected 4 shared content blocks but found %', v_shared_block_count;
    END IF;
END
$check$;

COMMIT;

-- Verify after running:
SELECT a.id, a.grade_level, a.academic_year, a.name, a.status, COUNT(aq.question_id) AS question_count
FROM assignments a
LEFT JOIN assignment_questions aq ON aq.assignment_id = a.id
WHERE a.grade_level = 6
  AND a.academic_year = '2026-2027'
  AND a.name = 'Mid-term Vocabulary Check — All Question Types'
GROUP BY a.id, a.grade_level, a.academic_year, a.name, a.status;

SELECT q.type, COUNT(*) AS count
FROM assignment_questions aq
JOIN assignments a ON a.id = aq.assignment_id
JOIN questions q ON q.id = aq.question_id
WHERE a.grade_level = 6
  AND a.academic_year = '2026-2027'
  AND a.name = 'Mid-term Vocabulary Check — All Question Types'
GROUP BY q.type
ORDER BY q.type;

-- Known product/schema gaps (the seed deliberately does not fake these capabilities):
-- 1) The current Matching definition stores only poolId/correctEntryId; it does not persist
--    the six A-F entries or a per-question prompt/answer pair as canonical question definition.
--    The POOL composition block carries A-F display entries, but engine matching authoring/runtime
--    must be completed for full functional matching.
-- 2) Cloze definition stores accepted answers by key but does not encode per-blank UI mode
--    (dropdown vs typed input) nor explicit segment-to-blank references. Four accepted-answer
--    slots are seeded; mixed dropdown/typed UI requires a schema/API enhancement.
-- 3) Teacher-manual marking is not represented in the current QuestionType/scoring contract.
--    The free-writing row is intentionally incomplete and the assignment remains DRAFT.
-- 4) MEDIA uses a placeholder assetId until an uploaded media asset exists. Replace it before use.
