-- Grade 7 supplemental Knowledge Note and Student Library/Reader QA fixtures.
-- Run AFTER 011_knowledge_note.sql and Flyway V69. PostgreSQL only.
-- DEV/TEST ONLY: never run on production or a populated real student database.
-- All content below is additive. Teacher-authored Notes/links are never edited.
-- Idempotency: description marker identifies each Note; unique Note/Topic links
-- are protected by ON CONFLICT. Existing Topic Primary is never replaced.
BEGIN;

DO $seed_preflight$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM grades WHERE code = 'GRADE_7') THEN
            RAISE EXCEPTION 'Run Grade 7 foundation (01) before 012';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'teacher@example.com' AND role = 'TEACHER') THEN
            RAISE EXCEPTION 'Expected seed Teacher account; run 01_foundation.sql first';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM knowledge_notes WHERE description LIKE '[G7-KN-SEED:g7-u01-core]%') THEN
            RAISE EXCEPTION 'Run 011_knowledge_note.sql before 012';
        END IF;
    END
$seed_preflight$;

-- 1. A distinct Topic for the primary-vs-supplementary cross-topic scenario.
-- The original Hobbies Topic and its Primary are preserved.
INSERT INTO content_topics (section_id, name, description, display_order, status)
SELECT s.id,
       'Present Simple vs Present Continuous',
       '[G7-KN-EXTRA-TOPIC] Contrast routines with actions happening now.',
       2, 'PUBLISHED'
FROM content_sections s
         JOIN content_units u ON u.id = s.unit_id AND u.code = 'G7-SEED-U01'
         JOIN grades g ON g.id = u.grade_id AND g.code = 'GRADE_7'
WHERE s.name = 'Grammar and Usage'
ON CONFLICT (section_id, name) DO NOTHING;

-- 2. Eight notes with honest learning content.
-- All content is a single Tiptap doc (V69). H2/H3 IDs and Learning Block IDs
-- are stable, and content is deliberately never overwritten on rerun.
-- The comparison table is a key point for renderer/Quick Summary testing.
WITH fixture(
             note_key, title, description, status, intro, rule, explanation,
             example, translation, check_question, table_left, table_right, table_example
    ) AS (
    VALUES
        ('g7-extra-tenses-contrast',
         'Phân biệt hiện tại đơn và hiện tại tiếp diễn',
         '[G7-KN-EXTRA:g7-extra-tenses-contrast] Cross-topic mixed Primary and Supplementary reading fixture.',
         'PUBLISHED',
         'Hiện tại đơn diễn tả thói quen và sự thật; hiện tại tiếp diễn nhấn mạnh hành động đang diễn ra lúc nói.',
         'Present Simple: S + V(s/es). Present Continuous: S + am/is/are + V-ing.',
         'Đọc từ chỉ thời gian trước: usually/every day thường gợi thói quen; now/at the moment thường gợi hành động đang xảy ra. Kiểm tra chủ ngữ và trợ động từ.',
         'She usually walks to school, but today she is riding a bike.',
         'Bạn ấy thường đi bộ đến trường, nhưng hôm nay đang đi xe đạp.',
         'The students ___ (study) English now. Đáp án: are studying.',
         'Present Simple | Thói quen: every day, usually',
         'Present Continuous | Đang xảy ra: now, at the moment',
         'He plays football on Sundays. / He is playing football now.'),
        ('g7-extra-hobbies-examples',
         'Ví dụ mở rộng - Sở thích và tần suất',
         '[G7-KN-EXTRA:g7-extra-hobbies-examples] Supplementary across Hobbies and Community Service.',
         'PUBLISHED',
         'Kết hợp hiện tại đơn với từ chỉ tần suất để mô tả lịch sinh hoạt hoặc hoạt động tình nguyện lặp lại.',
         'S + always/usually/often/sometimes/never + V; be + adverb of frequency.',
         'Từ chỉ tần suất thường đứng trước động từ thường, nhưng đứng sau động từ be. Với he/she/it vẫn chia động từ ở hiện tại đơn.',
         'Lan often reads books. Our class sometimes cleans the park.',
         'Lan thường đọc sách. Lớp chúng tôi đôi khi dọn công viên.',
         'Sửa câu: He always is late. Đáp án: He is always late.',
         'Động từ thường | She often reads.',
         'Động từ be | He is always polite.',
         'They usually play chess after school.'),
        ('g7-extra-quantity-table',
         'Bảng so sánh - Some, Any, Much, Many',
         '[G7-KN-EXTRA:g7-extra-quantity-table] Supplementary comparison table for Food and Drink.',
         'PUBLISHED',
         'Dùng bảng so sánh để chọn từ chỉ lượng phù hợp với danh từ đếm được và không đếm được.',
         'many + countable plural; much + uncountable; some/any + plural or uncountable.',
         'Many dùng với danh từ đếm được số nhiều, much với không đếm được. Some hay gặp trong câu khẳng định; any trong câu hỏi/phủ định, nhưng vẫn có ngoại lệ theo ý nghĩa.',
         'There are many apples. There is not much milk. Do we have any eggs?',
         'Có nhiều quả táo. Không có nhiều sữa. Chúng ta có quả trứng nào không?',
         'Chọn many/much: How ___ water is left? Đáp án: much.',
         'many | apples, bottles',
         'much | water, rice',
         'Some rice; any eggs; many vegetables.'),
        ('g7-extra-road-safety',
         'Đọc thêm - Hỏi khoảng cách và lời khuyên giao thông',
         '[G7-KN-EXTRA:g7-extra-road-safety] Supplementary for two Traffic-related Topics.',
         'PUBLISHED',
         'Luyện hỏi quãng đường, nhận diện hành vi an toàn và nêu lời khuyên bằng should.',
         'How far is it from A to B? / You should + V / You should not + V.',
         'How far hỏi khoảng cách; how long hỏi khoảng thời gian. Should đi cùng động từ nguyên mẫu, không thêm to.',
         'How far is it from home to school? You should wear a helmet.',
         'Từ nhà đến trường bao xa? Bạn nên đội mũ bảo hiểm.',
         'Sửa: You should to cross at the zebra crossing. Đáp án: You should cross...',
         'How far | Khoảng cách',
         'How long | Thời lượng',
         'You should follow traffic rules.'),
        ('g7-extra-error-review',
         'Lỗi thường gặp - Past Simple và Present Continuous',
         '[G7-KN-EXTRA:g7-extra-error-review] Supplementary across Community and Energy Units.',
         'PUBLISHED',
         'So sánh hai lỗi phổ biến: dùng V2 sau did và quên V-ing sau am/is/are.',
         'Did + S + V nguyên mẫu? / S + am/is/are + V-ing.',
         'Did đã mang dấu hiệu quá khứ nên động từ chính ở nguyên mẫu. Trong hiện tại tiếp diễn, động từ đi sau am/is/are cần dạng V-ing.',
         'Did you visit the museum? They are using solar panels now.',
         'Bạn đã thăm bảo tàng chưa? Hiện họ đang dùng các tấm pin mặt trời.',
         'Sửa: Did she visited? / They are use energy. Đáp án: Did she visit? / They are using energy.',
         'Past Simple | Did you see it?',
         'Present Continuous | Are you watching it?',
         'We visited the park yesterday; we are cleaning it now.'),
        ('g7-extra-articles-table',
         'Bảng so sánh - A, An, The và danh từ',
         '[G7-KN-EXTRA:g7-extra-articles-table] Supplementary for Food and English-speaking Countries.',
         'PUBLISHED',
         'Chọn a/an theo âm mở đầu, dùng the khi cả người nói và người nghe biết đối tượng.',
         'a + consonant sound; an + vowel sound; the + known/specific noun.',
         'University bắt đầu bằng âm /j/ nên dùng a university. Hour có h câm nên dùng an hour. The xác định người/vật đã biết.',
         'She is a university student. We spent an hour in the library.',
         'Bạn ấy là sinh viên đại học. Chúng tôi dành một giờ ở thư viện.',
         'Sửa: an university. Đáp án: a university.',
         'a | a university (âm /j/)',
         'an | an hour (h câm)',
         'The school has a library. The library is modern.'),
        ('g7-extra-free-reading',
         'Góc đọc tự do - Cách tự ôn từ vựng mỗi ngày',
         '[G7-KN-EXTRA:g7-extra-free-reading] Published but intentionally without Topic links.',
         'PUBLISHED',
         'Một trang học tập độc lập để luyện thói quen tự ôn từ vựng, không gắn vào Topic cụ thể.',
         'Read → Recall → Check → Review.',
         'Đọc từ và ví dụ, thử nhớ nghĩa trước khi kiểm tra, rồi ôn lại từ khó vào các ngày tiếp theo. Không đoán rằng hệ thống đã ghi nhận tiến độ đọc.',
         'I learn five new words today and review them tomorrow.',
         'Hôm nay tôi học năm từ mới và ôn lại chúng vào ngày mai.',
         'Hãy viết một câu riêng với hai từ đã học gần đây.',
         'Read | Đọc từ trong ngữ cảnh',
         'Recall | Nhớ lại mà không nhìn',
         'Check your understanding before moving on.'),
        ('g7-extra-hidden-draft',
         'Bản chưa công bố - Thử giới hạn thư viện',
         '[G7-KN-EXTRA:g7-extra-hidden-draft] UNPUBLISHED visibility negative fixture.',
         'UNPUBLISHED',
         'Nội dung phục vụ kiểm tra quyền đọc; học sinh không được nhìn thấy bài chưa công bố.',
         'This is an unpublished Teacher-only fixture.',
         'Không liên kết bài này với Topic và không hiển thị trong thư viện Student.',
         'This material must never be shown to a Student.',
         'Nội dung này không được hiển thị với học sinh.',
         'Kiểm tra API GET /v1/student/knowledge-notes/{id} phải từ chối.',
         'PUBLISHED | Có thể đọc cùng Grade',
         'UNPUBLISHED | Không được đọc',
         'Negative visibility fixture.')
),
     documents AS (
         SELECT f.*,
                jsonb_build_object(
                        'type', 'doc',
                        'content',
                        jsonb_build_array(
                                jsonb_build_object('type','heading',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-heading','level',2),
                                                   'content',jsonb_build_array(jsonb_build_object('type','text','text',f.title))),
                                jsonb_build_object('type','paragraph',
                                                   'content',jsonb_build_array(jsonb_build_object('type','text','text',f.intro))),
                                jsonb_build_object('type','heading',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-compare','level',3),
                                                   'content',jsonb_build_array(jsonb_build_object('type','text','text','So sánh và ghi nhớ'))),
                                jsonb_build_object('type','table',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-table',
                                                                              'purpose','comparison','isKeyPoint',true),
                                                   'content',jsonb_build_array(
                                                           jsonb_build_object('type','tableRow','content',jsonb_build_array(
                                                                   jsonb_build_object('type','tableHeader','content',jsonb_build_array(
                                                                           jsonb_build_object('type','paragraph','content',jsonb_build_array(
                                                                                   jsonb_build_object('type','text','text','Cấu trúc / Trường hợp'))))),
                                                                   jsonb_build_object('type','tableHeader','content',jsonb_build_array(
                                                                           jsonb_build_object('type','paragraph','content',jsonb_build_array(
                                                                                   jsonb_build_object('type','text','text','Ghi nhớ / Ví dụ'))))))),
                                                           jsonb_build_object('type','tableRow','content',jsonb_build_array(
                                                                   jsonb_build_object('type','tableCell','content',jsonb_build_array(
                                                                           jsonb_build_object('type','paragraph','content',jsonb_build_array(
                                                                                   jsonb_build_object('type','text','text',split_part(f.table_left,' | ',1)))))),
                                                                   jsonb_build_object('type','tableCell','content',jsonb_build_array(
                                                                           jsonb_build_object('type','paragraph','content',jsonb_build_array(
                                                                                   jsonb_build_object('type','text','text',split_part(f.table_left,' | ',2)))))))),
                                                           jsonb_build_object('type','tableRow','content',jsonb_build_array(
                                                                   jsonb_build_object('type','tableCell','content',jsonb_build_array(
                                                                           jsonb_build_object('type','paragraph','content',jsonb_build_array(
                                                                                   jsonb_build_object('type','text','text',split_part(f.table_right,' | ',1)))))),
                                                                   jsonb_build_object('type','tableCell','content',jsonb_build_array(
                                                                           jsonb_build_object('type','paragraph','content',jsonb_build_array(
                                                                                   jsonb_build_object('type','text','text',split_part(f.table_right,' | ',2))))))))
                                                             )),
                                jsonb_build_object('type','learningBlock',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-formula',
                                                                              'kind','formula','title','Quy tắc trọng tâm','variant','important','isKeyPoint',true),
                                                   'content',jsonb_build_array(
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','expression'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text',f.rule))))),
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','explanation'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text',f.explanation))))),
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','condition'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text','Quan sát từ khóa và ngữ cảnh của từng câu.')))))))
                        )
                            ||
                        jsonb_build_array(
                                jsonb_build_object('type','heading',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-example-heading','level',3),
                                                   'content',jsonb_build_array(jsonb_build_object('type','text','text','Ví dụ và tự kiểm tra'))),
                                jsonb_build_object('type','learningBlock',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-example',
                                                                              'kind','example','title','Ví dụ minh họa','variant','default','isKeyPoint',false),
                                                   'content',jsonb_build_array(
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','example'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text',f.example))))),
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','explanation'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text',f.table_example))))),
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','translation'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text',f.translation))))))),
                                jsonb_build_object('type','learningBlock',
                                                   'attrs',jsonb_build_object('id',f.note_key || '-self-check',
                                                                              'kind','callout','title','Tự kiểm tra','variant','note','isKeyPoint',false),
                                                   'content',jsonb_build_array(
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','body'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text',f.check_question))))),
                                                           jsonb_build_object('type','learningSection','attrs',jsonb_build_object('role','explanation'),
                                                                              'content',jsonb_build_array(jsonb_build_object('type','paragraph',
                                                                                                                             'content',jsonb_build_array(jsonb_build_object('type','text','text','Đọc lại bảng so sánh và tự kiểm tra quy tắc.')))))))
                        )
                ) AS document_json
         FROM fixture f
     )
INSERT INTO knowledge_notes
(grade_id, title, description, document_json, status,
 created_by, created_at, updated_at, published_at)
SELECT g.id, d.title, d.description, d.document_json, d.status,
       teacher.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
       CASE WHEN d.status = 'PUBLISHED' THEN CURRENT_TIMESTAMP ELSE NULL END
FROM documents d
         JOIN grades g ON g.code = 'GRADE_7'
         JOIN users teacher ON teacher.email = 'teacher@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_notes existing WHERE existing.description = d.description
);

-- 3. Primary ONLY for the new contrast Topic; preserve a teacher's Primary if present.
INSERT INTO knowledge_note_topic_links
(knowledge_note_id, topic_id, is_primary, display_order, created_at)
SELECT n.id, t.id, TRUE, 0, CURRENT_TIMESTAMP
FROM knowledge_notes n
         JOIN content_topics t ON t.name = 'Present Simple vs Present Continuous'
         JOIN content_sections s ON s.id = t.section_id AND s.name = 'Grammar and Usage'
         JOIN content_units u ON u.id = s.unit_id AND u.code = 'G7-SEED-U01'
         JOIN grades g ON g.id = u.grade_id AND g.code = 'GRADE_7'
WHERE n.description = '[G7-KN-EXTRA:g7-extra-tenses-contrast] Cross-topic mixed Primary and Supplementary reading fixture.'
  AND n.status = 'PUBLISHED'
  AND NOT EXISTS (
    SELECT 1 FROM knowledge_note_topic_links existing
    WHERE existing.topic_id = t.id AND existing.is_primary = TRUE
)
ON CONFLICT (knowledge_note_id, topic_id) DO NOTHING;

-- 4. Supplementary links to already seeded, PUBLISHED Grade 7 Topics.
-- One Note can be reused across Topics; never replace an existing Primary
-- or change an existing Note/Topic relationship created by a Teacher.
WITH link_map(note_key, unit_code, topic_name, display_order) AS (
    VALUES
        ('g7-extra-tenses-contrast', 'G7-SEED-U01', 'Hobbies and Present Simple', 10),
        ('g7-extra-tenses-contrast', 'G7-CURR-U10', 'Energy and Present Continuous', 10),
        ('g7-extra-hobbies-examples', 'G7-SEED-U01', 'Hobbies and Present Simple', 20),
        ('g7-extra-hobbies-examples', 'G7-SEED-U03', 'Community Service and Past Simple', 20),
        ('g7-extra-quantity-table', 'G7-SEED-U05', 'Food, Drink and Quantities', 10),
        ('g7-extra-road-safety', 'G7-CURR-U07', 'Traffic, Distance and Advice', 10),
        ('g7-extra-road-safety', 'G7-CURR-U09', 'Festivals and Word Stress', 20),
        ('g7-extra-error-review', 'G7-SEED-U03', 'Community Service and Past Simple', 10),
        ('g7-extra-error-review', 'G7-CURR-U10', 'Energy and Present Continuous', 20),
        ('g7-extra-articles-table', 'G7-SEED-U05', 'Food, Drink and Quantities', 20),
        ('g7-extra-articles-table', 'G7-CURR-U12', 'Countries, Articles and Intonation', 10)
)
INSERT INTO knowledge_note_topic_links
(knowledge_note_id, topic_id, is_primary, display_order, created_at)
SELECT n.id, t.id, FALSE, m.display_order, CURRENT_TIMESTAMP
FROM link_map m
         JOIN knowledge_notes n
              ON n.description LIKE ('[G7-KN-EXTRA:' || m.note_key || ']%')
         JOIN content_units u ON u.code = m.unit_code
         JOIN grades g ON g.id = u.grade_id AND g.code = 'GRADE_7'
         JOIN content_sections s ON s.unit_id = u.id AND s.name = 'Grammar and Usage'
         JOIN content_topics t ON t.section_id = s.id AND t.name = m.topic_name
WHERE n.status = 'PUBLISHED'
ON CONFLICT (knowledge_note_id, topic_id) DO NOTHING;

-- 5. Strong verification: fail the transaction for missing fixtures or
-- duplicate primary/invalid cross-grade links. Assertions are for *our* IDs.
DO $seed_assert$
    DECLARE
        notes_added INT;
        linked_extra INT;
    BEGIN
        SELECT COUNT(*) INTO notes_added
        FROM knowledge_notes
        WHERE description LIKE '[G7-KN-EXTRA:%';
        IF notes_added <> 8 THEN
            RAISE EXCEPTION 'Expected exactly 8 G7-KN-EXTRA Notes, found %', notes_added;
        END IF;

        SELECT COUNT(*) INTO linked_extra
        FROM knowledge_note_topic_links l
                 JOIN knowledge_notes n ON n.id = l.knowledge_note_id
        WHERE n.description LIKE '[G7-KN-EXTRA:%';
        IF linked_extra < 11 THEN
            RAISE EXCEPTION 'Expected 11+ supplemental/primary extra links, found %', linked_extra;
        END IF;

        IF EXISTS (
            SELECT 1 FROM knowledge_note_topic_links l
                              JOIN knowledge_notes n ON n.id = l.knowledge_note_id
                              JOIN content_topics t ON t.id = l.topic_id
                              JOIN content_sections s ON s.id = t.section_id
                              JOIN content_units u ON u.id = s.unit_id
            WHERE n.description LIKE '[G7-KN-EXTRA:%'
              AND (n.grade_id <> u.grade_id OR n.status <> 'PUBLISHED')
        ) THEN
            RAISE EXCEPTION 'Supplementary fixture produced cross-grade or nonpublished association';
        END IF;

        IF EXISTS (
            SELECT topic_id
            FROM knowledge_note_topic_links
            WHERE is_primary
            GROUP BY topic_id
            HAVING COUNT(*) > 1
        ) THEN
            RAISE EXCEPTION 'More than one Primary Note for one Topic';
        END IF;

        IF EXISTS (
            SELECT 1 FROM knowledge_note_topic_links l
                              JOIN knowledge_notes n ON n.id = l.knowledge_note_id
            WHERE n.description LIKE '[G7-KN-EXTRA:g7-extra-free-reading]%'
               OR n.description LIKE '[G7-KN-EXTRA:g7-extra-hidden-draft]%'
        ) THEN
            RAISE EXCEPTION 'Free reading or unpublished fixture must remain unlinked';
        END IF;
    END
$seed_assert$;

COMMIT;

-- 6. Read-only QA summary (no hardcoded DB IDs).
SELECT n.title, n.status,
       COUNT(l.id) AS linked_topics,
       COUNT(l.id) FILTER (WHERE l.is_primary) AS primary_links,
       COUNT(l.id) FILTER (WHERE NOT l.is_primary) AS supplementary_links
FROM knowledge_notes n
         LEFT JOIN knowledge_note_topic_links l ON l.knowledge_note_id = n.id
WHERE n.description LIKE '[G7-KN-EXTRA:%'
GROUP BY n.id, n.title, n.status
ORDER BY n.title;