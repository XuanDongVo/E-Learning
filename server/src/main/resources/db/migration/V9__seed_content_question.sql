-- Requires existing content:
-- Grade 6 / U2 / Grammar / Past Simple, Comparatives
-- Current schema: Question has is_complete + matching_mode;
-- QuestionOption and QuestionAnswer do not have display_order/matching_mode.

-- =========================================================
-- QUESTION BANKS
-- =========================================================
INSERT INTO content_question_banks (topic_id, name, description, display_order, status)
SELECT t.id, v.name, v.description, v.ord, 'DRAFT'
FROM content_topics t
         JOIN content_sections s ON s.id = t.section_id
         JOIN content_units u ON u.id = s.unit_id
         CROSS JOIN (VALUES
                         ('Past Simple - Basic', 'Basic past simple practice.', 1),
                         ('Past Simple - Review', 'Mixed past simple review.', 2)
) v(name, description, ord)
WHERE u.code = 'U2' AND s.name = 'Grammar' AND t.name = 'Past Simple'
  AND NOT EXISTS (
    SELECT 1 FROM content_question_banks qb
    WHERE qb.topic_id = t.id AND qb.name = v.name
);

INSERT INTO content_question_banks (topic_id, name, description, display_order, status)
SELECT t.id, 'Comparatives - Basic', 'Basic comparative adjective practice.', 1, 'DRAFT'
FROM content_topics t
         JOIN content_sections s ON s.id = t.section_id
         JOIN content_units u ON u.id = s.unit_id
WHERE u.code = 'U2' AND s.name = 'Grammar' AND t.name = 'Comparatives'
  AND NOT EXISTS (
    SELECT 1 FROM content_question_banks qb
    WHERE qb.topic_id = t.id AND qb.name = 'Comparatives - Basic'
);

-- =========================================================
-- PAST SIMPLE - BASIC
-- =========================================================
INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'She ____ to school yesterday.', 'Use the past form "went" for a completed action in the past.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'She ____ to school yesterday.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','go',false),('B','went',true),('C','goes',false),('D','going',false)) v(k,c,ok)
WHERE q.content = 'She ____ to school yesterday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'TRUE_FALSE', 'EASY', 'The past simple can describe a completed action in the past.', 'The past simple is commonly used for completed past actions.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'The past simple can describe a completed action in the past.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','True',true),('B','False',false)) v(k,c,ok)
WHERE q.content = 'The past simple can describe a completed action in the past.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'FILL_IN_BLANK', 'EASY', 'I ____ my homework last night.', 'The past form of "do" is "did".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'I ____ my homework last night.');

INSERT INTO content_question_answers (question_id, raw_value, normalized_value)
SELECT q.id, 'did', 'did'
FROM content_questions q
WHERE q.content = 'I ____ my homework last night.'
  AND NOT EXISTS (SELECT 1 FROM content_question_answers a WHERE a.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'TYPE_ANSWER', 'MEDIUM', 'What did you do yesterday?', 'Accept a suitable past simple sentence.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'What did you do yesterday?');

INSERT INTO content_question_answers (question_id, raw_value, normalized_value)
SELECT q.id, v.a, lower(v.a)
FROM content_questions q
         CROSS JOIN (VALUES ('I studied'), ('I played football')) v(a)
WHERE q.content = 'What did you do yesterday?'
  AND NOT EXISTS (SELECT 1 FROM content_question_answers x WHERE x.question_id = q.id AND x.normalized_value = lower(v.a));

-- =========================================================
-- PAST SIMPLE - REVIEW
-- =========================================================
INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'MULTIPLE_CHOICE', 'MEDIUM', 'Which sentences are in the past simple?', 'The first and third sentences describe completed past actions.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Review'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Which sentences are in the past simple?');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES
                         ('A','I visited Hanoi last year.',true),
                         ('B','She visits her grandmother every week.',false),
                         ('C','They went to the museum yesterday.',true),
                         ('D','We are studying now.',false)
) v(k,c,ok)
WHERE q.content = 'Which sentences are in the past simple?'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'HARD', 'They ____ the final match last weekend.', NULL, FALSE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Review'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'They ____ the final match last weekend.');
-- Intentionally incomplete: no options/correct answer, useful for testing isComplete filter.

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'FILL_IN_BLANK', 'MEDIUM', 'She ____ (buy) a new book yesterday.', 'The past form of "buy" is "bought".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Review'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'She ____ (buy) a new book yesterday.');

INSERT INTO content_question_answers (question_id, raw_value, normalized_value)
SELECT q.id, 'bought', 'bought'
FROM content_questions q
WHERE q.content = 'She ____ (buy) a new book yesterday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_answers a WHERE a.question_id = q.id);

-- =========================================================
-- COMPARATIVES - BASIC
-- =========================================================
INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'A car is ____ than a bicycle.', 'Use the comparative form "faster".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Comparatives - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'A car is ____ than a bicycle.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','fast',false),('B','faster',true),('C','fastest',false),('D','more fast',false)) v(k,c,ok)
WHERE q.content = 'A car is ____ than a bicycle.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'FILL_IN_BLANK', 'EASY', 'My new phone is ____ (small) than my old phone.', 'The comparative form of "small" is "smaller".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Comparatives - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'My new phone is ____ (small) than my old phone.');

INSERT INTO content_question_answers (question_id, raw_value, normalized_value)
SELECT q.id, 'smaller', 'smaller'
FROM content_questions q
WHERE q.content = 'My new phone is ____ (small) than my old phone.'
  AND NOT EXISTS (SELECT 1 FROM content_question_answers a WHERE a.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'MULTIPLE_CHOICE', 'HARD', 'Which sentences correctly use comparatives?', 'Both the first and second sentences use comparatives correctly.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Comparatives - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Which sentences correctly use comparatives?');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES
                         ('A','Tom is taller than Ben.',true),
                         ('B','This book is more interesting than that one.',true),
                         ('C','She is the tallest than her sister.',false),
                         ('D','He is more fast than me.',false)
) v(k,c,ok)
WHERE q.content = 'Which sentences correctly use comparatives?'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);


-- =========================================================
-- EXTRA QUESTIONS FOR PAGINATION / SEARCH / FILTER TESTING
-- Adds 20 more questions to Past Simple - Basic.
-- =========================================================

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'Tom ____ breakfast this morning.', 'Tom ate breakfast this morning.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Tom ____ breakfast this morning.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','eat',false),('B','ate',true),('C','eats',false),('D','eating',false)) v(k,c,ok)
WHERE q.content = 'Tom ____ breakfast this morning.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'Lisa ____ her friend last Saturday.', 'Lisa visited her friend last Saturday.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Lisa ____ her friend last Saturday.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','visit',false),('B','visited',true),('C','visits',false),('D','visiting',false)) v(k,c,ok)
WHERE q.content = 'Lisa ____ her friend last Saturday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'We ____ a great movie last night.', 'We watched a great movie last night.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'We ____ a great movie last night.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','watch',false),('B','watched',true),('C','watches',false),('D','watching',false)) v(k,c,ok)
WHERE q.content = 'We ____ a great movie last night.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'My parents ____ home late yesterday.', 'The past form of "come" is "came".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'My parents ____ home late yesterday.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','come',false),('B','came',true),('C','comes',false),('D','coming',false)) v(k,c,ok)
WHERE q.content = 'My parents ____ home late yesterday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'The students ____ English yesterday afternoon.', 'The past form of "study" is "studied".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'The students ____ English yesterday afternoon.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','study',false),('B','studied',true),('C','studies',false),('D','studying',false)) v(k,c,ok)
WHERE q.content = 'The students ____ English yesterday afternoon.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'Jack ____ his keys on the table.', 'The past form of "leave" is "left".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Jack ____ his keys on the table.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','leave',false),('B','left',true),('C','leaves',false),('D','leaving',false)) v(k,c,ok)
WHERE q.content = 'Jack ____ his keys on the table.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'Sarah ____ a new dress last week.', 'The past form of "buy" is "bought".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Sarah ____ a new dress last week.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','buy',false),('B','bought',true),('C','buys',false),('D','buying',false)) v(k,c,ok)
WHERE q.content = 'Sarah ____ a new dress last week.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'They ____ to the beach on Sunday.', 'The past form of "go" is "went".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'They ____ to the beach on Sunday.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','go',false),('B','went',true),('C','goes',false),('D','going',false)) v(k,c,ok)
WHERE q.content = 'They ____ to the beach on Sunday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'I ____ my homework before dinner.', 'Use "finished" for a completed past action.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'I ____ my homework before dinner.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','finish',false),('B','finished',true),('C','finishes',false),('D','finishing',false)) v(k,c,ok)
WHERE q.content = 'I ____ my homework before dinner.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'EASY', 'He ____ a letter to his teacher.', 'The past form of "write" is "wrote".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'He ____ a letter to his teacher.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','write',false),('B','wrote',true),('C','writes',false),('D','writing',false)) v(k,c,ok)
WHERE q.content = 'He ____ a letter to his teacher.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'Anna ____ the window because it was cold.', 'The past form of "close" is "closed".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Anna ____ the window because it was cold.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','close',false),('B','closed',true),('C','closes',false),('D','closing',false)) v(k,c,ok)
WHERE q.content = 'Anna ____ the window because it was cold.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'Peter ____ his bike to school yesterday.', 'The past form of "ride" is "rode".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Peter ____ his bike to school yesterday.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','ride',false),('B','rode',true),('C','rides',false),('D','riding',false)) v(k,c,ok)
WHERE q.content = 'Peter ____ his bike to school yesterday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'We ____ lunch at twelve yesterday.', 'The past form of "have" is "had".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'We ____ lunch at twelve yesterday.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','have',false),('B','had',true),('C','has',false),('D','having',false)) v(k,c,ok)
WHERE q.content = 'We ____ lunch at twelve yesterday.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'Mary ____ a beautiful song at the party.', 'The past form of "sing" is "sang".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Mary ____ a beautiful song at the party.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','sing',false),('B','sang',true),('C','sings',false),('D','singing',false)) v(k,c,ok)
WHERE q.content = 'Mary ____ a beautiful song at the party.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'The dog ____ very loudly last night.', 'The past form of "bark" is "barked".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'The dog ____ very loudly last night.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','bark',false),('B','barked',true),('C','barks',false),('D','barking',false)) v(k,c,ok)
WHERE q.content = 'The dog ____ very loudly last night.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'David ____ his room yesterday morning.', 'The past form of "clean" is "cleaned".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'David ____ his room yesterday morning.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','clean',false),('B','cleaned',true),('C','cleans',false),('D','cleaning',false)) v(k,c,ok)
WHERE q.content = 'David ____ his room yesterday morning.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'Emma ____ a photo of the sunset.', 'The past form of "take" is "took".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Emma ____ a photo of the sunset.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','take',false),('B','took',true),('C','takes',false),('D','taking',false)) v(k,c,ok)
WHERE q.content = 'Emma ____ a photo of the sunset.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'They ____ the bus at seven o’clock.', 'The past form of "catch" is "caught".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'They ____ the bus at seven o’clock.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','catch',false),('B','caught',true),('C','catches',false),('D','catching',false)) v(k,c,ok)
WHERE q.content = 'They ____ the bus at seven o’clock.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'I ____ my grandmother last weekend.', 'The past form of "call" is "called".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'I ____ my grandmother last weekend.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','call',false),('B','called',true),('C','calls',false),('D','calling',false)) v(k,c,ok)
WHERE q.content = 'I ____ my grandmother last weekend.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'SINGLE_CHOICE', 'MEDIUM', 'Ben ____ a sandwich after school.', 'The past form of "make" is "made".', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Basic'
  AND NOT EXISTS (SELECT 1 FROM content_questions q WHERE q.question_bank_id = qb.id AND q.content = 'Ben ____ a sandwich after school.');

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','make',false),('B','made',true),('C','makes',false),('D','making',false)) v(k,c,ok)
WHERE q.content = 'Ben ____ a sandwich after school.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

-- =========================================================
-- CHECKS
-- =========================================================
SELECT qb.id, qb.name, t.name AS topic, COUNT(q.id) AS total_questions
FROM content_question_banks qb
         JOIN content_topics t ON t.id = qb.topic_id
         LEFT JOIN content_questions q ON q.question_bank_id = qb.id
WHERE qb.name IN ('Past Simple - Basic', 'Past Simple - Review', 'Comparatives - Basic')
GROUP BY qb.id, qb.name, t.name
ORDER BY qb.id;

SELECT qb.name AS question_bank, q.type, q.difficulty, COUNT(*) AS total
FROM content_questions q
         JOIN content_question_banks qb ON qb.id = q.question_bank_id
WHERE qb.name IN ('Past Simple - Basic', 'Past Simple - Review', 'Comparatives - Basic')
GROUP BY qb.name, q.type, q.difficulty
ORDER BY qb.name, q.type, q.difficulty;

-- =========================================================
-- EXTRA TYPE COVERAGE FOR API / FILTER TESTING
-- =========================================================

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'TRUE_FALSE', 'MEDIUM', 'The verb "go" changes to "went" in the past simple.', 'Go is an irregular verb; its past form is went.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Review'
  AND NOT EXISTS (
    SELECT 1 FROM content_questions q
    WHERE q.question_bank_id = qb.id
      AND q.content = 'The verb "go" changes to "went" in the past simple.'
);

INSERT INTO content_question_options (question_id, option_key, content, is_correct)
SELECT q.id, v.k, v.c, v.ok
FROM content_questions q
         CROSS JOIN (VALUES ('A','True',true),('B','False',false)) v(k,c,ok)
WHERE q.content = 'The verb "go" changes to "went" in the past simple.'
  AND NOT EXISTS (SELECT 1 FROM content_question_options qo WHERE qo.question_id = q.id);

INSERT INTO content_questions (question_bank_id, type, difficulty, content, explanation, is_complete, matching_mode)
SELECT qb.id, 'TYPE_ANSWER', 'HARD', 'Write one past simple sentence about your weekend.', 'Any valid past simple sentence can be accepted.', TRUE, 'CASE_INSENSITIVE_TRIM'
FROM content_question_banks qb
WHERE qb.name = 'Past Simple - Review'
  AND NOT EXISTS (
    SELECT 1 FROM content_questions q
    WHERE q.question_bank_id = qb.id
      AND q.content = 'Write one past simple sentence about your weekend.'
);

INSERT INTO content_question_answers (question_id, raw_value, normalized_value)
SELECT q.id, v.a, lower(trim(v.a))
FROM content_questions q
         CROSS JOIN (VALUES ('I visited my grandparents.'), ('I played football.')) v(a)
WHERE q.content = 'Write one past simple sentence about your weekend.'
  AND NOT EXISTS (
    SELECT 1 FROM content_question_answers x
    WHERE x.question_id = q.id
      AND x.normalized_value = lower(trim(v.a))
);

-- =========================================================
-- FINAL CHECKS
-- =========================================================

SELECT
    qb.id,
    qb.name,
    t.name AS topic,
    COUNT(q.id) AS total_questions,
    COUNT(*) FILTER (WHERE q.is_complete) AS ready_questions,
    COUNT(*) FILTER (WHERE NOT q.is_complete) AS incomplete_questions
FROM content_question_banks qb
         JOIN content_topics t ON t.id = qb.topic_id
         LEFT JOIN content_questions q ON q.question_bank_id = qb.id
WHERE qb.name IN (
                  'Past Simple - Basic',
                  'Past Simple - Review',
                  'Comparatives - Basic'
    )
GROUP BY qb.id, qb.name, t.name
ORDER BY qb.id;

SELECT
    qb.name AS question_bank,
    q.type,
    q.difficulty,
    q.is_complete,
    COUNT(*) AS total
FROM content_questions q
         JOIN content_question_banks qb ON qb.id = q.question_bank_id
WHERE qb.name IN (
                  'Past Simple - Basic',
                  'Past Simple - Review',
                  'Comparatives - Basic'
    )
GROUP BY qb.name, q.type, q.difficulty, q.is_complete
ORDER BY qb.name, q.type, q.difficulty, q.is_complete;
