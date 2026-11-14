# 02 — SRS: Guided Reasoning v1

**Software Requirements Specification — E-Learning**  
**Phiên bản:** 1.1 — cập nhật theo thay đổi nghiệp vụ ngày 14/11/2026  
**Trạng thái:** M1 authoring và M2 Activity configuration/eligibility đã triển
khai trên branch nêu dưới; runtime, Student UI/review và release verification vẫn
chưa triển khai.<br>
**Repo/branch triển khai:** `XuanDongVo/E-Learning` · `feature/guided-reasoning-v1`  
**Base:** `main` tại `268bcf0b03cb87e0c72cf14a9d28998698b8421b`  
**Tài liệu đi kèm:** [03_FRS_Guided_Reasoning_v1.md](03_FRS_Guided_Reasoning_v1.md)

> **Nhãn quyết định:** **CONFIRMED** = yêu cầu do Product Owner xác nhận; **PROPOSED** = quy tắc bổ sung để implement nhất quán, có thể điều chỉnh khi review; **EXISTING** = quan sát từ mã nguồn `main` tại SHA trên. Không coi một đề xuất là chức năng đã triển khai.

## 1. Mục tiêu

Mở rộng Question hiện hành bằng một Guided Definition tùy chọn. Teacher thiết kế chuỗi câu hỏi nhỏ nhằm giúp Student suy luận; Student hoàn thành **từng Guided Step trước**, rồi mới được xem **Question chính (Final)**, trả lời Final và xem lời giải. Mọi kết quả của Step được lưu để Student/Teacher xem lại. Không xây Experience Engine tổng quát.

### 1.1. Bối cảnh đã xác minh trên `main`

| Khu vực | Hiện trạng | Yêu cầu bổ sung |
|---|---|---|
| Question / Question Engine | Question có type, answer/option/definition; `QuestionEngine` hỗ trợ validation, parse, grade và `QuestionTypeHandlerRegistry` | Step dùng QuestionSpec + handler hiện có, **không tạo Question Entity riêng** |
| Question types | Activity chọn năm loại: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER; Question Engine còn có MATCHING/CLOZE | Guided Step v1 hỗ trợ ba loại; không mở rộng Matching/Cloze trong Activity |
| Teacher Question | `/v1/content/questions` có bulk create và update | Giữ bulk; thêm Guided Editor sau khi Question có ID |
| Activity | Unit + Question Bank distribution EQUAL/PERCENTAGE/FIXED_COUNT; LEARNING/TRY_HARD/BOTH, RANDOM/WEAKNESS_PRIORITY | Bổ sung `practiceType`; Guided chỉ LEARNING + RANDOM |
| Session | Snapshot Question schema v2; server xử lý answer, hint, finish, XP/streak | Snapshot Guided riêng + Step state/hint/attempts/Final review |
| Grading | ActivityService hiện tự chấm Final qua `isCorrect(snapshot, answer)`, Learning có retry một lần | Step dùng QuestionEngine; Final giữ policy hiện tại, tránh đổi XP |
| Results | API result hiện tập trung score/XP; Student UI phụ thuộc picks/revealed client state | Persist Step/Final answers; Student và Teacher review chi tiết có phân quyền |
| Teacher access | `TeacherStudentLearningService` đã có danh sách Activity Sessions của học sinh có quyền | Cần detail endpoint được bảo vệ tương ứng |

## 2. Quyết định nghiệp vụ

| ID | Nội dung | Trạng thái |
|---|---|---|
| DEC-01 | Tối đa **một Guided Definition** trên mỗi Question | CONFIRMED |
| DEC-02 | **Không có giới hạn số Step tối đa ở cấp nghiệp vụ** | CONFIRMED |
| DEC-03 | Mỗi lần nộp Step trả **đúng/sai ngay**; **không lộ đáp án đúng** trước khi Final resolved | CONFIRMED |
| DEC-04 (revised) | **Guided Steps xuất hiện trước; Question chính chỉ được hiển thị khi hoàn thành toàn bộ Step** | CONFIRMED — thay DEC-04 cũ |
| DEC-05 | Final quyết định score/XP; Step chỉ dùng phân tích học tập, **không thưởng XP riêng** | CONFIRMED |
| DEC-06 | Step `TYPE_ANSWER` tái sử dụng QuestionEngine, acceptedAnswers, matchingMode/normalization từ handler | CONFIRMED |
| DEC-07 | Guided Activity v1 chỉ `LEARNING` + `RANDOM` | CONFIRMED |
| DEC-08 | Student/Teacher được xem chi tiết từng Step theo quyền và điều kiện tiết lộ đáp án | CONFIRMED |
| DEC-09 (new) | **Hint tùy chọn cho từng Step**; Teacher chọn bật/tắt và nội dung hint | CONFIRMED — bổ sung |
| DEC-10 (new) | **Retry tùy chọn cho từng Step**; Teacher chọn bật/tắt | CONFIRMED — bổ sung |

**Chưa được Product Owner xác nhận riêng:** mặc định `hintEnabled=false`/`retryEnabled=false`, retry bật thì thêm **một lượt** (tổng hai attempts), Step Hint không giảm XP Final, Step đúng thì kết thúc ngay, sai hết lượt vẫn đi tiếp, context/intro tùy chọn. Đánh dấu toàn bộ là **PROPOSED policy v1**; không diễn giải là các quyết định đã chốt.

## 3. Phân biệt miền nghiệp vụ

- `Question`: entity có type/answer/explanation/QuestionDefinition như hiện tại; làm Final.
- `GuidedDefinition`: extension tùy chọn 0..1 của Question; có version, status DRAFT/READY, revision guard, intro/context tùy chọn và các Step theo thứ tự.
- `GuidedStep`: QuestionSpec nhúng với type SINGLE_CHOICE, TRUE_FALSE hoặc TYPE_ANSWER, hint policy/retry policy tùy chọn; **không** phải Question độc lập trong Bank.
- `PracticeType`: `CLASSIC` hoặc `GUIDED_REASONING`, **không** phải QuestionType/ActivityMode.
- `StepAttempt`: record bất biến cho một lần nộp; `StepProgress` lưu current index, số lần thử, trạng thái và `hintUsed`.
- `Final`: Question chính được tiết lộ **sau** các Step; LEARNING retry/hint và XP tiếp tục dùng chính sách hiện tại.

## 4. Scope và exclusions

| Trong scope | Ngoài scope |
|---|---|
| Teacher tạo/sửa/reorder/preview Guided, hint/retry từng Step; DRAFT/READY | Error Detective, Retrieval, Mixed, engine tổng quát |
| Question Bank hiển thị availability Guided; Activity Guided riêng biệt | Step types MULTIPLE_CHOICE/FILL_IN_BLANK/MATCHING/CLOZE; Final MATCHING/CLOZE |
| Student Step → feedback → optional hint/retry → Final → Result | Adaptive branching, AI-generated hints/answers, fuzzy/LLM grading |
| Persist server-side snapshot/attempt/hint state; resume refresh; idempotency | TRY_HARD, Weakness Priority, timer/lives Step |
| Student & Teacher review từng attempt/step và Final, có RBAC | Bulk Guided Create, Teacher class analytics aggregate, sửa Assignment |
| Giữ CLASSIC, XP/streak và lịch sử Session | Chấm XP/bonus/hint penalty dựa trên Step (đề xuất v1) |

## 5. Workflow hệ thống

### 5.1. Teacher

1. Tạo/bulk tạo Question thông thường trong Question Bank; mở chung Guided Editor khi Question đã có ID.
2. Biên soạn **introContent** nếu Step cần bối cảnh, nhưng **không hiển thị Question chính trước Final**.
3. Thêm một hoặc nhiều Step, chọn QuestionType; cấu hình hintEnabled + hint text, retryEnabled từng Step; sắp xếp/preview.
4. Save Draft hoặc validate để READY; revalidate nếu Question gốc đã thay đổi.
5. Tạo Activity `GUIDED_REASONING`; LEARNING, RANDOM; phân phối Question Bank theo cơ chế hiện có; chỉ Question Guided READY được chọn.
6. Kiểm tra Readiness/Publish; xem Session review chi tiết của Student có quan hệ lớp hợp lệ.

### 5.2. Student

1. Bắt đầu Guided Activity đã Publish; server chọn Question ngẫu nhiên từ các Bank theo allocation và tạo snapshot.
2. **Không nhận content/options/answer key của Final** trong response ở giai đoạn Step. Chỉ hiện intro (nếu có), Step hiện hành và tiến độ.
3. Nộp Step: server trả correct true/false. Nếu sai và retryEnabled còn lượt thì ở lại Step, cho nộp lại; nếu hết lượt/chính xác thì chuyển Step kế tiếp. Hint chỉ hiện khi được bật và học sinh yêu cầu.
4. Hoàn thành Step cuối → API cấp public **Final Question** và control trả lời chính. Hint/retry Final theo chính sách LEARNING hiện có.
5. Khi Final **resolved**, trả lời đúng/sai và xem lại Step attempts, hints đã dùng, answers/explanations; XP tính **duy nhất theo Final**, không cấp Step XP.
6. Refresh/resume lấy dữ liệu tiến trình từ server, không tin vào state React làm nguồn sự thật.

### 5.3. Quy tắc đề xuất nhằm đóng mơ hồ

| Mã | Quy tắc | Tình trạng |
|---|---|---|
| POL-01 | Ready yêu cầu tối thiểu 1 Step; không hardcode maxStepCount nghiệp vụ, vận hành có request/payload size guard | PROPOSED |
| POL-02 | Retry Step bật = tối đa 2 attempts; tắt = 1; đúng kết thúc Step ngay; sai hết lượt vẫn tiến tiếp | PROPOSED |
| POL-03 | Hint Step được xem trước/sau lần sai khi còn Step active; chỉ một lần reveal có lưu dấu; no hint khi disabled | PROPOSED |
| POL-04 | Hint Step **không** đánh dấu `ActivitySessionQuestion.hintUsed` và **không** làm giảm XP Final; final hint policy cũ không đổi | PROPOSED |
| POL-05 | Step vẫn trả correctness mỗi lần; không trả correct key, acceptedAnswers, explanation cho tới khi Final resolved. Retry không tạo oracle lộ đáp án | PROPOSED |
| POL-06 | Không skip, không tự ý sửa previous Step hoặc gửi Final trước gate; các bước tuyến tính | PROPOSED |
| POL-07 | Trước Final, server không cấp toàn bộ Question payload; introContent/Step không tự động chèn Question content vào payload | PROPOSED |
| POL-08 | Teacher sửa Question/Guided sau session start không ảnh hưởng snapshot của session cũ; content revisions khác nhau phải revalidate READY | PROPOSED |
| POL-09 | Dữ liệu của Session ABANDONED: reviewer được xem submitted answers và flags, **không lộ key của Question/Step chưa resolved**; Teacher view không được trở thành answer-key endpoint mở | PROPOSED |

## 6. Functional requirements cấp hệ thống

| ID | Yêu cầu |
|---|---|
| SRS-GR-001 | Tồn tại 0..1 Guided Definition/Question, quản lý Draft/Ready/revision |
| SRS-GR-002 | Hỗ trợ số Step bất kỳ >= 1 cho READY trong giới hạn tài nguyên vận hành |
| SRS-GR-003 | Cho Teacher authoring ba Step types và cấu hình per-Step hint/retry |
| SRS-GR-004 | Duy trì hai Activity practice types, Guided chỉ LEARNING+RANDOM |
| SRS-GR-005 | Readiness, selection, snapshot dựa trên Guided READY và source revision |
| SRS-GR-006 | Guided-first UI/endpoint: Final Question không xuất hiện trước khi tất cả Step hoàn thành |
| SRS-GR-007 | Step feedback ngay; retry/hint theo policy, tuyệt đối không lộ đáp án trong giai đoạn Step |
| SRS-GR-008 | Server điều phối state machine và bảo vệ request order/idempotency/concurrent submissions |
| SRS-GR-009 | Tách Step progress và XP Final; giữ Final Learning scoring/hint/retry |
| SRS-GR-010 | Persist Step attempts & final answer attempts để review sau refresh |
| SRS-GR-011 | Student và Teacher review chi tiết theo quyền, chỉ reveal đáp án khi cho phép |
| SRS-GR-012 | Không làm thay đổi Classic/Assignment/legacy XP-streak/old Session |
| SRS-GR-013 | Preview Teacher đúng luồng Guided Steps trước, Final sau, có test nội dung/gợi ý |

## 7. Kiến trúc mức cao

```text
Question (existing)
  └── GuidedDefinition 0..1  [schemaVersion, status, sourceRevision, introContent]
        └── GuidedStep 1..n [QuestionSpec, hintPolicy, retryPolicy]

Activity (existing)
  └── practiceType = CLASSIC | GUIDED_REASONING

ActivitySession (existing)
  ├── QuestionSnapshot (existing)
  ├── GuidedSnapshot (new, immutable)
  ├── GuidedStepProgress + GuidedStepAttempts (new)
  └── FinalQuestionAttempts (new review persistence)
```

Backend: Spring Boot service orchestration; QuestionEngine adapter cho Step; bước hiện tại và eligibility được quản lý trong DB transaction (locking/idempotency); Flyway migration forward-only. Frontend: reuse Teacher Question Form primitives, Student renderer tương thích QuestionType, state derives from API. **Không tạo Experience/Interaction Registry tổng quát trong v1.**

- **Snapshot/versioning:** Question và Guided đóng băng tại session start.
- **Finite State Machine:** `STEP_ACTIVE → STEP_RETRY` (nếu bật) `→ NEXT_STEP → FINAL_PENDING → FINAL_RETRY → QUESTION_RESOLVED`.
- **Single source of truth:** Backend authoritative; không tin final gate, correct/step index gửi từ client.
- **Compatibility:** `practiceType` default CLASSIC ở existing rows; endpoint và DTO Classic giữ backward compatibility.
- **Security:** Teacher authoring theo quyền Question Bank; Teacher review theo quan hệ lớp; Student sessions theo JWT ownership, account status và grade entitlement.

## 8. Non-functional requirements

| ID | NFR |
|---|---|
| NFR-GR-01 | **Security:** không có answer key trong Step/Final pre-gate API. Đừng chỉ che bằng CSS; sanitize DTO server-side |
| NFR-GR-02 | **Integrity:** unique Question-Definition; stepKey stable; attempt_number + requestId idempotent; row lock/transaction |
| NFR-GR-03 | **Durability:** submit/hint atomic; resume & review sau refresh/restart; migration không làm mất historical Sessions |
| NFR-GR-04 | **Performance:** không hard-limit Step count nghiệp vụ, nhưng phân trang/virtualize authoring và giới hạn request size, tránh N+1/API trả full Guided secret payload |
| NFR-GR-05 | **Accessibility/UX:** responsive desktop/mobile, keyboard, trạng thái hint/retry/đúng/sai rõ, không chỉ biểu đạt bằng màu |
| NFR-GR-06 | **Observability:** log transition, rejected out-of-order request, grading errors; không log đáp án/PII nhạy cảm |
| NFR-GR-07 | **Compatibility:** không đổi điểm/XP/streak với Classic; không dùng runtime Question Definition mới để chấm old snapshot |
| NFR-GR-08 | **Testability:** unit, service integration, E2E cover hint on/off, retry on/off, final gating, teacher access, stale content |
| NFR-GR-09 | **Failure behavior:** concurrent duplicate submits không tăng attempts; invalid requests trả lỗi có mã; UI retry kỹ thuật không tạo retry nghiệp vụ |
| NFR-GR-10 | **Maintainability:** DTO typed/schemaVersion, reuse QuestionEngine and existing snapshot/XP workflow; feature boundaries hẹp |

## 9. Rủi ro và kiểm soát

| Rủi ro | Biện pháp |
|---|---|
| Question Final bị lộ sớm | Public session payload trong phase Step chỉ gồm intro + current Step đã sanitize; test serialization |
| Step câu hỏi quá dài/đáp án lộ ở intro/hint | Preview Teacher, cảnh báo sư phạm; không dùng AI tự động xác nhận ngữ nghĩa |
| Retry Step làm tăng duplicate / race | requestId per attempt; transactional state, lock; retry HTTP khác retry nghiệp vụ |
| Hint Step ảnh hưởng XP trái ý | Step hintUsed riêng; Final XP audit chỉ dựa Final fields |
| Unbounded Step gây payload/performance | streaming/paging/virtualized UI + server operational limits, không đặt quota Step nghiệp vụ |
| Teacher xem student ngoài phạm vi | Backend class ownership check, không tin studentId client |
| Sửa nội dung giữa session | Immutable snapshot; revised content READY guard; old result không đổi |

## 10. Kế hoạch triển khai và nghiệm thu

1. **M0 — Baseline + policy/contracts:** characterization tests Classic, finalize POL-01..09 trong implementation review, confirm migration version trên HEAD.
2. **M1 — Definition/Editor:** entity/validation/draft-ready, Teacher UI, intro/hint/retry configuration.
3. **M2 — Activity:** practiceType + readiness + selection + publishing constraints.
4. **M3 — Runtime:** snapshot, Step submit/hint/retry, guarded final fetch/answer, resume/idempotency.
5. **M4 — Review:** student + teacher detail endpoints and UI.
6. **M5 — QA/release:** E2E, security & regression, docs/API schema.

**Go-live criteria:** Teacher biên soạn 3 loại Step và 4 cấu hình hint/retry; Guided Step xuất hiện **trước Final**, đúng/sai tức thì không lộ key; retry/hint persisted; Student/Teacher review được; Final quyết định XP; Classic/Assignment/legacy Sessions không hồi quy.

## 11. Source audit, traceability, change control

**Repo main @ `268bcf0b...`:**

- `server/src/main/java/e_learning/server/question/engine/core/QuestionEngine.java`
- `server/src/main/java/e_learning/server/question/engine/core/QuestionTypeHandlerRegistry.java`
- `server/src/main/java/e_learning/server/activitysession/service/ActivitySessionService.java`
- `server/src/main/java/e_learning/server/activitysession/selection/ActivityQuestionSelectionService.java`
- `server/src/main/java/e_learning/server/activitysession/snapshot/ActivityQuestionSnapshotAssembler.java`
- `server/src/main/java/e_learning/server/student/service/teacher/TeacherStudentLearningService.java`
- `client-e-learning/src/components/features/student/activities/practice-runner.tsx`
- `client-e-learning/src/components/features/student/activities/practice-result.tsx`
- `client-e-learning/src/components/features/teacher/activities/activity-editor.tsx`

Chi tiết workflow/DTO/schema/acceptance cases nằm ở [FRS](03_FRS_Guided_Reasoning_v1.md). Thay đổi `DEC-04` và bổ sung `DEC-09/10` **supersede** phần Guided-first/hint/retry cũ; không diễn giải nhầm “không hint/retry Step” là yêu cầu nữa. Bất cứ mở rộng Error Detective, Mixed, TRY_HARD, Matching/Cloze, hoặc đổi XP Step đều cần change request.
