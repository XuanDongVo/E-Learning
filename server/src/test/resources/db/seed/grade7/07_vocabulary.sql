-- G7-SEED vocabulary fixture for the V55 enum/UK-US and V56 relatedTerms schema.
-- 20 unique words in each of six Grade 7 units. Safe to rerun: per-unit, case-insensitive lookup.
-- Speech is synthesized by the browser: no fabricated audio URLs. A few words use
-- bundled illustrative SVG files so Student UI can exercise both image/no-image layouts.
-- Intended for a fresh/reset fixture DB (owner handles cleanup). No DELETE/TRUNCATE here.
-- Related terms are inserted in the same statement as each VocabularyWord.
BEGIN;

WITH words(unit_code,word,meaning_vi,pronunciation,part_of_speech,difficulty,display_order,example_sentence,example_meaning_vi) AS (
 VALUES
  ('G7-SEED-U01', 'hobby', 'sở thích', NULL, 'noun', 'EASY', 1, 'My hobby is reading comics.', 'Sở thích của tôi là đọc truyện tranh.'),
  ('G7-SEED-U01', 'collect', 'sưu tầm', NULL, 'verb', 'EASY', 2, 'I collect old postcards.', 'Tôi sưu tầm bưu thiếp cũ.'),
  ('G7-SEED-U01', 'painting', 'vẽ tranh', NULL, 'noun', 'EASY', 3, 'Painting helps me relax.', 'Vẽ tranh giúp tôi thư giãn.'),
  ('G7-SEED-U01', 'gardening', 'làm vườn', NULL, 'noun', 'EASY', 4, 'My grandparents enjoy gardening.', 'Ông bà tôi thích làm vườn.'),
  ('G7-SEED-U01', 'photography', 'nhiếp ảnh', NULL, 'noun', 'MEDIUM', 5, 'Photography is her favorite hobby.', 'Nhiếp ảnh là sở thích yêu thích của cô ấy.'),
  ('G7-SEED-U01', 'sketch', 'phác họa', NULL, 'verb', 'MEDIUM', 6, 'I sketch flowers in my notebook.', 'Tôi phác họa hoa trong sổ tay.'),
  ('G7-SEED-U01', 'knitting', 'đan len', NULL, 'noun', 'MEDIUM', 7, 'Knitting takes patience.', 'Đan len cần sự kiên nhẫn.'),
  ('G7-SEED-U01', 'board game', 'trò chơi trên bàn', NULL, 'noun', 'EASY', 8, 'We play a board game on Sundays.', 'Chúng tôi chơi trò chơi trên bàn vào Chủ nhật.'),
  ('G7-SEED-U01', 'free time', 'thời gian rảnh', NULL, 'noun', 'EASY', 9, 'I play badminton in my free time.', 'Tôi chơi cầu lông vào thời gian rảnh.'),
  ('G7-SEED-U01', 'creative', 'sáng tạo', NULL, 'adjective', 'MEDIUM', 10, 'Her projects are very creative.', 'Các dự án của cô ấy rất sáng tạo.'),
  ('G7-SEED-U01', 'model', 'mô hình', NULL, 'noun', 'EASY', 11, 'He builds a model airplane.', 'Cậu ấy làm mô hình máy bay.'),
  ('G7-SEED-U01', 'coin', 'đồng xu', NULL, 'noun', 'EASY', 12, 'She has a collection of coins.', 'Cô ấy có một bộ sưu tập đồng xu.'),
  ('G7-SEED-U01', 'outdoor', 'ngoài trời', NULL, 'adjective', 'MEDIUM', 13, 'Cycling is an outdoor activity.', 'Đạp xe là hoạt động ngoài trời.'),
  ('G7-SEED-U01', 'indoor', 'trong nhà', NULL, 'adjective', 'MEDIUM', 14, 'Chess is an indoor hobby.', 'Cờ vua là sở thích trong nhà.'),
  ('G7-SEED-U01', 'origami', 'nghệ thuật gấp giấy', NULL, 'noun', 'HARD', 15, 'We learn origami at school.', 'Chúng tôi học gấp giấy ở trường.'),
  ('G7-SEED-U01', 'chess', 'cờ vua', NULL, 'noun', 'EASY', 16, 'My sister can play chess.', 'Em gái tôi biết chơi cờ vua.'),
  ('G7-SEED-U01', 'instrument', 'nhạc cụ', NULL, 'noun', 'MEDIUM', 17, 'The guitar is a musical instrument.', 'Đàn ghi-ta là một nhạc cụ.'),
  ('G7-SEED-U01', 'practice', 'luyện tập', NULL, 'verb', 'EASY', 18, 'Practice the piano every day.', 'Hãy luyện đàn piano mỗi ngày.'),
  ('G7-SEED-U01', 'skill', 'kỹ năng', NULL, 'noun', 'MEDIUM', 19, 'Drawing is a useful skill.', 'Vẽ là một kỹ năng hữu ích.'),
  ('G7-SEED-U01', 'enjoy', 'yêu thích', NULL, 'verb', 'EASY', 20, 'I enjoy making paper crafts.', 'Tôi thích làm đồ thủ công bằng giấy.'),
  ('G7-SEED-U02', 'healthy', 'khỏe mạnh', NULL, 'adjective', 'EASY', 1, 'Fruit helps us stay healthy.', 'Trái cây giúp chúng ta khỏe mạnh.'),
  ('G7-SEED-U02', 'exercise', 'tập thể dục', NULL, 'verb', 'EASY', 2, 'I exercise after school.', 'Tôi tập thể dục sau giờ học.'),
  ('G7-SEED-U02', 'vegetable', 'rau củ', NULL, 'noun', 'EASY', 3, 'Eat a vegetable with dinner.', 'Hãy ăn rau trong bữa tối.'),
  ('G7-SEED-U02', 'balance', 'sự cân bằng', NULL, 'noun', 'MEDIUM', 4, 'A balance of food and exercise matters.', 'Sự cân bằng giữa ăn uống và vận động rất quan trọng.'),
  ('G7-SEED-U02', 'sleep', 'giấc ngủ', NULL, 'noun', 'EASY', 5, 'Good sleep helps you focus.', 'Giấc ngủ tốt giúp bạn tập trung.'),
  ('G7-SEED-U02', 'habit', 'thói quen', NULL, 'noun', 'EASY', 6, 'Drinking water is a good habit.', 'Uống nước là một thói quen tốt.'),
  ('G7-SEED-U02', 'vitamin', 'vitamin', NULL, 'noun', 'MEDIUM', 7, 'Oranges contain vitamin C.', 'Cam chứa vitamin C.'),
  ('G7-SEED-U02', 'protein', 'chất đạm', NULL, 'noun', 'HARD', 8, 'Eggs provide protein.', 'Trứng cung cấp chất đạm.'),
  ('G7-SEED-U02', 'energy', 'năng lượng', NULL, 'noun', 'EASY', 9, 'Breakfast gives us energy.', 'Bữa sáng cho chúng ta năng lượng.'),
  ('G7-SEED-U02', 'sore throat', 'đau họng', NULL, 'noun', 'MEDIUM', 10, 'I have a sore throat today.', 'Hôm nay tôi bị đau họng.'),
  ('G7-SEED-U02', 'headache', 'đau đầu', NULL, 'noun', 'EASY', 11, 'She has a headache.', 'Cô ấy bị đau đầu.'),
  ('G7-SEED-U02', 'toothache', 'đau răng', NULL, 'noun', 'EASY', 12, 'A toothache can be painful.', 'Đau răng có thể rất khó chịu.'),
  ('G7-SEED-U02', 'rest', 'nghỉ ngơi', NULL, 'verb', 'EASY', 13, 'You should rest when you are tired.', 'Bạn nên nghỉ ngơi khi mệt.'),
  ('G7-SEED-U02', 'avoid', 'tránh', NULL, 'verb', 'MEDIUM', 14, 'Avoid too much sugary food.', 'Hãy tránh ăn quá nhiều đồ ngọt.'),
  ('G7-SEED-U02', 'diet', 'chế độ ăn', NULL, 'noun', 'MEDIUM', 15, 'A healthy diet includes vegetables.', 'Chế độ ăn lành mạnh có rau củ.'),
  ('G7-SEED-U02', 'fitness', 'thể lực', NULL, 'noun', 'HARD', 16, 'Swimming improves fitness.', 'Bơi lội giúp cải thiện thể lực.'),
  ('G7-SEED-U02', 'hydration', 'việc cung cấp đủ nước', NULL, 'noun', 'HARD', 17, 'Hydration is important in hot weather.', 'Việc uống đủ nước quan trọng khi trời nóng.'),
  ('G7-SEED-U02', 'fresh', 'tươi', NULL, 'adjective', 'EASY', 18, 'Fresh fruit is delicious.', 'Trái cây tươi rất ngon.'),
  ('G7-SEED-U02', 'routine', 'thói quen hằng ngày', NULL, 'noun', 'MEDIUM', 19, 'Walking is part of my routine.', 'Đi bộ là một phần thói quen hằng ngày của tôi.'),
  ('G7-SEED-U02', 'advice', 'lời khuyên', NULL, 'noun', 'EASY', 20, 'The doctor gave me good advice.', 'Bác sĩ đã cho tôi lời khuyên hữu ích.'),
  ('G7-SEED-U03', 'volunteer', 'tình nguyện viên', NULL, 'noun', 'EASY', 1, 'A volunteer helps the community.', 'Tình nguyện viên giúp đỡ cộng đồng.'),
  ('G7-SEED-U03', 'donate', 'quyên góp', NULL, 'verb', 'EASY', 2, 'We donate books to children.', 'Chúng tôi quyên góp sách cho trẻ em.'),
  ('G7-SEED-U03', 'charity', 'tổ chức từ thiện', NULL, 'noun', 'MEDIUM', 3, 'The charity supports families.', 'Tổ chức từ thiện hỗ trợ các gia đình.'),
  ('G7-SEED-U03', 'community', 'cộng đồng', NULL, 'noun', 'EASY', 4, 'Our community cleans the park.', 'Cộng đồng chúng tôi dọn công viên.'),
  ('G7-SEED-U03', 'shelter', 'nơi trú ẩn', NULL, 'noun', 'MEDIUM', 5, 'The shelter cares for stray animals.', 'Nơi trú ẩn chăm sóc động vật đi lạc.'),
  ('G7-SEED-U03', 'collect rubbish', 'nhặt rác', NULL, 'verb', 'EASY', 6, 'Students collect rubbish near the river.', 'Học sinh nhặt rác gần sông.'),
  ('G7-SEED-U03', 'recycle', 'tái chế', NULL, 'verb', 'EASY', 7, 'We recycle plastic bottles.', 'Chúng tôi tái chế chai nhựa.'),
  ('G7-SEED-U03', 'elderly', 'người cao tuổi', NULL, 'adjective', 'MEDIUM', 8, 'We visit elderly neighbors.', 'Chúng tôi thăm những người hàng xóm cao tuổi.'),
  ('G7-SEED-U03', 'orphanage', 'trại trẻ mồ côi', NULL, 'noun', 'HARD', 9, 'They brought toys to the orphanage.', 'Họ mang đồ chơi đến trại trẻ mồ côi.'),
  ('G7-SEED-U03', 'support', 'hỗ trợ', NULL, 'verb', 'EASY', 10, 'We support local families.', 'Chúng tôi hỗ trợ các gia đình địa phương.'),
  ('G7-SEED-U03', 'fundraising', 'gây quỹ', NULL, 'noun', 'HARD', 11, 'The fundraising event was successful.', 'Sự kiện gây quỹ đã thành công.'),
  ('G7-SEED-U03', 'neighborhood', 'khu phố', NULL, 'noun', 'MEDIUM', 12, 'Our neighborhood has a small library.', 'Khu phố của chúng tôi có thư viện nhỏ.'),
  ('G7-SEED-U03', 'environment', 'môi trường', NULL, 'noun', 'EASY', 13, 'We protect the environment.', 'Chúng tôi bảo vệ môi trường.'),
  ('G7-SEED-U03', 'plant trees', 'trồng cây', NULL, 'verb', 'EASY', 14, 'We plant trees every spring.', 'Chúng tôi trồng cây mỗi mùa xuân.'),
  ('G7-SEED-U03', 'campaign', 'chiến dịch', NULL, 'noun', 'MEDIUM', 15, 'Our class started a clean-up campaign.', 'Lớp tôi bắt đầu chiến dịch dọn vệ sinh.'),
  ('G7-SEED-U03', 'generous', 'hào phóng', NULL, 'adjective', 'MEDIUM', 16, 'It was generous of you to help.', 'Bạn thật hào phóng khi giúp đỡ.'),
  ('G7-SEED-U03', 'kindness', 'lòng tốt', NULL, 'noun', 'EASY', 17, 'Small acts of kindness matter.', 'Những hành động tử tế nhỏ rất có ý nghĩa.'),
  ('G7-SEED-U03', 'improve', 'cải thiện', NULL, 'verb', 'MEDIUM', 18, 'We can improve our school garden.', 'Chúng ta có thể cải thiện vườn trường.'),
  ('G7-SEED-U03', 'participate', 'tham gia', NULL, 'verb', 'HARD', 19, 'Students participate in the event.', 'Học sinh tham gia sự kiện.'),
  ('G7-SEED-U03', 'organize', 'tổ chức', NULL, 'verb', 'MEDIUM', 20, 'Our class will organize a book drive.', 'Lớp tôi sẽ tổ chức một đợt quyên góp sách.'),
  ('G7-SEED-U04', 'music', 'âm nhạc', NULL, 'noun', 'EASY', 1, 'Music makes me happy.', 'Âm nhạc khiến tôi vui.'),
  ('G7-SEED-U04', 'artist', 'nghệ sĩ', NULL, 'noun', 'EASY', 2, 'The artist paints landscapes.', 'Nghệ sĩ vẽ tranh phong cảnh.'),
  ('G7-SEED-U04', 'performance', 'buổi biểu diễn', NULL, 'noun', 'MEDIUM', 3, 'The performance starts at seven.', 'Buổi biểu diễn bắt đầu lúc bảy giờ.'),
  ('G7-SEED-U04', 'gallery', 'phòng trưng bày', NULL, 'noun', 'MEDIUM', 4, 'We visited an art gallery.', 'Chúng tôi đã đến một phòng trưng bày nghệ thuật.'),
  ('G7-SEED-U04', 'portrait', 'tranh chân dung', NULL, 'noun', 'MEDIUM', 5, 'She painted a portrait of her mother.', 'Cô ấy vẽ chân dung mẹ mình.'),
  ('G7-SEED-U04', 'sculpture', 'tác phẩm điêu khắc', NULL, 'noun', 'HARD', 6, 'The sculpture is made of wood.', 'Tác phẩm điêu khắc làm bằng gỗ.'),
  ('G7-SEED-U04', 'museum', 'bảo tàng', NULL, 'noun', 'EASY', 7, 'The museum opens at nine.', 'Bảo tàng mở cửa lúc chín giờ.'),
  ('G7-SEED-U04', 'concert', 'buổi hòa nhạc', NULL, 'noun', 'EASY', 8, 'We attended a concert last night.', 'Tối qua chúng tôi tham dự buổi hòa nhạc.'),
  ('G7-SEED-U04', 'composer', 'nhà soạn nhạc', NULL, 'noun', 'HARD', 9, 'The composer wrote a famous song.', 'Nhà soạn nhạc đã viết một bài hát nổi tiếng.'),
  ('G7-SEED-U04', 'melody', 'giai điệu', NULL, 'noun', 'MEDIUM', 10, 'The melody is easy to remember.', 'Giai điệu rất dễ nhớ.'),
  ('G7-SEED-U04', 'rhythm', 'nhịp điệu', NULL, 'noun', 'MEDIUM', 11, 'The song has a lively rhythm.', 'Bài hát có nhịp điệu sôi nổi.'),
  ('G7-SEED-U04', 'musician', 'nhạc công', NULL, 'noun', 'EASY', 12, 'My uncle is a musician.', 'Chú tôi là một nhạc công.'),
  ('G7-SEED-U04', 'audience', 'khán giả', NULL, 'noun', 'MEDIUM', 13, 'The audience clapped loudly.', 'Khán giả vỗ tay lớn.'),
  ('G7-SEED-U04', 'stage', 'sân khấu', NULL, 'noun', 'EASY', 14, 'The dancers walked onto the stage.', 'Các vũ công bước lên sân khấu.'),
  ('G7-SEED-U04', 'folk music', 'nhạc dân gian', NULL, 'noun', 'MEDIUM', 15, 'I enjoy Vietnamese folk music.', 'Tôi thích nhạc dân gian Việt Nam.'),
  ('G7-SEED-U04', 'traditional', 'truyền thống', NULL, 'adjective', 'MEDIUM', 16, 'She wears traditional clothing.', 'Cô ấy mặc trang phục truyền thống.'),
  ('G7-SEED-U04', 'exhibition', 'triển lãm', NULL, 'noun', 'HARD', 17, 'The exhibition includes modern paintings.', 'Triển lãm có các bức tranh hiện đại.'),
  ('G7-SEED-U04', 'landscape', 'phong cảnh', NULL, 'noun', 'MEDIUM', 18, 'He painted a mountain landscape.', 'Anh ấy vẽ phong cảnh núi.'),
  ('G7-SEED-U04', 'drum', 'trống', NULL, 'noun', 'EASY', 19, 'The drummer plays a big drum.', 'Tay trống đánh một chiếc trống lớn.'),
  ('G7-SEED-U04', 'violin', 'đàn vĩ cầm', NULL, 'noun', 'EASY', 20, 'She plays the violin well.', 'Cô ấy chơi đàn vĩ cầm giỏi.'),
  ('G7-SEED-U05', 'ingredient', 'nguyên liệu', NULL, 'noun', 'MEDIUM', 1, 'Rice is an ingredient in this dish.', 'Gạo là một nguyên liệu trong món ăn này.'),
  ('G7-SEED-U05', 'recipe', 'công thức nấu ăn', NULL, 'noun', 'EASY', 2, 'Follow the recipe carefully.', 'Hãy làm theo công thức cẩn thận.'),
  ('G7-SEED-U05', 'boil', 'luộc', NULL, 'verb', 'EASY', 3, 'Boil the eggs for ten minutes.', 'Luộc trứng trong mười phút.'),
  ('G7-SEED-U05', 'fry', 'chiên', NULL, 'verb', 'EASY', 4, 'We fry fish for dinner.', 'Chúng tôi chiên cá cho bữa tối.'),
  ('G7-SEED-U05', 'grill', 'nướng', NULL, 'verb', 'EASY', 5, 'Dad will grill chicken.', 'Bố sẽ nướng gà.'),
  ('G7-SEED-U05', 'steam', 'hấp', NULL, 'verb', 'MEDIUM', 6, 'Steam the vegetables until soft.', 'Hấp rau cho đến khi mềm.'),
  ('G7-SEED-U05', 'slice', 'thái lát', NULL, 'verb', 'EASY', 7, 'Slice the tomatoes thinly.', 'Thái cà chua thành lát mỏng.'),
  ('G7-SEED-U05', 'stir', 'khuấy', NULL, 'verb', 'EASY', 8, 'Stir the soup gently.', 'Khuấy súp nhẹ nhàng.'),
  ('G7-SEED-U05', 'flavor', 'hương vị', NULL, 'noun', 'MEDIUM', 9, 'This soup has a rich flavor.', 'Món súp này có hương vị đậm đà.'),
  ('G7-SEED-U05', 'spicy', 'cay', NULL, 'adjective', 'EASY', 10, 'This curry is very spicy.', 'Món cà ri này rất cay.'),
  ('G7-SEED-U05', 'sweet', 'ngọt', NULL, 'adjective', 'EASY', 11, 'The mango tastes sweet.', 'Quả xoài có vị ngọt.'),
  ('G7-SEED-U05', 'sour', 'chua', NULL, 'adjective', 'EASY', 12, 'Lemons taste sour.', 'Chanh có vị chua.'),
  ('G7-SEED-U05', 'portion', 'khẩu phần', NULL, 'noun', 'MEDIUM', 13, 'One portion is enough for me.', 'Một khẩu phần là đủ cho tôi.'),
  ('G7-SEED-U05', 'beverage', 'đồ uống', NULL, 'noun', 'MEDIUM', 14, 'Water is a healthy beverage.', 'Nước là một đồ uống tốt cho sức khỏe.'),
  ('G7-SEED-U05', 'noodles', 'mì, bún', NULL, 'noun', 'EASY', 15, 'I like noodles for breakfast.', 'Tôi thích ăn mì vào bữa sáng.'),
  ('G7-SEED-U05', 'pancake', 'bánh kếp', NULL, 'noun', 'EASY', 16, 'She made a banana pancake.', 'Cô ấy làm một chiếc bánh kếp chuối.'),
  ('G7-SEED-U05', 'omelette', 'trứng tráng', NULL, 'noun', 'MEDIUM', 17, 'He cooks an omelette every Sunday.', 'Anh ấy làm trứng tráng mỗi Chủ nhật.'),
  ('G7-SEED-U05', 'delicious', 'ngon miệng', NULL, 'adjective', 'EASY', 18, 'The meal is delicious.', 'Bữa ăn rất ngon.'),
  ('G7-SEED-U05', 'serve', 'phục vụ', NULL, 'verb', 'MEDIUM', 19, 'We serve rice with vegetables.', 'Chúng tôi phục vụ cơm cùng rau.'),
  ('G7-SEED-U05', 'measure', 'đong, đo', NULL, 'verb', 'MEDIUM', 20, 'Measure two cups of flour.', 'Đong hai cốc bột mì.'),
  ('G7-SEED-U06', 'traffic', 'giao thông', NULL, 'noun', 'EASY', 1, 'Traffic is heavy in the morning.', 'Giao thông đông đúc vào buổi sáng.'),
  ('G7-SEED-U06', 'pedestrian', 'người đi bộ', NULL, 'noun', 'MEDIUM', 2, 'Pedestrians use the sidewalk.', 'Người đi bộ sử dụng vỉa hè.'),
  ('G7-SEED-U06', 'crosswalk', 'vạch qua đường', NULL, 'noun', 'MEDIUM', 3, 'Wait at the crosswalk.', 'Hãy đợi ở vạch qua đường.'),
  ('G7-SEED-U06', 'sidewalk', 'vỉa hè', NULL, 'noun', 'EASY', 4, 'Walk on the sidewalk.', 'Hãy đi trên vỉa hè.'),
  ('G7-SEED-U06', 'helmet', 'mũ bảo hiểm', NULL, 'noun', 'EASY', 5, 'Always wear a helmet.', 'Luôn đội mũ bảo hiểm.'),
  ('G7-SEED-U06', 'intersection', 'ngã tư', NULL, 'noun', 'MEDIUM', 6, 'Turn left at the intersection.', 'Rẽ trái ở ngã tư.'),
  ('G7-SEED-U06', 'roundabout', 'vòng xuyến', NULL, 'noun', 'HARD', 7, 'Take the second exit at the roundabout.', 'Đi theo lối ra thứ hai tại vòng xuyến.'),
  ('G7-SEED-U06', 'bicycle lane', 'làn đường xe đạp', NULL, 'noun', 'MEDIUM', 8, 'Use the bicycle lane when possible.', 'Hãy đi làn đường xe đạp khi có thể.'),
  ('G7-SEED-U06', 'road sign', 'biển báo giao thông', NULL, 'noun', 'EASY', 9, 'Read the road sign carefully.', 'Đọc kỹ biển báo giao thông.'),
  ('G7-SEED-U06', 'seat belt', 'dây an toàn', NULL, 'noun', 'EASY', 10, 'Fasten your seat belt.', 'Thắt dây an toàn.'),
  ('G7-SEED-U06', 'passenger', 'hành khách', NULL, 'noun', 'EASY', 11, 'The passenger got off the bus.', 'Hành khách xuống xe buýt.'),
  ('G7-SEED-U06', 'platform', 'sân ga', NULL, 'noun', 'MEDIUM', 12, 'The train leaves from platform two.', 'Tàu khởi hành từ sân ga số hai.'),
  ('G7-SEED-U06', 'fare', 'giá vé', NULL, 'noun', 'MEDIUM', 13, 'The bus fare is affordable.', 'Giá vé xe buýt phải chăng.'),
  ('G7-SEED-U06', 'direction', 'phương hướng', NULL, 'noun', 'EASY', 14, 'Can you show me the direction?', 'Bạn có thể chỉ đường cho tôi không?'),
  ('G7-SEED-U06', 'turn left', 'rẽ trái', NULL, 'verb', 'EASY', 15, 'Turn left at the next street.', 'Rẽ trái ở con đường tiếp theo.'),
  ('G7-SEED-U06', 'turn right', 'rẽ phải', NULL, 'verb', 'EASY', 16, 'Turn right after the bridge.', 'Rẽ phải sau cây cầu.'),
  ('G7-SEED-U06', 'speed limit', 'giới hạn tốc độ', NULL, 'noun', 'MEDIUM', 17, 'Respect the speed limit.', 'Hãy tuân thủ giới hạn tốc độ.'),
  ('G7-SEED-U06', 'public transport', 'phương tiện công cộng', NULL, 'noun', 'MEDIUM', 18, 'Public transport reduces traffic.', 'Phương tiện công cộng giảm ùn tắc.'),
  ('G7-SEED-U06', 'congestion', 'tắc nghẽn giao thông', NULL, 'noun', 'HARD', 19, 'Congestion is common at rush hour.', 'Tắc nghẽn thường xảy ra vào giờ cao điểm.'),
  ('G7-SEED-U06', 'safety', 'sự an toàn', NULL, 'noun', 'EASY', 20, 'Road safety is important.', 'An toàn giao thông rất quan trọng.')
)
INSERT INTO vocabulary_words(
 unit_id,word,meaning_vi,pronunciation,pronunciation_uk,pronunciation_us,part_of_speech,
 example_sentence,example_meaning_vi,audio_url,image_url,difficulty,display_order,status,related_terms
)
SELECT u.id,w.word,w.meaning_vi,w.pronunciation,
       CASE w.word
           WHEN 'chess' THEN '/tʃes/' WHEN 'collect' THEN '/kəˈlekt/'
           WHEN 'gardening' THEN '/ˈɡɑː.dən.ɪŋ/' WHEN 'healthy' THEN '/ˈhel.θi/'
           WHEN 'recycle' THEN '/ˌriːˈsaɪ.kəl/' WHEN 'music' THEN '/ˈmjuː.zɪk/'
           WHEN 'omelette' THEN '/ˈɒm.lət/' WHEN 'helmet' THEN '/ˈhel.mɪt/'
           ELSE NULL END,
       CASE w.word
           WHEN 'chess' THEN '/tʃes/' WHEN 'collect' THEN '/kəˈlekt/'
           WHEN 'gardening' THEN '/ˈɡɑːr.dən.ɪŋ/' WHEN 'healthy' THEN '/ˈhel.θi/'
           WHEN 'recycle' THEN '/ˌriːˈsaɪ.kəl/' WHEN 'music' THEN '/ˈmjuː.zɪk/'
           WHEN 'omelette' THEN '/ˈɑːm.lət/' WHEN 'helmet' THEN '/ˈhel.mət/'
           ELSE NULL END,
       UPPER(w.part_of_speech),w.example_sentence,w.example_meaning_vi,NULL,
       CASE w.word
           WHEN 'chess' THEN '/assets/vocabulary/chess.svg'
           WHEN 'gardening' THEN '/assets/vocabulary/gardening.svg'
           WHEN 'healthy' THEN '/assets/vocabulary/healthy.svg'
           WHEN 'recycle' THEN '/assets/vocabulary/recycle.svg'
           WHEN 'music' THEN '/assets/vocabulary/music.svg'
           WHEN 'omelette' THEN '/assets/vocabulary/omelette.svg'
           WHEN 'helmet' THEN '/assets/vocabulary/helmet.svg'
           ELSE NULL END,
       w.difficulty,w.display_order,'ACTIVE',
       CASE w.word
           -- U01 · Hobbies and interests
           WHEN 'hobby' THEN '{"wordFamilies":[{"term":"hobbyist","meaningVi":"người có sở thích riêng","partOfSpeech":"NOUN"}],"synonyms":[{"term":"pastime","meaningVi":"thú tiêu khiển","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'collect' THEN '{"wordFamilies":[{"term":"collection","meaningVi":"bộ sưu tập","partOfSpeech":"NOUN"},{"term":"collector","meaningVi":"người sưu tầm","partOfSpeech":"NOUN"}],"synonyms":[{"term":"gather","meaningVi":"thu thập","partOfSpeech":"VERB"}],"antonyms":[{"term":"distribute","meaningVi":"phân phát","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'painting' THEN '{"wordFamilies":[{"term":"paint","meaningVi":"vẽ bằng màu","partOfSpeech":"VERB"},{"term":"painter","meaningVi":"họa sĩ","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'gardening' THEN '{"wordFamilies":[{"term":"garden","meaningVi":"khu vườn","partOfSpeech":"NOUN"},{"term":"gardener","meaningVi":"người làm vườn","partOfSpeech":"NOUN"}],"synonyms":[{"term":"horticulture","meaningVi":"nghề làm vườn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'photography' THEN '{"wordFamilies":[{"term":"photograph","meaningVi":"bức ảnh","partOfSpeech":"NOUN"},{"term":"photographer","meaningVi":"nhiếp ảnh gia","partOfSpeech":"NOUN"}],"synonyms":[{"term":"picture-taking","meaningVi":"việc chụp ảnh","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'sketch' THEN '{"wordFamilies":[{"term":"sketching","meaningVi":"việc phác họa","partOfSpeech":"NOUN"},{"term":"sketcher","meaningVi":"người phác họa","partOfSpeech":"NOUN"}],"synonyms":[{"term":"draw","meaningVi":"vẽ","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb
           WHEN 'knitting' THEN '{"wordFamilies":[{"term":"knit","meaningVi":"đan len","partOfSpeech":"VERB"},{"term":"knitter","meaningVi":"người đan len","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'board game' THEN '{"wordFamilies":[],"synonyms":[{"term":"tabletop game","meaningVi":"trò chơi trên bàn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'free time' THEN '{"wordFamilies":[],"synonyms":[{"term":"leisure time","meaningVi":"thời gian nhàn rỗi","partOfSpeech":"NOUN"},{"term":"spare time","meaningVi":"thời gian rảnh","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'creative' THEN '{"wordFamilies":[{"term":"create","meaningVi":"tạo ra","partOfSpeech":"VERB"},{"term":"creativity","meaningVi":"tính sáng tạo","partOfSpeech":"NOUN"}],"synonyms":[{"term":"imaginative","meaningVi":"giàu trí tưởng tượng","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"uncreative","meaningVi":"thiếu sáng tạo","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'model' THEN '{"wordFamilies":[{"term":"modeling","meaningVi":"việc làm mô hình","partOfSpeech":"NOUN"}],"synonyms":[{"term":"miniature","meaningVi":"mô hình thu nhỏ","partOfSpeech":"NOUN"},{"term":"replica","meaningVi":"bản sao mô phỏng","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'coin' THEN '{"wordFamilies":[{"term":"coinage","meaningVi":"tiền xu","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'outdoor' THEN '{"wordFamilies":[{"term":"outdoors","meaningVi":"ở ngoài trời","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"open-air","meaningVi":"ngoài trời","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"indoor","meaningVi":"trong nhà","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'indoor' THEN '{"wordFamilies":[{"term":"indoors","meaningVi":"ở trong nhà","partOfSpeech":"ADVERB"}],"synonyms":[],"antonyms":[{"term":"outdoor","meaningVi":"ngoài trời","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'origami' THEN '{"wordFamilies":[],"synonyms":[{"term":"paper folding","meaningVi":"nghệ thuật gấp giấy","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'chess' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'instrument' THEN '{"wordFamilies":[{"term":"instrumental","meaningVi":"thuộc nhạc cụ","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"musical instrument","meaningVi":"nhạc cụ","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'practice' THEN '{"wordFamilies":[{"term":"practicing","meaningVi":"việc luyện tập","partOfSpeech":"NOUN"}],"synonyms":[{"term":"rehearse","meaningVi":"tập dượt","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb
           WHEN 'skill' THEN '{"wordFamilies":[{"term":"skilled","meaningVi":"có kỹ năng","partOfSpeech":"ADJECTIVE"},{"term":"skillful","meaningVi":"khéo léo","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"ability","meaningVi":"khả năng","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'enjoy' THEN '{"wordFamilies":[{"term":"enjoyment","meaningVi":"niềm vui","partOfSpeech":"NOUN"},{"term":"enjoyable","meaningVi":"thú vị","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"like","meaningVi":"thích","partOfSpeech":"VERB"}],"antonyms":[{"term":"dislike","meaningVi":"không thích","partOfSpeech":"VERB"}]}'::jsonb

           -- U02 · Health
           WHEN 'healthy' THEN '{"wordFamilies":[{"term":"health","meaningVi":"sức khỏe","partOfSpeech":"NOUN"},{"term":"healthily","meaningVi":"một cách lành mạnh","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"fit","meaningVi":"khỏe mạnh","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"unhealthy","meaningVi":"không lành mạnh","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'exercise' THEN '{"wordFamilies":[{"term":"exercising","meaningVi":"việc tập thể dục","partOfSpeech":"NOUN"}],"synonyms":[{"term":"work out","meaningVi":"tập luyện thể chất","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb
           WHEN 'vegetable' THEN '{"wordFamilies":[],"synonyms":[{"term":"veggie","meaningVi":"rau củ (thân mật)","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'balance' THEN '{"wordFamilies":[{"term":"balanced","meaningVi":"cân bằng","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"equilibrium","meaningVi":"trạng thái cân bằng","partOfSpeech":"NOUN"}],"antonyms":[{"term":"imbalance","meaningVi":"sự mất cân bằng","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'sleep' THEN '{"wordFamilies":[{"term":"sleepy","meaningVi":"buồn ngủ","partOfSpeech":"ADJECTIVE"},{"term":"sleepless","meaningVi":"mất ngủ","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"slumber","meaningVi":"giấc ngủ","partOfSpeech":"NOUN"}],"antonyms":[{"term":"wakefulness","meaningVi":"trạng thái thức","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'habit' THEN '{"wordFamilies":[{"term":"habitual","meaningVi":"theo thói quen","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"routine","meaningVi":"thói quen hằng ngày","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'vitamin' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'protein' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'energy' THEN '{"wordFamilies":[{"term":"energetic","meaningVi":"tràn đầy năng lượng","partOfSpeech":"ADJECTIVE"},{"term":"energize","meaningVi":"tiếp năng lượng","partOfSpeech":"VERB"}],"synonyms":[{"term":"vitality","meaningVi":"sức sống","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'sore throat' THEN '{"wordFamilies":[],"synonyms":[{"term":"throat pain","meaningVi":"đau họng","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'headache' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'toothache' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'rest' THEN '{"wordFamilies":[{"term":"restful","meaningVi":"giúp nghỉ ngơi","partOfSpeech":"ADJECTIVE"},{"term":"rested","meaningVi":"đã nghỉ ngơi","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"relax","meaningVi":"thư giãn","partOfSpeech":"VERB"}],"antonyms":[{"term":"work","meaningVi":"làm việc","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'avoid' THEN '{"wordFamilies":[{"term":"avoidance","meaningVi":"sự tránh né","partOfSpeech":"NOUN"},{"term":"avoidable","meaningVi":"có thể tránh được","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"stay away from","meaningVi":"tránh xa","partOfSpeech":"PHRASE"}],"antonyms":[{"term":"approach","meaningVi":"tiếp cận","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'diet' THEN '{"wordFamilies":[{"term":"dietary","meaningVi":"thuộc chế độ ăn","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"eating plan","meaningVi":"kế hoạch ăn uống","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'fitness' THEN '{"wordFamilies":[{"term":"fit","meaningVi":"khỏe mạnh","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"physical condition","meaningVi":"thể trạng","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'hydration' THEN '{"wordFamilies":[{"term":"hydrate","meaningVi":"cung cấp nước","partOfSpeech":"VERB"},{"term":"hydrated","meaningVi":"được cung cấp đủ nước","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"fluid intake","meaningVi":"lượng nước đưa vào cơ thể","partOfSpeech":"NOUN"}],"antonyms":[{"term":"dehydration","meaningVi":"tình trạng thiếu nước","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'fresh' THEN '{"wordFamilies":[{"term":"freshness","meaningVi":"độ tươi mới","partOfSpeech":"NOUN"},{"term":"freshly","meaningVi":"mới đây","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"unspoiled","meaningVi":"chưa hư hỏng","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"stale","meaningVi":"không còn tươi","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'routine' THEN '{"wordFamilies":[{"term":"routinely","meaningVi":"theo thói quen","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"habit","meaningVi":"thói quen","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'advice' THEN '{"wordFamilies":[{"term":"advise","meaningVi":"khuyên bảo","partOfSpeech":"VERB"},{"term":"adviser","meaningVi":"người cố vấn","partOfSpeech":"NOUN"}],"synonyms":[{"term":"guidance","meaningVi":"sự hướng dẫn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb

           -- U03 · Community service
           WHEN 'volunteer' THEN '{"wordFamilies":[{"term":"volunteering","meaningVi":"việc tình nguyện","partOfSpeech":"NOUN"},{"term":"voluntary","meaningVi":"tự nguyện","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"helper","meaningVi":"người giúp đỡ","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'donate' THEN '{"wordFamilies":[{"term":"donation","meaningVi":"khoản quyên góp","partOfSpeech":"NOUN"},{"term":"donor","meaningVi":"người quyên góp","partOfSpeech":"NOUN"}],"synonyms":[{"term":"give","meaningVi":"trao tặng","partOfSpeech":"VERB"}],"antonyms":[{"term":"withhold","meaningVi":"giữ lại, không trao","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'charity' THEN '{"wordFamilies":[{"term":"charitable","meaningVi":"có tính từ thiện","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"nonprofit organization","meaningVi":"tổ chức phi lợi nhuận","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'community' THEN '{"wordFamilies":[{"term":"communal","meaningVi":"thuộc cộng đồng","partOfSpeech":"ADJECTIVE"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'shelter' THEN '{"wordFamilies":[{"term":"sheltered","meaningVi":"được che chở","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"refuge","meaningVi":"nơi trú ẩn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'collect rubbish' THEN '{"wordFamilies":[{"term":"collection","meaningVi":"việc thu gom","partOfSpeech":"NOUN"}],"synonyms":[{"term":"pick up litter","meaningVi":"nhặt rác","partOfSpeech":"PHRASE"}],"antonyms":[{"term":"litter","meaningVi":"xả rác","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'recycle' THEN '{"wordFamilies":[{"term":"recycling","meaningVi":"việc tái chế","partOfSpeech":"NOUN"},{"term":"recyclable","meaningVi":"có thể tái chế","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"reprocess","meaningVi":"xử lý lại","partOfSpeech":"VERB"}],"antonyms":[{"term":"discard","meaningVi":"vứt bỏ","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'elderly' THEN '{"wordFamilies":[{"term":"elder","meaningVi":"người lớn tuổi","partOfSpeech":"NOUN"}],"synonyms":[{"term":"older","meaningVi":"cao tuổi hơn","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"young","meaningVi":"trẻ","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'orphanage' THEN '{"wordFamilies":[{"term":"orphan","meaningVi":"trẻ mồ côi","partOfSpeech":"NOUN"},{"term":"orphaned","meaningVi":"mồ côi","partOfSpeech":"ADJECTIVE"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'support' THEN '{"wordFamilies":[{"term":"supporter","meaningVi":"người ủng hộ","partOfSpeech":"NOUN"},{"term":"supportive","meaningVi":"hay hỗ trợ","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"assist","meaningVi":"giúp đỡ","partOfSpeech":"VERB"}],"antonyms":[{"term":"oppose","meaningVi":"phản đối","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'fundraising' THEN '{"wordFamilies":[{"term":"fundraise","meaningVi":"gây quỹ","partOfSpeech":"VERB"},{"term":"fundraiser","meaningVi":"người hoặc sự kiện gây quỹ","partOfSpeech":"NOUN"}],"synonyms":[{"term":"charity drive","meaningVi":"đợt vận động từ thiện","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'neighborhood' THEN '{"wordFamilies":[{"term":"neighbor","meaningVi":"hàng xóm","partOfSpeech":"NOUN"},{"term":"neighboring","meaningVi":"lân cận","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"local area","meaningVi":"khu vực địa phương","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'environment' THEN '{"wordFamilies":[{"term":"environmental","meaningVi":"thuộc môi trường","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"surroundings","meaningVi":"môi trường xung quanh","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'plant trees' THEN '{"wordFamilies":[{"term":"planting","meaningVi":"việc trồng cây","partOfSpeech":"NOUN"}],"synonyms":[{"term":"grow trees","meaningVi":"trồng cây","partOfSpeech":"PHRASE"}],"antonyms":[{"term":"cut down trees","meaningVi":"chặt cây","partOfSpeech":"PHRASE"}]}'::jsonb
           WHEN 'campaign' THEN '{"wordFamilies":[{"term":"campaigner","meaningVi":"người vận động","partOfSpeech":"NOUN"},{"term":"campaigning","meaningVi":"việc vận động","partOfSpeech":"NOUN"}],"synonyms":[{"term":"initiative","meaningVi":"sáng kiến hành động","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'generous' THEN '{"wordFamilies":[{"term":"generosity","meaningVi":"lòng hào phóng","partOfSpeech":"NOUN"},{"term":"generously","meaningVi":"một cách hào phóng","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"giving","meaningVi":"rộng lượng","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"selfish","meaningVi":"ích kỷ","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'kindness' THEN '{"wordFamilies":[{"term":"kind","meaningVi":"tử tế","partOfSpeech":"ADJECTIVE"},{"term":"kindly","meaningVi":"một cách tử tế","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"compassion","meaningVi":"lòng trắc ẩn","partOfSpeech":"NOUN"}],"antonyms":[{"term":"cruelty","meaningVi":"sự tàn nhẫn","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'improve' THEN '{"wordFamilies":[{"term":"improvement","meaningVi":"sự cải thiện","partOfSpeech":"NOUN"},{"term":"improved","meaningVi":"được cải thiện","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"enhance","meaningVi":"nâng cao","partOfSpeech":"VERB"}],"antonyms":[{"term":"worsen","meaningVi":"làm xấu đi","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'participate' THEN '{"wordFamilies":[{"term":"participation","meaningVi":"sự tham gia","partOfSpeech":"NOUN"},{"term":"participant","meaningVi":"người tham gia","partOfSpeech":"NOUN"}],"synonyms":[{"term":"take part","meaningVi":"tham gia","partOfSpeech":"PHRASE"}],"antonyms":[{"term":"abstain","meaningVi":"không tham gia","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'organize' THEN '{"wordFamilies":[{"term":"organization","meaningVi":"sự tổ chức","partOfSpeech":"NOUN"},{"term":"organizer","meaningVi":"người tổ chức","partOfSpeech":"NOUN"}],"synonyms":[{"term":"arrange","meaningVi":"sắp xếp","partOfSpeech":"VERB"}],"antonyms":[{"term":"disorganize","meaningVi":"làm mất trật tự","partOfSpeech":"VERB"}]}'::jsonb

           -- U04 · Music and arts
           WHEN 'music' THEN '{"wordFamilies":[{"term":"musical","meaningVi":"thuộc âm nhạc","partOfSpeech":"ADJECTIVE"},{"term":"musician","meaningVi":"nhạc công","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'artist' THEN '{"wordFamilies":[{"term":"artistic","meaningVi":"có tính nghệ thuật","partOfSpeech":"ADJECTIVE"},{"term":"artistry","meaningVi":"tài nghệ","partOfSpeech":"NOUN"}],"synonyms":[{"term":"creator","meaningVi":"người sáng tạo","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'performance' THEN '{"wordFamilies":[{"term":"perform","meaningVi":"biểu diễn","partOfSpeech":"VERB"},{"term":"performer","meaningVi":"người biểu diễn","partOfSpeech":"NOUN"}],"synonyms":[{"term":"show","meaningVi":"buổi trình diễn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'gallery' THEN '{"wordFamilies":[],"synonyms":[{"term":"exhibition space","meaningVi":"không gian trưng bày","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'portrait' THEN '{"wordFamilies":[{"term":"portraitist","meaningVi":"họa sĩ chân dung","partOfSpeech":"NOUN"}],"synonyms":[{"term":"likeness","meaningVi":"hình ảnh chân dung","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'sculpture' THEN '{"wordFamilies":[{"term":"sculpt","meaningVi":"điêu khắc","partOfSpeech":"VERB"},{"term":"sculptor","meaningVi":"nhà điêu khắc","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'museum' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'concert' THEN '{"wordFamilies":[{"term":"concertgoer","meaningVi":"người đi nghe hòa nhạc","partOfSpeech":"NOUN"}],"synonyms":[{"term":"live music show","meaningVi":"buổi biểu diễn nhạc trực tiếp","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'composer' THEN '{"wordFamilies":[{"term":"compose","meaningVi":"soạn nhạc","partOfSpeech":"VERB"},{"term":"composition","meaningVi":"tác phẩm âm nhạc","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'melody' THEN '{"wordFamilies":[{"term":"melodic","meaningVi":"có giai điệu","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"tune","meaningVi":"giai điệu","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'rhythm' THEN '{"wordFamilies":[{"term":"rhythmic","meaningVi":"có nhịp điệu","partOfSpeech":"ADJECTIVE"},{"term":"rhythmically","meaningVi":"theo nhịp điệu","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"beat","meaningVi":"nhịp","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'musician' THEN '{"wordFamilies":[{"term":"music","meaningVi":"âm nhạc","partOfSpeech":"NOUN"},{"term":"musical","meaningVi":"thuộc âm nhạc","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"performer","meaningVi":"người biểu diễn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'audience' THEN '{"wordFamilies":[],"synonyms":[{"term":"spectators","meaningVi":"khán giả","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'stage' THEN '{"wordFamilies":[{"term":"staging","meaningVi":"việc dàn dựng sân khấu","partOfSpeech":"NOUN"}],"synonyms":[{"term":"performance platform","meaningVi":"bục biểu diễn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'folk music' THEN '{"wordFamilies":[],"synonyms":[{"term":"traditional music","meaningVi":"âm nhạc truyền thống","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'traditional' THEN '{"wordFamilies":[{"term":"tradition","meaningVi":"truyền thống","partOfSpeech":"NOUN"},{"term":"traditionally","meaningVi":"theo truyền thống","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"customary","meaningVi":"theo tập quán","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"modern","meaningVi":"hiện đại","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'exhibition' THEN '{"wordFamilies":[{"term":"exhibit","meaningVi":"trưng bày","partOfSpeech":"VERB"},{"term":"exhibitor","meaningVi":"người trưng bày","partOfSpeech":"NOUN"}],"synonyms":[{"term":"display","meaningVi":"cuộc trưng bày","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'landscape' THEN '{"wordFamilies":[],"synonyms":[{"term":"scenery","meaningVi":"phong cảnh","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'drum' THEN '{"wordFamilies":[{"term":"drummer","meaningVi":"tay trống","partOfSpeech":"NOUN"},{"term":"drumming","meaningVi":"việc đánh trống","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'violin' THEN '{"wordFamilies":[{"term":"violinist","meaningVi":"nghệ sĩ vĩ cầm","partOfSpeech":"NOUN"}],"synonyms":[{"term":"fiddle","meaningVi":"đàn vĩ cầm (cách gọi thân mật)","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb

           -- U05 · Food and cooking
           WHEN 'ingredient' THEN '{"wordFamilies":[],"synonyms":[{"term":"component","meaningVi":"thành phần","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'recipe' THEN '{"wordFamilies":[],"synonyms":[{"term":"cooking instructions","meaningVi":"hướng dẫn nấu ăn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'boil' THEN '{"wordFamilies":[{"term":"boiling","meaningVi":"sự sôi","partOfSpeech":"NOUN"},{"term":"boiled","meaningVi":"được luộc","partOfSpeech":"ADJECTIVE"}],"synonyms":[],"antonyms":[{"term":"freeze","meaningVi":"làm đông lạnh","partOfSpeech":"VERB"}]}'::jsonb
           WHEN 'fry' THEN '{"wordFamilies":[{"term":"fried","meaningVi":"được chiên","partOfSpeech":"ADJECTIVE"},{"term":"frying","meaningVi":"việc chiên","partOfSpeech":"NOUN"}],"synonyms":[{"term":"pan-fry","meaningVi":"chiên bằng chảo","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb
           WHEN 'grill' THEN '{"wordFamilies":[{"term":"grilling","meaningVi":"việc nướng","partOfSpeech":"NOUN"},{"term":"grilled","meaningVi":"được nướng","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"barbecue","meaningVi":"nướng trên vỉ","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb
           WHEN 'steam' THEN '{"wordFamilies":[{"term":"steaming","meaningVi":"việc hấp","partOfSpeech":"NOUN"},{"term":"steamed","meaningVi":"được hấp","partOfSpeech":"ADJECTIVE"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'slice' THEN '{"wordFamilies":[{"term":"slicing","meaningVi":"việc cắt lát","partOfSpeech":"NOUN"},{"term":"sliced","meaningVi":"được thái lát","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"cut into slices","meaningVi":"cắt thành lát","partOfSpeech":"PHRASE"}],"antonyms":[]}'::jsonb
           WHEN 'stir' THEN '{"wordFamilies":[{"term":"stirring","meaningVi":"việc khuấy","partOfSpeech":"NOUN"}],"synonyms":[{"term":"mix","meaningVi":"trộn","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb
           WHEN 'flavor' THEN '{"wordFamilies":[{"term":"flavorful","meaningVi":"đậm đà hương vị","partOfSpeech":"ADJECTIVE"},{"term":"flavoring","meaningVi":"chất tạo hương vị","partOfSpeech":"NOUN"}],"synonyms":[{"term":"taste","meaningVi":"mùi vị","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'spicy' THEN '{"wordFamilies":[{"term":"spice","meaningVi":"gia vị","partOfSpeech":"NOUN"},{"term":"spiciness","meaningVi":"độ cay","partOfSpeech":"NOUN"}],"synonyms":[{"term":"hot","meaningVi":"cay (thức ăn)","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"mild","meaningVi":"ít cay","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'sweet' THEN '{"wordFamilies":[{"term":"sweetness","meaningVi":"vị ngọt","partOfSpeech":"NOUN"},{"term":"sweeten","meaningVi":"làm ngọt","partOfSpeech":"VERB"}],"synonyms":[{"term":"sugary","meaningVi":"ngọt nhiều đường","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"bitter","meaningVi":"đắng","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'sour' THEN '{"wordFamilies":[{"term":"sourness","meaningVi":"vị chua","partOfSpeech":"NOUN"}],"synonyms":[{"term":"tart","meaningVi":"chua gắt","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"sweet","meaningVi":"ngọt","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'portion' THEN '{"wordFamilies":[{"term":"portioned","meaningVi":"đã được chia phần","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"serving","meaningVi":"khẩu phần ăn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'beverage' THEN '{"wordFamilies":[],"synonyms":[{"term":"drink","meaningVi":"đồ uống","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'noodles' THEN '{"wordFamilies":[{"term":"noodle","meaningVi":"sợi mì","partOfSpeech":"NOUN"}],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'pancake' THEN '{"wordFamilies":[],"synonyms":[{"term":"flapjack","meaningVi":"bánh kếp (cách gọi ở Mỹ)","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'omelette' THEN '{"wordFamilies":[],"synonyms":[{"term":"omelet","meaningVi":"trứng tráng (chính tả Mỹ)","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'delicious' THEN '{"wordFamilies":[{"term":"deliciously","meaningVi":"một cách ngon miệng","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"tasty","meaningVi":"ngon","partOfSpeech":"ADJECTIVE"}],"antonyms":[{"term":"unappetizing","meaningVi":"không hấp dẫn về vị giác","partOfSpeech":"ADJECTIVE"}]}'::jsonb
           WHEN 'serve' THEN '{"wordFamilies":[{"term":"service","meaningVi":"sự phục vụ","partOfSpeech":"NOUN"},{"term":"server","meaningVi":"người phục vụ","partOfSpeech":"NOUN"}],"synonyms":[{"term":"dish up","meaningVi":"dọn món ăn ra","partOfSpeech":"PHRASE"}],"antonyms":[]}'::jsonb
           WHEN 'measure' THEN '{"wordFamilies":[{"term":"measurement","meaningVi":"sự đo lường","partOfSpeech":"NOUN"},{"term":"measurable","meaningVi":"có thể đo được","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"quantify","meaningVi":"định lượng","partOfSpeech":"VERB"}],"antonyms":[]}'::jsonb

           -- U06 · Traffic and transport
           WHEN 'traffic' THEN '{"wordFamilies":[],"synonyms":[{"term":"road traffic","meaningVi":"giao thông đường bộ","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'pedestrian' THEN '{"wordFamilies":[],"synonyms":[{"term":"walker","meaningVi":"người đi bộ","partOfSpeech":"NOUN"}],"antonyms":[{"term":"motorist","meaningVi":"người lái xe cơ giới","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'crosswalk' THEN '{"wordFamilies":[{"term":"crossing","meaningVi":"chỗ băng qua đường","partOfSpeech":"NOUN"}],"synonyms":[{"term":"pedestrian crossing","meaningVi":"vạch sang đường","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'sidewalk' THEN '{"wordFamilies":[],"synonyms":[{"term":"pavement","meaningVi":"vỉa hè (Anh–Anh)","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'helmet' THEN '{"wordFamilies":[{"term":"helmeted","meaningVi":"có đội mũ bảo hiểm","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"protective headgear","meaningVi":"đồ bảo vệ đầu","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'intersection' THEN '{"wordFamilies":[{"term":"intersect","meaningVi":"giao nhau","partOfSpeech":"VERB"}],"synonyms":[{"term":"junction","meaningVi":"nút giao","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'roundabout' THEN '{"wordFamilies":[],"synonyms":[{"term":"traffic circle","meaningVi":"bùng binh, vòng xuyến","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'bicycle lane' THEN '{"wordFamilies":[],"synonyms":[{"term":"bike lane","meaningVi":"làn đường xe đạp","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'road sign' THEN '{"wordFamilies":[{"term":"signage","meaningVi":"hệ thống biển báo","partOfSpeech":"NOUN"}],"synonyms":[{"term":"traffic sign","meaningVi":"biển báo giao thông","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'seat belt' THEN '{"wordFamilies":[],"synonyms":[{"term":"safety belt","meaningVi":"dây an toàn","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'passenger' THEN '{"wordFamilies":[],"synonyms":[{"term":"rider","meaningVi":"người đi trên phương tiện","partOfSpeech":"NOUN"}],"antonyms":[{"term":"driver","meaningVi":"người lái xe","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'platform' THEN '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
           WHEN 'fare' THEN '{"wordFamilies":[],"synonyms":[{"term":"ticket price","meaningVi":"giá vé","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'direction' THEN '{"wordFamilies":[{"term":"direct","meaningVi":"chỉ đường","partOfSpeech":"VERB"},{"term":"directional","meaningVi":"thuộc phương hướng","partOfSpeech":"ADJECTIVE"}],"synonyms":[{"term":"orientation","meaningVi":"hướng","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'turn left' THEN '{"wordFamilies":[{"term":"leftward","meaningVi":"về phía trái","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"make a left turn","meaningVi":"rẽ trái","partOfSpeech":"PHRASE"}],"antonyms":[{"term":"turn right","meaningVi":"rẽ phải","partOfSpeech":"PHRASE"}]}'::jsonb
           WHEN 'turn right' THEN '{"wordFamilies":[{"term":"rightward","meaningVi":"về phía phải","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"make a right turn","meaningVi":"rẽ phải","partOfSpeech":"PHRASE"}],"antonyms":[{"term":"turn left","meaningVi":"rẽ trái","partOfSpeech":"PHRASE"}]}'::jsonb
           WHEN 'speed limit' THEN '{"wordFamilies":[{"term":"limitation","meaningVi":"sự giới hạn","partOfSpeech":"NOUN"}],"synonyms":[{"term":"maximum speed","meaningVi":"tốc độ tối đa","partOfSpeech":"NOUN"}],"antonyms":[]}'::jsonb
           WHEN 'public transport' THEN '{"wordFamilies":[{"term":"transportation","meaningVi":"sự vận chuyển","partOfSpeech":"NOUN"}],"synonyms":[{"term":"public transit","meaningVi":"giao thông công cộng","partOfSpeech":"NOUN"}],"antonyms":[{"term":"private transport","meaningVi":"phương tiện cá nhân","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'congestion' THEN '{"wordFamilies":[{"term":"congested","meaningVi":"bị ùn tắc","partOfSpeech":"ADJECTIVE"},{"term":"congest","meaningVi":"làm tắc nghẽn","partOfSpeech":"VERB"}],"synonyms":[{"term":"traffic jam","meaningVi":"tắc đường","partOfSpeech":"NOUN"}],"antonyms":[{"term":"free-flowing traffic","meaningVi":"giao thông thông suốt","partOfSpeech":"NOUN"}]}'::jsonb
           WHEN 'safety' THEN '{"wordFamilies":[{"term":"safe","meaningVi":"an toàn","partOfSpeech":"ADJECTIVE"},{"term":"safely","meaningVi":"một cách an toàn","partOfSpeech":"ADVERB"}],"synonyms":[{"term":"security","meaningVi":"sự an toàn","partOfSpeech":"NOUN"}],"antonyms":[{"term":"danger","meaningVi":"sự nguy hiểm","partOfSpeech":"NOUN"}]}'::jsonb
           ELSE '{"wordFamilies":[],"synonyms":[],"antonyms":[]}'::jsonb
       END
FROM words w JOIN content_units u ON u.code=w.unit_code
WHERE NOT EXISTS(
 SELECT 1 FROM vocabulary_words existing
 WHERE existing.unit_id=u.id AND lower(existing.word)=lower(w.word)
);

COMMIT;
