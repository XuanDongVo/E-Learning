# ADR 0024 — Assignment Composition là cấu trúc nội dung có thứ tự

**Trạng thái:** Accepted; quy tắc chấm điểm/hiển thị được làm rõ bởi ADR 0026  
**Ngày:** 2026-10-12; mô hình Content Sharing được làm rõ ngày 2026-10-21  
**Phạm vi:** Assignment Builder, thứ tự nội dung, nhóm Content Sharing và ranh giới với Question Engine.

## 1. Quyết định

1. Assignment Composition là cấu trúc sản phẩm có thứ tự: `Assignment → Section → Item`. Thứ tự lưu trong Composition là nguồn sự thật cho Builder, Student Preview, Assignment đã phát hành và AssessmentAttempt.
2. `AssignmentQuestion` chỉ là liên kết sở hữu Question bởi Assignment; không sở hữu thứ tự, vị trí hay cấu trúc Content Sharing.
3. Question có thể đứng độc lập trong Section. Khi được đặt trong Content Sharing, Question vừa là thành viên của nhóm trên UI vừa phải có liên kết dữ liệu tường minh tới từng Content Block mà nó thực sự sử dụng. Không suy ra liên kết ngữ nghĩa chỉ từ việc nằm trong nhóm.
4. Content Sharing là một container Composition riêng, không phải một loại Question và không phải thư viện nội dung dùng chung toàn hệ thống. Trong v1, nhóm và các block thuộc một Assignment/Section; không cho phép tham chiếu block từ Assignment khác.
5. Một Content Sharing group có thể chứa các Question thành viên và các Content Block như PASSAGE, POOL, MEDIA hoặc INSTRUCTIONS theo quy tắc được kiểm tra ở server. Các block và Question có thứ tự riêng bên trong group. Không cho phép nhóm lồng nhóm.
6. Quan hệ thành viên nhóm và quan hệ Question–Block là hai khái niệm riêng:
   - **Membership:** Question nằm trong group nào để tổ chức, sắp xếp và hiển thị UI.
   - **Reference:** Question sử dụng Block nào, với vai trò nào (ví dụ `PASSAGE`, `ANSWER_POOL`, `INSTRUCTIONS`, `MEDIA`).
   Một Question có thể tham chiếu nhiều Block; nhiều Question có thể tham chiếu cùng một Block.
7. Question độc lập không bắt buộc thuộc group và không cần tham chiếu Block. Question chỉ được đưa vào group khi người soạn chọn thao tác đó. Không tự động gom mọi Question trong cùng Section thành Content Sharing.
8. Question Bank/Question Engine sở hữu nội dung Question chuẩn và logic chấm điểm. Composition sở hữu cách đặt Question vào Assignment, membership, liên kết tới Block theo Assignment, thứ tự, điểm, required/example và cấu hình hiển thị. Không để Composition Save âm thầm ghi đè nội dung Question Bank.
9. V1 hỗ trợ block INSTRUCTIONS, PASSAGE, MEDIA (ảnh) và POOL. Audio và thư viện Content Sharing toàn hệ thống nằm ngoài phạm vi hiện tại.
10. MATCHING và CLOZE là loại câu hỏi compound, cần được triển khai theo vertical slice đầy đủ. Không coi việc đã có enum/spec/handler là đủ điều kiện bật UI hoặc phát hành.
11. AssessmentAttempt phải snapshot Composition, các QuestionSpec đã phân giải, nội dung Block, liên kết Question–Block, thứ tự, đáp án, quy tắc chuẩn hóa/chấm điểm, điểm từng phần và các cài đặt liên quan. Attempt lịch sử không được tính lại từ dữ liệu đang thay đổi.
12. Theo ADR 0026, câu hỏi có điểm mặc định 1; điểm từng phần của MATCHING/CLOZE mặc định chia đều nhưng có thể chỉnh nếu tổng điểm phần bằng điểm tổng. Server chấm tự động. `show_score_after_submit` và `show_answers_after_submit` là hai cài đặt độc lập.

## 2. Mô hình Composition mục tiêu

```text
Assignment
└── Section (ordered)
    ├── Question (độc lập, không bắt buộc có Block reference)
    └── Content Sharing Group (ordered container)
        ├── Content Block: PASSAGE / POOL / MEDIA / INSTRUCTIONS
        ├── Question member A
        └── Question member B

Question member A ── references(role=PASSAGE) ──> PASSAGE block
Question member A ── references(role=ANSWER_POOL) ──> POOL block
Question member B ── references(role=PASSAGE) ──> PASSAGE block
```

Sơ đồ trên thể hiện hai quan hệ khác nhau. Cây Composition xác định nơi hiển thị và thứ tự; bảng/quan hệ tham chiếu xác định dữ liệu mà Question Engine sử dụng khi dựng đề và chấm điểm.

## 3. Ràng buộc dữ liệu

- Mỗi Question xuất hiện tối đa một lần trong Composition của cùng Assignment; không nhân bản Question item chỉ để tạo nhiều liên kết nội dung.
- Group, block và Question item phải thuộc cùng Assignment và cùng Section trong v1.
- Group chỉ được chứa loại item được cho phép; block không được chứa block lồng nhau; group không được lồng group.
- Question–Block reference phải trỏ tới Block tồn tại trong cùng Assignment; role phải phù hợp loại Block; cấm tham chiếu chéo Assignment.
- Xóa Block đang được tham chiếu phải bị từ chối hoặc yêu cầu người dùng gỡ/thay thế các reference trước; không âm thầm để lại liên kết mồ côi.
- Xóa Question khỏi Composition không xóa Question Bank record. Xóa group phải có quy tắc rõ ràng cho thành viên: thao tác UI phải yêu cầu chọn chuyển Question ra Section hay gỡ khỏi Assignment; không được xóa nhầm nội dung Question.
- ID của POOL entry phải ổn định và độc lập với text hiển thị. Không dùng text đáp án làm khóa liên kết hoặc đáp án đúng.
- Composition API phải trả về canonical tree theo `position` và các reference tường minh; không suy thứ tự từ ID hay thứ tự truy vấn DB.

## 4. Ranh giới Matching và Cloze

- MATCHING: hàng/cặp có key ổn định; answer pool entry có ID/key ổn định; đáp án đúng lưu theo entry key, không lưu bằng text. Nếu dùng POOL block chung, Assignment Composition phải liên kết Question với block và kiểm tra các key cần thiết tồn tại trong pool. Quy tắc có được tái sử dụng cùng một entry ở nhiều hàng phải được khai báo rõ.
- CLOZE: các đoạn văn bản được sắp thứ tự xen kẽ với blank ổn định. Với N blank phải có N+1 segment; mỗi blank có key duy nhất và ít nhất một đáp án hợp lệ. Liên kết tới PASSAGE block (nếu có) phải tường minh. Không suy vị trí blank chỉ từ số thứ tự hiển thị.
- QuestionSpec canonical không được lưu ID database của một Assignment-specific Block; quan hệ tới Block thuộc Composition. Snapshot phải kết hợp QuestionSpec và reference đã phân giải thành một runtime definition bất biến.

## 5. Migration và triển khai

- Không sửa migration đã phát hành. Nhánh hiện có V33 tạo Section/Item với `item_type` chỉ cho QUESTION, INSTRUCTIONS, PASSAGE, MEDIA, POOL; cần kiểm tra max migration thực tế trước khi chọn số mới.
- Thay đổi mô hình cần migration mới cho group và Question–Block references, đồng thời cập nhật constraint/index, entity/repository, DTO, validation, frontend types/mapping, Builder actions, Student Preview/runtime snapshot và tests.
- Không triển khai bằng cách chỉ thêm một `groupId` vào frontend hoặc tái sử dụng `parent_item_id` như thể nó là semantic reference.
- Việc sửa Matching/Cloze phải giữ dữ liệu canonical xuyên suốt create → read → edit → save → reload → preview/runtime → snapshot → grading.

## 6. Tài liệu có thẩm quyền

- Mô hình chi tiết và audit hiện trạng: `.agent/architecture/assignment-composition-v1.md`
- Question Engine và hợp đồng spec/answer/grading/snapshot: `.agent/architecture/question-engine-v1.md`
- Kế hoạch xử lý phát hiện: `.agent/plans/CONTENT_SHARING_MATCHING_CLOZE_AUDIT.md`
