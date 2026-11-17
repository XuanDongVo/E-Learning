# 03 — FRS: Ordering Question Type v1

**Functional Requirements Specification — E-Learning**  
**Phiên bản:** 1.0 — 17/11/2026  
**Trạng thái:** **FRS FOR IMPLEMENTATION — chưa triển khai code**  
**Repository:** `XuanDongVo/E-Learning`  
**Baseline được đối chiếu:** `feature/guided-reasoning-v1` @ `88f8f87878661aa575c2f9dee4e66e7f62cd3810`  
**SRS nguồn:** [02_SRS_Ordering_v1.md](02_SRS_Ordering_v1.md) — v1.1, các quyết định `DEC-ORD-01..14` đã duyệt  
**UI source:** `ordering_ui_prototype_v1.html` — prototype độc lập đã review, chưa đưa lên repository hoặc kết nối backend  
**Tham chiếu quy trình:** `docs/guided-reasoning/03_FRS_Guided_Reasoning_v1.md`

> **Chú giải:** **APPROVED** = quy tắc đã chốt trong SRS; **EXISTING** = quan sát từ baseline; **FRS DESIGN** = chi tiết đề xuất để implement, chưa phải API/DB đang có. Tài liệu này **không xác nhận tính năng đã được triển khai**. Nếu FRS DESIGN thay đổi chính sách đã duyệt, SRS có quyền ưu tiên.

---

## 1. Mục tiêu, phạm vi, ranh giới

### 1.1. Mục tiêu

Bổ sung `QuestionType.ORDERING` để Student sắp xếp từ/cụm từ/câu theo thứ tự hợp lệ. Ordering được lưu trong **Question Bank** như một `Question`, dùng trong:

- **Classic Activity:** LEARNING và TRY_HARD theo vòng đời hiện hành; với Activity `BOTH`, tuân theo mode được Student chọn.
- **Guided Reasoning:** chỉ làm **Final Question**, được mở sau khi tất cả Guided Steps đã giải quyết.

Không bổ sung `ActivityPracticeType`, không tạo XP từng item, không xây công cụ Teacher Analytics mới.

### 1.2. Scope matrix — bắt buộc ở cả backend lẫn frontend

| Địa điểm sử dụng | Có trong V1? | Hành vi |
|---|---:|---|
| Question Bank CRUD/Preview | Có | `ORDERING` với ba subtype |
| Classic LEARNING | Có | Sắp xếp, nộp, feedback, retry/hint theo policy cũ |
| Classic TRY_HARD | Có | Sắp xếp, thời gian/lives theo policy cũ |
| Guided Reasoning **Final** | Có | Guided Steps trước → Ordering Final |
| Guided Reasoning **Step** | **Không** | Không có trong capabilities/step-type dropdown; server từ chối |
| Assignment/Assessment | **Không** | UI lọc, backend fail-closed từ thêm câu đến nộp/chấm |
| Teacher Analytics Ordering-specific | **Không** | Không tạo dashboard, endpoint hay bảng mới |
| CSV Import Ordering | **Không** | Không nhận CSV như thể đó là Ordering hoàn chỉnh |
| Standalone Ordering Activity Method | **Không** | Vẫn dùng `CLASSIC` hoặc `GUIDED_REASONING` |

### 1.3. Type matrix

| Question Type | Classic Final | Guided Final | Guided Step | Assignment |
|---|---:|---:|---:|---:|
| Các type cũ được Classic hỗ trợ | Giữ nguyên | Giữ nguyên theo Guided capabilities | Chỉ các Step type hiện có | Giữ nguyên |
| **ORDERING** | **Có** | **Có** | **Không** | **Không** |

**Không suy ra rằng Matching/Cloze tự nhiên được mở trong Activity** chỉ vì Ordering được hỗ trợ.

### 1.4. Quyết định đã phê duyệt

| Tham chiếu | Chính sách Ordering V1 |
|---|---|
| DEC-ORD-01..03 | Một Question Type mới; Classic và Guided Final |
| DEC-ORD-04..05 | Không Guided Step, không Assignment |
| DEC-ORD-06 | `WORD`, `PHRASE`, `SENTENCE` |
| DEC-ORD-07 | **Shuffle bắt buộc**, không field/toggle cấu hình |
| DEC-ORD-08 | Không Teacher Analytics riêng |
| DEC-ORD-09 | **Binary grading** toàn bộ thứ tự; một Question XP outcome |
| DEC-ORD-10 | Nhiều `acceptedOrders` |
| DEC-ORD-11 | **3–8 items** cho mỗi Question trong V1 |
| DEC-ORD-12 | Classic TRY_HARD trong phạm vi; phải test timeout UI |
| DEC-ORD-13 | Freeze thứ tự hiển thị trong Session còn hiệu lực (retry/chuyển câu); refresh/rời runtime không resume theo ADR 0012 |
| DEC-ORD-14 | Hai item có text giống hệt nhau không bị chấm sai vì đổi ID vô hình |

---

## 2. Actor, authorization và use cases

| Actor | Use case hợp lệ | Bảo vệ bắt buộc |
|---|---|---|
| Teacher sở hữu nội dung | Tạo/sửa/duplicate/preview Ordering; gắn Guided Definition; cấu hình Activity | Kiểm tra quyền Question/Bank hiện có; không bypass READY |
| Student | Start lượt mới, chọn/sắp xếp/nộp, hint/retry trong lượt còn hiệu lực, xem result/review | Activity không resume khi rời/refresh (ADR 0012); Session thuộc principal JWT, server chấm |
| Backend | Normalize/validate definition, chọn, shuffle, snapshot, grade, quyết toán XP | Không tin key/correctness/difficulty/accepted orders do Student gửi |
| Assignment author/runtime | Không thể dùng Ordering | Guard cả API và UI, không chỉ ẩn lựa chọn |

**Use cases chính:** `UC-ORD-01` Teacher authoring; `UC-ORD-02` Teacher Guided Final/Activity readiness; `UC-ORD-03` Classic runtime; `UC-ORD-04` Guided Final runtime; `UC-ORD-05` feedback/retry/hint/timeout; `UC-ORD-06` Result/Review; `UC-ORD-07` compatibility/Assignment protection.

---

## 3. Data model và canonical Question Definition

### FRS-ORD-001 — Entity boundary

`questions.type = ORDERING`; sử dụng `questions.definition` hiện có. Không tạo `ordering_questions`, `ordering_items` hoặc `ordering_attempts` mới. Mapping vào Question Bank, content revision, difficulty, hint, explanation, media theo cơ chế hiện tại.

### FRS-ORD-002 — Type schema

**Logical definition V1** (định dạng JSON cuối cùng phải được map đúng `QuestionDefinitionRequest` hiện hành):

```json
{
  "schemaVersion": 1,
  "subtype": "PHRASE",
  "items": [
    {"key": "p1", "content": "Last Sunday,"},
    {"key": "p2", "content": "we"},
    {"key": "p3", "content": "helped"},
    {"key": "p4", "content": "older people."}
  ],
  "acceptedOrders": [
    ["p1", "p2", "p3", "p4"]
  ]
}
```

| Field | Type | Yêu cầu |
|---|---|---|
| `schemaVersion` | integer | `1` cho definition V1; reject version chưa hỗ trợ |
| `subtype` | enum | `WORD` / `PHRASE` / `SENTENCE` |
| `items` | array | **3–8** item; thứ tự nhập là accepted order đầu tiên |
| `items[].key` | string | Không rỗng; duy nhất trong Question; ổn định qua reorder/edit |
| `items[].content` | string | Không rỗng sau trim; escaped khi render; giữ dấu câu |
| `acceptedOrders` | array of array | >= 1; mỗi entry hoán vị hoàn chỉnh của toàn bộ key, không thiếu/trùng/thừa |

**Không có** `shuffleItems`, `shuffleEnabled`, `allowShuffle` ở JSON, API hay UI. Server shuffle là hành vi mặc định không thể tắt ở V1.

**Giới hạn kỹ thuật gợi ý cho Editor (FRS DESIGN, cần kiểm tra UX):** `WORD` ≤ 60 ký tự/item, `PHRASE` ≤ 180, `SENTENCE` ≤ 400. Giới hạn prompt/hint/explanation giữ theo request validation hiện tại; kiểm tra thêm max request size. Không tự cắt câu theo dấu cách/dấu chấm.

### FRS-ORD-003 — Canonicalization và duplicate display text

- Khi lưu, chuẩn hóa item `content` về Unicode NFC, loại khoảng trắng đầu/cuối và thống nhất xuống dòng tương ứng renderer; **không** tự bỏ dấu câu, đổi hoa/thường hoặc dịch nội dung.
- Mỗi item vẫn có **key riêng**, kể cả khi `content` giống nhau.
- Với grading, một submitted order đúng nếu **chuỗi `content` canonical theo vị trí** bằng chuỗi của **ít nhất một accepted order**. So sánh key theo vị trí vẫn dùng để lưu trace; **hoán đổi hai item hoàn toàn giống nhau không bị trừ điểm**.
- Ví dụ accepted IDs `[w1, w2, w3]`, `w1.content == w2.content`: `[w2, w1, w3]` phải được chấp nhận tương đương.
- Đối với chuỗi có khác biệt thực sự về chữ hoa/dấu câu, không áp dụng suy luận ngữ pháp tự động. Editor giúp Teacher khai báo accepted order khác.

### FRS-ORD-004 — Save/READY validation

Khi Save Draft, hệ thống có thể giữ incomplete state theo convention hiện có. Để Question **complete/eligible/READY**, yêu cầu:

1. Type/subtype hợp lệ, prompt và difficulty hợp lệ.
2. Có 3–8 items; key unique; content nonblank và đúng giới hạn kỹ thuật.
3. Có ít nhất một accepted order; mỗi accepted order chứa đúng cùng một tập key, mỗi key đúng một lần.
4. Duplicate accepted orders theo **chuỗi content hiển thị** phải được gộp/cảnh báo; không hiển thị giả tạo là hai đáp án khác nhau nếu học sinh không phân biệt được.
5. Tồn tại **ít nhất một hoán vị có thứ tự hiển thị khác mọi accepted order**, để shuffle không sắp sẵn đáp án.
6. Mọi thay đổi item/key/order làm definition revalidate; sửa Question đang có Guided READY áp dụng revision/stale policy Guided hiện hành.

Validation trả field path chính xác, ví dụ `definition.ordering.items[2].content`, `definition.ordering.acceptedOrders[1]` (đường dẫn phải khớp schema thực tế). **Không tự đánh giá đúng/sai ngữ pháp hoặc mạch lạc đoạn văn**.

### FRS-ORD-005 — Answer shape

Logical Student submission:

```json
{"order": ["p1", "p3", "p2", "p4"]}
```

Mảng **giữ nguyên thứ tự**, không convert sang `Set`, sort, CSV string hoặc hash đảo thứ tự. Dạng wire thực tế có thể bao ngoài bằng request `answer`, `requestId` của Final submit endpoint sẵn có (xem §8). Không dùng nội dung câu thay thế key; UI render từ public items snapshot.

---

## 4. UC-ORD-01 — Teacher Ordering Authoring và UI

### FRS-ORD-010 — Navigation và bố cục

Luồng: **Question Bank → Add Question / Edit Question → Type `ORDERING`**. Giữ layout Teacher mặc định (form rõ, border/focus rõ), **không áp dụng CSS Student scrapbook** vào trang Teacher.

Editor có các vùng:

| Vùng | Control | Hành vi |
|---|---|---|
| Header | Breadcrumb/back, Question Type, Difficulty, Save, Preview | Không mất draft khi đổi tab hoặc subtype |
| Main Question | Prompt, subtype selector | Không hiện controls Choice/TrueFalse/TextAnswer cũ |
| Ordered Items | Danh sách nhập đúng thứ tự | Add/Remove/Move Up/Down, drag optional, stable keys |
| Alternate accepted orders | Danh sách thứ tự thay thế | Tạo từ bản sao, đổi thứ tự, validate toàn bộ keys |
| Help | Hint (optional), Explanation | Reuse convention cũ |
| Info | “Hệ thống tự trộn khi học sinh làm” | Thông báo tĩnh, **không có toggle** |
| Preview | Student-like interaction | Trộn item; test correct/wrong, subtype và responsive |

### FRS-ORD-011 — Item editing

- Teacher nhập các items theo **thứ tự đáp án chuẩn**; đó là `acceptedOrders[0]`.
- `Add item` thêm sau item hiện tại/cuối danh sách; Remove hiển thị xác nhận nếu thao tác làm mất accepted alternative; Undo local nếu phù hợp.
- `Move Up/Down` là phương thức chính bảo đảm keyboard; drag-drop chỉ tùy chọn. Sau reorder mặc định, cập nhật `acceptedOrders[0]` theo key mới; các alternative orders được giữ nguyên về key nếu còn đủ keys.
- Nếu thêm/xóa một item, **không tự sửa các alternative accepted orders và coi chúng hợp lệ**. Hiển thị `Needs review` cho các order bị ảnh hưởng; Teacher chỉnh lại trước khi Ready.
- Không split tự động theo khoảng trắng: các cụm từ như `would like to`, `look after` phải được giữ nguyên do Teacher quyết định.

### FRS-ORD-012 — Duplicate, type-change, edit đã lưu

- Duplicating Question sao chép items và accepted orders cùng semantic mapping; có thể regenerate item keys nội bộ và remap accepted orders đồng bộ, không trỏ nhầm Question cũ.
- Type change **từ/về ORDERING** phải hiện confirm cảnh báo mất definition cũ theo editor hiện hành; không silently drop draft.
- Teacher mở lại Question đã lưu thấy đầy đủ subtype/items/accepted orders/hint/explanation; update tăng content revision theo convention.
- Existing Guided Definition có revision guard: nếu Final Question thay đổi, Guided READY phải được revalidate trước khi được chọn vào Session mới.
- Question List và Preview không render `[object Object]`; label thể hiện subtype và số items.

### FRS-ORD-013 — Teacher Preview rules

- Preview sử dụng **renderer Student chung** nhưng thực hiện grading local giả lập; không tạo Session thật/XP/attempt.
- Teacher có thể chuyển WORD/PHRASE/SENTENCE, xem correct/wrong/feedback và mobile viewport.
- Preview phải mô phỏng shuffle **không trúng accepted order kể cả hoán đổi key trùng nội dung**, có nút làm mới đề.
- Preview Teacher có thể xem key/expected order, nhưng Student production API không được reuse payload Teacher.

### FRS-ORD-014 — Authoring acceptance samples

**WORD:** `My / brother / plays / football / after / school.` → `My brother plays football after school.`  
**PHRASE:** `Last Saturday, / our class / cleaned / the park.` → `Last Saturday, our class cleaned the park.`  
**SENTENCE:** `Last Sunday, ...` → `First, ...` → `Then, ...` → `Finally, ...`.

Các ví dụ chỉ là bài Teacher tự biên soạn theo chương trình THCS; hệ thống không giả định tất cả thứ tự khác đều sai về ngữ pháp nếu Teacher chưa khai báo.

---

## 5. UC-ORD-02 — Activity readiness và Guided Final authoring

### FRS-ORD-020 — Classic eligible

Một Ordering Question eligible cho Classic khi `question.complete == true`, typed Ordering Definition valid, thuộc Question Bank được phép chọn, phù hợp difficulty và các quy tắc Activity source hiện hành. Readiness, source count, preview selection và runtime selection dùng **cùng một eligibility predicate**.

### FRS-ORD-021 — Guided Final eligible

Một Ordering Question eligible cho `GUIDED_REASONING` khi đồng thời:

- Final Ordering Question complete/valid.
- Có Guided Definition **READY** với `sourceQuestionRevision` hiện hành.
- Guided Steps chỉ gồm những loại đã được Guided capabilities hỗ trợ (`SINGLE_CHOICE`, `TRUE_FALSE`, `TYPE_ANSWER` theo baseline); không có `ORDERING` Step.
- Activity Guided đáp ứng mode/selection policy hiện tại (`LEARNING` + `RANDOM`).

**UI:** `GuidedDraftEditor` không chặn `ORDERING` như `MATCHING/CLOZE`; vẫn giữ Step dropdown không có Ordering. Teacher Preview phải chạy **Steps trước → Ordering Final sau**, không show Final trước gate.

### FRS-ORD-022 — Source mismatch / not-ready

- Nếu Bank thiếu đủ Ordering READY/eligible theo allocation, Activity readiness trả lỗi rõ; start mới bị từ chối.
- Không fallback từ Guided sang Classic hoặc đổi Question Type không thông báo.
- Session đang chạy vẫn dùng snapshots cũ khi Teacher sửa/disable Question.

---

## 6. UC-ORD-03 — Session start, shuffle và immutable snapshot

### FRS-ORD-030 — Snapshot

Khi start Session, backend select Question bằng logic bank allocation hiện có. Với Ordering:

- Lưu immutable snapshot của **subtype, item keys/text, acceptedOrders, canonicalization/grading version, difficulty, prompt, hint, explanation**.
- Sinh `presentationOrder` đã trộn và lưu **cùng snapshot/session question** trước khi phục vụ Student.
- `presentationOrder` không bị tái tạo ở các thao tác GET/trả lời/retry/chuyển câu trong **cùng Session còn hiệu lực**; ở New Session/replay chọn/trộn lại. GET Review lịch sử đọc snapshot mà không resume.
- Student public DTO chỉ nhận `items` theo `presentationOrder` hoặc danh sách key order đó, **không nhận** acceptedOrders/secret correctness.

**Versioning:** Baseline có Question Snapshot schema v2 và XP guard strict version. FRS DESIGN khuyến nghị **schema v3 riêng cho Ordering** (hoặc extension tương đương được version hóa) và cập nhật XP eligibility để cho phép snapshot compatible v2/v3 **theo kiểm tra rõ từng version**, không dùng `schemaVersion >= 2` vô điều kiện. Không rewrite snapshots cũ.

### FRS-ORD-031 — Shuffle algorithm

1. Server tạo hoán vị items bằng thuật toán trộn chuẩn; xét chuỗi content canonical hiển thị.
2. Nếu thứ tự trộn tương đương một `acceptedOrder`, chọn/trộn lại **bằng cơ chế có giới hạn**, không vòng lặp vô hạn.
3. Nếu hoán vị được chấp nhận về mặt hiển thị chiếm toàn bộ không gian, **Question không READY** và không thể được phục vụ.
4. Giữ nguyên key→content, media, dấu câu trong mọi thao tác.
5. Bounded retry + deterministic fallback hoặc candidate pool được tính trước để bảo đảm termination; không yêu cầu lưu `shuffleEnabled`.

**Đặc biệt:** Với items trùng text, phải so theo nội dung hiển thị thay vì chỉ `key` để tránh một đề nhìn như đáp án đúng ngay từ đầu.

### FRS-ORD-032 — Public session projection

Ví dụ **sau khi Final được phép xuất hiện**:

```json
{
  "type": "ORDERING",
  "content": "Sắp xếp các cụm từ thành câu hoàn chỉnh.",
  "ordering": {
    "subtype": "PHRASE",
    "items": [
      {"key": "p3", "content": "helped"},
      {"key": "p1", "content": "Last Sunday,"},
      {"key": "p4", "content": "older people."},
      {"key": "p2", "content": "we"}
    ]
  }
}
```

Đây là fragment logic mới, **không phải khẳng định DTO trong repo đã có property `ordering`**. Không gửi `acceptedOrders`, không gửi `correct` trên từng item. Khi Guided đang STEP_ACTIVE/STEP_RETRY, không gửi **Final prompt, Ordering items, hint hoặc explanation** ở bất kỳ field lồng nào.

### FRS-ORD-033 — Refresh/leave: no resume (ADR 0012)

- **Activity chưa hoàn thành không được resume.** Khi Student refresh/rời runtime, lượt cũ bị abandon theo leave lifecycle hiện hành; nếu mở lại Activity, start **Session mới** với lựa chọn câu và Ordering shuffle mới.
- Không khôi phục client draft chưa nộp, attempts, hintUsed, retryAvailable hay Guided gate từ lượt cũ vào lượt mới.
- Trong **một Session còn hiệu lực** (retry hoặc điều hướng giữa các câu trong Classic Learning), backend giữ nguyên `presentationOrder` đã snapshot. GET Review lịch sử chỉ đọc dữ liệu đã lưu, không làm Session hoạt động lại.
- Không tự submit khi mount/unmount/refresh. ABANDONED không cấp XP/streak hoặc tính kết quả theo ADR 0012. Cần xử lý mất kết nối/unload theo lifecycle hiện có và không phát triển recovery riêng cho Ordering.

---

## 7. UC-ORD-04 — Student UI: interaction specification

### FRS-ORD-040 — Component ownership

Dùng **một `OrderingAnswer`** dùng chung Classic Question renderer và Guided Final Question renderer. Component nhận public sanitized `ordering` data, `draftOrder: string[]`, `disabled`, callbacks `onChange`, hint/feedback/retry props do runner quyết định. Không tự gọi API grade bên trong component. Guided Steps tiếp tục dùng component/answer types hiện tại.

### FRS-ORD-041 — UI theo subtype

| Subtype | Layout | Thao tác chính | Mobile |
|---|---|---|---|
| `WORD` | Chip vừa, tự wrap | Tap chip để thêm; reorder/insert; tap để trả lại | Không cuộn ngang, touch target rộng |
| `PHRASE` | Chip/card ngắn | Tap to place, chèn giữa, reorder | Cụm dài wrap đúng, không cắt mất chữ |
| `SENTENCE` | Dọc mỗi card một câu | Move Up/Down là mặc định, drag optional | Chiều rộng full, text dài tự xuống dòng |

UI phải hiển thị được câu/cụm có dấu câu, Unicode, dấu nháy, chữ giống nhau, và 3–8 items. Không ép Student kéo thả để hoàn thành.

### FRS-ORD-042 — States và controls

| State | UI bắt buộc | Submission |
|---|---|---|
| INITIAL | Prompt, shuffled pool, vùng đáp án trống, tiến độ `0/N` | Disable |
| PARTIAL | Các chip đã chọn + còn lại, Undo/Reset, reorder | Disable |
| COMPLETE_DRAFT | Đã đặt đủ N items, cho reorder và Submit | Enable |
| SUBMITTING | Disable submit/actions gây duplicate, loading rõ | Chỉ một requestId |
| CORRECT_FEEDBACK | Giữ submitted order; hiển thị đúng bằng text/icon | Không tự chuyển tức thì |
| WRONG_RETRY | Giữ submitted order và feedback; cho Student bấm retry/tiếp tục theo policy | Không lộ acceptedOrders khi còn retry |
| RESOLVED | Lock input; hiện correct order nếu được reveal | No re-submit |
| TIMED_OUT | Lock; áp dụng feedback/result theo Try-Hard policy | Không submit draft chưa nộp |
| ERROR_NETWORK | Giữ draft và thứ tự; cho retry **HTTP request với cùng requestId** | Không coi là lượt retry nghiệp vụ |

### FRS-ORD-043 — UX cụ thể

- Tap/click item trong pool → append vào vùng đáp án. Tap item đã chọn → trả về pool. Chọn đủ N **không auto-submit**.
- Trong vùng đáp án luôn có nút/gesture **Move Left/Right** cho WORD/PHRASE và **Move Up/Down** cho SENTENCE; hỗ trợ keyboard focus/Enter/Space. Có Undo last action và Reset với phản hồi rõ.
- Khi muốn chèn giữa, Student có thể move item hoặc dùng insertion affordance; **không buộc xóa chuỗi phía sau rồi chọn lại**.
- Nếu drag-and-drop được thêm, phải có fallback hoàn chỉnh cho tap và keyboard; không dùng drag-only.
- Submit button đủ lớn, nhãn rõ. Giữ feedback hiển thị đủ lâu, ưu tiên Student chủ động “Tiếp tục” / “Thử lại”; không tự skip khiến mất cơ hội đọc đúng/sai.
- Hạn chế thao tác chuột: sau retry, focus đưa về vùng tương tác; khi input full, focus về nút submit hoặc thông báo; hỗ trợ phím nếu không xung đột WCAG.

### FRS-ORD-044 — Visual Design Rules

**Student-only:** giữ hướng **Indie Illustrated Scrapbook / Hand-Drawn + Hipness Purgatory** theo theme đã có; background giấy nhẹ, đường viền `border-ink`, đổ bóng `shadow-pop`, heading có nét thủ công nhưng body **Plus Jakarta Sans** dễ đọc. Không ép trang Teacher dùng Student tokens. Ưu tiên khả năng đọc và điều khiển hơn hiệu ứng.

- Base body theo theme hiện tại xấp xỉ 14px; text item trên mobile không thu nhỏ quá mức.
- Focus ring/contrast rõ; button disabled khác active bằng hơn một dấu hiệu; không dựa chỉ màu sắc để báo đúng/sai.
- Chip không overflow container; card `SENTENCE` dùng column dọc với gaps dễ chạm; hỗ trợ dark mode theo tokens nếu theme có.
- Feedback có icon + label + explanation; chuyển trạng thái nhẹ, không có animation bắt buộc. Hỗ trợ `prefers-reduced-motion`.
- Teacher giữ hệ thống form hiện có (viền rõ, tiêu đề và breadcrumb), không render bảng điều khiển gamification trong Teacher Editor.

### FRS-ORD-045 — UI content và microcopy tiếng Việt

| State | Label đề xuất |
|---|---|
| Pool | “Các phần tử cần sắp xếp” |
| Answer zone | “Thứ tự của bạn” |
| No selection | “Chạm vào một phần tử để thêm vào đáp án” |
| Progress | “Đã chọn {selected}/{total}” |
| Reset | “Đặt lại” |
| Undo | “Hoàn tác” |
| Submit | “Kiểm tra đáp án” (Learning) / “Nộp đáp án” (Try-Hard) |
| Retry | “Thử lại” |
| Correct | “Chính xác! Bạn đã sắp xếp đúng.” |
| Wrong | “Thứ tự chưa đúng. Hãy kiểm tra lại.” |
| Locked | “Bạn đã hoàn tất câu hỏi này.” |

Prototype chỉ là **visual contract để review**, không phải định nghĩa runtime authoritative; FRS và SRS quyết định xử lý backend.

---

## 8. UC-ORD-05 — Submission, validation, grading, feedback

### FRS-ORD-050 — API sử dụng endpoint hiện có

**Không đề xuất tạo endpoint `/ordering/grade` riêng.** Tái sử dụng đường Final Question submit hiện hành của Activity Session; dùng typed answer adapter cho Ordering.

**Logical request fragment** (vỏ ngoài bám sát request DTO/`requestId` thực tế khi code):

```json
{
  "requestId": "8cdb67a8-a177-493f-9a1f-d13dc0b65c0c",
  "answer": {
    "order": ["p1", "p3", "p2", "p4"]
  }
}
```

Không tin bất kỳ `expectedOrder`, `isCorrect`, `score` do client gửi. Tránh thay đổi shape các answer request của Question Types cũ; adapter mới chịu trách nhiệm parse canonical OrderingAnswer.

### FRS-ORD-051 — Parse/validate ở backend

- Bắt buộc `order` là mảng key có thứ tự đúng bằng số items snapshot.
- Mỗi key phải thuộc snapshot đúng **một lần**. Reject null, thiếu, trùng, lạ, sai type, sai Session state.
- Invalid answer **không** tiêu hao business attempt; trả error code và UI giữ draft để sửa.
- Missing/unanswered distinction không đánh đồng một request rỗng với wrong answer đã nộp.
- Validate quyền sở hữu Student/Session trước khi parse/grade.

### FRS-ORD-052 — GradeResult binary + equivalent duplicates

`correct = exists(acceptedOrders) such that canonicalContentSequence(submittedOrder) == canonicalContentSequence(acceptedOrder)`.

- Correct → `GradeResult(scoreFraction=1)` với single `PartGrade` toàn câu.
- Incorrect → `GradeResult(scoreFraction=0)` với single `PartGrade` toàn câu.
- `firstCorrect/finalCorrect` và XP outcome như Question thường; **không** cấp fraction score/XP dựa trên từng item.
- Nếu có nhiều accepted orders, Teacher có thể chọn một **đáp án mẫu chuẩn** cho review (thường là acceptedOrders[0]); **không** nói Student sai chỉ vì dùng một accepted order khác.

### FRS-ORD-053 — Classic Learning / Try-Hard

- LEARNING: dùng số lần thử và hint policy hiện có; sai lần đầu có retry nếu policy cho phép; không hiển thị đáp án chuẩn trước khi hết quyền retry.
- TRY_HARD: countdown/lives/timeout hiện có; thao tác reorder không tạo attempt; hết hạn không tự gửi draft dở dang; Question resolution theo policy cũ.
- `BOTH` Activity: Ordering hoạt động với mode Session thực tế, không tạo rule riêng.
- `GAME_OVER`, `ABANDONED`, `COMPLETED`, Replay, Streak, Completion Bonus và XP base/scale giữ nguyên chính sách nền tảng.

### FRS-ORD-054 — Guided Final

- Guided Steps tiếp tục được chấm bằng các Step handlers hiện có; không cấp XP riêng.
- Final Ordering chỉ được fetch/submit/hint sau khi Step gate hoàn tất.
- Final nộp qua Answer endpoint dành cho Final, `GradeResult` của Ordering chuyển thành correctness; Guided final feedback/retry và XP không thay đổi.
- Step Hint **không** làm phát sinh Final `hintUsed`; Final Hint dùng policy riêng hiện có.
- Nếu Guided Step sai mà Final Ordering đúng, Final quyết định kết quả Question/XP.

### FRS-ORD-055 — Idempotency và concurrency

- Network retry cùng `requestId` + same payload trả lại cùng business result; không ghi attempt/XP lần nữa.
- Cùng `requestId` nhưng khác payload phải conflict theo idempotency policy hiện hành.
- Concurrent submissions không được tạo hai attempts cho một lần Submit; server kiểm tra state under transaction/lock.
- Student reload khi đang SUBMITTING phải query Session; không tự gửi answer mới với requestId khác nếu request cũ có thể đã thành công.

### FRS-ORD-056 — Feedback reveal

- Student chỉ nhận `correct`, retry availability và status mà mode cho phép; nếu retry còn thì **không** trả `acceptedOrders` hay mẫu đáp án.
- Khi resolved và được phép reveal, trả **một đáp án mẫu** và explanation; Student Review có thể liệt kê các accepted orders nếu nghiệp vụ review cho phép, nhưng không bắt buộc show tất cả trên UI.
- Không lộ accepted orders qua item metadata, source code client, snapshot JSON raw, response error hoặc preview không bảo vệ.

---

## 9. UC-ORD-06 — Result, Review và History

### FRS-ORD-060 — Persist attempts

Mỗi attempt hợp lệ lưu immutable ordered keys và `correct` theo question snapshot, attempt number, requestId, hint state trước attempt, thời gian. Existing Final Answer Attempt persistence được reuse; không tạo bảng Ordering-specific.

### FRS-ORD-061 — Student Review

Trang `GET /v1/activity-sessions/{sessionId}/review` hiện có cần render Ordering theo subtype:

| Vùng | Giá trị |
|---|---|
| Heading | “Sắp xếp từ/cụm từ/câu” và prompt |
| Your attempt(s) | Item text theo **thứ tự đã nộp**; nếu có retry, xem từng attempt |
| Status | Đúng/Sai cho từng attempt |
| Suggested answer | Thứ tự mẫu khi được phép reveal |
| Explanation | Explanation đã được Teacher lưu |
| Legacy | Nếu không có persisted answer, dùng nhãn legacy unavailable; không bịa lại from current Question |

Đề xuất mở rộng typed review DTO để chứa `ordering.subtype`, item map và attempt arrays theo thứ tự. Không flatten đối tượng thành chuỗi CSV hoặc làm mất duplicate IDs. Old Question Types/old Sessions phải giữ nguyên behavior.

### FRS-ORD-062 — Score/XP/Student Result

Một Ordering Question vẫn đóng góp **1** vào `totalQuestions`, `firstCorrectCount`, `finalCorrectCount`, completion denominator, và **1** XP outcome. Không cộng điểm vì 4 hay 8 items. Student Result page hiển thị score/XP như các Question khác.

### FRS-ORD-063 — Teacher Analytics ngoài scope

Không thiết kế `GET /teacher/ordering-analytics`, breakdown vị trí sai, histogram subtype, cohort dashboard hoặc bảng tổng hợp. Chỉ duy trì dữ liệu chuẩn cho Session/History; không chặn Teacher xem thông tin Question trong khu vực nội dung sẵn có.

---

## 10. UC-ORD-07 — Assignment fail-closed và compatibility

### FRS-ORD-070 — Assignment UI/backend guard

- Assignment Builder không liệt kê `ORDERING` trong câu hỏi có thể chọn.
- Backend validate ngay các lệnh attach/add/edit/publish liên quan Assignment; từ chối Ordering với mã lỗi minh bạch.
- Nếu API khác bypass bằng payload trực tiếp hoặc dùng shared Question IDs, backend vẫn reject; **không** chờ đến lúc Student làm bài mới báo unsupported.
- Assignment student-runtime/history không cần renderer Ordering trong v1; các Assignment hiện tại vẫn chạy bình thường.

### FRS-ORD-071 — Legacy Question Types

Mọi `switch`, mapper, validator, DTO union và serializer phải hỗ trợ enum mới nhưng không làm thay đổi semantics 7 loại cũ. `QuestionTypeHandlerRegistry` hiện yêu cầu đủ Handler cho mọi enum: thêm `ORDERING` và `OrderingHandler` **cùng thay đổi** để tránh lỗi boot.

### FRS-ORD-072 — Migration và schema evolution

- Tái sử dụng `questions.definition` TEXT JSON; không thêm bảng Ordering.
- Rà CHECK constraint SQL/Flyway về `QuestionType` (ví dụ migration trước từng thêm Matching/Cloze). Nếu có whitelist, bổ sung `ORDERING` bằng migration **mới**; không sửa migration đã chạy.
- Ký hiệu version migration chỉ chọn sau khi kiểm tra HEAD thật của branch sẽ code. Không tự mặc định `V63` hay version khác.
- Snapshot version và XP guard phải tương thích: các Session v2 cũ giữ chạy, Ordering snapshot mới không bị chặn sai do equality check version.

---

## 11. Proposed API/DTO map (logical, not existing endpoints)

| Flow | Existing endpoint family | Contract Ordering V1 |
|---|---|---|
| Teacher create/update Question | `/v1/content/questions/**` | `type=ORDERING` + typed `definition.ordering` hoặc canonical definition mapped theo service |
| Teacher Guided authoring | `/v1/content/questions/{id}/guided` và validate | Final `ORDERING` được READY; Steps không đổi |
| Activity readiness | `/v1/activities/{id}/readiness` | Count Ordering valid; Guided còn yêu cầu Guided READY |
| Start Session | `POST /v1/activities/{id}/sessions` | Snapshot + frozen presentation order |
| Resume Session | `GET /v1/activity-sessions/{id}` | Public items only khi gate cho phép |
| Submit Final | `POST /v1/activity-sessions/{id}/questions/{sessionQuestionId}/answer` | Ordered item-key answer qua existing answer adapter |
| Final hint | Existing final hint route | Theo mode/gate; không Ordering-specific |
| Result | `GET /v1/activity-sessions/{id}/result` | Score/XP bình thường |
| Student Review | `GET /v1/activity-sessions/{id}/review` | Typed Ordering answer + resolved suggested order |

**Contract verification gate:** Trước coding, đối chiếu chính xác tên fields và envelope request/response trong Controller/DTO của branch HEAD. Các fragment ví dụ ở §6–8 là **logical shapes**, không tự tạo endpoint trùng với endpoint đang có.

### 11.1. Error taxonomy đề xuất

Các code sau là **FRS DESIGN**; khi code có thể map sang convention `AppException/ErrorCode` hiện có:

| Code logic | Khi nào |
|---|---|
| `ORDERING_INVALID_DEFINITION` | Items/order thiếu hoặc không hợp lệ |
| `ORDERING_INVALID_PERMUTATION` | Student gửi key thiếu/trùng/thừa/lạ |
| `ORDERING_NO_VALID_SHUFFLE` | Không tồn tại hoán vị hiển thị sai |
| `ORDERING_NOT_SUPPORTED_IN_ASSIGNMENT` | Bị đưa vào Assignment |
| `ORDERING_NOT_SUPPORTED_AS_GUIDED_STEP` | Bị dùng làm Guided Step |
| `ORDERING_FINAL_NOT_AVAILABLE` | Guided chưa xong Steps |

Không trả accepted orders trong error detail cho Student.

---

## 12. Validation & edge-case catalog

| ID | Situation | Expected behavior |
|---|---|---|
| VAL-ORD-01 | `items.length=2` hoặc `9` | Không READY; field error rõ |
| VAL-ORD-02 | Trùng/blank item key | Reject |
| VAL-ORD-03 | Blank item content | Reject |
| VAL-ORD-04 | Accepted order thiếu/thừa/trùng key | Reject |
| VAL-ORD-05 | Accepted order trùng về display text | De-duplicate/cảnh báo, không double counting |
| VAL-ORD-06 | Hai key cùng content bị đổi chỗ | Chấm **đúng** nếu chuỗi hiển thị giống accepted order |
| VAL-ORD-07 | Shuffle ra accepted/equivalent order | Trộn lại; không phục vụ đề sắp đúng sẵn |
| VAL-ORD-08 | Mọi visible permutation accepted | Không READY; giải thích nguyên nhân |
| VAL-ORD-09 | Student thiếu item | UI disable Submit; backend invalid, no business attempt |
| VAL-ORD-10 | Student duplicate key | Backend invalid |
| VAL-ORD-11 | Student unknown key | Backend invalid, no key leak |
| VAL-ORD-12 | Student làm mới trang | Frozen presentation, attempt state giữ đúng |
| VAL-ORD-13 | Retry sau incorrect | Không re-shuffle, không reveal sớm |
| VAL-ORD-14 | Student submit alt accepted order | Correct true |
| VAL-ORD-15 | Teacher sửa item sau Session start | Session cũ chấm/review theo snapshot |
| VAL-ORD-16 | Teacher duplicate/edit/change type | Deep copy và revalidate, không stale key |
| VAL-ORD-17 | Guided Step stage | Final Ordering content/items không xuất hiện trong public API |
| VAL-ORD-18 | Guided Final Ordering | Works with existing step gate/retry/hint/XP |
| VAL-ORD-19 | Classic TRY_HARD timeout giữa thao tác | Không submit draft; timeout/lives logic cũ |
| VAL-ORD-20 | Assignment API inject Ordering | Backend reject, no partial publish |
| VAL-ORD-21 | Retry HTTP same requestId | Idempotent no extra attempt/XP |
| VAL-ORD-22 | Duplicate parallel Final submissions | At most valid state transitions per policy |
| VAL-ORD-23 | Hidden key in public error/result | No premature answer leak |
| VAL-ORD-24 | Mobile card dài/Unicode/quoted text | Wrap, safe render, keyboard fallback |
| VAL-ORD-25 | Legacy Question Type / legacy snapshot | Không regression |
| VAL-ORD-26 | Question có 8 SENTENCE items | Không ngang overflow hoặc trap focus |

---

## 13. Acceptance criteria — Gherkin

### AC-ORD-01 — Teacher tạo ba subtype

**Given** Teacher có quyền Question Bank  
**When** tạo Ordering với `WORD`, `PHRASE`, `SENTENCE`, 3–8 items và accepted orders đầy đủ  
**Then** Save/Reload/Edit/Preview giữ nguyên nội dung, key/order và mỗi subtype render đúng.

### AC-ORD-02 — Không có Shuffle field

**Given** Teacher mở Ordering Editor hoặc gọi API authoring  
**Then** không có `shuffleItems`/toggle tương đương; runtime luôn shuffle server-side.

### AC-ORD-03 — Nhiều accepted orders

**Given** Question có hai accepted orders khác nhau  
**When** Student nộp một trong hai  
**Then** `correct=true`; nộp một hoán vị khác thì `correct=false`.

### AC-ORD-04 — Duplicate visible items

**Given** hai item có content giống hệt nhau, keys khác nhau  
**When** Student hoán đổi hai keys mà chuỗi câu hiển thị vẫn đúng  
**Then** Question được chấm đúng.

### AC-ORD-05 — Stable shuffle

**Given** Session đã khởi tạo một Ordering Question  
**When** Student retry hoặc chuyển câu trong cùng Session đang hoạt động  
**Then** `presentationOrder` không đổi và không trùng accepted visible order.  
**When** Student refresh/rời runtime rồi mở lại Activity  
**Then** lượt cũ không resume; lượt mới được chọn và shuffle lại theo ADR 0012.

### AC-ORD-06 — Classic LEARNING

**Given** Student nộp sai lần đầu và policy cho retry  
**When** Student retry và trả lời đúng  
**Then** hai attempts persisted, firstCorrect=false, finalCorrect=true, XP theo retry outcome cũ, không tính theo item.

### AC-ORD-07 — Classic TRY_HARD

**Given** Student đang sắp xếp khi deadline hết hạn  
**When** timeout được server resolve  
**Then** draft chưa submit không được tính là answer attempt; lives/XP/next state theo rule cũ.

### AC-ORD-08 — Guided Final gate

**Given** Guided Question có Final type Ordering và Steps valid  
**When** Student chưa hoàn thành Steps  
**Then** API không expose prompt/items/hint/answer của Final.  
**When** các Steps đã resolved  
**Then** Student có thể sắp xếp và submit Final như Question bình thường.

### AC-ORD-09 — Guided Steps loại trừ Ordering

**Given** Teacher mở Step editor hoặc gửi Step type Ordering qua API  
**Then** UI không offer; backend reject.

### AC-ORD-10 — Assignment fail-closed

**Given** Teacher tìm Question để thêm vào Assignment hoặc submit API inject Ordering  
**Then** UI không offer và backend reject trước khi bài được xuất bản.

### AC-ORD-11 — No extra XP

**Given** Ordering có 8 items  
**When** Student giải xong  
**Then** Session tính như **1 Question**, chỉ có một XP outcome; replay/retry/idempotency không cộng trùng.

### AC-ORD-12 — Result & Review

**Given** Student đã nộp Ordering và được phép xem Review  
**When** mở History  
**Then** xem đúng submitted ordered items, correct status, suggested answer/explanation khi hợp lệ; không mất duplicate content.

### AC-ORD-13 — Invalid answer safety

**Given** Student gửi thiếu/trùng/lạ key  
**When** backend parse  
**Then** báo validation error, không tạo attempt/XP và không leak answer key.

### AC-ORD-14 — Responsive & keyboard

**Given** màn hình mobile hoặc chỉ dùng bàn phím  
**When** làm WORD/PHRASE/SENTENCE với tối đa 8 items  
**Then** Student hoàn thành và đổi vị trí không cần drag, không horizontal overflow.

### AC-ORD-15 — Legacy regression

**Given** dữ liệu Question, Session, Guided và Assignment cũ  
**When** ứng dụng triển khai Ordering  
**Then** các Question Type cũ, XP/Streak/Review/snapshots cũ vẫn hoạt động đúng.

---

## 14. Implementation impact — files/modules

### Backend

| Nhóm | Entry points baseline | Deliverable |
|---|---|---|
| Enum/Engine | `question/enums/QuestionType.java`, `question/engine/core/QuestionTypeHandlerRegistry.java` | Enum + Handler đủ registry |
| Specs | `question/engine/model/QuestionSpec.java`, compound specs | `OrderingSpec`, `OrderingAnswer`, single-part GradeResult |
| Authoring | `question/dto/request/QuestionDefinitionRequest.java`, `QuestionSpecMapper`, `QuestionPersistenceService`, `QuestionContentValidator` | Typed Ordering definition, validation, completeness |
| Activity selection | `ActivityQuestionEligibilityService`, readiness/selection | Classic+Guided Final whitelist, READY guard |
| Session | `ActivityQuestionSnapshotAssembler`, `ActivitySessionService` | Ordering snapshot/frozen shuffle/read & grade |
| Guided | Guided Definition validator + Final response/gate/runtime | Final ORDERING; Steps giữ type cũ |
| Review | `ActivitySessionReviewResponse`, mapper | Typed Ordered attempt display/reveal |
| Assignment | Composition/add/update/Assessment Attempt validators | Fail-closed ORDERING |
| DB/Flyway | `questions.definition`, QuestionType SQL check | Migration constraint nếu cần, backward compat |

### Frontend

| Nhóm | Entry points baseline | Deliverable |
|---|---|---|
| Shared types | `client-e-learning/src/types/question.ts` | Draft/spec union + subtype/definition |
| Teacher editor | `QuestionForm.tsx`, `QuestionComposer.tsx`, validator/draft | Ordering editor, accepted orders, preview, type-change |
| Guided editor | `GuidedDraftEditor.tsx` | Allow Final Ordering, Step type unchanged |
| Student shared UI | `question-stage-view.tsx`, `question-stage/answer-controls.tsx` | `OrderingAnswer` + type dispatch |
| Student state | `use-practice-controller.ts`, utilities | Ordered-array draft; not CSV/string/set |
| Guided Final | `guided-stage.tsx` | Show Ordering only on Final gate |
| Student Result | practice result, activity review | Ordered attempts, suggested order, responsive |
| Assignment UI | Teacher Assignment Builder | Filter unsupported Ordering |

**Giữ nguyên** Student theme và Teacher theme isolation; không refactor toàn bộ activity runner để thêm một Question Type.

---

## 15. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-ORD-01 | Server authoritative cho snapshot, shuffle, grade, reveal; Student không có answer key trước khi hợp lệ |
| NFR-ORD-02 | Ownership/auth chính xác; không dùng Student-provided `userId` làm nguồn xác thực |
| NFR-ORD-03 | Transaction + requestId idempotency, không double attempts/XP khi retries/concurrency |
| NFR-ORD-04 | 3–8 items; size guards; không vòng shuffle vô hạn; không N+1 bất thường |
| NFR-ORD-05 | HTML escape và xử lý Unicode, không XSS từ nội dung Teacher nhập |
| NFR-ORD-06 | WCAG cơ bản: focus visible, labels, keyboard controls, feedback text, touch targets hợp lý |
| NFR-ORD-07 | Responsive không overflow ngang; prefers-reduced-motion; Student-only CSS, Teacher không ảnh hưởng |
| NFR-ORD-08 | Old Question Types/legacy v2 snapshots tiếp tục đọc/chấm như trước |
| NFR-ORD-09 | Error code thống nhất với AppException convention, không leak expected order |
| NFR-ORD-10 | Thay đổi migration forward-only; không rewrite dữ liệu production đã có |

---

## 16. Implementation phases & gates

| Phase | Scope | Exit criteria |
|---|---|---|
| **M1 — Definition + Teacher UI + Assignment guard** | Enum/Handler/mapper/validator/persistence; Editor/Preview; **Assignment UI filter + backend fail-closed**; chuẩn bị Guided Final authoring, chưa bật runtime | Teacher tạo 3 subtype/alt orders; registry boot; Assignment chặn ORDERING |
| **M2 — Classic runtime** | **Chỉ bật ORDERING cho CLASSIC**; server shuffle/frozen snapshot, Ordering UI, binary grading, retry/hint/timeout; Guided eligibility vẫn loại ORDERING | LEARNING & TRY_HARD pass, XP no duplicate, Guided không được chọn trước M3 |
| **M3 — Guided Final** | Final gate, Guided UI/submit, final feedback & review | Ordering Final only; Steps không đổi, no early leak |
| **M4 — Compatibility & QA** | Regression Assignment guard M1, Student Review, mobile/keyboard, snapshot v2/v3 và XP guard regression | All AC-ORD-01..15 pass |

**ADR 0012 / no-resume:** Refresh/rời Activity không được xem là phương án khôi phục Ordering Session. `presentationOrder` ổn định chỉ trong lượt đang hoạt động và cho Review lịch sử.

**Go-live:** Không release nếu UI chỉ drag-drop, Guided lộ Final, shuffle có thể ra đáp án đúng sẵn, duplicate text bị chấm sai, Assignment nhận Ordering hoặc XP/session snapshot regression.

---

## 17. Traceability SRS → FRS → Acceptance

| SRS requirement | FRS | Acceptance |
|---|---|---|
| SRS-ORD-001..002 | 001..005, 070..072 | AC-ORD-01/02/15 |
| SRS-ORD-003..005 | 010..014 | AC-ORD-01/02 |
| SRS-ORD-006..007 | 030..033 | AC-ORD-04/05 |
| SRS-ORD-008..011 | 032, 040..045, 050..056 | AC-ORD-03/04/13/14 |
| SRS-ORD-012 | 053 | AC-ORD-06/07 |
| SRS-ORD-013..014 | 021, 054 | AC-ORD-08/09 |
| SRS-ORD-015 | 070 | AC-ORD-10 |
| SRS-ORD-016..017 | 030, 060..061, 072 | AC-ORD-05/12/15 |
| SRS-ORD-018 | 052..055, 062 | AC-ORD-06/11/15 |
| SRS-ORD-019 | 063 | No Teacher Analytics |
| SRS-ORD-020 | 012, 071 | AC-ORD-01/15 |

---

## 18. Source audit, assumptions & change control

**Baseline đã đối chiếu:** `feature/guided-reasoning-v1` @ `88f8f87`; SRS v1.1; prototype Ordering HTML. Entry points tiêu biểu:

- `server/src/main/java/e_learning/server/question/enums/QuestionType.java`
- `server/src/main/java/e_learning/server/question/entity/Question.java`
- `server/src/main/java/e_learning/server/question/engine/core/QuestionEngine.java`
- `server/src/main/java/e_learning/server/question/engine/core/QuestionTypeHandlerRegistry.java`
- `server/src/main/java/e_learning/server/question/engine/result/GradeResult.java`
- `server/src/main/java/e_learning/server/question/service/QuestionSpecMapper.java`
- `server/src/main/java/e_learning/server/question/service/QuestionPersistenceService.java`
- `server/src/main/java/e_learning/server/activity/service/ActivityQuestionEligibilityService.java`
- `server/src/main/java/e_learning/server/activitysession/snapshot/ActivityQuestionSnapshotAssembler.java`
- `server/src/main/java/e_learning/server/activitysession/entity/ActivitySessionQuestion.java`
- `server/src/main/java/e_learning/server/activitysession/dto/response/ActivitySessionReviewResponse.java`
- `client-e-learning/src/types/question.ts`
- `client-e-learning/src/components/features/teacher/question-authoring/QuestionComposer.tsx`
- `client-e-learning/src/components/features/teacher/question-authoring/GuidedDraftEditor.tsx`
- `client-e-learning/src/components/features/student/activities/runtime/question-stage-view.tsx`
- `client-e-learning/src/components/features/student/activities/runtime/guided-stage.tsx`

**Cần xác minh lại trước implement:** HEAD của nhánh triển khai thực tế, tên chính xác của DTO/endpoint Answer, rule reveal của Result, Flyway version còn trống, các Assignment mutation paths, việc Guided READY bị stale khi sửa Final; đây là **implementation verification gates**, không phải thay đổi nghiệp vụ.

**Chưa xây dựng:** Ordering trong Guided Steps/Assignment, Teacher Analytics, CSV import, AI grading, partial XP/score hoặc new PracticeType. Những yêu cầu này phải có change request trước khi triển khai.

**Kết luận trạng thái:** FRS hoàn chỉnh ở mức thiết kế để Product Owner review. Prototype chỉ mô phỏng UI; **không có migration, API hoặc commit mới được thực hiện**.