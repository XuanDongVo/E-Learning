-- Ordering Question v1 disposable QA fixture. Requires Flyway V63 and the
-- Grade 7 foundation/questions/activities seed files. Never run in production.
BEGIN;

INSERT INTO content_question_banks (topic_id, name, description, display_order, status)
SELECT t.id, 'G7-SEED Ordering Runtime',
       'Ordering runtime QA: subtype, alternatives, duplicates, mobile and Guided Final.',
       10, 'PUBLISHED'
FROM content_topics t
JOIN content_sections s ON s.id = t.section_id
JOIN content_units u ON u.id = s.unit_id
WHERE u.code = 'G7-SEED-U01' AND t.name = 'G7-SEED Core Practice'
ON CONFLICT (topic_id, name) DO UPDATE
SET description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status;

CREATE TEMP TABLE ordering_question_fixture (
    seed_key TEXT PRIMARY KEY,
    difficulty VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT NOT NULL,
    hint TEXT,
    definition TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO ordering_question_fixture
    (seed_key, difficulty, content, explanation, hint, definition)
VALUES
    ('word-alternatives', 'EASY',
     '[G7-ORDERING WORD] Arrange the words into an accepted sentence.',
     'Both positions of the adverb are accepted in this fixture.',
     'Place every word exactly once.',
     '{"ordering":{"schemaVersion":1,"subtype":"WORD","items":[{"key":"w1","content":"I"},{"key":"w2","content":"sometimes"},{"key":"w3","content":"read"},{"key":"w4","content":"books"}],"acceptedOrders":[["w1","w2","w3","w4"],["w2","w1","w3","w4"]]}}'),
    ('phrase-duplicates', 'MEDIUM',
     '[G7-ORDERING PHRASE] Arrange the phrase with duplicate visible pieces.',
     'The two very pieces have different keys but identical visible content.',
     'The last piece describes usefulness.',
     '{"ordering":{"schemaVersion":1,"subtype":"PHRASE","items":[{"key":"p1","content":"This lesson is"},{"key":"p2","content":"very"},{"key":"p3","content":"very"},{"key":"p4","content":"useful."}],"acceptedOrders":[["p1","p2","p3","p4"]]}}'),
    ('sentence-eight-long', 'HARD',
     '[G7-ORDERING SENTENCE] Put the eight events in chronological order.',
     'The sequence follows a complete school-day routine from arrival to reflection.',
     'Start with arriving at school and finish with writing a reflection.',
     '{"ordering":{"schemaVersion":1,"subtype":"SENTENCE","items":[{"key":"s1","content":"At 6:45, Minh arrives at the school gate and greets his classmates."},{"key":"s2","content":"First, he checks the timetable and prepares the books for the morning lessons."},{"key":"s3","content":"Next, the class practises a short English dialogue about asking for directions."},{"key":"s4","content":"During the break, Minh shares a snack with Lan near the library."},{"key":"s5","content":"After the break, the students complete a science experiment in small groups."},{"key":"s6","content":"At lunchtime, they discuss the quotation “Practice makes progress” together."},{"key":"s7","content":"Before going home, Minh returns two books to the librarian."},{"key":"s8","content":"Finally, he writes a brief reflection about what he learned that day."}],"acceptedOrders":[["s1","s2","s3","s4","s5","s6","s7","s8"]]}}'),
    ('guided-final', 'MEDIUM',
     '[G7-ORDERING GUIDED] Arrange the words to complete the Final sentence.',
     'The correct sentence is: My brother plays football after school.',
     'Begin with the possessive phrase My brother.',
     '{"ordering":{"schemaVersion":1,"subtype":"WORD","items":[{"key":"g1","content":"My"},{"key":"g2","content":"brother"},{"key":"g3","content":"plays"},{"key":"g4","content":"football"},{"key":"g5","content":"after"},{"key":"g6","content":"school."}],"acceptedOrders":[["g1","g2","g3","g4","g5","g6"]]}}');

INSERT INTO questions
    (type, difficulty, content, explanation, hint, definition,
     is_complete, matching_mode, content_revision)
SELECT 'ORDERING', f.difficulty, f.content, f.explanation, f.hint, f.definition,
       TRUE, 'CASE_INSENSITIVE_TRIM', 1
FROM ordering_question_fixture f
WHERE NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = f.content);

UPDATE questions q
SET type = 'ORDERING',
    difficulty = f.difficulty,
    explanation = f.explanation,
    hint = f.hint,
    definition = f.definition,
    is_complete = TRUE,
    matching_mode = 'CASE_INSENSITIVE_TRIM',
    content_revision = 1,
    updated_at = CURRENT_TIMESTAMP
FROM ordering_question_fixture f
WHERE q.content = f.content;

INSERT INTO content_questions (question_id, question_bank_id)
SELECT q.id, qb.id
FROM ordering_question_fixture f
JOIN questions q ON q.content = f.content
JOIN content_question_banks qb ON qb.name = 'G7-SEED Ordering Runtime'
JOIN content_topics t ON t.id = qb.topic_id
JOIN content_sections s ON s.id = t.section_id
JOIN content_units u ON u.id = s.unit_id AND u.code = 'G7-SEED-U01'
ON CONFLICT (question_id) DO UPDATE
SET question_bank_id = EXCLUDED.question_bank_id;

INSERT INTO question_guided_definitions
    (question_id, schema_version, version, status, source_question_revision,
     definition_payload, created_at, updated_at)
SELECT q.id, 1, 0, 'READY', q.content_revision,
       '{"introContent":"Review the subject and verb before arranging the Final sentence.","steps":[{"stepKey":"subject","position":0,"type":"SINGLE_CHOICE","prompt":"Which phrase is the subject?","options":[{"key":"A","content":"My brother"},{"key":"B","content":"after school"}],"correctKey":"A","expected":null,"acceptedAnswers":[],"matchingMode":null,"explanation":"My brother is the person doing the action.","hintEnabled":true,"hint":"Look for the person in the sentence.","retryEnabled":true},{"stepKey":"verb","position":1,"type":"TYPE_ANSWER","prompt":"Type the present-simple verb used after my brother.","options":[],"correctKey":null,"expected":null,"acceptedAnswers":["plays"],"matchingMode":"CASE_INSENSITIVE_TRIM","explanation":"A singular third-person subject uses plays.","hintEnabled":false,"hint":null,"retryEnabled":true}]}'::jsonb,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM questions q
WHERE q.content = '[G7-ORDERING GUIDED] Arrange the words to complete the Final sentence.'
ON CONFLICT (question_id) DO UPDATE SET
    schema_version = EXCLUDED.schema_version,
    status = EXCLUDED.status,
    source_question_revision = EXCLUDED.source_question_revision,
    definition_payload = EXCLUDED.definition_payload,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO activities
    (unit_id, name, description, display_order, status, distribution_mode,
     total_questions, mode, practice_type, time_limit_seconds, lives,
     question_difficulty, published_at)
SELECT u.id, fixture.name, fixture.description, fixture.display_order,
       'PUBLISHED', 'FIXED_COUNT', fixture.total_questions, fixture.mode,
       fixture.practice_type, fixture.time_limit_seconds, fixture.lives,
       'MIXED', CURRENT_TIMESTAMP
FROM content_units u
CROSS JOIN (VALUES
    ('G7-ORDERING-CLASSIC',
     'Classic Learning/Try Hard Ordering QA with four edge-case Questions.',
     100, 4, 'BOTH', 'CLASSIC', 45, 3),
    ('G7-ORDERING-GUIDED',
     'Guided Steps followed by an Ordering Final Question.',
     101, 1, 'LEARNING', 'GUIDED_REASONING', NULL, NULL)
) AS fixture(name, description, display_order, total_questions, mode,
             practice_type, time_limit_seconds, lives)
WHERE u.code = 'G7-SEED-U01'
ON CONFLICT (unit_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    distribution_mode = EXCLUDED.distribution_mode,
    total_questions = EXCLUDED.total_questions,
    mode = EXCLUDED.mode,
    practice_type = EXCLUDED.practice_type,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    lives = EXCLUDED.lives,
    question_difficulty = EXCLUDED.question_difficulty,
    published_at = EXCLUDED.published_at;

-- These tagged Activities belong entirely to this disposable fixture. Remove
-- stray manually-added strategies/sources so reruns preserve Guided readiness.
DELETE FROM activity_selection_strategies strategy
USING activities a, content_units u
WHERE strategy.activity_id = a.id
  AND a.unit_id = u.id
  AND u.code = 'G7-SEED-U01'
  AND a.name IN ('G7-ORDERING-CLASSIC', 'G7-ORDERING-GUIDED')
  AND strategy.selection_strategy <> 'RANDOM';

INSERT INTO activity_selection_strategies (activity_id, selection_strategy)
SELECT a.id, 'RANDOM'
FROM activities a
JOIN content_units u ON u.id = a.unit_id AND u.code = 'G7-SEED-U01'
WHERE a.name IN ('G7-ORDERING-CLASSIC', 'G7-ORDERING-GUIDED')
ON CONFLICT (activity_id, selection_strategy) DO NOTHING;

DELETE FROM activity_banks source
USING activities a, content_units u, content_question_banks qb,
      content_topics t, content_sections s
WHERE source.activity_id = a.id
  AND a.unit_id = u.id
  AND u.code = 'G7-SEED-U01'
  AND a.name IN ('G7-ORDERING-CLASSIC', 'G7-ORDERING-GUIDED')
  AND qb.name = 'G7-SEED Ordering Runtime'
  AND qb.topic_id = t.id
  AND t.section_id = s.id
  AND s.unit_id = u.id
  AND source.question_bank_id <> qb.id;

INSERT INTO activity_banks
    (activity_id, question_bank_id, display_order, percentage, fixed_count)
SELECT a.id, qb.id, 0, NULL,
       CASE WHEN a.name = 'G7-ORDERING-CLASSIC' THEN 4 ELSE 1 END
FROM activities a
JOIN content_units u ON u.id = a.unit_id AND u.code = 'G7-SEED-U01'
JOIN content_question_banks qb ON qb.name = 'G7-SEED Ordering Runtime'
JOIN content_topics t ON t.id = qb.topic_id
JOIN content_sections s ON s.id = t.section_id AND s.unit_id = u.id
WHERE a.name IN ('G7-ORDERING-CLASSIC', 'G7-ORDERING-GUIDED')
ON CONFLICT (activity_id, question_bank_id) DO UPDATE SET
    display_order = EXCLUDED.display_order,
    percentage = NULL,
    fixed_count = EXCLUDED.fixed_count;

SELECT 1 / CASE WHEN (
    SELECT count(*)
    FROM questions
    WHERE content LIKE '[G7-ORDERING %' AND type = 'ORDERING' AND is_complete
) = 4 THEN 1 ELSE 0 END AS ordering_question_assertion;

SELECT 1 / CASE WHEN EXISTS (
    SELECT 1
    FROM question_guided_definitions gd
    JOIN questions q ON q.id = gd.question_id
    WHERE q.content = '[G7-ORDERING GUIDED] Arrange the words to complete the Final sentence.'
      AND gd.status = 'READY'
      AND gd.source_question_revision = q.content_revision
) THEN 1 ELSE 0 END AS ordering_guided_assertion;

SELECT 1 / CASE WHEN (
    SELECT count(*)
    FROM activities a
    JOIN content_units u ON u.id = a.unit_id
    WHERE u.code = 'G7-SEED-U01'
      AND a.name IN ('G7-ORDERING-CLASSIC', 'G7-ORDERING-GUIDED')
      AND a.status = 'PUBLISHED'
) = 2 THEN 1 ELSE 0 END AS ordering_activity_assertion;

SELECT 1 / CASE WHEN EXISTS (
    SELECT 1 FROM activities a
    JOIN content_units u ON u.id = a.unit_id
    WHERE u.code = 'G7-SEED-U01'
      AND a.name = 'G7-ORDERING-CLASSIC'
      AND a.mode = 'BOTH'
      AND a.practice_type = 'CLASSIC'
      AND a.total_questions = 4
      AND a.time_limit_seconds = 45
      AND a.lives = 3
) THEN 1 ELSE 0 END AS ordering_classic_configuration_assertion;

SELECT 1 / CASE WHEN EXISTS (
    SELECT 1 FROM activities a
    JOIN content_units u ON u.id = a.unit_id
    WHERE u.code = 'G7-SEED-U01'
      AND a.name = 'G7-ORDERING-GUIDED'
      AND a.mode = 'LEARNING'
      AND a.practice_type = 'GUIDED_REASONING'
      AND a.total_questions = 1
      AND a.time_limit_seconds IS NULL
      AND a.lives IS NULL
      AND (SELECT count(*) FROM activity_selection_strategies strategy
           WHERE strategy.activity_id = a.id) = 1
) THEN 1 ELSE 0 END AS ordering_guided_configuration_assertion;

COMMIT;
