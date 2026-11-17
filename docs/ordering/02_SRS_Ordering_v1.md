# 02 — SRS: Ordering Question Type v1

**Software Requirements Specification — E-Learning**  
**Phiên bản:** 1.1 — Product Owner đã duyệt phương án PROPOSED, 16/11/2026  
**Trạng thái:** **BUSINESS REQUIREMENTS APPROVED / UI PROTOTYPE REVIEW** — chưa triển khai ứng dụng hoặc tạo migration; SRS được lưu trong nhánh chuẩn bị triển khai  
**Repository:** `XuanDongVo/E-Learning`  
**Nguồn đối chiếu:** `feature/guided-reasoning-v1` tại commit `88f8f87878661aa575c2f9dee4e66e7f62cd3810`  
**Tài liệu tham khảo cấu trúc:** `docs/guided-reasoning/02_SRS_Guided_Reasoning_v1.md`

> **Quy ước trạng thái**  
> **CONFIRMED** — quyết định Product Owner đã nêu trong trao đổi.  
> **PROPOSED** — phương án từng được đề xuất; toàn bộ DEC-ORD-09..14 đã được Product Owner chấp thuận ngày 16/11/2026.  
> **EXISTING** — quan sát từ code được kiểm tra trên branch nêu trên.  
> **OUT OF SCOPE** — loại trừ khỏi Ordering v1.  
> Mọi JSON/API/UI trong tài liệu là **thiết kế đề xuất**, không phải contract đang tồn tại.

---

## 1. Mục tiêu và bối cảnh

### 1.1. Mục tiêu

Bổ sung **một `QuestionType = ORDERING`** vào Question Bank để học sinh sắp xếp **từ, cụm từ hoặc câu** thành một trình tự hợp lệ. Ordering là **Question Type**, **không phải `ActivityPracticeType` mới**.

Ordering v1 phải dùng được trong:

1. **Classic Activity** — một Question bình thường trong vòng đời Session.
2. **Guided Reasoning — Final Question** — học sinh hoàn thành các Guided Steps hiện có trước, sau đó giải Ordering Final.

Không mở Ordering trong Guided Steps hoặc Assignment ở v1. Không triển khai Teacher Analytics dành riêng cho Ordering.

### 1.2. Giá trị học tập và phạm vi chương trình

Ordering áp dụng theo các Grade/Unit mà hệ thống đang hỗ trợ, không hardcode giới hạn cấp lớp trong Question Type hoặc Activity. Các ví dụ THCS dưới đây chỉ minh họa, không phải ràng buộc chỉ hỗ trợ lớp 6–9:

| Subtype | Kỹ năng chính | Ví dụ nội dung |
|---|---|---|
| `WORD` | Trật tự từ và cấu trúc câu | `English / learns / she / every day.` |
| `PHRASE` | Ghép các cụm có ý nghĩa thành câu | `Last Sunday, / we / helped / older people.` |
| `SENTENCE` | Tính mạch lạc đoạn văn, trình tự hội thoại / sự kiện | Sắp xếp 4 câu mô tả hoạt động tình nguyện |

Các ví dụ chỉ mang tính biên soạn minh họa. Teacher vẫn chịu trách nhiệm chọn kiến thức và độ khó đúng với Unit/Question Bank.

### 1.3. Hiện trạng liên quan đã đối chiếu

| Khu vực | Hiện trạng (`EXISTING`) | Tác động Ordering |
|---|---|---|
| `QuestionType` | 7 loại, chưa có `ORDERING` | Thêm enum và xử lý đầy đủ mọi switch/registry |
| `questions` | Có `definition` dạng JSON text cho type phức hợp | Tái sử dụng, không cần bảng `ordering_questions` |
| `QuestionEngine` | Registry bắt buộc một handler cho mỗi enum; có `GradeResult` | Thêm OrderingSpec/Handler/validation/grading |
| Activity eligibility | Classic/Guided chỉ nhận 5 loại cơ bản; Guided còn yêu cầu READY | Mở rộng eligibility cho Ordering theo practice type và status |
| Guided v1 | Steps trước Final; `GuidedDraftEditor` chặn một số type làm Final | Cho phép Ordering **Final**, giữ nguyên tập type của **Steps** |
| Session | `ActivitySessionQuestion` có immutable question snapshot và attempt/result state | Đóng băng order definition + thứ tự trình bày đã trộn |
| Student runtime | Renderer chung cho Classic và Guided Final, answer draft hiện thiên về choice/text | Thêm UI Ordering và payload mảng ID **có thứ tự** |
| XP/score | Một Question có một outcome; Step Guided không tự cấp XP | Ordering vẫn là **một Question** |
| Assignment | Dùng Question Bank chung nhưng runtime/validator riêng | Phải **lọc/chặn** Ordering cả frontend lẫn backend |

---

## 2. Quyết định nghiệp vụ

| ID | Quyết định | Trạng thái |
|---|---|---|
| `DEC-ORD-01` | Chỉ thêm `QuestionType.ORDERING`, không thêm Learning Method / Practice Type mới | **CONFIRMED** |
| `DEC-ORD-02` | Dùng trong Classic Activity | **CONFIRMED** |
| `DEC-ORD-03` | Dùng làm **Final Question** trong Guided Reasoning | **CONFIRMED** |
| `DEC-ORD-04` | Không dùng Ordering làm Guided Step trong v1 | **CONFIRMED** |
| `DEC-ORD-05` | Không dùng Ordering trong Assignment ở v1 | **CONFIRMED** |
| `DEC-ORD-06` | Có ba subtype `WORD`, `PHRASE`, `SENTENCE` | **CONFIRMED** |
| `DEC-ORD-07` | **Shuffle luôn bật**, không có `shuffleItems` hoặc toggle tương đương ở Teacher UI/API/definition | **CONFIRMED** |
| `DEC-ORD-08` | Không triển khai Teacher Analytics riêng cho Ordering trong v1 | **CONFIRMED** |
| `DEC-ORD-09` | Chấm **binary**: đúng một accepted order thì Question đúng; không cấp XP theo item | **CONFIRMED — PO approved** |
| `DEC-ORD-10` | Teacher có thể cấu hình **nhiều accepted orders** cho một Question | **CONFIRMED — PO approved** |
| `DEC-ORD-11` | Một Question có khoảng **3–8 item** để kiểm soát UX; thông số có thể thay đổi | **CONFIRMED — PO approved** |
| `DEC-ORD-12` | Classic kế thừa LEARNING / TRY_HARD khi cả thời gian, retry và controls đã tương thích | **CONFIRMED — PO approved** |
| `DEC-ORD-13` | Re-shuffle giữa các Session; **giữ nguyên thứ tự trình bày khi retry/chuyển câu trong Session còn hiệu lực**. Refresh/rời runtime tuân ADR 0012: không resume, mở lại tạo lượt mới | **CONFIRMED — PO approved** |
| `DEC-ORD-14` | Không chấm sai khi hai item giống hệt nhau về nội dung hiển thị chỉ vì đổi ID; cần quy tắc tương đương rõ | **CONFIRMED — PO approved** |

**Bổ sung 17/11/2026:** ADR 0012 quyết định Activity không resume; phản hồi reload trong DEC-ORD-13 được làm rõ như trên. Scope Grade không giới hạn cứng, Assignment guard thuộc M1 và eligibility mở theo từng phase.

**Lưu ý cập nhật 16/11/2026:** Product Owner đã duyệt toàn bộ các quyết định `DEC-ORD-09` đến `DEC-ORD-14`. Chúng được xem là phạm vi v1 bắt buộc; thay đổi cần được review riêng.

---

## 3. Ranh giới nghiệp vụ và mô hình nội dung

### 3.1. Phân biệt các khái niệm

- **Question**: entity hiện có; `type = ORDERING`, có prompt, difficulty, hint, explanation và `definition`.
- **Ordering Definition**: cấu hình items, subtype, accepted orders; **không** là entity/bảng độc lập.
- **Ordering Item**: mảnh nội dung có `key` ổn định và text hiển thị.
- **Accepted Order**: một hoán vị đầy đủ của tập item keys được chấp nhận.
- **Presentation Order**: thứ tự được server trộn và đóng băng riêng cho Session Question.
- **Submitted Order**: thứ tự item keys học sinh nộp; có ý nghĩa theo **vị trí**, không phải tập hợp.
- **Guided Final**: chính Question gốc với type ORDERING; các Steps vẫn có type riêng được Guided v1 hỗ trợ.

### 3.2. Không thay đổi các mối quan hệ chính

```text
Unit → Section → Topic → Question Bank
                            └── Question(type=ORDERING)
                                  ├── prompt / hint / explanation / difficulty
                                  └── definition(JSON)
                                        ├── subtype
                                        ├── items[stableKey, content]
                                        └── acceptedOrders[ordered keys]

Activity(practiceType=CLASSIC | GUIDED_REASONING)
  └── Session → SessionQuestion(snapshot + presentation order)
                         ├── Attempts(submitted ordered keys)
                         └── Final correctness / XP outcome
```

**Không tạo** `OrderingActivity`, `OrderingAttempt`, `OrderingProgress`, `OrderingAnalytics` trong v1.

### 3.3. Định nghĩa JSON đề xuất

```json
{
  "schemaVersion": 1,
  "subtype": "PHRASE",
  "items": [
    { "key": "p1", "content": "Last Sunday," },
    { "key": "p2", "content": "we" },
    { "key": "p3", "content": "helped" },
    { "key": "p4", "content": "older people." }
  ],
  "acceptedOrders": [
    ["p1", "p2", "p3", "p4"]
  ]
}
```

- Thứ tự mặc định mà Teacher nhập chính là **accepted order đầu tiên**.
- Không có `shuffleItems`; server **luôn trộn**.
- Keys là định danh, không dựa vào thứ tự trong mảng `items`.
- `schemaVersion` phục vụ nâng cấp/đọc lịch sử; `graderVersion` có thể được gắn trong snapshot khi cần.
- Payload Student **không bao giờ** chứa `acceptedOrders` trước thời điểm được phép reveal.

### 3.4. Payload câu trả lời đề xuất

```json
{
  "order": ["p1", "p3", "p2", "p4"]
}
```

Đây là payload logic; cần ánh xạ vào format `RawAnswer`/API thực tế của từng runtime mà không thay đổi contract cũ vô cớ. Không dùng `Set`, không sắp xếp lại mảng trước khi chấm.

---

## 4. Scope và exclusions

| Trong scope v1 | Ngoài scope v1 |
|---|---|
| Ordering trong Question Bank: tạo/sửa/duplicate/preview/validate | Assignment Ordering, kể cả create/submit/review |
| Subtype `WORD`/`PHRASE`/`SENTENCE` | Tự động sinh câu bằng AI, LLM grading |
| Classic Question runtime | Ordering trong Guided Steps |
| Guided Reasoning **Final Question** runtime | Learning Method Ordering riêng |
| Shuffle bắt buộc, frozen per Session | Toggle Shuffle hoặc Teacher tự chọn initial shuffle |
| Server grading đúng thứ tự; feedback/retry/hint theo mode | Partial score ảnh hưởng XP, điểm theo mỗi item |
| Student Result, Review, History phục hồi theo snapshot | Dashboard / API Teacher Analytics riêng theo Ordering |
| Tương thích API/DB/question types cũ, Assignment fail-closed | CSV import Ordering (để phase sau) |

**Ranh giới quan trọng:** Việc chặn Ordering trong Assignment là **compatibility guard bắt buộc**, dù việc thêm khả năng sử dụng Ordering trong Assignment không nằm trong scope.

---

## 5. Workflow chi tiết

### 5.1. Teacher — tạo Ordering Question

1. Mở Question Bank → Add Question → chọn `ORDERING`.
2. Chọn subtype `WORD`, `PHRASE` hoặc `SENTENCE`.
3. Nhập prompt, difficulty, hint (tùy chọn), explanation.
4. Thêm từng item dưới dạng **từ/cụm/câu**; nhập theo **thứ tự đáp án đúng**, không ép Teacher tách câu bằng dấu cách tự động.
5. Có thể thêm `acceptedOrders` khác qua trình kéo/chuyển vị trí hoặc danh sách thứ tự.
6. Chọn **Preview Student** để xem item đã trộn, thử trả lời và xem feedback giả lập.
7. Save Draft / đánh giá Ready theo cơ chế Question hiện có.
8. Teacher chọn Question Bank có Ordering trong Activity Editor; Readiness phản ánh đúng nguồn Classic/Guided.
9. Khi cấu hình Guided, Teacher soạn Steps bằng các loại đang hỗ trợ, còn Ordering nằm ở **Final**.

**Không hiển thị** toggle `Shuffle`. UI phải mô tả rõ: “Các phần tử được tự động xáo trộn cho học sinh.”

### 5.2. Student — Classic

1. Server chọn Question từ Bank, snapshot definition, tạo thứ tự item đã trộn và lưu cùng Session Question.
2. Student thấy prompt và item theo **thứ tự đã trộn**; không thấy đáp án đúng.
3. Student chạm/click để thêm item, chèn/đổi vị trí item, undo/reset; có thể dùng bàn phím và thao tác touch.
4. Student chỉ được Submit khi đã sử dụng **đủ các item đúng một lần**.
5. Backend kiểm tra membership/permutation, chấm qua QuestionEngine; trả feedback theo policy Classic hiện có.
6. Learning retry (nếu còn) cho phép sắp xếp lại; Try-Hard timeout/lives (nếu được bật) kế thừa lifecycle cũ.
7. Result và Review hiển thị bản đã nộp, trạng thái đúng/sai và thứ tự mẫu khi đáp án được phép tiết lộ.

### 5.3. Student — Guided Final

1. Guided Steps chạy **như hiện tại**; loại Step không thay đổi.
2. Trước khi hoàn tất tất cả Steps, backend **không trả Final Ordering payload** (bao gồm items, đáp án) để tránh lộ Question sớm.
3. Sau Step cuối, mở Final với renderer `OrderingAnswer` dùng chung Classic.
4. Student sắp xếp, Submit Final; backend chấm theo snapshot, xử lý Final hint/retry và XP **như quy tắc Guided hiện có**.
5. Step attempts được review theo Guided; Final Ordering được review như Ordering Question, không mất thứ tự đã nộp.
6. XP chỉ dựa vào Final Question outcome, **không tính theo số item** và không tính riêng cho Steps.

### 5.4. Student UI theo subtype

| Subtype | Layout chính | UX tối thiểu |
|---|---|---|
| `WORD` | Chip nhỏ, xuống dòng tự nhiên | Tap to append; insert/reorder; undo/reset |
| `PHRASE` | Chip hoặc card ngắn | Giữ nguyên cụm; cho đổi vị trí không phải xóa cả câu |
| `SENTENCE` | Các card dạng danh sách dọc | Move up/down, drag optional; hỗ trợ đoạn dài/mobile |

**Yêu cầu chung:** một logic submission/grading; chỉ khác layout. Không auto-submit khi chọn hết item. Không tự động chuyển quá nhanh khiến học sinh không xem được feedback. Nút và focus phải đủ rõ ở desktop/mobile.

---

## 6. Functional Requirements

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| `SRS-ORD-001` | Hỗ trợ `QuestionType.ORDERING` trong enum, API types, FE spec | P0 |
| `SRS-ORD-002` | Dùng một definition typed/versioned cho WORD/PHRASE/SENTENCE | P0 |
| `SRS-ORD-003` | Teacher thêm/sửa/xóa/reorder item, hint, explanation, preview | P0 |
| `SRS-ORD-004` | Validate nonblank items, unique stable keys và accepted orders là hoán vị hoàn chỉnh | P0 |
| `SRS-ORD-005` | Teacher không có toggle/field Shuffle ở bất kỳ màn hình Ordering nào | P0 |
| `SRS-ORD-006` | Server shuffle bắt buộc và không cấp thứ tự đầu đã là accepted order | P0 |
| `SRS-ORD-007` | Presentation order ổn định trong cùng Session (reload/retry), thay đổi có thể xảy ra ở Session mới | P0 |
| `SRS-ORD-008` | Runtime Classic/Guided Final nhận danh sách item an toàn, không lộ accepted orders | P0 |
| `SRS-ORD-009` | Student sắp xếp bằng tap/click và reorder, dùng được trên mobile/bàn phím | P0 |
| `SRS-ORD-010` | Backend parse/validate ordered IDs; từ chối thiếu/trùng/thừa/ID lạ | P0 |
| `SRS-ORD-011` | Server grade binary theo accepted orders; xử lý mục trùng nội dung không bất công | P0 |
| `SRS-ORD-012` | Classic giữ trạng thái LEARNING/retry/hint/timeout/lives hiện hành | P0 |
| `SRS-ORD-013` | Guided chỉ hỗ trợ Ordering **Final**, không hỗ trợ Ordering Step | P0 |
| `SRS-ORD-014` | Guided Final chỉ xuất hiện sau tất cả Steps, chấm/XP theo Final | P0 |
| `SRS-ORD-015` | Assignment frontend không offer Ordering; backend từ chối attach/publish/submit Ordering | P0 |
| `SRS-ORD-016` | Persist immutable snapshot và ordered answers; edit Question không đổi Session cũ | P0 |
| `SRS-ORD-017` | Student Result / Review / History render đủ submitted order và correct order khi reveal hợp lệ | P0 |
| `SRS-ORD-018` | Không thay đổi quy tắc XP, Streak, Level, Completion Bonus, score denominator | P0 |
| `SRS-ORD-019` | Teacher Analytics không phát triển Ordering-specific endpoint/UI v1 | P0 scope |
| `SRS-ORD-020` | Question List, duplicate draft, type-change, import/export có fallback an toàn | P1 |

---

## 7. Chính sách kỹ thuật đề xuất

### 7.1. Readiness / validation

Một Ordering Question được READY nếu: có prompt, difficulty, số item hợp lệ; các item có key duy nhất và nội dung không rỗng; có ít nhất một accepted order; mỗi accepted order chứa **đúng và đủ** các item keys, không lặp; có ít nhất một hoán vị **không được chấp nhận** để shuffle có ý nghĩa.

- Không tự đoán các thứ tự đúng bằng AI/grammar parser.
- Teacher chịu trách nhiệm khai báo các biến thể hợp lệ khi nhiều cách sắp xếp đều đúng.
- Nếu hai item hiển thị giống nhau, backend không được coi việc đổi chỗ hai item không phân biệt được bằng mắt là lỗi; **phương án đề xuất**: so khớp tương đương theo nội dung hiển thị ở đúng vị trí hoặc reject authoring mơ hồ, phải chọn một quy tắc và test nhất quán trước release.
- Số lượng item 3–8 là **giới hạn đã được duyệt cho V1** (bao gồm subtype `SENTENCE`); giới hạn nội dung từng item sẽ được chi tiết hóa trong FRS.

### 7.2. Shuffle policy

- Server tạo một hoán vị ngẫu nhiên **không thuộc tập đáp án được chấp nhận, kể cả các hoán vị tương đương về nội dung hiển thị** (nếu policy duplicate-content được duyệt).
- Shuffle theo IDs, không biến đổi text, dấu câu, khoảng trắng có ý nghĩa.
- Lưu `presentationOrder` vào immutable Session Question snapshot hoặc payload phiên bản hóa tương đương.
- Giữ presentation order cố định khi retry hoặc chuyển câu trong Session đang hoạt động; Review đọc từ immutable snapshot lịch sử.
- **ADR 0012:** Activity chưa hoàn thành không resume. Refresh/rời runtime kết thúc lượt cũ theo leave/abandon policy, mở Activity lại tạo Session mới (random câu và presentationOrder mới); không khôi phục draft chưa nộp.
- Khi câu có không gian hoán vị quá nhỏ hoặc mọi hoán vị đều được chấp nhận, **không READY** thay vì vòng lặp shuffle vô hạn.
- Không ghi một field `shuffleItems`; hành vi này là **quy tắc hệ thống**.

### 7.3. Grading / scoring / XP

- Chỉ đúng toàn bộ order mới `correct = true`; không cộng XP cho từng item.
- `QuestionEngine` có thể trả `GradeResult` với một phần grade toàn câu; Activity tiếp tục quy đổi ra correctness theo policy đã chọn.
- Retry, hint, timeout, GAME_OVER, ABANDONED, Replay, Completion Bonus kế thừa hợp đồng hiện hành; không tạo rule Ordering riêng.
- Mọi lần nộp dùng cơ chế idempotency `requestId` và concurrency guard hiện có; refresh/rời runtime không tự submit draft hoặc tạo attempt mới. Khi mở lại Activity, start lượt mới theo ADR 0012.
- Partial score và các chỉ số đảo vị trí **không** tác động Activity Score/XP v1.

### 7.4. Answer reveal / bảo mật

- Authoring/Teacher có thể thấy đáp án; Student API chưa đến thời điểm reveal chỉ thấy prompt, items và draft của mình.
- Guided Step phase **không lộ Final Question** (không chỉ ẩn bằng CSS).
- Review của Session chưa resolved/abandoned phải tuân thủ điều kiện che đáp án hiện có.
- Server validate ID ownership theo snapshot; không chấm dựa vào dữ liệu đáp án client tự gửi.

---

## 8. Database, API và component impact

### 8.1. Database

| Bảng / dữ liệu | Thay đổi v1 | Ghi chú |
|---|---|---|
| `questions` | Dùng `type=ORDERING`, `definition` JSON text sẵn có | Không thêm bảng con |
| `question_options`, `question_answers` | Không ép items/orders vào cấu trúc choice/text answers | Ordering đọc từ typed definition |
| Question Bank mapping | Không thay quan hệ | Content eligibility có kiểm tra READY |
| `activity_session_questions` | Mở rộng snapshot payload/version để có item IDs, accepted orders, presentation order | Server-only phần đáp án |
| Final answer attempts | Lưu mảng key theo thứ tự | Không mất thứ tự JSON array |
| XP ledger / streak | Không đổi schema | Một Question = một outcome |
| Assignment attempts | Không hỗ trợ Ordering | Chặn attach và các luồng không tương thích |
| Ordering analytics tables | **Không tạo** | Teacher Analytics ngoài scope |

**Migration:** rà các CHECK constraint/type whitelist từng có ở migration question; tạo Flyway migration mới với version thực sự còn trống trên nhánh triển khai. Không ghi đè migration cũ.

### 8.2. Backend impact — điểm phải cập nhật đồng bộ

- `QuestionType` enum, `QuestionTypeHandlerRegistry` (**thêm enum mà thiếu Handler có thể làm registry khởi tạo thất bại**).
- Typed `OrderingSpec`, `OrderingAnswer`, `OrderingHandler` và `QuestionDefinitionRequest`/mapper/validator/persistence/response.
- `ActivityQuestionEligibilityService`/Readiness/selection: Classic nhận Ordering READY; Guided chỉ lấy Ordering có Guided Definition READY; Assignment không nhận.
- Snapshot assembler, Student public projection, final answer parsing/grading, feedback/retry, Review mapper.
- Guided Final compatibility guard: không đặt `ORDERING` vào danh sách Step types; chỉ bổ sung Final support.
- Kiểm tra `switch` exhaustiveness, legacy serialization, `questionTypeOptions` và các nơi assumption chỉ có 5/7 Question Types.

### 8.3. Frontend impact

- Teacher: `DraftQuestion`, `QuestionSpec` union, `QuestionForm`, `QuestionComposer`, draft factory/validator, duplicate, preview, type-change warning.
- Student: một `OrderingAnswer` có hai layout (chip cho WORD/PHRASE, card-list cho SENTENCE), dùng trong Classic và Guided Final qua renderer chung.
- `use-practice-controller`, draft answers, answer-format utils: **không stringify rồi split bằng dấu phẩy** nếu ảnh hưởng item IDs; gửi ordered array theo contract.
- Student Result/Review: render order thay vì văn bản đáp án đơn giản; không hiển thị `[object Object]` hoặc mất thứ tự khi format.
- Teacher Assignment Builder: lọc và chặn Ordering; hướng dẫn rõ “chỉ hỗ trợ trong Activity”.

---

## 9. Non-functional requirements

| ID | Yêu cầu |
|---|---|
| `NFR-ORD-01` | Responsive mobile/desktop; vùng chạm đủ lớn, wrap không gây overflow ngang |
| `NFR-ORD-02` | Hoàn thành thao tác bằng bàn phím; nút move left/right hoặc up/down, focus visible, không bắt drag-only |
| `NFR-ORD-03` | Tất cả feedback có text/icon; không truyền đạt đúng/sai chỉ bằng màu |
| `NFR-ORD-04` | Server authoritative: grade, shuffle, snapshot, retry và answer reveal ở backend |
| `NFR-ORD-05` | Không lộ answer key ở Student API, logs, serialized DTO; Guided Step gate an toàn |
| `NFR-ORD-06` | Payload size, item length và count có giới hạn vận hành; validator trả message xác định |
| `NFR-ORD-07` | Idempotency và transactional safety cho duplicate submit / concurrent retry |
| `NFR-ORD-08` | Backward compatibility với 7 Question Types cũ, Classic/Guided/Assignment đang chạy và old snapshots |
| `NFR-ORD-09` | Teacher Preview mô phỏng đúng shuffle và UI subtype trên desktop/mobile |
| `NFR-ORD-10` | Tách UI Teacher mặc định khỏi theme Student Indie Scrapbook, không làm ảnh hưởng global styling |

---

## 10. Edge cases và hành vi mong đợi

| Case | Expected behavior |
|---|---|
| Item keys trùng / rỗng | Reject READY |
| Item content rỗng | Reject READY |
| Hai item có nội dung hiển thị giống hệt nhau | Không chấm bất công vì key khác; áp dụng policy tương đương được chốt |
| Student thiếu một item | Không Submit từ UI; backend reject |
| Student gửi item key hai lần | Backend reject |
| Student gửi item lạ / ID không thuộc snapshot | Backend reject |
| `acceptedOrders` không phải full permutation | Reject READY |
| `acceptedOrders` chứa các thứ tự trùng | Normalize hoặc reject có thông báo |
| Teacher thay một item sau khi lưu | Revalidate accepted orders và READY status |
| Shuffle trúng accepted order hoặc order tương đương khi text lặp | Resample / thuật toán chọn thứ tự không được chấp nhận |
| Tất cả permutations đều accepted | Reject READY vì không thể trộn thành đề chưa giải |
| Refresh/rời Activity đang làm | Không resume; lượt cũ không tính kết quả/XP, mở lại tạo Session mới với câu và presentationOrder được chọn/trộn lại theo ADR 0012 |
| Retry sau lần sai | Không cấp thêm XP; giữ lịch sử attempts và thứ tự đầu của Session |
| Guided chưa xong Steps | Không trả Final Ordering payload |
| Guided Final đã xong | Reveal theo rule hiện hành, review chính xác thứ tự |
| Assignment có request đính kèm Ordering | Backend reject với lỗi rõ; UI không offer |
| Teacher sửa Question khi Student đang làm | Chấm bằng Session snapshot cũ |
| Answer chứa Unicode/dấu câu/line breaks | Không làm đổi keys và vị trí; render an toàn |
| TRY_HARD timeout giữa thao tác | Chính sách timeout cũ áp dụng, không tạo answer tự động từ draft chưa gửi |

---

## 11. Regression và acceptance criteria

### 11.1. Bộ test nghiệp vụ bắt buộc

| ID | Tình huống | Tiêu chí đạt |
|---|---|---|
| `AC-01` | Teacher tạo Ordering WORD/PHRASE/SENTENCE | Save → reload → edit → preview không mất item/order |
| `AC-02` | Teacher dùng nhiều accepted orders | Mọi order được khai báo đều grade đúng; order khác grade sai |
| `AC-03` | Teacher vào Ordering Editor | **Không** có field Shuffle ở UI/API definition |
| `AC-04` | Student bắt đầu Session | Item được trộn, không trùng bất kỳ accepted order |
| `AC-05` | Retry/chuyển câu trong Session; refresh/rời Activity | Retry/chuyển câu giữ order khi Session còn hiệu lực; refresh/rời không resume, mở lại tạo Session mới và shuffle mới theo ADR 0012 |
| `AC-06` | Classic Learning: sai → retry → đúng | Attempt, feedback và XP outcome đúng quy tắc cũ |
| `AC-07` | Classic TRY_HARD: hết hạn | Timeout/lives/XP giữ hành vi cũ, không phá navigation |
| `AC-08` | Guided Final Ordering | Guided Steps xong mới lộ Final; Final grade/retry/review thành công |
| `AC-09` | Guided Steps | Không xuất hiện ORDERING trong Step Type dropdown/API capability |
| `AC-10` | Teacher gắn Ordering vào Assignment | UI không cho; backend trả lỗi an toàn |
| `AC-11` | Student gửi thiếu/trùng/item lạ | Backend từ chối; không sai lệch attempts/XP |
| `AC-12` | Teacher sửa sau khi Session được tạo | Old Session và Review không thay đổi |
| `AC-13` | Student Review / History | Xem đúng order đã nộp, accepted order khi reveal hợp lệ |
| `AC-14` | Mobile/keyboard-only | Hoàn thành được WORD/PHRASE/SENTENCE không cần drag-and-drop |
| `AC-15` | Legacy question types | Classic, Guided, Assignment, XP/Streak không hồi quy |
| `AC-16` | XP settlement trùng request | Không tăng attempt/XP hai lần |

### 11.2. Go-live criteria

Ordering chỉ Ready để release khi:

1. Teacher có thể author/preview **cả 3 subtype**, shuffle luôn bật và không có option cấu hình.
2. Classic và Guided Final dùng chung Ordering grading/server snapshot.
3. Guided Steps không bị thay đổi và Final không bị lộ sớm.
4. Assignment không nhận Ordering ở cả UI và API.
5. Student Result/Review đọc được lịch sử chính xác; XP/score không bị cộng trùng.
6. Regression suite với Question Types cũ, Student mobile và keyboard đạt yêu cầu.

---

## 12. Kế hoạch triển khai đề xuất

| Milestone | Nội dung | Đầu ra |
|---|---|---|
| **M1 — Question foundation + compatibility guard** | Enum, typed definition, Handler, mapper, validator, DB constraint, Teacher Editor/Preview; Assignment fail-closed từ UI + backend | Ordering authoring hoạt động, Assignment không nhận ORDERING |
| **M2 — Classic runtime** | Bật eligibility ORDERING riêng cho CLASSIC; snapshot+shuffle, public DTO, Student UI, grading/feedback; Guided vẫn chặn ORDERING cho tới M3 | Classic Ordering hoàn chỉnh; Guided không chọn Ordering sớm |
| **M3 — Guided Final** | Final readiness, Guided UI/server gate, submit/feedback/retry, review | Ordering làm Guided Final |
| **M4 — Compatibility & QA** | Regression Assignment guard đã làm tại M1, Student Review/History, snapshot v2/v3 + XP regression, mobile/a11y | Release candidate |

**Không bao gồm** Teacher Analytics mới, Assignment Ordering, Guided Ordering Steps, CSV import Ordering hoặc thuật toán đánh giá ngữ pháp tự động.

---

## 13. Rủi ro chính và kiểm soát

| Rủi ro | Kiểm soát |
|---|---|
| Thêm enum làm `QuestionTypeHandlerRegistry` thiếu Handler | Thay đổi enum+Handler+Mapper+validator đồng bộ, test bootstrap |
| Thứ tự khác nhưng vẫn đúng ngữ pháp bị chấm sai | `acceptedOrders`, Teacher Preview, quy tắc equivalent duplicates |
| Shuffle hiển thị luôn đáp án | Kiểm tra accepted permutations, freeze presentation order |
| Ordering vào Assignment nhưng không có renderer | Chặn cả UI và backend; regression với Assignment hiện có |
| Guided lộ Final trước khi xong Steps | Sanitize DTO phía server, test gate bằng API độc lập FE |
| XP bị tính theo item hoặc hai lần | Một Question/outcome, idempotency, test replay/retry/timeout |
| Chèn/sửa item khó dùng trên điện thoại | Tap-to-place, controls reorder, keyboard & touch QA |
| Old snapshot lỗi sau migration | Schema version, không chấm old Session bằng live Question definition |
| Phình scope thành Analytics / Assignment | Giữ exclusions rõ trong SRS và change control |

---

## 14. Quyết định đã được Product Owner phê duyệt

> **PO approved ngày 16/11/2026:** Các phương án mặc định dưới đây được chấp nhận làm chính sách Ordering V1. Phần FRS sẽ cụ thể hóa cách thực thi và các giới hạn kỹ thuật.

| ID | Chính sách đã duyệt | Giá trị V1 |
|---|---|---|
| `OPEN-01` | Có hỗ trợ nhiều accepted orders ngay v1? | **Có** |
| `OPEN-02` | Có chấm binary không? | **Có**, không partial XP |
| `OPEN-03` | Giới hạn item 3–8 có phù hợp cả `SENTENCE` không? | **3–8**; giới hạn text theo subtype |
| `OPEN-04` | Classic TRY_HARD có hỗ trợ ngay v1 không? | **Có**, sau khi timeout UI đã pass |
| `OPEN-05` | Hai item có text giống nhau: chấp nhận và chấm tương đương hay yêu cầu Teacher phân biệt? | **Chấm tương đương**, không phạt swap vô hình |
| `OPEN-06` | Guided Final có dùng hint/retry hiện hành hoàn toàn không? | **Có**, không tạo chính sách riêng |

---

## 15. Source audit & change control

Đã đối chiếu tại branch `feature/guided-reasoning-v1`, commit `88f8f87`:

- `server/src/main/java/e_learning/server/question/enums/QuestionType.java`
- `server/src/main/java/e_learning/server/question/entity/Question.java`
- `server/src/main/java/e_learning/server/question/engine/core/QuestionTypeHandlerRegistry.java`
- `server/src/main/java/e_learning/server/question/engine/core/QuestionEngine.java`
- `server/src/main/java/e_learning/server/question/engine/result/GradeResult.java`
- `server/src/main/java/e_learning/server/question/service/QuestionSpecMapper.java`
- `server/src/main/java/e_learning/server/activity/service/ActivityQuestionEligibilityService.java`
- `server/src/main/java/e_learning/server/activitysession/entity/ActivitySessionQuestion.java`
- `server/src/main/java/e_learning/server/activitysession/entity/ActivityQuestionSnapshot.java`
- `server/src/main/java/e_learning/server/activitysession/dto/response/ActivitySessionReviewResponse.java`
- `client-e-learning/src/types/question.ts`
- `client-e-learning/src/components/features/teacher/question-authoring/QuestionComposer.tsx`
- `client-e-learning/src/components/features/teacher/question-authoring/GuidedDraftEditor.tsx`
- `client-e-learning/src/components/features/student/activities/runtime/guided-stage.tsx`
- `client-e-learning/src/components/features/student/activities/runtime/shell/practice-workspace.tsx`
- `client-e-learning/src/components/features/student/activities/runtime/question-stage/answer-controls.tsx`
- `docs/guided-reasoning/02_SRS_Guided_Reasoning_v1.md`

**Change control:** Nếu sau này bổ sung Ordering cho Assignment, Guided Steps, Teacher Analytics, partial scoring, adaptive sequencing hoặc auto-correction bằng AI, tạo change request/FRS tương ứng; không diễn giải chúng là phạm vi Ordering v1.

---

**Trạng thái cuối:** Quyết định nghiệp vụ đã duyệt; đang review prototype UI trước khi viết FRS. **Chưa có thay đổi repository**.