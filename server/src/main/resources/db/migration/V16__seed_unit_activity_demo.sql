-- Demo content for rendering Grade 6 / Unit 1 Activity UI.
-- Uses the real content hierarchy and is safe to re-run.

INSERT INTO content_sections (unit_id, name, description, display_order, status)
SELECT u.id, v.name, v.description, v.ord, 'PUBLISHED'
FROM content_units u
CROSS JOIN (VALUES
    ('Grammar', 'Grammar practice for Unit 1.', 1),
    ('Vocabulary', 'School vocabulary for Unit 1.', 2)
) v(name, description, ord)
WHERE u.code = 'U1'
AND NOT EXISTS (
    SELECT 1 FROM content_sections s
    WHERE s.unit_id = u.id AND s.name = v.name
);

INSERT INTO content_topics (section_id, name, description, display_order, status)
SELECT s.id, v.name, v.description, 1, 'PUBLISHED'
FROM content_sections s
JOIN content_units u ON u.id = s.unit_id
CROSS JOIN (VALUES
    ('There is / There are', 'There is and there are practice.', 'Grammar'),
    ('School Objects', 'Common school objects.', 'Vocabulary')
) v(name, description, section_name)
WHERE u.code = 'U1'
AND s.name = v.section_name
AND NOT EXISTS (
    SELECT 1 FROM content_topics t
    WHERE t.section_id = s.id AND t.name = v.name
);

INSERT INTO content_question_banks (topic_id, name, description, display_order, status)
SELECT t.id, v.name, v.description, v.ord, 'PUBLISHED'
FROM content_topics t
JOIN content_sections s ON s.id = t.section_id
JOIN content_units u ON u.id = s.unit_id
CROSS JOIN (VALUES
    ('There is / There are - Basic', 'Basic grammar practice.', 1, 'There is / There are'),
    ('There is / There are - Review', 'Grammar review.', 2, 'There is / There are'),
    ('School Objects - Basic', 'Basic school vocabulary.', 1, 'School Objects')
) v(name, description, ord, topic_name)
WHERE u.code = 'U1'
AND t.name = v.topic_name
AND NOT EXISTS (
    SELECT 1 FROM content_question_banks qb
    WHERE qb.topic_id = t.id AND qb.name = v.name
);

INSERT INTO content_questions
(question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY',
       'There ____ a book on the desk.',
       'Use "is" with a singular noun.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'There is / There are - Basic'
AND NOT EXISTS (
    SELECT 1 FROM content_questions q
    WHERE q.question_bank_id = qb.id AND q.content = 'There ____ a book on the desk.'
);

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
CROSS JOIN (VALUES
    ('A','is',TRUE),('B','are',FALSE),('C','am',FALSE),('D','be',FALSE)
) v(k,c,ok)
WHERE q.content = 'There ____ a book on the desk.'
AND NOT EXISTS (
    SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id
);

INSERT INTO content_questions
(question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY',
       'There ____ two windows in our classroom.',
       'Use "are" with a plural noun.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'There is / There are - Basic'
AND NOT EXISTS (
    SELECT 1 FROM content_questions q
    WHERE q.question_bank_id = qb.id AND q.content = 'There ____ two windows in our classroom.'
);

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
CROSS JOIN (VALUES
    ('A','is',FALSE),('B','are',TRUE),('C','am',FALSE),('D','be',FALSE)
) v(k,c,ok)
WHERE q.content = 'There ____ two windows in our classroom.'
AND NOT EXISTS (
    SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id
);

INSERT INTO content_questions
(question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY',
       'Which object do students use to write with ink?',
       'A pen is used to write with ink.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'School Objects - Basic'
AND NOT EXISTS (
    SELECT 1 FROM content_questions q
    WHERE q.question_bank_id = qb.id
    AND q.content = 'Which object do students use to write with ink?'
);

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
CROSS JOIN (VALUES
    ('A','Pen',TRUE),('B','Ruler',FALSE),('C','Bag',FALSE),('D','Desk',FALSE)
) v(k,c,ok)
WHERE q.content = 'Which object do students use to write with ink?'
AND NOT EXISTS (
    SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id
);

INSERT INTO content_questions
(question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM',
       'Which object helps you draw a straight line?',
       'A ruler helps you draw a straight line.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'School Objects - Basic'
AND NOT EXISTS (
    SELECT 1 FROM content_questions q
    WHERE q.question_bank_id = qb.id
    AND q.content = 'Which object helps you draw a straight line?'
);

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
CROSS JOIN (VALUES
    ('A','Notebook',FALSE),('B','Ruler',TRUE),('C','Chair',FALSE),('D','Clock',FALSE)
) v(k,c,ok)
WHERE q.content = 'Which object helps you draw a straight line?'
AND NOT EXISTS (
    SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id
);

INSERT INTO activities
(unit_id, name, description, display_order, status, distribution_mode, total_questions,
 selection_strategy, mode, time_limit_seconds, lives)
SELECT u.id, 'Unit 1 Grammar Practice',
       'Practice Unit 1 grammar in Learning or Try Hard mode.',
       1, 'PUBLISHED', 'EQUAL', 4, 'RANDOM', 'BOTH', 60, 3
FROM content_units u
WHERE u.code = 'U1'
AND NOT EXISTS (
    SELECT 1 FROM activities a
    WHERE a.unit_id = u.id AND a.name = 'Unit 1 Grammar Practice'
);

INSERT INTO activity_banks (activity_id, question_bank_id, display_order)
SELECT a.id, qb.id, 0
FROM activities a
JOIN content_units u ON u.id = a.unit_id
JOIN content_question_banks qb ON qb.name = 'There is / There are - Basic'
JOIN content_topics t ON t.id = qb.topic_id
JOIN content_sections s ON s.id = t.section_id
WHERE u.code = 'U1' AND a.name = 'Unit 1 Grammar Practice'
AND NOT EXISTS (
    SELECT 1 FROM activity_banks ab
    WHERE ab.activity_id = a.id AND ab.question_bank_id = qb.id
);

INSERT INTO activity_banks (activity_id, question_bank_id, display_order)
SELECT a.id, qb.id, 1
FROM activities a
JOIN content_units u ON u.id = a.unit_id
JOIN content_question_banks qb ON qb.name = 'There is / There are - Review'
JOIN content_topics t ON t.id = qb.topic_id
JOIN content_sections s ON s.id = t.section_id
WHERE u.code = 'U1' AND a.name = 'Unit 1 Grammar Practice'
AND NOT EXISTS (
    SELECT 1 FROM activity_banks ab
    WHERE ab.activity_id = a.id AND ab.question_bank_id = qb.id
);

INSERT INTO activities
(unit_id, name, description, display_order, status, distribution_mode, total_questions,
 selection_strategy, mode, time_limit_seconds, lives)
SELECT u.id, 'Unit 1 School Challenge',
       'Fast school vocabulary challenge.',
       2, 'DRAFT', 'PERCENTAGE', 4, 'RANDOM', 'TRY_HARD', 90, 3
FROM content_units u
WHERE u.code = 'U1'
AND NOT EXISTS (
    SELECT 1 FROM activities a
    WHERE a.unit_id = u.id AND a.name = 'Unit 1 School Challenge'
);

INSERT INTO activity_banks (activity_id, question_bank_id, display_order, percentage)
SELECT a.id, qb.id, 0, 100
FROM activities a
JOIN content_units u ON u.id = a.unit_id
JOIN content_question_banks qb ON qb.name = 'School Objects - Basic'
JOIN content_topics t ON t.id = qb.topic_id
JOIN content_sections s ON s.id = t.section_id
WHERE u.code = 'U1' AND a.name = 'Unit 1 School Challenge'
AND NOT EXISTS (
    SELECT 1 FROM activity_banks ab
    WHERE ab.activity_id = a.id AND ab.question_bank_id = qb.id
);
