# Glossary

One term per concept. Use the English term in code, types, API and UI copy. The Vietnamese column is a suggested
translation for the team; confirm and adjust it once, then keep it consistent.

| Term | Vietnamese (suggested) | Meaning |
|---|---|---|
| Grade | Khối lớp | Grade 6, 7 or 8 |
| Unit | Unit / Chương | A course unit inside a Grade |
| Section | Phần | A group of Topics inside a Unit |
| Topic | Chủ đề | A learning topic, for example Past Simple |
| Question bank | Ngân hàng câu hỏi | A reusable set of Questions under a Topic; lifecycle Draft / Published / Archived |
| Question | Câu hỏi | One question; "Ready" when `is_complete` is true |
| Activity | Hoạt động | A repeatable learning/practice/game experience. **Not** an Assignment |
| Activity source | Nguồn câu hỏi | A QuestionBank used by an Activity (`ActivityBank`) |
| Distribution | Phân bổ | How many questions come from each source: equal, percentage, fixed count |
| Selection strategy | Cách chọn câu hỏi | Which questions fill a quota: random or weakness priority |
| Learning mode | Chế độ Học | No time limit, hints and explanations available |
| Try Hard mode | Chế độ Thử thách | Time limit, lives, no hints |
| Both (mode) | Cả hai chế độ | Default. The student chooses Learning or Try Hard when starting |
| GameTemplate | Mẫu trò chơi | Presentation layer of an Activity; not a separate question system |
| Assignment | Bài được giao | Teacher-assigned task or assessment with a target, schedule, one attempt, official score |
| Attempt | Lượt làm bài | One real run by a student (of an Activity or an Assignment) |
| Readiness | Mức sẵn sàng | **Derived** state of an Activity (`READY` / `NEEDS_ATTENTION`); never stored |
| Needs attention | Cần xử lý | Readiness warning, **not** a lifecycle status |
| Draft / Published / Archived | Nháp / Đã xuất bản / Lưu trữ | Lifecycle statuses |
| XP | Điểm kinh nghiệm | Rewards recorded in `XPTransaction`; separate from the official Assignment score |

Never use "Quiz" for Activity or "Test" for Assignment in the UI.
