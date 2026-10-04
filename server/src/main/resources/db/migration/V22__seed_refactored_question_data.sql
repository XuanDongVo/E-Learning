-- Canonical seed for the refactored shared Question Core.
-- Content and Assignment have distinct ownership rows.

-- Content question banks already exist from V6/V9/V16.
WITH q AS (
  INSERT INTO questions(type,difficulty,content,explanation,is_complete,matching_mode)
  VALUES
  ('SINGLE_CHOICE','EASY','There ____ a book on the desk.','Use "is" with a singular noun.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('SINGLE_CHOICE','EASY','There ____ two windows in our classroom.','Use "are" with a plural noun.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('TRUE_FALSE','EASY','We use "There are" with plural nouns.','Plural nouns use the plural form "are".',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('FILL_IN_BLANK','MEDIUM','There ____ three students in the room.','Use "are" because "students" is plural.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('MULTIPLE_CHOICE','MEDIUM','Which objects can be used for writing?','A pen and a pencil are both writing tools.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('TYPE_ANSWER','EASY','Name one object you use to write in class.','Examples include pen and pencil.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('SINGLE_CHOICE','EASY','She ____ to school yesterday.','Use "went" for a completed action in the past.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('FILL_IN_BLANK','EASY','I ____ my homework last night.','The past form of "do" is "did".',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('MULTIPLE_CHOICE','MEDIUM','Which sentences are in the past simple?','The first and third sentences describe completed past actions.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('SINGLE_CHOICE','HARD','They ____ the final match last weekend.',NULL,FALSE,'CASE_INSENSITIVE_TRIM'),
  ('FILL_IN_BLANK','EASY','My new phone is ____ (small) than my old phone.','The comparative form of "small" is "smaller".',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('TRUE_FALSE','MEDIUM','"Faster" is the comparative form of "fast".','Short adjectives usually take -er in the comparative form.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('SINGLE_CHOICE','EASY','There ____ a teacher in the classroom.','Use "is" with a singular noun.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('MULTIPLE_CHOICE','MEDIUM','Which sentences use the correct form of There is / There are?','Both plural examples correctly use There are.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('TRUE_FALSE','EASY','There are is used with plural nouns.','The plural form is There are.',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('FILL_IN_BLANK','EASY','There ____ four chairs in the room.','Use "are" with the plural noun "chairs".',TRUE,'CASE_INSENSITIVE_TRIM'),
  ('TYPE_ANSWER','EASY','Name one school object.','Examples include pen, pencil, ruler and notebook.',TRUE,'CASE_INSENSITIVE_TRIM')
  RETURNING id, content
)
INSERT INTO content_questions(question_id,question_bank_id)
SELECT q.id,qb.id
FROM q
JOIN content_question_banks qb ON qb.name =
  CASE q.content
    WHEN 'There ____ a book on the desk.' THEN 'There is / There are - Basic'
    WHEN 'There ____ two windows in our classroom.' THEN 'There is / There are - Basic'
    WHEN 'We use "There are" with plural nouns.' THEN 'There is / There are - Review'
    WHEN 'There ____ three students in the room.' THEN 'There is / There are - Review'
    WHEN 'Which objects can be used for writing?' THEN 'School Objects - Basic'
    WHEN 'Name one object you use to write in class.' THEN 'School Objects - Basic'
    WHEN 'She ____ to school yesterday.' THEN 'Past Simple - Basic'
    WHEN 'I ____ my homework last night.' THEN 'Past Simple - Basic'
    WHEN 'Which sentences are in the past simple?' THEN 'Past Simple - Review'
    WHEN 'They ____ the final match last weekend.' THEN 'Past Simple - Review'
    WHEN 'My new phone is ____ (small) than my old phone.' THEN 'Comparatives - Basic'
    WHEN '"Faster" is the comparative form of "fast".' THEN 'Comparatives - Basic'
  END
WHERE q.content NOT IN (
  'There ____ a teacher in the classroom.',
  'Which sentences use the correct form of There is / There are?',
  'There are is used with plural nouns.',
  'There ____ four chairs in the room.',
  'Name one school object.'
);

INSERT INTO assignment_questions(question_id,assignment_id,topic_id,position)
SELECT q.id,a.id,t.id,v.position
FROM questions q
JOIN (VALUES
  ('There ____ a teacher in the classroom.',0),
  ('Which sentences use the correct form of There is / There are?',1),
  ('There are is used with plural nouns.',2),
  ('There ____ four chairs in the room.',3),
  ('Name one school object.',4)
) v(content,position) ON v.content=q.content
JOIN assignments a ON a.name='Unit 1 Grammar Review'
LEFT JOIN content_topics t ON t.name='There is / There are'
 AND t.section_id IN (
   SELECT s.id FROM content_sections s
   JOIN content_units u ON u.id=s.unit_id
   WHERE u.code='U1' AND s.name='Grammar'
 );

INSERT INTO question_options(question_id,option_key,content,is_correct)
SELECT q.id,v.k,v.c,v.ok
FROM questions q
CROSS JOIN (VALUES
('There ____ a book on the desk.','A','is',TRUE),('There ____ a book on the desk.','B','are',FALSE),('There ____ a book on the desk.','C','am',FALSE),('There ____ a book on the desk.','D','be',FALSE),
('There ____ two windows in our classroom.','A','is',FALSE),('There ____ two windows in our classroom.','B','are',TRUE),('There ____ two windows in our classroom.','C','am',FALSE),('There ____ two windows in our classroom.','D','be',FALSE),
('Which objects can be used for writing?','A','Pen',TRUE),('Which objects can be used for writing?','B','Pencil',TRUE),('Which objects can be used for writing?','C','Desk',FALSE),('Which objects can be used for writing?','D','Chair',FALSE),
('She ____ to school yesterday.','A','go',FALSE),('She ____ to school yesterday.','B','went',TRUE),('She ____ to school yesterday.','C','goes',FALSE),('She ____ to school yesterday.','D','going',FALSE),
('Which sentences are in the past simple?','A','I visited Hanoi last year.',TRUE),('Which sentences are in the past simple?','B','She visits her grandmother every week.',FALSE),('Which sentences are in the past simple?','C','They went to the museum yesterday.',TRUE),('Which sentences are in the past simple?','D','We are studying now.',FALSE),
('There ____ a teacher in the classroom.','A','is',TRUE),('There ____ a teacher in the classroom.','B','are',FALSE),('There ____ a teacher in the classroom.','C','am',FALSE),('There ____ a teacher in the classroom.','D','be',FALSE),
('Which sentences use the correct form of There is / There are?','A','There is two books.',FALSE),('Which sentences use the correct form of There is / There are?','B','There are three desks.',TRUE),('Which sentences use the correct form of There is / There are?','C','There are two windows.',TRUE),('Which sentences use the correct form of There is / There are?','D','There is five students.',FALSE)
) v(content,k,c,ok)
WHERE q.content=v.content;

INSERT INTO question_answers(question_id,raw_value,normalized_value)
SELECT q.id,v.raw_value,v.normalized_value
FROM questions q
CROSS JOIN (VALUES
('We use "There are" with plural nouns.','TRUE','true'),
('There ____ three students in the room.','are','are'),
('I ____ my homework last night.','did','did'),
('My new phone is ____ (small) than my old phone.','smaller','smaller'),
('"Faster" is the comparative form of "fast".','TRUE','true'),
('There are is used with plural nouns.','TRUE','true'),
('There ____ four chairs in the room.','are','are'),
('Name one object you use to write in class.','pen','pen'),
('Name one object you use to write in class.','pencil','pencil'),
('Name one school object.','pen','pen'),
('Name one school object.','pencil','pencil'),
('Name one school object.','ruler','ruler'),
('Name one school object.','notebook','notebook')
) v(content,raw_value,normalized_value)
WHERE q.content=v.content;

SELECT COUNT(*) AS shared_questions FROM questions;
SELECT COUNT(*) AS content_question_owners FROM content_questions;
SELECT COUNT(*) AS assignment_question_owners FROM assignment_questions;
