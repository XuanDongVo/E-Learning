

BEGIN;

-- Add the missing curriculum units without changing legacy fixture units.
INSERT INTO content_units
    (grade_id, code, name, description, display_order, status, published_at)
SELECT g.id, v.code, v.name, v.description, v.display_order, 'PUBLISHED', CURRENT_TIMESTAMP
FROM grades g
CROSS JOIN (VALUES
    ('G7-CURR-U06', 'A Visit to a School', 'School facilities, prepositions and describing schools.', 6),
    ('G7-CURR-U07', 'Traffic', 'Transport, distance, road safety and advice.', 7),
    ('G7-CURR-U08', 'Films', 'Film genres, opinions and contrast expressions.', 8),
    ('G7-CURR-U09', 'Festivals Around the World', 'Festivals, descriptions, questions and word stress.', 9),
    ('G7-CURR-U10', 'Energy Sources', 'Energy, present continuous and conservation.', 10),
    ('G7-CURR-U11', 'Travelling in the Future', 'Future transport, predictions and possession.', 11),
    ('G7-CURR-U12', 'English-speaking Countries', 'Countries, cultures, articles and intonation.', 12)
) AS v(code, name, description, display_order)
WHERE g.code = 'GRADE_7'
ON CONFLICT (grade_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    published_at = COALESCE(content_units.published_at, EXCLUDED.published_at);

-- Every curriculum unit has a stable section set. Existing sections are
-- preserved and only missing sections/topics are added.
INSERT INTO content_sections (unit_id, name, description, display_order, status)
SELECT u.id, s.name, s.description, s.display_order, 'PUBLISHED'
FROM content_units u
CROSS JOIN (VALUES
    ('Vocabulary and Pronunciation', 'Theme vocabulary, collocations and pronunciation.', 1),
    ('Grammar and Usage', 'Grammar structures and guided examples.', 2),
    ('Communication and Skills', 'Communication, reading and writing strategies.', 3)
) AS s(name, description, display_order)
JOIN grades g ON g.id = u.grade_id AND g.code = 'GRADE_7'
WHERE u.code LIKE 'G7-SEED-U%' OR u.code LIKE 'G7-CURR-U%'
ON CONFLICT (unit_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status;

-- One focused curriculum topic per core note. The topic is only a link target;
-- the note remains independently owned by Grade 7.
INSERT INTO content_topics (section_id, name, description, display_order, status)
SELECT s.id, v.topic_name, v.topic_description, 1, 'PUBLISHED'
FROM content_units u
JOIN content_sections s ON s.unit_id = u.id AND s.name = 'Grammar and Usage'
JOIN (VALUES
    ('G7-SEED-U01', 'Hobbies and Present Simple', 'Hobbies vocabulary and present simple routines.'),
    ('G7-SEED-U02', 'Healthy Living and Advice', 'Health problems, habits and advice.'),
    ('G7-SEED-U03', 'Community Service and Past Simple', 'Community activities and completed actions.'),
    ('G7-SEED-U04', 'Music, Arts and Comparisons', 'Arts vocabulary and comparison structures.'),
    ('G7-SEED-U05', 'Food, Drink and Quantities', 'Countable nouns, uncountable nouns and quantities.'),
    ('G7-SEED-U06', 'Traffic and Road Safety', 'Legacy Traffic and Transport topic retained for compatibility.'),
    ('G7-CURR-U06', 'School Facilities and Prepositions', 'School places and prepositions of time and place.'),
    ('G7-CURR-U07', 'Traffic, Distance and Advice', 'Distance expressions, should and road safety.'),
    ('G7-CURR-U08', 'Films and Opinions', 'Film genres, opinions and contrast.'),
    ('G7-CURR-U09', 'Festivals and Word Stress', 'Festival descriptions, questions and stress.'),
    ('G7-CURR-U10', 'Energy and Present Continuous', 'Energy sources, current actions and conservation.'),
    ('G7-CURR-U11', 'Future Transport and Predictions', 'Future simple and possessive pronouns.'),
    ('G7-CURR-U12', 'Countries, Articles and Intonation', 'Articles, place descriptions and questions.')
) AS v(unit_code, topic_name, topic_description) ON v.unit_code = u.code
ON CONFLICT (section_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status;

-- The documents below use only the V69 validator contract. The marker in each
-- description is the fixture identity: reruns skip these rows and never
-- overwrite a teacher-authored note with the same title.
WITH seed_notes(note_key, title, description, unit_code, topic_name,
                intro, expression, explanation, example, translation, mistake) AS (
    VALUES
    ('g7-u01-core', 'U01 - Sở thích và thì hiện tại đơn',
     '[G7-KN-SEED:g7-u01-core] Core Curriculum; vocabulary, grammar and communication.',
     'G7-SEED-U01', 'Hobbies and Present Simple',
     'Dùng để nói về sở thích, thói quen và hoạt động lặp lại trong thời gian rảnh.',
     'S + V(s/es) + ...; S + do/does not + V; Do/Does + S + V ...?',
     'Với he, she, it, động từ thường thêm s hoặc es ở câu khẳng định. Sau do, does và does not, động từ trở về dạng nguyên mẫu.',
     'Mai plays chess every Sunday. Does Nam collect stamps?',
     'Mai chơi cờ mỗi Chủ nhật. Nam có sưu tầm tem không?',
     'Sai: She play badminton. Đúng: She plays badminton. Chủ ngữ she cần động từ có s ở hiện tại đơn.'),
    ('g7-u02-core', 'U02 - Sống khỏe và đưa lời khuyên',
     '[G7-KN-SEED:g7-u02-core] Core Curriculum; health vocabulary and advice.',
     'G7-SEED-U02', 'Healthy Living and Advice',
     'Bài học kết nối từ vựng về sức khỏe với cách nói thói quen và lời khuyên đơn giản.',
     'S + should/should not + V nguyên mẫu.',
     'Should dùng để khuyên nên làm; should not hoặc should not viết tắt là shouldn’t dùng để khuyên không nên làm.',
     'You should drink enough water. You shouldn’t skip breakfast.',
     'Bạn nên uống đủ nước. Bạn không nên bỏ bữa sáng.',
     'Sai: You should to sleep early. Đúng: You should sleep early. Sau should không dùng to.'),
    ('g7-u03-core', 'U03 - Hoạt động cộng đồng và thì quá khứ đơn',
     '[G7-KN-SEED:g7-u03-core] Core Curriculum; past simple and community service.',
     'G7-SEED-U03', 'Community Service and Past Simple',
     'Thì quá khứ đơn kể một việc đã hoàn thành tại một thời điểm hoặc giai đoạn đã kết thúc.',
     'S + V-ed/V2 + ...; S + did not + V; Did + S + V ...?',
     'Động từ có quy tắc thêm ed; động từ bất quy tắc phải học dạng quá khứ riêng. Trong câu hỏi và phủ định với did, dùng động từ nguyên mẫu.',
     'Last Saturday, our class cleaned the park. Did they donate books?',
     'Thứ Bảy trước, lớp chúng tôi đã dọn công viên. Họ có quyên góp sách không?',
     'Sai: Did you visited the elderly? Đúng: Did you visit the elderly? Sau did dùng visit.'),
    ('g7-u04-core', 'U04 - Âm nhạc, nghệ thuật và so sánh',
     '[G7-KN-SEED:g7-u04-core] Core Curriculum; comparisons and arts vocabulary.',
     'G7-SEED-U04', 'Music, Arts and Comparisons',
     'Các mẫu so sánh giúp nêu điểm giống, khác hoặc mức độ tương đương giữa hai sự vật.',
     'A is like B; A is different from B; A is (not) as + adjective + as B.',
     'Like nghĩa là giống; different from nghĩa là khác; as ... as diễn tả mức độ bằng nhau hoặc không bằng nhau.',
     'This painting is as colourful as that one. Rock music is different from folk music.',
     'Bức tranh này nhiều màu như bức kia. Nhạc rock khác nhạc dân gian.',
     'Sai: This song is different than that song. Đúng: This song is different from that song.'),
    ('g7-u05-core', 'U05 - Đồ ăn, thức uống và từ chỉ lượng',
     '[G7-KN-SEED:g7-u05-core] Core Curriculum; countability and quantities.',
     'G7-SEED-U05', 'Food, Drink and Quantities',
     'Từ chỉ lượng phải phù hợp với danh từ đếm được hoặc không đếm được.',
     'some/any + danh từ; a lot of/lots of + danh từ số nhiều hoặc không đếm được.',
     'Rice và water thường không đếm được; apples và eggs là danh từ đếm được số nhiều. Some thường dùng trong câu khẳng định, any thường dùng trong phủ định và câu hỏi.',
     'We need some rice and a lot of vegetables. Are there any eggs?',
     'Chúng ta cần một ít gạo và nhiều rau. Có quả trứng nào không?',
     'Sai: two breads. Đúng: two loaves of bread hoặc two pieces of bread. Bread thường không đếm trực tiếp.'),
    ('g7-u06-school', 'U06 - Thăm một ngôi trường',
     '[G7-KN-SEED:g7-u06-school] Core Curriculum; school description and prepositions.',
     'G7-CURR-U06', 'School Facilities and Prepositions',
     'Bài học giúp mô tả trường học bằng từ vựng về cơ sở vật chất và giới từ vị trí, thời gian.',
     'There is/are ...; in/on/at + place or time.',
     'There is dùng với danh từ số ít, there are dùng với danh từ số nhiều. In thường chỉ không gian lớn hoặc tháng/năm; on chỉ ngày/bề mặt; at chỉ địa điểm hoặc thời điểm cụ thể.',
     'There are two laboratories on the second floor. Classes start at eight o’clock.',
     'Có hai phòng thí nghiệm ở tầng hai. Các tiết học bắt đầu lúc tám giờ.',
     'Sai: The library is in the second floor. Đúng: The library is on the second floor.'),
    ('g7-u07-traffic', 'U07 - Giao thông, khoảng cách và an toàn đường bộ',
     '[G7-KN-SEED:g7-u07-traffic] Core Curriculum; distance, advice and road safety.',
     'G7-CURR-U07', 'Traffic, Distance and Advice',
     'Có thể hỏi khoảng cách và đưa lời khuyên để đi lại an toàn.',
     'How far is it from A to B? - It is ...; You should/shouldn’t + V.',
     'Mẫu How far hỏi khoảng cách. It is ... kilometres from ... to ... trả lời khoảng cách; should và shouldn’t nêu lời khuyên.',
     'How far is it from home to school? It is two kilometres. You should wear a helmet.',
     'Từ nhà đến trường bao xa? Hai ki-lô-mét. Bạn nên đội mũ bảo hiểm.',
     'Sai: How long is it from here to school? Đúng: How far is it from here to school?'),
    ('g7-u08-films', 'U08 - Thể loại phim và cách nêu ý kiến',
     '[G7-KN-SEED:g7-u08-films] Core Curriculum; film opinions and contrast.',
     'G7-CURR-U08', 'Films and Opinions',
     'Từ vựng về phim giúp học sinh mô tả thể loại và nêu lý do yêu thích hoặc không yêu thích.',
     'Although + mệnh đề, mệnh đề; Mệnh đề. However, mệnh đề.',
     'Although nối hai ý tương phản trong cùng một câu. However thường đứng sau dấu chấm hoặc dấu chấm phẩy và cần dấu phẩy sau nó.',
     'Although the film is long, it is exciting. The story is simple. However, the acting is excellent.',
     'Mặc dù phim dài nhưng rất hấp dẫn. Cốt truyện đơn giản. Tuy nhiên, diễn xuất rất xuất sắc.',
     'Sai: Although it rained, but we watched the film. Đúng: Although it rained, we watched the film.'),
    ('g7-u09-festivals', 'U09 - Lễ hội và trọng âm từ hai âm tiết',
     '[G7-KN-SEED:g7-u09-festivals] Core Curriculum; festivals, questions and stress.',
     'G7-CURR-U09', 'Festivals and Word Stress',
     'Mô tả lễ hội cần từ vựng về thời gian, hoạt động, người tham gia và mục đích.',
     'Wh-word + do/does/did + S + V ...?; trọng âm rơi vào một âm tiết nổi bật.',
     'Câu hỏi Wh hỏi thông tin cụ thể; do, does hoặc did phải phù hợp với thì. Khi học từ hai âm tiết, cần ghi nhớ âm tiết được nhấn mạnh thay vì đọc đều các âm.',
     'When does the festival take place? People celebrate it in spring.',
     'Lễ hội diễn ra khi nào? Mọi người tổ chức lễ hội vào mùa xuân.',
     'Sai: Where the festival takes place? Đúng: Where does the festival take place?'),
    ('g7-u10-energy', 'U10 - Nguồn năng lượng và hiện tại tiếp diễn',
     '[G7-KN-SEED:g7-u10-energy] Core Curriculum; present continuous and conservation.',
     'G7-CURR-U10', 'Energy and Present Continuous',
     'Hiện tại tiếp diễn diễn tả việc đang xảy ra quanh thời điểm nói; chủ đề năng lượng mở rộng sang hành động tiết kiệm điện.',
     'S + am/is/are + V-ing; S + am/is/are not + V-ing; Am/Is/Are + S + V-ing?',
     'Dùng be đúng với chủ ngữ và thêm ing vào động từ. Không dùng hiện tại tiếp diễn cho sự thật hoặc thói quen ổn định.',
     'We are saving electricity by turning off the lights. Is the wind turbine working?',
     'Chúng tôi đang tiết kiệm điện bằng cách tắt đèn. Tuabin gió có đang hoạt động không?',
     'Sai: They are use solar energy. Đúng: They are using solar energy. Sau are cần V-ing.'),
    ('g7-u11-future', 'U11 - Phương tiện tương lai và dự đoán',
     '[G7-KN-SEED:g7-u11-future] Core Curriculum; future simple and possession.',
     'G7-CURR-U11', 'Future Transport and Predictions',
     'Nói về phương tiện tương lai cần dự đoán, nêu khả năng và chỉ rõ vật thuộc về ai.',
     'S + will + V; S + will not + V; This is mine/yours/his/hers/ours/theirs.',
     'Will đứng trước động từ nguyên mẫu để dự đoán hoặc quyết định nhanh. Đại từ sở hữu thay cho cụm tính từ sở hữu và danh từ đã biết.',
     'People will travel in flying cars. This electric bike is ours.',
     'Mọi người sẽ đi lại bằng ô tô bay. Chiếc xe đạp điện này là của chúng tôi.',
     'Sai: This is my. Đúng: This is mine. Sau this is cần đại từ sở hữu độc lập.'),
    ('g7-u12-countries', 'U12 - Các nước nói tiếng Anh và mạo từ',
     '[G7-KN-SEED:g7-u12-countries] Core Curriculum; articles and descriptions.',
     'G7-CURR-U12', 'Countries, Articles and Intonation',
     'Mạo từ và cách lên xuống giọng giúp mô tả địa điểm, văn hóa và đặt câu hỏi rõ ràng.',
     'a/an + danh từ số ít chưa xác định; the + đối tượng đã xác định hoặc duy nhất.',
     'Dùng an trước âm nguyên âm, không chỉ trước chữ cái nguyên âm. Dùng the khi người nghe biết đối tượng hoặc đối tượng là duy nhất trong ngữ cảnh.',
     'Australia is an English-speaking country. The capital city is Canberra.',
     'Australia là một quốc gia nói tiếng Anh. Thủ đô là Canberra.',
     'Sai: She is an university student. Đúng: She is a university student. University bắt đầu bằng âm /juː/.'),
    ('g7-review-tenses', 'Ôn tập - Bốn thì thường dùng ở lớp 7',
     '[G7-KN-SEED:g7-review-tenses] Review; present, past and future tenses.',
     NULL, NULL,
     'Ôn tập nhanh giúp phân biệt hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn và tương lai đơn trước khi làm bài.',
     'Present simple: V(s/es); present continuous: am/is/are + V-ing; past simple: V2/V-ed; future simple: will + V.',
     'Từ khóa thời gian và mục đích câu giúp chọn thì. Hãy kiểm tra cả trợ động từ và dạng chính của động từ.',
     'She usually walks to school, but she is riding a bike today. She visited her aunt yesterday and will return tomorrow.',
     'Bạn ấy thường đi bộ đến trường nhưng hôm nay đang đi xe đạp. Hôm qua bạn ấy đã thăm cô và ngày mai sẽ quay lại.',
     'Sai: He is play football every Sunday. Đúng: He plays football every Sunday. Thói quen dùng hiện tại đơn.'),
    ('g7-review-pronouns', 'Ôn tập - Đại từ chủ ngữ, tân ngữ và sở hữu',
     '[G7-KN-SEED:g7-review-pronouns] Review; pronouns and possession.',
     NULL, NULL,
     'Đại từ giúp tránh lặp danh từ và cho biết ai thực hiện, nhận hoặc sở hữu một hành động.',
     'I/me/my/mine; he/him/his; she/her/hers; we/us/our/ours; they/them/their/theirs.',
     'Đại từ chủ ngữ đứng trước động từ; tân ngữ đứng sau động từ hoặc giới từ; tính từ sở hữu đi trước danh từ; đại từ sở hữu đứng độc lập.',
     'This is our classroom. The classroom is ours. The teacher helps us.',
     'Đây là lớp học của chúng tôi. Lớp học là của chúng tôi. Giáo viên giúp chúng tôi.',
     'Sai: This book is my. Đúng: This book is mine. Đại từ sở hữu không đi kèm danh từ.'),
    ('g7-review-articles-quantifiers', 'Ôn tập - Mạo từ, danh từ và từ chỉ lượng',
     '[G7-KN-SEED:g7-review-articles-quantifiers] Review; articles, countability and quantities.',
     NULL, NULL,
     'Nhận diện danh từ đếm được, không đếm được giúp chọn mạo từ và từ chỉ lượng chính xác.',
     'a/an + danh từ số ít; some/any + danh từ; many/few + đếm được; much/little + không đếm được.',
     'Không dùng a/an với danh từ không đếm được. Many hỏi số lượng đếm được; much hỏi lượng không đếm được trong câu hỏi và phủ định.',
     'There are many apples, but there isn’t much juice.',
     'Có nhiều quả táo nhưng không có nhiều nước ép.',
     'Sai: much students. Đúng: many students. Students là danh từ đếm được số nhiều.'),
    ('g7-review-prepositions', 'Ôn tập - Giới từ thời gian và nơi chốn',
     '[G7-KN-SEED:g7-review-prepositions] Review; prepositions of time and place.',
     NULL, NULL,
     'Giới từ cho biết một người hoặc sự vật ở đâu và một hoạt động diễn ra khi nào.',
     'at + giờ/điểm cụ thể; on + ngày/bề mặt; in + tháng/năm/khu vực; next to/between/opposite + vị trí.',
     'Học giới từ theo cụm và hình dung quan hệ vị trí. Một số cách dùng phụ thuộc vào ngữ cảnh, không nên dịch từng từ.',
     'The science room is next to the library. We have English on Monday.',
     'Phòng khoa học ở cạnh thư viện. Chúng tôi học tiếng Anh vào thứ Hai.',
     'Sai: at Monday. Đúng: on Monday. Ngày trong tuần dùng on.'),
    ('g7-review-reading-writing', 'Ôn tập - Đọc hiểu và viết đoạn văn có hướng dẫn',
     '[G7-KN-SEED:g7-review-reading-writing] Review; reading strategy and paragraph writing.',
     NULL, NULL,
     'Một đoạn văn tốt có chủ đề rõ, các ý được sắp xếp và câu kết nối phù hợp.',
     'Topic sentence → supporting details → example or reason → concluding sentence.',
     'Khi đọc, đọc tiêu đề và câu hỏi trước, gạch từ khóa rồi tìm ý tương đương trong bài. Khi viết, lập dàn ý ngắn và kiểm tra chủ ngữ, thì, chính tả.',
     'My hobby is cycling. I cycle with my friends twice a week because it keeps me healthy.',
     'Sở thích của tôi là đạp xe. Tôi đạp xe với bạn hai lần một tuần vì hoạt động này giúp tôi khỏe mạnh.',
     'Sai: My hobby cycling. Đúng: My hobby is cycling. Câu cần động từ to be để nối chủ ngữ và phần bổ nghĩa.'),
    ('g7-review-pronunciation-stress', 'Ôn tập - Phát âm, trọng âm và ngữ điệu câu hỏi',
     '[G7-KN-SEED:g7-review-pronunciation-stress] Review; pronunciation, stress and intonation.',
     NULL, NULL,
     'Phát âm rõ không chỉ là đọc đúng từng âm mà còn là nhấn trọng âm và lên xuống giọng phù hợp.',
     'Câu hỏi Yes/No thường lên giọng ở cuối; câu hỏi Wh thường xuống giọng. Từ nhiều âm tiết cần ghi nhớ âm tiết được nhấn.',
     'Nghe mẫu, đánh dấu âm tiết nhấn, đọc chậm rồi tăng dần tốc độ. Không thêm âm tiết hoặc kéo dài mọi âm như nhau.',
     'Do you like music? Where do you live?',
     'Bạn có thích âm nhạc không? Bạn sống ở đâu?',
     'Sai: đọc mọi câu hỏi cùng một ngữ điệu. Hãy phân biệt câu hỏi Yes/No và câu hỏi Wh.')
),
documents AS (
    SELECT n.*,
           jsonb_build_object(
               'type', 'doc',
               'content', jsonb_build_array(
                   jsonb_build_object(
                       'type', 'heading',
                       'attrs', jsonb_build_object('id', n.note_key || '-heading', 'level', 2),
                       'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.title))
                   ),
                   jsonb_build_object(
                       'type', 'paragraph',
                       'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.intro))
                   ),
                   jsonb_build_object(
                       'type', 'learningBlock',
                       'attrs', jsonb_build_object(
                           'id', n.note_key || '-formula', 'kind', 'formula',
                           'title', 'Cấu trúc và quy tắc trọng tâm',
                           'variant', 'important', 'isKeyPoint', true
                       ),
                       'content', jsonb_build_array(
                           jsonb_build_object(
                               'type', 'learningSection', 'attrs', jsonb_build_object('role', 'expression'),
                               'content', jsonb_build_array(jsonb_build_object(
                                   'type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.expression))
                               ))
                           ),
                           jsonb_build_object(
                               'type', 'learningSection', 'attrs', jsonb_build_object('role', 'explanation'),
                               'content', jsonb_build_array(jsonb_build_object(
                                   'type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.explanation))
                               ))
                           ),
                           jsonb_build_object(
                               'type', 'learningSection', 'attrs', jsonb_build_object('role', 'condition'),
                               'content', jsonb_build_array(jsonb_build_object(
                                   'type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Hãy xác định chủ ngữ, thì và mục đích giao tiếp trước khi chọn cấu trúc.'))
                               ))
                           )
                       )
                   ),
                   jsonb_build_object(
                       'type', 'learningBlock',
                       'attrs', jsonb_build_object(
                           'id', n.note_key || '-example', 'kind', 'example',
                           'title', 'Ví dụ có phân tích', 'variant', 'default', 'isKeyPoint', false
                       ),
                       'content', jsonb_build_array(
                           jsonb_build_object(
                               'type', 'learningSection', 'attrs', jsonb_build_object('role', 'example'),
                               'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.example))))
                           ),
                           jsonb_build_object(
                               'type', 'learningSection', 'attrs', jsonb_build_object('role', 'explanation'),
                               'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Dấu hiệu và cấu trúc trong câu phù hợp với chủ đề của bài.'))))
                           ),
                           jsonb_build_object(
                               'type', 'learningSection', 'attrs', jsonb_build_object('role', 'translation'),
                               'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.translation))))
                           )
                       )
                   ),
                   jsonb_build_object(
                       'type', 'learningBlock',
                       'attrs', jsonb_build_object(
                           'id', n.note_key || '-mistake', 'kind', 'commonMistake',
                           'title', 'Lỗi thường gặp', 'variant', 'warning', 'isKeyPoint', false
                       ),
                       'content', jsonb_build_array(
                           jsonb_build_object('type', 'learningSection', 'attrs', jsonb_build_object('role', 'incorrect'), 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', n.mistake))))),
                           jsonb_build_object('type', 'learningSection', 'attrs', jsonb_build_object('role', 'correct'), 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Hãy sửa câu theo công thức và kiểm tra lại trợ động từ hoặc dạng của động từ.'))))),
                           jsonb_build_object('type', 'learningSection', 'attrs', jsonb_build_object('role', 'explanation'), 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Lỗi thường xuất hiện khi áp dụng quy tắc của một cấu trúc sang cấu trúc khác.')))))
                       )
                   ),
                   jsonb_build_object(
                       'type', 'learningBlock',
                       'attrs', jsonb_build_object(
                           'id', n.note_key || '-review', 'kind', 'callout',
                           'title', 'Tự kiểm tra nhanh', 'variant', 'note', 'isKeyPoint', false
                       ),
                       'content', jsonb_build_array(
                           jsonb_build_object('type', 'learningSection', 'attrs', jsonb_build_object('role', 'body'), 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Tự đặt một câu khẳng định, một câu phủ định và một câu hỏi theo chủ đề này.'))))),
                           jsonb_build_object('type', 'learningSection', 'attrs', jsonb_build_object('role', 'explanation'), 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Nếu câu trả lời chưa chắc chắn, quay lại khối công thức và xác định từ khóa chỉ thời gian.')))))
                       )
                   )
               )
           ) AS document_json
    FROM seed_notes n
)
INSERT INTO knowledge_notes
    (grade_id, title, description, document_json, status, created_by, created_at, updated_at, published_at)
SELECT g.id, d.title, d.description, d.document_json, 'PUBLISHED', u.id,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM documents d
JOIN grades g ON g.code = 'GRADE_7'
JOIN users u ON u.email = 'teacher@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_notes existing
    WHERE existing.description = d.description
);

-- Primary links are inserted only when the topic has no existing primary.
-- This avoids replacing a teacher's meaningful primary association.
WITH seed_links(note_key, description, unit_code, topic_name) AS (
    VALUES
    ('g7-u01-core', '[G7-KN-SEED:g7-u01-core] Core Curriculum; vocabulary, grammar and communication.', 'G7-SEED-U01', 'Hobbies and Present Simple'),
    ('g7-u02-core', '[G7-KN-SEED:g7-u02-core] Core Curriculum; health vocabulary and advice.', 'G7-SEED-U02', 'Healthy Living and Advice'),
    ('g7-u03-core', '[G7-KN-SEED:g7-u03-core] Core Curriculum; past simple and community service.', 'G7-SEED-U03', 'Community Service and Past Simple'),
    ('g7-u04-core', '[G7-KN-SEED:g7-u04-core] Core Curriculum; comparisons and arts vocabulary.', 'G7-SEED-U04', 'Music, Arts and Comparisons'),
    ('g7-u05-core', '[G7-KN-SEED:g7-u05-core] Core Curriculum; countability and quantities.', 'G7-SEED-U05', 'Food, Drink and Quantities'),
    ('g7-u06-school', '[G7-KN-SEED:g7-u06-school] Core Curriculum; school description and prepositions.', 'G7-CURR-U06', 'School Facilities and Prepositions'),
    ('g7-u07-traffic', '[G7-KN-SEED:g7-u07-traffic] Core Curriculum; distance, advice and road safety.', 'G7-CURR-U07', 'Traffic, Distance and Advice'),
    ('g7-u08-films', '[G7-KN-SEED:g7-u08-films] Core Curriculum; film opinions and contrast.', 'G7-CURR-U08', 'Films and Opinions'),
    ('g7-u09-festivals', '[G7-KN-SEED:g7-u09-festivals] Core Curriculum; festivals, questions and stress.', 'G7-CURR-U09', 'Festivals and Word Stress'),
    ('g7-u10-energy', '[G7-KN-SEED:g7-u10-energy] Core Curriculum; present continuous and conservation.', 'G7-CURR-U10', 'Energy and Present Continuous'),
    ('g7-u11-future', '[G7-KN-SEED:g7-u11-future] Core Curriculum; future simple and possession.', 'G7-CURR-U11', 'Future Transport and Predictions'),
    ('g7-u12-countries', '[G7-KN-SEED:g7-u12-countries] Core Curriculum; articles and descriptions.', 'G7-CURR-U12', 'Countries, Articles and Intonation')
)
INSERT INTO knowledge_note_topic_links
    (knowledge_note_id, topic_id, is_primary, display_order, created_at)
SELECT n.id, t.id, true, 0, CURRENT_TIMESTAMP
FROM seed_links l
JOIN knowledge_notes n ON n.description = l.description
JOIN content_units u ON u.code = l.unit_code
JOIN content_sections s ON s.unit_id = u.id AND s.name = 'Grammar and Usage'
JOIN content_topics t ON t.section_id = s.id AND t.name = l.topic_name
WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_note_topic_links existing
    WHERE existing.knowledge_note_id = n.id AND existing.topic_id = t.id
)
AND NOT EXISTS (
    SELECT 1 FROM knowledge_note_topic_links existing_primary
    WHERE existing_primary.topic_id = t.id AND existing_primary.is_primary
);

COMMIT;