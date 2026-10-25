# 08 — Student Assignment Attempt: Nghiệp vụ, ERD và Use Cases

**Trạng thái:** ACTIVE SPECIFICATION — chốt hợp đồng nghiệp vụ trước migration/code skeleton  
**Nhánh:** feature/student-assignment-attempt  
**Nhánh gốc:** refactor/teacher-content-ui-routing  
**Phạm vi:** Phase 7B — runtime làm Assignment chính thức của Student  
**Tài liệu liên quan:** CURRENT_STATE.md, plans/PHASES.md, plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md, plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md, ADR 0021–0026, architecture/assignment-composition-v1.md

> Tài liệu mô tả nghiệp vụ đích, không khẳng định chức năng đã được triển khai. Assignment Composition đã có ở phía authoring; AssessmentAttempt runtime chưa có. Code và migration thực tế vẫn là căn cứ cuối cùng để xác định hiện trạng.

## 1. Mục đích

Xây dựng luồng Student làm Assignment chính thức: bắt đầu bài; chỉ có một Attempt chính thức cho mỗi Student + Assignment; có thể resume khi rời trang hoặc mất kết nối; chỉ một tab/thiết bị được quyền ghi tại một thời điểm; autosave; đồng hồ toàn bài do server quản lý; submit/timeout chốt và chấm tự động; lưu tổng điểm và kết quả từng phần; dùng snapshot bất biến để dữ liệu nguồn thay đổi không làm thay đổi Attempt cũ.

## 2. Phạm vi

### Trong phạm vi
- Start/resume Attempt, snapshot Composition và Question cần cho hiển thị/chấm.
- Autosave câu trả lời, submit idempotent và auto-submit khi timeout.
- Quyền ghi độc quyền cho một màn hình, heartbeat tối giản và takeover khi session cũ stale.
- Server-authoritative whole-attempt timer.
- Chấm tự động bằng Question Engine; lưu tổng điểm, điểm từng phần và trạng thái từng phần.
- Kiểm tra quyền truy cập, lịch, target/grade/class membership ở backend.
- Khóa chỉnh sửa Assignment sau khi Attempt đầu tiên bắt đầu; clone để thay đổi.

### Ngoài phạm vi
- Không tạo bảng AttemptSession riêng.
- Không xây hệ thống quản lý thiết bị, lịch sử session, dashboard session hoặc audit session chuyên sâu.
- Không thêm Redis chỉ để làm session lock.
- Không lưu thời gian làm từng câu hỏi.
- Không có XP, badge, ranking, chấm thủ công, báo cáo giáo viên hoặc analytics nâng cao trong bước này.
- Không tạo Attempt runtime đa hình dùng chung cho ActivitySession. ActivitySession và AssessmentAttempt là hai aggregate riêng.

## 3. Actor và thuật ngữ

- **Student:** người được phép làm Assignment.
- **Teacher:** người tạo/chỉnh sửa Assignment; sau Attempt đầu tiên phải clone nếu muốn thay đổi hợp đồng bài làm.
- **Assignment:** cấu hình bài do Teacher soạn, gồm Composition, câu hỏi, thời gian, lịch và cài đặt kết quả.
- **AssessmentAttempt:** lần làm bài chính thức duy nhất của một Student cho một Assignment.
- **AttemptQuestion:** một Question trong snapshot của Attempt, theo thứ tự được giao.
- **AttemptAnswer:** câu trả lời đã lưu cho AttemptQuestion.
- **AttemptPartResult:** kết quả chấm của từng phần trong một Question.
- **Active screen/session:** mã định danh tối giản của tab làm bài, dùng để kiểm soát quyền ghi; không phải aggregate riêng.

## 4. Business rules

### BR-01 — Một Attempt chính thức
Một cặp assignment_id + student_id chỉ có tối đa một AssessmentAttempt. Bảo vệ bằng unique constraint ở database, không chỉ kiểm tra trong service.

### BR-02 — Resume thay vì tạo mới
- Chưa có Attempt và Assignment đủ điều kiện: tạo Attempt.
- Đã có Attempt IN_PROGRESS và chưa hết giờ: trả cùng Attempt để tiếp tục.
- Attempt SUBMITTED hoặc TIMED_OUT: không tạo Attempt mới, không cho sửa/nộp lại.
- Nếu Attempt IN_PROGRESS đã quá deadline, backend xử lý timeout/auto-submit trước khi trả dữ liệu tiếp tục.

### BR-03 — Lifecycle
Trạng thái chính thức: IN_PROGRESS, SUBMITTED, TIMED_OUT. Nộp trễ là metadata is_late, không phải lifecycle state. Không có trạng thái chờ giáo viên chấm.

### BR-04 — Chỉ một màn hình có quyền ghi
- Màn hình đầu tiên được backend cấp quyền giữ quyền điều khiển.
- Tab/thiết bị khác nhận cảnh báo; không được autosave hoặc submit.
- Không tự động takeover chỉ vì tab mới được mở.
- Mọi write request phải kiểm tra active session ở backend; khóa UI không đủ.
- Khi session cũ stale, session mới có thể takeover cùng Attempt. Sau takeover, mọi write từ session cũ bị từ chối.
- Attempt đã kết thúc thì không session nào được sửa câu trả lời.

### BR-05 — Heartbeat tối giản
Heartbeat chỉ cho biết màn hình giữ quyền còn hoạt động; không điều khiển timer, điểm hoặc submit. Giá trị khởi điểm để thử nghiệm: heartbeat mỗi khoảng 30 giây, session stale sau khoảng 90 giây không có heartbeat. Đây là ngưỡng kỹ thuật có thể tinh chỉnh, không phải quy tắc nghiệp vụ cố định. Backend phải xử lý takeover và write một cách an toàn trước race condition. MVP không cần bảng lịch sử session.

### BR-06 — Đồng hồ toàn bài
- Time limit áp dụng cho toàn Attempt, không phải từng câu.
- Started time và deadline do server quyết định.
- Refresh, đóng tab hoặc mất mạng không dừng đồng hồ.
- Backend kiểm tra timeout trên các thao tác liên quan và có cơ chế server xử lý khi Student không gửi request tiếp theo.
- Timeout chốt câu trả lời đã lưu, chấm tự động và đặt trạng thái TIMED_OUT.
- Không dựa vào JavaScript timer để quyết định kết quả cuối cùng.

### BR-07 — Autosave
- Chỉ chấp nhận khi Attempt IN_PROGRESS, chưa timeout và session có quyền ghi.
- Retry mạng không được tạo dữ liệu trùng hoặc ghi đè câu trả lời mới hơn.
- Lỗi lưu phải được trả rõ ràng; UI chỉ hiển thị saved sau xác nhận thành công từ backend.
- Chỉ câu trả lời backend đã xác nhận lưu mới được bảo đảm có mặt khi submit/timeout.
- Xử lý race giữa autosave, submit, timeout và takeover bằng transaction/locking hoặc cơ chế concurrency phù hợp.

### BR-08 — Submit idempotent
Submit kiểm tra trạng thái và active session. Lần submit hợp lệ đầu tiên chốt câu trả lời, chấm bài, lưu kết quả và kết thúc Attempt. Retry trả về kết quả đã chốt, không tạo lượt chấm mới.

### BR-09 — Snapshot bất biến
Khi bắt đầu Attempt, lưu snapshot đủ để hiển thị và chấm độc lập với dữ liệu nguồn về sau, tối thiểu gồm:
- Thứ tự section/item/question và nhóm câu hỏi liên quan.
- QuestionSpec/payload cần hiển thị.
- Answer key/accepted values và hợp đồng normalization/grading được lưu nội bộ.
- Points, required/example flags.
- Snapshot schema version và normalizer/grading contract version.
- Media/block payload cần dựng lại nội dung Student đã thấy.
- Time limit và các cài đặt score/answer visibility liên quan.

Không trả answer key, accepted answers hoặc explanation bị hạn chế cho Student trước thời điểm được phép reveal. Tách snapshot nội bộ khỏi DTO trả Student.

### BR-10 — Chấm điểm
- Chấm tự động qua Question Engine; không có chấm thủ công.
- Chấm từ snapshot, không lấy đáp án live hiện tại.
- PartStatus: CORRECT, PARTIALLY_CORRECT, INCORRECT, UNANSWERED.
- Lưu earned_points, possible_points, part_key ổn định và version liên quan.
- Example items không tính vào mẫu số điểm chính thức.
- Không lưu thời gian theo từng câu hỏi.

### BR-11 — Score visibility và answer visibility độc lập
show_score_after_submit quyết định có hiển thị điểm; show_answers_after_submit quyết định có hiển thị đáp án/giải thích. Backend phải enforce riêng từng setting. Có dữ liệu chấm nội bộ không có nghĩa là được trả dữ liệu đó cho Student.

### BR-12 — Nộp trễ
Nếu chính sách hiện hành cho phép nộp trễ, vẫn chấp nhận bài và đánh dấu is_late=true, không tự trừ điểm vì nộp trễ. Không nhầm due date với time limit của Attempt đã bắt đầu.

### BR-13 — Khóa Assignment sau Attempt đầu tiên
Sau Attempt đầu tiên, backend từ chối thay đổi ảnh hưởng hợp đồng bài làm: Composition/thứ tự, Question content/membership, points/required/example flags, target, schedule/time limit và review settings. Teacher clone Assignment để thay đổi. Đóng/ngừng nhận lượt mới không được làm biến đổi snapshot cũ.

### BR-14 — Phân quyền
Mọi thao tác start/resume/read/save/submit/result phải xác thực Student và kiểm tra Assignment target, grade/class membership, publish state, schedule và due policy ở backend. Không tin student_id, điểm, thời gian hay quyền ghi do client tự khai báo.

## 5. ERD tối thiểu

Assignment
- Authoring hiện có: Assignment → AssignmentSection → AssignmentItem → Question/Content Block.
- Runtime: Assignment → AssessmentAttempt → AttemptQuestion → AttemptAnswer.
- Runtime grading: AttemptQuestion → AttemptPartResult.

### 5.1 AssessmentAttempt
Trường mục tiêu, cần đối chiếu convention hiện có trước migration:
- id, assignment_id, student_id, status
- started_at, submitted_at, timed_out_at
- time_limit_seconds, deadline_at
- total_possible_points, total_earned_points, percentage_score
- is_late
- active_session_id, last_activity_at
- snapshot_version, created_at, updated_at

Ràng buộc bắt buộc: unique (assignment_id, student_id). Không tạo AttemptSession table trong MVP.

### 5.2 AttemptQuestion
- id, attempt_id
- assignment_item_id (nullable nếu không thể bảo đảm tham chiếu ổn định sau snapshot)
- question_id (tham chiếu nguồn tùy chọn để truy vết; không phải nguồn runtime)
- position
- question_snapshot (JSONB hoặc kiểu tương đương theo convention hiện có)
- possible_points, is_required, is_example
- snapshot_version và timestamps

position ở đây là thứ tự snapshot runtime, không phải thêm position vào AssignmentQuestion. Thứ tự authoring vẫn do Composition quản lý.

### 5.3 AttemptAnswer
- id, attempt_question_id
- answer_payload (JSON)
- normalized_value (nullable, dữ liệu nội bộ nếu cần)
- saved_at và timestamps

Một AttemptQuestion có tối đa một answer hiện hành trong MVP. CLOZE/MATCHING có thể lưu nhiều phần trả lời trong payload; không cần tạo một row riêng cho từng blank nếu Question Engine contract hiện tại hỗ trợ.

### 5.4 AttemptPartResult
- id, attempt_question_id, part_key
- status, earned_points, possible_points
- snapshot_version, normalizer_version
- timestamps

Unique constraint phù hợp, tối thiểu (attempt_question_id, part_key), để retry không nhân đôi kết quả. Tổng điểm lưu trên AssessmentAttempt; chi tiết nằm ở AttemptPartResult. MVP không cần bảng AttemptResult riêng.

## 6. Use cases

### UC-01 — Bắt đầu Assignment lần đầu
**Actor:** Student.  
**Điều kiện:** đăng nhập; Assignment published, trong thời gian cho phép và Student thuộc target hợp lệ.
1. Student mở Assignment.
2. Backend kiểm tra quyền và điều kiện start.
3. Backend tìm Attempt theo Assignment + Student.
4. Nếu chưa có, tạo Attempt IN_PROGRESS, snapshot dữ liệu và cấp active session.
5. Trả nội dung làm bài không chứa answer key bị hạn chế.
6. UI hiển thị bài và thời gian còn lại theo deadline server.
**Kết quả:** chỉ một Attempt chính thức được tạo.

### UC-02 — Quay lại Attempt đang làm
1. Student mở lại Assignment.
2. Backend kiểm tra quyền và deadline.
3. Nếu chưa hết giờ, trả cùng Attempt và answer đã lưu.
4. Nếu session cũ vẫn active, không cấp quyền ghi cho tab mới; hiển thị cảnh báo.
5. Nếu session cũ stale, cho takeover an toàn và vô hiệu hóa quyền ghi của session cũ.
6. Tiếp tục từ dữ liệu đã lưu và deadline ban đầu.
**Kết quả:** resume cùng Attempt, không tạo mới.

### UC-03 — Mở tab/thiết bị thứ hai
1. Session A được cấp quyền ghi.
2. Session B yêu cầu mở cùng Attempt.
3. Nếu A còn active, B chỉ được xem trạng thái cần thiết, không được ghi.
4. Nếu A stale, B có thể takeover.
5. Sau takeover, write từ A bị từ chối.
**Kết quả:** chỉ một session được quyền ghi tại một thời điểm.

### UC-04 — Autosave
1. Student thay đổi câu trả lời.
2. UI gửi payload cùng Attempt ID và session ID.
3. Backend kiểm tra ownership, trạng thái, deadline và active session.
4. Backend lưu theo quy tắc idempotency/concurrency.
5. UI chỉ hiển thị saved sau response thành công.
**Nhánh lỗi:** session mất quyền, Attempt kết thúc hoặc mạng lỗi thì không được báo saved nhầm.

### UC-05 — Submit chủ động
1. Student yêu cầu submit.
2. Backend kiểm tra active session và trạng thái.
3. Backend chốt answer đã lưu, tự chấm từ snapshot, lưu part results/tổng điểm.
4. Đặt SUBMITTED, submitted_at và is_late nếu phù hợp.
5. Retry trả kết quả đã chốt.
6. UI chỉ hiển thị điểm/đáp án được phép.

### UC-06 — Timeout
1. Deadline server đến.
2. Request hoặc cơ chế xử lý timeout phát hiện Attempt hết hạn.
3. Backend chặn autosave mới, chốt answer đã lưu và chấm.
4. Đặt TIMED_OUT và timed_out_at.
5. UI hiển thị đã hết giờ cùng kết quả được phép xem.
Timeout phải do server quyết định kể cả khi Student không còn tương tác; cơ chế cụ thể cần phù hợp hạ tầng hiện có.

### UC-07 — Teacher sửa Assignment sau Attempt đầu tiên
1. Teacher gửi thay đổi ảnh hưởng hợp đồng bài làm.
2. Backend kiểm tra đã có Attempt chưa.
3. Nếu có, từ chối thay đổi.
4. Teacher clone Assignment và chỉnh sửa bản clone.
5. Attempt cũ tiếp tục dùng snapshot cũ.

### UC-08 — Mở Attempt đã kết thúc
1. Student mở Assignment có Attempt SUBMITTED hoặc TIMED_OUT.
2. Backend không tạo Attempt mới và không cho sửa/nộp lại.
3. Trả trạng thái kết thúc và dữ liệu kết quả được phép xem theo visibility settings.

## 7. Vấn đề và hướng giải quyết

| ID | Vấn đề/rủi ro | Hướng giải quyết |
|---|---|---|
| P0-01 | Có thể tạo nhiều Attempt | Unique constraint + start/resume idempotent |
| P0-02 | Mất câu trả lời khi refresh/mất mạng | Autosave có xác nhận backend |
| P0-03 | Hai tab ghi đè nhau | active_session_id và kiểm tra backend ở mọi write |
| P0-04 | Session mất kết nối giữ lock mãi | Heartbeat + stale threshold + takeover |
| P0-05 | Session cũ ghi sau takeover | Từ chối mọi write từ session không còn active |
| P0-06 | Client lách timer | Deadline server và xử lý timeout server-side |
| P0-07 | Submit/timeout bị gọi lặp | Submit idempotent, transaction/concurrency guard, unique part result |
| P0-08 | Sửa Question làm đổi bài cũ | Snapshot bất biến, hard lock và clone |
| P0-09 | Lộ đáp án trước thời điểm cho phép | DTO tách biệt và backend enforce visibility |
| P0-10 | Tổng điểm lệch kết quả từng phần | Grading từ snapshot, lưu part results và aggregate nhất quán |
| P0-11 | Autosave/submit/timeout chạy đua | Transaction/locking hoặc optimistic versioning; định nghĩa rõ thao tác nào thắng |
| P0-12 | Truy cập Assignment không thuộc Student | Enforce target, membership, publish/schedule ở mọi endpoint |
| P1-01 | Tạo migration trùng schema hiện có | Audit migrations/entities trước khi chọn version |
| P1-02 | Question Engine chưa đủ parity mọi type | Kiểm tra snapshot/normalization/grading cho từng type trước khi publish |
| P1-03 | UI báo saved khi chưa lưu | Chỉ xác nhận saved theo response thành công |
| P1-04 | Phình scope | Hoãn XP, badge, analytics nâng cao và per-question timing |

## 8. Trình tự sau khi review spec

1. **Audit trước migration:** kiểm tra migration directory, entity/repository/schema và convention ID/timestamps. CURRENT_STATE hiện ghi V42 nhưng phải xác minh lại ngay trước migration. Không sửa migration đã áp dụng.
2. **Migration:** tạo schema cho AssessmentAttempt, AttemptQuestion, AttemptAnswer, AttemptPartResult và các constraint/index/FK.
3. **Code skeleton:** entity, repository, DTO, service/controller và error contract theo package convention thực tế.
4. **Core runtime:** start/resume, active-session permission, autosave, submit, timeout, grading.
5. **Security/concurrency tests:** multi-tab/device, stale takeover, write cũ sau takeover, autosave-vs-submit-vs-timeout, retry idempotency và access control.
6. **Student UI:** làm bài, resume, trạng thái autosave, cảnh báo session khác, đồng hồ và kết quả theo visibility.
7. **Verification:** chạy test/backend/frontend/build/browser checks; ghi commit SHA và kết quả thực tế trong PROGRESS.md.

Trước Scope B implementation, xử lý gate xác minh Scope A/Question Engine trong plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md. Không đánh dấu gate đã pass nếu chưa chạy kiểm tra.

## 9. Acceptance criteria

- [ ] Không thể tạo hơn một Attempt kể cả hai request start đồng thời.
- [ ] Resume không reset deadline hoặc answer đã lưu.
- [ ] Attempt SUBMITTED/TIMED_OUT không thể sửa hoặc tạo Attempt mới.
- [ ] Chỉ active session hiện tại được autosave/submit.
- [ ] Session khác bị chặn khi active session còn hoạt động; stale takeover an toàn.
- [ ] Session cũ không thể ghi sau takeover.
- [ ] Autosave retry không tạo dữ liệu trùng hoặc làm mất câu trả lời mới hơn.
- [ ] Timeout do server quyết định và tự chốt kể cả khi Student không tương tác.
- [ ] Submit retry không chấm/lưu kết quả lần hai.
- [ ] Snapshot runtime không đổi khi dữ liệu nguồn thay đổi.
- [ ] Tổng điểm khớp tổng điểm phần; example không tính vào mẫu số.
- [ ] Score visibility và answer visibility được enforce riêng ở backend.
- [ ] Assignment bị khóa sau Attempt đầu tiên; clone tạo dữ liệu độc lập.
- [ ] Mọi endpoint kiểm tra quyền truy cập.
- [ ] Tests/build/browser validation được chạy và ghi theo commit cụ thể.

## 10. Điểm cần chốt khi review

1. Tên/kiểu khóa ngoại Student và Assignment phải theo entity hiện có.
2. assignment_item_id và question_id trong snapshot là traceability tùy chọn; snapshot payload mới là nguồn runtime.
3. Cơ chế timeout server-side phải phù hợp hạ tầng hiện có; không thêm scheduler/infra mới nếu giải pháp đơn giản đáp ứng yêu cầu.
4. Heartbeat/stale threshold 30s/90s là giá trị khởi đầu, cần test thực tế và có thể tinh chỉnh.
5. Xác minh Question Engine tạo snapshot, chuẩn hóa và chấm đầy đủ cho mọi type được publish trước khi mở runtime cho tất cả type.

**Quy tắc hoàn thành:** spec không đồng nghĩa implementation. Migration/code skeleton là bước tiếp theo sau khi nội dung nghiệp vụ được rà soát; trạng thái test chỉ được cập nhật khi thực sự chạy trên commit cụ thể.
