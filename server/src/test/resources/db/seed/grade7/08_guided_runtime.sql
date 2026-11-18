BEGIN;

INSERT INTO content_question_banks (topic_id, name, description, display_order, status)
SELECT t.id, 'G7-SEED Guided Runtime',
       'Three READY Guided Reasoning questions for student runtime verification.', 9, 'PUBLISHED'
FROM content_topics t
JOIN content_sections s ON s.id = t.section_id
JOIN content_units u ON u.id = s.unit_id
WHERE u.code = 'G7-SEED-U01' AND t.name = 'G7-SEED Core Practice'
ON CONFLICT (topic_id, name) DO UPDATE
SET description = EXCLUDED.description, display_order = EXCLUDED.display_order, status = EXCLUDED.status;

WITH fixture(type, difficulty, content, explanation, hint, answers) AS (
    VALUES
        ('SINGLE_CHOICE', 'EASY', '[G7-GUIDED-RUNTIME SC] She ___ to school every day.',
         'With she in the present simple, use goes.', 'Think about the subject before choosing.', '[]'::jsonb),
        ('TRUE_FALSE', 'MEDIUM', '[G7-GUIDED-RUNTIME TF] "He go to school every day" is correct.',
         'He is third-person singular, so the verb needs -s: goes.', 'Check the verb after he.', '["FALSE"]'::jsonb),
        ('TYPE_ANSWER', 'HARD', '[G7-GUIDED-RUNTIME TYPE] Type the missing word: My friends ___ football on Sundays.',
         'With a plural subject, use the base verb play.', 'The subject is plural.', '["play"]'::jsonb)
)
INSERT INTO questions (type, difficulty, content, explanation, hint, is_complete, matching_mode, content_revision)
SELECT f.type, f.difficulty, f.content, f.explanation, f.hint, TRUE, 'CASE_INSENSITIVE_TRIM', 1
FROM fixture f
WHERE NOT EXISTS (SELECT 1 FROM questions q WHERE q.content = f.content);

INSERT INTO question_options (question_id, option_key, content, is_correct, display_order)
SELECT q.id, o.option_key, o.content, o.is_correct, o.display_order
FROM questions q
JOIN (VALUES
    ('[G7-GUIDED-RUNTIME SC] She ___ to school every day.', 'A', 'go', FALSE, 1),
    ('[G7-GUIDED-RUNTIME SC] She ___ to school every day.', 'B', 'goes', TRUE, 2),
    ('[G7-GUIDED-RUNTIME SC] She ___ to school every day.', 'C', 'going', FALSE, 3)
) AS o(question_content, option_key, content, is_correct, display_order) ON o.question_content = q.content
WHERE NOT EXISTS (
    SELECT 1 FROM question_options existing
    WHERE existing.question_id = q.id AND existing.option_key = o.option_key
);

INSERT INTO question_answers (question_id, raw_value, normalized_value)
SELECT q.id, answer, lower(btrim(answer))
FROM questions q
JOIN (VALUES
    ('[G7-GUIDED-RUNTIME TF] "He go to school every day" is correct.', 'FALSE'),
    ('[G7-GUIDED-RUNTIME TYPE] Type the missing word: My friends ___ football on Sundays.', 'play')
) AS a(question_content, answer) ON a.question_content = q.content
WHERE NOT EXISTS (
    SELECT 1 FROM question_answers existing
    WHERE existing.question_id = q.id AND existing.raw_value = a.answer
);

INSERT INTO content_questions (question_id, question_bank_id)
SELECT q.id, qb.id
FROM questions q
JOIN content_question_banks qb ON qb.name = 'G7-SEED Guided Runtime'
JOIN content_topics t ON t.id = qb.topic_id
JOIN content_sections s ON s.id = t.section_id
JOIN content_units u ON u.id = s.unit_id AND u.code = 'G7-SEED-U01'
WHERE q.content LIKE '[G7-GUIDED-RUNTIME %'
ON CONFLICT (question_id) DO UPDATE SET question_bank_id = EXCLUDED.question_bank_id;

INSERT INTO question_guided_definitions
    (question_id, schema_version, version, status, source_question_revision, definition_payload, created_at, updated_at)
SELECT q.id, 1, 0, 'READY', q.content_revision, payload::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM questions q
JOIN (VALUES
    ('[G7-GUIDED-RUNTIME SC] She ___ to school every day.', $$
     {"introContent":"Cùng ôn lại quy tắc hiện tại đơn trước khi làm câu chính.","steps":[
       {"stepKey":"subject","position":0,"type":"SINGLE_CHOICE","prompt":"'She' nói về chủ ngữ nào?","options":[{"key":"A","content":"Nhiều người hoặc nhiều vật"},{"key":"B","content":"Một người hoặc một vật"}],"correctKey":"B","expected":null,"acceptedAnswers":[],"matchingMode":null,"explanation":"She là ngôi thứ ba số ít.","hintEnabled":true,"hint":"She dùng cho một người nữ.","retryEnabled":true},
       {"stepKey":"rule","position":1,"type":"TRUE_FALSE","prompt":"Với she ở hiện tại đơn, động từ thường thêm -s hoặc -es.","options":[],"correctKey":null,"expected":true,"acceptedAnswers":[],"matchingMode":null,"explanation":"Đây là quy tắc ngôi thứ ba số ít.","hintEnabled":false,"hint":null,"retryEnabled":true},
       {"stepKey":"verb","position":2,"type":"TYPE_ANSWER","prompt":"Gõ dạng đúng của động từ go sau she.","options":[],"correctKey":null,"expected":null,"acceptedAnswers":["goes"],"matchingMode":"CASE_INSENSITIVE_TRIM","explanation":"Go thêm -es thành goes.","hintEnabled":true,"hint":"Động từ tận cùng bằng o thường thêm -es.","retryEnabled":true}
     ]}$$),
    ('[G7-GUIDED-RUNTIME TF] "He go to school every day" is correct.', $$
     {"introContent":"Phân tích chủ ngữ và động từ trước khi quyết định.","steps":[
       {"stepKey":"subject","position":0,"type":"TYPE_ANSWER","prompt":"Gõ đại từ trong câu đóng vai trò chủ ngữ.","options":[],"correctKey":null,"expected":null,"acceptedAnswers":["He"],"matchingMode":"CASE_INSENSITIVE_TRIM","explanation":"He là chủ ngữ trong câu.","hintEnabled":true,"hint":"Đó là từ đầu câu.","retryEnabled":true},
       {"stepKey":"verb","position":1,"type":"SINGLE_CHOICE","prompt":"Dạng động từ nào đúng sau he?","options":[{"key":"A","content":"go"},{"key":"B","content":"goes"}],"correctKey":"B","expected":null,"acceptedAnswers":[],"matchingMode":null,"explanation":"He dùng với goes ở hiện tại đơn.","hintEnabled":false,"hint":null,"retryEnabled":true}
     ]}$$),
    ('[G7-GUIDED-RUNTIME TYPE] Type the missing word: My friends ___ football on Sundays.', $$
     {"introContent":"Hãy xác định số ít hay số nhiều trước khi chọn động từ.","steps":[
       {"stepKey":"number","position":0,"type":"TRUE_FALSE","prompt":"Friends là danh từ số nhiều.","options":[],"correctKey":null,"expected":true,"acceptedAnswers":[],"matchingMode":null,"explanation":"Friends có -s và chỉ nhiều người.","hintEnabled":true,"hint":"Một friend, nhiều friends.","retryEnabled":true},
       {"stepKey":"base-form","position":1,"type":"TYPE_ANSWER","prompt":"Gõ dạng động từ dùng với my friends: play hay plays?","options":[],"correctKey":null,"expected":null,"acceptedAnswers":["play"],"matchingMode":"CASE_INSENSITIVE_TRIM","explanation":"Chủ ngữ số nhiều dùng động từ nguyên mẫu play.","hintEnabled":false,"hint":null,"retryEnabled":true}
     ]}$$)
) AS g(question_content, payload) ON g.question_content = q.content
ON CONFLICT (question_id) DO UPDATE SET
    schema_version = EXCLUDED.schema_version,
    status = EXCLUDED.status,
    source_question_revision = EXCLUDED.source_question_revision,
    definition_payload = EXCLUDED.definition_payload,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO activities
    (unit_id, name, description, display_order, status, distribution_mode, total_questions,
     mode, practice_type, time_limit_seconds, lives, question_difficulty, published_at)
SELECT u.id, 'G7-GUIDED-RUNTIME', 'Guided Reasoning UI fixture: choice, true/false, typing, hint and retry.',
       99, 'PUBLISHED', 'FIXED_COUNT', 3, 'LEARNING', 'GUIDED_REASONING', NULL, NULL, 'MIXED', CURRENT_TIMESTAMP
FROM content_units u
WHERE u.code = 'G7-SEED-U01'
ON CONFLICT (unit_id, name) DO UPDATE SET
    description = EXCLUDED.description, display_order = EXCLUDED.display_order, status = EXCLUDED.status,
    distribution_mode = EXCLUDED.distribution_mode, total_questions = EXCLUDED.total_questions,
    mode = EXCLUDED.mode, practice_type = EXCLUDED.practice_type,
    time_limit_seconds = NULL, lives = NULL, question_difficulty = EXCLUDED.question_difficulty,
    published_at = EXCLUDED.published_at;

INSERT INTO activity_selection_strategies (activity_id, selection_strategy)
SELECT a.id, 'RANDOM'
FROM activities a
WHERE a.name = 'G7-GUIDED-RUNTIME'
ON CONFLICT (activity_id, selection_strategy) DO NOTHING;

INSERT INTO activity_banks (activity_id, question_bank_id, display_order, percentage, fixed_count)
SELECT a.id, qb.id, 0, NULL, 3
FROM activities a
JOIN content_question_banks qb ON qb.name = 'G7-SEED Guided Runtime'
WHERE a.name = 'G7-GUIDED-RUNTIME'
ON CONFLICT (activity_id, question_bank_id) DO UPDATE
SET display_order = EXCLUDED.display_order, percentage = NULL, fixed_count = EXCLUDED.fixed_count;

-- Keep assertions plain SQL so clients that split procedural dollar-quoted
-- blocks still run this fixture correctly. Division by zero stops the seed.
SELECT 1 / CASE WHEN (
    SELECT count(*) FROM question_guided_definitions gd
    JOIN questions q ON q.id = gd.question_id
    WHERE q.content LIKE '[G7-GUIDED-RUNTIME %' AND gd.status = 'READY'
) = 3 THEN 1 ELSE 0 END AS guided_definition_assertion;

SELECT 1 / CASE WHEN EXISTS (
    SELECT 1 FROM activities
    WHERE name = 'G7-GUIDED-RUNTIME'
      AND practice_type = 'GUIDED_REASONING'
      AND mode = 'LEARNING'
) THEN 1 ELSE 0 END AS guided_activity_assertion;

COMMIT;
