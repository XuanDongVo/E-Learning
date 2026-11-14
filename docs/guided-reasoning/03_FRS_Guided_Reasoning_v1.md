# 03 — FRS: Guided Reasoning v1

**Functional Requirements Specification — E-Learning**  
**Phiên bản:** 1.1, cập nhật 14/11/2026 theo Guided-first + Hint/Retry từng Step  
**Branch:** `feature/guided-reasoning-v1` (tạo từ `main` @ `268bcf0b03cb87e0c72cf14a9d28998698b8421b`)  
**Tình trạng:** M1 đã có schema và Teacher authoring API (definition Draft/Ready,
validation, optimistic version, capabilities); M2 đã có Activity `practiceType`,
Guided eligibility/readiness, Teacher Activity configuration, và Teacher
workspace sửa Question đã lưu. M3–M5 — runtime,
review và Student UI — vẫn là specification, trừ khi ghi rõ EXISTING.<br>
**SRS:** [02_SRS_Guided_Reasoning_v1.md](02_SRS_Guided_Reasoning_v1.md)

> **CONFIRMED:** Product Owner đã chốt. **PROPOSED:** Policy triển khai chi tiết có thể thay đổi khi review, được ghi nhãn rõ; không được xem là Product Owner đã duyệt. **EXISTING:** Từ mã nguồn `main` tại base SHA.

## 1. Quyết định và phạm vi

| ID | Quyết định |
|---|---|
| DEC-01 | Một Question có tối đa một Guided Definition |
| DEC-02 | Không hard limit số Step ở business rules |
| DEC-03 | Mỗi lần nộp Step phản hồi đúng/sai ngay, không reveal đáp án đúng |
| **DEC-04 revised** | **Guided Steps xuất hiện trước; Question chính chỉ hiển thị sau khi hoàn thành mọi Step** |
| DEC-05 | Final quyết định XP/score; Step không sinh XP |
| DEC-06 | TYPE_ANSWER Step chấm bằng QuestionEngine với acceptedAnswers và matchingMode của handler |
| DEC-07 | Guided Activity chỉ LEARNING+RANDOM |
| DEC-08 | Student và Teacher đều review chi tiết từng Step |
| **DEC-09 added** | Teacher có thể bật/tắt Hint riêng trên mỗi Step |
| **DEC-10 added** | Teacher có thể bật/tắt Retry riêng trên mỗi Step |

### 1.1. Bản chất nghiệp vụ

`Question` hiện hành vẫn là Final Question và nguồn kết quả/XP. `GuidedDefinition` là extension tùy chọn của Question; `GuidedStep` là embedded QuestionSpec, không tạo Question Entity; QuestionType chính độc lập với QuestionType của Step. `PracticeType` của Activity là `CLASSIC | GUIDED_REASONING`, không phải QuestionType hay ActivityMode.

**Scope:** Teacher Guided Editor + per-Step Hint/Retry, Bulk Guided draft authoring and local Preview Exam; Guided Activity readiness/selection; Guided-first Student Runner; snapshot, state, grading, result Student/Teacher. **Out of scope:** Error Detective, Retrieval, Mixed Activity, TRY_HARD/WEAKNESS_PRIORITY Guided, Matching/Cloze Activity, branching/AI grading, XP per Step.

### 1.2. Type matrix

| QuestionType | Final Question | Guided Step |
|---|---|---|
| SINGLE_CHOICE | Yes | Yes |
| MULTIPLE_CHOICE | Yes | No |
| TRUE_FALSE | Yes | Yes |
| FILL_IN_BLANK | Yes | No |
| TYPE_ANSWER | Yes | Yes |
| MATCHING | No | No |
| CLOZE | No | No |

Enforcement ở backend; frontend lấy capability thống nhất; không sinh một `GuidedQuestionType` enum mới.

### 1.3. Policy đề xuất cần phân biệt

| Policy | PROPOSED default |
|---|---|
| POL-01 | DRAFT cho phép 0 Step; READY yêu cầu >=1; không giới hạn business maximum |
| POL-02 | `retryEnabled=false` mặc định; bật cho **tối đa 2 lần nộp** (first attempt + one retry); khi đúng thì Step kết thúc, khi sai hết lượt vẫn qua Step sau |
| POL-03 | `hintEnabled=false` mặc định; bật thì yêu cầu nội dung `hint` không rỗng để READY. Hint dùng được khi Step đang ACTIVE, một lần reveal; không ảnh hưởng Final XP |
| POL-04 | Hint Step và Retry Step **không** sửa fields `hintUsed`, `firstCorrect`, `finalCorrect` của ActivitySessionQuestion; step analytics riêng |
| POL-05 | Sau mỗi attempt, trả only `correct` và `retryAvailable` cùng next state; không trả accepted answers/correct option key/explanation trước Final resolved |
| POL-06 | Step tuyến tính, không skip/branch/redo completed Step; idempotent network retries không được tính làm business retry |
| POL-07 | Intro/context tùy chọn để Step có ngữ cảnh mà không cần reveal Final; không tự chèn Question content vào Step response |
| POL-08 | Final dùng current LEARNING policy: sai lần đầu có một retry, không reveal khi còn retry; đúng/sai đã resolved mới reveal |
| POL-09 | ABANDONED giữ attempts đã nộp nhưng **không tiết lộ key cho Step hoặc Final chưa resolved** |
| POL-10 | Explicit `continue` nếu UI cần hiển thị feedback trước khi sang Step kế; API state không bắt buộc tự điều hướng ngay |

Nếu Product Owner đổi retry limit, hint policy hoặc ảnh hưởng XP, cập nhật SRS/FRS trước khi coding.

## 2. Actor và authorization

| Actor | Được phép | Không được phép |
|---|---|---|
| Teacher | CRUD Guided trên Question/Bank thuộc quyền; tạo Activity Guided; review Student sessions trong phạm vi lớp được phép | Đọc Student khác lớp/phạm vi; bypass READY/authoritative grade |
| Student | Start/GET/submit/hint/Final cho Session của chính mình; xem Result sau khi đủ điều kiện | Đọc Question Final trước gate; truy xuất correct keys; submit future Step/Session của người khác |
| Backend | Parse/validate/grade bằng QuestionEngine, snapshot, lock state, XP final | Tin correctness/currentStep/practiceType/studentId do client gửi |

**EXISTING:** `/v1/content/**` hiện dành cho Teacher; `/v1/activity-sessions/**` dành cho Student; Teacher Student Learning Service có `listActivitySessions` và kiểm tra quyền qua `profileService.getForTeacher`. **PROPOSED:** Teacher review chi tiết phải có endpoint trong `/v1/teacher/**`, xác thực teacherId từ JWT và kiểm tra phạm vi từng session.

## 3. UC-GR-01: Teacher Guided authoring

### FRS-GR-001 — Definition cardinality

- FK `question_id` unique và non-null; 0..1 Guided Definition/Question.
- Guided không được nhúng vào `QuestionWriteRequest.definition` (định nghĩa type-specific như Matching/Cloze hiện tại).
- Saved Question maintenance uses the existing per-Question endpoints. Bulk Composer may
  carry an optional Guided DRAFT alongside its local Question draft through the dedicated
  atomic endpoint; Guided is still not embedded in `QuestionWriteRequest.definition`.

### FRS-GR-002 — Definition schema

| Field | Loại | Quy tắc |
|---|---|---|
| questionId | Long | FK unique |
| schemaVersion | integer | >0; initial version 1 |
| version | long | optimistic version |
| sourceQuestionRevision | long | revision Question khi mark READY |
| status | DRAFT/READY | server quyết định khi validate |
| introContent | nullable string | ngữ cảnh chung **trước các Step**, không chứa Question Final tự động |
| steps | ordered array | READY >=1, no hard business max |

### FRS-GR-003 — Step schema

| Field | Requirement |
|---|---|
| stepKey | Unique stable opaque key trong Guided Definition; reorder không đổi |
| position | Unique contiguous ordinal trong Definition |
| type | SINGLE_CHOICE / TRUE_FALSE / TYPE_ANSWER |
| prompt | Required nonblank; đủ ngữ cảnh (hoặc dựa trên introContent) |
| questionSpec | canonical typed definition; options/correctKey, expected boolean hoặc acceptedAnswers + matchingMode |
| explanation | Optional, chỉ Student xem khi Final resolved |
| hintEnabled | boolean; default false **PROPOSED** |
| hint | string nullable; nếu enabled thì required, nonblank **PROPOSED** |
| retryEnabled | boolean; default false **PROPOSED** |
| maxAttempts | **Derived** 1 khi off, 2 khi on theo POL-02; không cho client đưa số tùy ý v1 |

Step Common content chính là prompt; difficulty của Step không cấp XP riêng và có thể kế thừa Question snapshot theo adapter. Validation dùng `QuestionEngine.validateDefinition`, không viết grader trùng.

### FRS-GR-004 — Step editor & preview

Teacher có thể Add/Remove/Reorder Step, thay type, nhập answer(s), cấu hình Hint và Retry từng Step. Các control hỗ trợ đúng ba type. Khi Hint bật hiển thị editor hint; khi Retry bật hiển thị “Có thêm một lượt nếu sai” (policy PROPOSED). Preview hiển thị **intro → Step 1..n → Final Question → Review**, không hiển thị Final trước Step cuối trong Student preview. Teacher authoring/preview có thể xem đáp án.

**Pedagogical warning:** Step/hint có thể vô tình lộ đáp án Final; hiển thị cảnh báo reviewer, không hứa phát hiện ngữ nghĩa tự động.

### FRS-GR-005 — Draft/Ready/revision

- DRAFT cho phép Step chưa đầy đủ; không eligible vào Guided Activity.
- READY yêu cầu Question chính complete + supported; >=1 Step; mọi Step validate thành công, hint nếu enabled hợp lệ; sourceQuestionRevision khớp.
- Question content/type/answer revision thay đổi → Guided không còn eligible (STALE là trạng thái computed nếu muốn); Teacher phải kiểm tra lại.
- Guided update/disable/deletion không thay đổi snapshot Session đã chạy.
- Concurrent edit phải dùng optimistic version để tránh last-write-wins im lặng.

### FRS-GR-006 — Long sequences

Không có validator `maxStepCount`; chỉ có operational constraints (payload/request size, field length, memory). UI có thể cảnh báo/hỗ trợ virtualized list để giữ responsive; cảnh báo nhiều Step không chặn business READY một cách tùy tiện.

## 4. UC-GR-02: Teacher tạo Guided Activity

### FRS-GR-010 — Activity configuration

- New `practiceType=CLASSIC|GUIDED_REASONING`, default CLASSIC với dữ liệu cũ.
- Guided bắt buộc `mode=LEARNING`, availableSelectionStrategies đúng `[RANDOM]`, không cho Student override.
- Guided Activity **100% Guided**; không có Mixed/Classic quota, không bắt buộc tạo Classic song song.

### FRS-GR-011 — Bank distribution

Giữ nguồn Question Bank thuộc cùng Unit, `EQUAL/PERCENTAGE/FIXED_COUNT`. Per-bank `required` phải <= số Question vừa complete, vừa supported Final type, vừa có Guided READY + source revision match, vừa phù hợp difficulty. Dùng cùng filter cho source options, readiness, preview, publish và selection runtime; không silently fallback to Classic.

### FRS-GR-012 — Readiness/start fail-safe

Nếu Published Activity mất đủ nguồn khi Teacher sửa Guided, **start mới** fail not-ready với mã lỗi; không đánh tráo câu khác/Classic. Existing Session snapshot vẫn tiếp tục bình thường.

### FRS-GR-013 — Display

Teacher Activity Editor/Detail hiện kiểu luyện và Guided Ready counts theo Bank. Student Activity Card mô tả “Luyện tư duy từng bước”; Student không chọn practiceType.

## 5. UC-GR-03: Start, snapshot & GET Session

### FRS-GR-015 — Start

Server auth student, validate access/Activity Published + readiness + LEARNING/RANDOM; random Question selection theo Bank allocation; tạo immutable Question + Guided snapshot cho từng selected Question trước khi trả response.

### FRS-GR-016 — Snapshot schema

- Existing Question snapshot schema v2/XP difficulty giữ nguyên.
- New Guided snapshot schema v1 bao gồm intro, ordered Step prompt/spec, answer keys, hint, policies, Step identity/version.
- **Client không nhận raw Guided snapshot**; response sanitize theo state và quyền.
- Lưu câu trả lời và state đủ để khôi phục giữa chừng, teacher edit không tác động Session cũ.

### FRS-GR-017 — Guided-first public payload (security-critical)

Khi state là STEP_ACTIVE / STEP_RETRY, public GET Session cho Student chỉ trả: question session ID, vị trí câu trong Activity, practiceType, Guided intro, current step ordinal/prompt/type/options đã **loại correct flags**, hintAvailable/used và attempt state. **Không trả Question chính: content, options, answers, hint, explanation** trước khi mọi Step complete.

Ở FINAL_PENDING/FINAL_RETRY, server mới trả **Question chính đã sanitize**: content/type/options (không đúng/sai)/hint available. Không gửi đáp án/expected answer trước resolved.

Ở QUESTION_RESOLVED, có thể cấp review theo policy; không làm lộ answer key của các Question khác chưa resolved.

### FRS-GR-018 — Resume

GET /v1/activity-sessions/{id} server recompute current state từ DB, không phụ thuộc UI. Refresh sau nộp Step, sau dùng hint, sau lần sai có retry, và giữa Final retry đều giữ đúng số attempts/hintUsed. Không mở lại Step đã đóng.

## 6. UC-GR-04: Step submission, Hint, Retry và Final

### 6.1. State machine (per session-question)

```text
STEP_ACTIVE
   ├─ use hint (if enabled) ──────> STEP_ACTIVE [hintUsed=true]
   ├─ correct submission ────────> NEXT_STEP | FINAL_PENDING
   ├─ wrong, retryEnabled=true ──> STEP_RETRY
   └─ wrong, retryEnabled=false ─> NEXT_STEP | FINAL_PENDING

STEP_RETRY
   ├─ use hint (if enabled) ──────> STEP_RETRY
   └─ submit (correct/wrong) ─────> NEXT_STEP | FINAL_PENDING

FINAL_PENDING
   ├─ correct ───────────────────> QUESTION_RESOLVED
   └─ wrong ─────────────────────> FINAL_RETRY
FINAL_RETRY
   └─ submit ────────────────────> QUESTION_RESOLVED

NEXT_STEP = STEP_ACTIVE for next ordinal.
QUESTION_RESOLVED = result reveal eligible + XP Final only.
```

### FRS-GR-019 — Ordering, single current step

Step chỉ cho nộp nếu request đúng `sessionQuestionId`, `stepKey`, `stepIndex` active và Session IN_PROGRESS. Backend reject future/previous attempts, forbidden access, invalid Student grade, Completed/Abandoned Session. Trước Final gate, reject Final submit **và Final GET detail**. Không tin client progress/correctness.

### FRS-GR-020 — Submit một Step

Request bắt buộc `requestId` idempotency key, `answer` theo QuestionSpec. Backend parseAndValidate + grade bằng QuestionEngine. Mỗi submission business hợp lệ tạo **một** immutable attempt, với ordinal 1 hoặc 2 (POL-02), correct, raw/normalized answer, time; response correct ngay và `retryAvailable`, `stepResolved`, current state; **không** gửi correct key/accepted answers/explanation.

Sai lần đầu có Retry: giữ Step active, Student nhập lại; **không được** giữ option sai và tự gửi lại trên cùng requestId như một business attempt. Sai lần cuối: lưu finalCorrect=false cho Step, tiếp tục Step kế. Đúng lần đầu hoặc Retry: resolve Step. UI có thể yêu cầu hành động “Tiếp tục” để đọc feedback mà không trì hoãn commit server.

### FRS-GR-021 — Hint Step

- Hint endpoint chỉ hoạt động khi `hintEnabled=true`, Step đang active/retry, Student sở hữu Session.
- Server trả đúng **hint text** thuộc Step snapshot khi được phép, `hintUsed=true`; không trả explanation/correct key. Repeated GET/mutation hint idempotent, không cộng thêm use.
- Khi disabled: 4xx có mã `GUIDED_HINT_UNAVAILABLE`, không lộ text.
- HintUsed Step là **field riêng**, không gọi Final Question Hint endpoint và không làm giảm XP Final (POL-04).
- Nếu hint content vô tình chứa đáp án Final: đây là authoring issue cần Teacher preview, không thể đảm bảo semantic filtering bằng code.

### FRS-GR-022 — Retry Step

- Disabled: một lần nộp, correct/wrong đều resolve Step.
- Enabled: wrong lần đầu cho phép **một retry** theo POL-02; correct first kết thúc sớm; attempt thứ hai resolve bất kể correct.
- Với `TYPE_ANSWER`, không trả acceptedAnswers khi retry; giữ matchingMode nhất quán.
- Lượt retry chỉ tính khi Student **nộp đáp án mới**; retry do mạng với requestId cũ phải trả response cũ, không tăng attempts.

### FRS-GR-023 — Immediate feedback & answer secrecy

Response từng attempt nêu `correct`, `attemptNumber`, `retryAvailable`, `stepResolved`; **không** bao gồm acceptedAnswers, correct option flag/key, expected boolean, explanation, raw snapshot, hoặc Final Question content. Step đã resolved có thể hiển thị lại đúng/sai khi resume; không tiết lộ đáp án trước khi Final resolved.

### FRS-GR-024 — TYPE_ANSWER normalization

Với Step TYPE_ANSWER, dùng `TypeAnswerSpec(acceptedAnswers,matchingMode)` qua `QuestionEngine.parseAndValidate` và `grade`. `CASE_INSENSITIVE_TRIM` bỏ khoảng trắng **đầu/cuối** và phân biệt hoa/thường theo mode; **không mặc định gộp whitespace bên trong hoặc fuzzy match**. Không thay normalization của handler hiện tại. Missing/invalid answer nhận validation error, không tiêu hao lượt attempt.

### FRS-GR-025 — Final Question & LEARNING Retry

- Khi tất cả Step resolved, API transition FINAL_PENDING và public Question chính với sanitized options.
- Student answer Final bằng existing Question session answer flow có extension Guided guard; giữ firstCorrect/finalCorrect/answerAttempts và một retry khi sai lần đầu; existing hint endpoint chỉ dành cho Final.
- Final đúng first / đúng retry / sai retry → resolved, XP receipt theo existing flow. Không tiết lộ correct answer khi Final sai first còn retry.
- Guided Steps **không** thay đổi `ActivitySessionQuestion.hintUsed`, question difficulty snapshot, XP multiplier, completion bonus, streak; chỉ Final ảnh hưởng.
- Nếu học sinh sai Step nhưng Final đúng, Question vẫn được tính đúng theo Final.

### FRS-GR-026 — Finish/Abandon & transitions

Finish khi tất cả Final resolved → COMPLETED, giữ XP/streak chính sách cũ. Leave trước hoàn thành → ABANDONED, không XP; giữ attempts đã nộp nhưng không reveal key cho các Question chưa Final-resolved. Start new Session có thể abandon prior open Session theo behavior hiện hành. Replay chọn random snapshot mới.

### FRS-GR-027 — Concurrency/idempotency

- Unique `(session_question_id,step_key,attempt_number)` và unique `(session_question_id,request_id)`; transactional server lock.
- Same requestId + same payload: trả cached outcome không tạo attempt/hint/XP nữa; same requestId + differing payload: 409 `GUIDED_IDEMPOTENCY_CONFLICT`.
- Concurrent different requests vào Step: chỉ tối đa attempt allowance, state không bị nhảy hai bước.
- Failures giữa grade/insert/update rollback toàn bộ, response retry deterministic.

## 7. UC-GR-05: Student/Teacher Review

### FRS-GR-030 — Student review

Khi Final resolved, Student mở Question review gồm Step ordinal/type/prompt, từng attempt (submitted answer, correct, attempt number, usedHint flag, timestamp), Step final status, Final submitted attempts, correct answer/explanation theo quyền. Result tổng hợp vẫn có Activity score, XP receipt. Trang reload lại được từ API.

### FRS-GR-031 — Teacher review

Teacher vào Student detail → Activity Sessions → Guided Session Review, thấy tiến trình từng Step, submitted answers/đúng sai/hint/retry và Final outcome. Phải kiểm tra Teacher được quyền xem Student **và session thuộc phạm vi phù hợp**; không chỉ có `hasRole(TEACHER)`. Review của Session đang IN_PROGRESS/ABANDONED không được tiết lộ key của Question chưa Final resolved.

### FRS-GR-032 — Historical/Classic review

Các Session CLASSIC cũ không có step records; API mới trả `steps=[]` hoặc `guided=null`, không lỗi. Student Classical result chưa được phép phụ thuộc local picks cho Guided, nhưng không thay đổi Classic UI/gamification ngoài phạm vi cần thiết.

## 8. API contracts

**M1 Teacher editor implemented:** the saved Question edit workspace reuses the
same Main Question / Guided Reasoning authoring pattern as Create. It supports
ordered Steps, per-Step Hint/Retry, draft save, ready validation, deletion, and
a Teacher-only guided-first flow preview.

**M1 implemented:** toàn bộ endpoint authoring ở §8.1, theo `ApiResponse` hiện có.
**M2 implemented:** phần cấu hình Activity ở §8.2 (`practiceType`, Guided-only
LEARNING/RANDOM, eligibility/readiness/preview/selection). **Chưa implemented:**
Student runtime và Review (§8.3–8.4).

Bên dưới là **contract gợi ý**, cần phù hợp ApiResponse/error code convention hiện tại. IDs `sessionQuestionId` là **row ID** của ActivitySessionQuestion, không phải Question Bank ID.

### 8.1. Authoring

`POST /v1/content/questions/bulk-with-guided` is implemented for the Unified
Bulk Composer. Each item contains a client `draftId`, a standard Question create
payload, and optional Guided DRAFT payload. The endpoint is atomic: any invalid
Question or Guided draft rolls back the complete batch. A successful response
maps each `draftId` to its persisted Question; Guided status stays `DRAFT` until
the normal validation endpoint marks it `READY`.

| Method / path | Mục đích |
|---|---|
| `GET /v1/content/questions/{questionId}/guided` | Teacher đọc Guided Draft/Ready & revision |
| `PUT /v1/content/questions/{questionId}/guided` | Upsert Draft với `expectedVersion` |
| `POST /v1/content/questions/{questionId}/guided/validate` | Validate+mark READY; trả list issues có field paths |
| `DELETE /v1/content/questions/{questionId}/guided` | Disable/delete cho future use (old snapshots không đổi) |
| `GET /v1/content/guided/capabilities` | Teacher FE lấy Step supported types + policy giới hạn |

Sample draft:

```json
{
  "expectedVersion": 3,
  "status": "DRAFT",
  "introContent": "Ôn tập quy tắc thì hiện tại đơn trước khi giải bài cuối.",
  "steps": [
    {
      "stepKey": "s-1",
      "position": 0,
      "type": "SINGLE_CHOICE",
      "prompt": "Đại từ nào là ngôi thứ ba số ít?",
      "options": [
        {"key": "A", "content": "They"},
        {"key": "B", "content": "She"}
      ],
      "correctKey": "B",
      "explanation": "She là chủ ngữ ngôi thứ ba số ít.",
      "hintEnabled": true,
      "hint": "Hãy nghĩ đến một người nữ.",
      "retryEnabled": true
    },
    {
      "stepKey": "s-2",
      "position": 1,
      "type": "TYPE_ANSWER",
      "prompt": "Viết tên thì diễn tả thói quen lặp lại trong tiếng Anh.",
      "acceptedAnswers": ["present simple", "simple present"],
      "matchingMode": "CASE_INSENSITIVE_TRIM",
      "hintEnabled": false,
      "retryEnabled": false
    }
  ]
}
```

Teacher editor có dữ liệu answer key; **Student DTO phải hoàn toàn khác**, sanitize server-side.

### 8.2. Activity

Extend `CreateActivityRequest`, `UpdateActivityRequest`, ActivityResponse với `practiceType`. Readiness `/v1/activities/{id}/readiness` phân biệt CLASSIC/GUIDED. Existing `mode=LEARNING`, `availableSelectionStrategies=["RANDOM"]` bắt buộc cho Guided.

### 8.3. Student runtime

| Method/path | Vai trò |
|---|---|
| `POST /v1/activities/{activityId}/sessions` | Start; reused; validate practiceType/mode/strategy server-side |
| `GET /v1/activity-sessions/{sessionId}` | Resume, **stage-sensitive sanitized** |
| `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/steps/{stepKey}/answer` | Submit current Guided Step |
| `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/steps/{stepKey}/hint` | Reveal hint Step nếu enabled |
| `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/answer` | Existing Final endpoint, có Guided gate |
| `POST /v1/activity-sessions/{sessionId}/questions/{sessionQuestionId}/hint` | Existing Final hint endpoint, có Guided gate |
| `GET /v1/activity-sessions/{sessionId}/result` | Existing XP summary; extend link/review data |

Example **Step-stage** sanitized response (illustrative fragment; no Final content):

```json
{
  "sessionQuestionId": 901,
  "practiceType": "GUIDED_REASONING",
  "stage": "STEP_RETRY",
  "currentStep": {
    "stepKey": "s-1",
    "position": 0,
    "totalSteps": 2,
    "type": "SINGLE_CHOICE",
    "prompt": "Đại từ nào là ngôi thứ ba số ít?",
    "options": [
      {"key": "A", "content": "They"},
      {"key": "B", "content": "She"}
    ],
    "hintAvailable": true,
    "hintUsed": false,
    "attemptsUsed": 1,
    "attemptsAllowed": 2
  }
}
```

Student step submit:

```json
{
  "requestId": "c53f7f17-11ee-477d-818e-88653f96183f",
  "answer": "A"
}
```

Feedback:

```json
{
  "correct": false,
  "attemptNumber": 1,
  "retryAvailable": true,
  "stepResolved": false,
  "stage": "STEP_RETRY"
}
```

Hint response:

```json
{
  "hint": "Hãy nghĩ đến một người nữ.",
  "hintUsed": true,
  "stage": "STEP_RETRY"
}
```

**No answer key, correct option flags, Final Question content, Step explanation in pre-Final responses.** Server must sanitize parent `ActivitySessionQuestionResponse` as well; do not merely omit Final from a new nested property while the old `questions` array leaks it.

### 8.4. Review

| Method/path | Quyền |
|---|---|
| `GET /v1/activity-sessions/{sessionId}/review` | Student owns session |
| `GET /v1/teacher/students/{studentId}/activity-sessions/{sessionId}/review` | Teacher permitted to view student + session |

Sample review shape (no key for unresolved Final):

```json
{
  "sessionId": 402,
  "sessionQuestionId": 901,
  "stage": "QUESTION_RESOLVED",
  "steps": [
    {
      "stepKey": "s-1",
      "prompt": "Đại từ nào là ngôi thứ ba số ít?",
      "type": "SINGLE_CHOICE",
      "hintUsed": true,
      "attempts": [
        {"attemptNumber": 1, "submittedAnswer": "A", "correct": false},
        {"attemptNumber": 2, "submittedAnswer": "B", "correct": true}
      ],
      "correctAnswer": "B",
      "explanation": "She là chủ ngữ ngôi thứ ba số ít."
    }
  ],
  "final": {
    "firstCorrect": true,
    "finalCorrect": true,
    "submittedAnswers": ["B"],
    "answerRevealed": true
  }
}
```

## 9. Proposed persistence

| Entity/table (names tentative) | Key fields/constraints |
|---|---|
| `question_guided_definitions` | `id`, `question_id UNIQUE FK`, `schema_version`, `version`, `status`, `source_question_revision`, `intro_content`, `definition_payload JSONB`, timestamps |
| `activities` extension | `practice_type` non-null default `CLASSIC` to preserve existing rows |
| `activity_session_questions` extension | `guided_snapshot_payload JSONB` nullable, `guided_snapshot_schema_version` nullable; immutable at start |
| `activity_session_guided_progress` | `session_question_id UNIQUE FK`, `current_step_key`, `stage`, `version`; last state reconciled with attempts |
| `activity_session_guided_step_attempts` | `id`, `session_question_id FK`, `step_key`, `attempt_number`, `request_id`, `answer_payload`, `normalized_answer`, `correct`, `submitted_at`; unique(session_question, step, attempt), unique(session_question, request_id) |
| `activity_session_guided_step_hint_state` | `session_question_id`, `step_key`, `used_at`, unique(session_question,step), or progress JSON if transactions guaranteed |
| `activity_session_final_answer_attempts` | `session_question_id`, `attempt_number`, `request_id`, `answer_payload`, `correct`, `submitted_at`; enables persisted Guided review |

**Important:** Step hint state and attempts must not be written into the existing Final `hintUsed/answerAttempts`; `ActivityXpSessionAuditService` reads only Final Question data. Migrations additive, forward-only; verify next Flyway version from feature branch head, do not assume V58 if concurrent merges occur. Old Session rows remain valid.

### 9.1. Data exposure

- **Secret persisted snapshot:** complete typed Step specs and Final answer key, backend only.
- **Student active Step DTO:** only current prompt/options stripped of correctness + hint availability + attempts state.
- **Student after Final gate DTO:** Final content/options without correctness.
- **Student/Teacher eligible review:** saved answers, correctness, correct keys & explanation only for Question resolved. Teacher role **does not exempt** premature answer-key policy in active/unresolved Sessions.

## 10. Validation catalog

| ID | Case | Expected |
|---|---|---|
| VAL-GR-01 | Second Guided Definition for same Question | Unique constraint rejection |
| VAL-GR-02 | READY with 0 Step | Reject; Draft can hold 0 |
| VAL-GR-03 | Invalid Step type | Validation error with path |
| VAL-GR-04 | Duplicate/missing stepKey/position | Reject |
| VAL-GR-05 | Hint enabled but blank hint | Reject READY (POL-03) |
| VAL-GR-06 | Hint disabled, hint request | `GUIDED_HINT_UNAVAILABLE` |
| VAL-GR-07 | Retry disabled, second attempt | `GUIDED_STEP_ALREADY_RESOLVED` |
| VAL-GR-08 | Retry enabled, wrong first | Feedback false + retry available; no answer key |
| VAL-GR-09 | Retry enabled, correct first | Resolved; no second attempt |
| VAL-GR-10 | Retry enabled, wrong second | Resolved wrong, next Step/Final |
| VAL-GR-11 | Retry enabled, correct second | Resolved correct; finalCorrect Step true, firstCorrect Step false |
| VAL-GR-12 | Unsupported Final QuestionType | Cannot READY Guided/Publish selection |
| VAL-GR-13 | Guided stale from Question revision | Not eligible for new Sessions |
| VAL-GR-14 | Insufficient Guided Ready per Bank | Readiness false and start rejected |
| VAL-GR-15 | Wrong requested mode/strategy | Reject Guided start, no silent fallback |
| VAL-GR-16 | Request Final before Step complete | Gate rejection; **no Final content** |
| VAL-GR-17 | Request future/past Step | Out-of-order/finished error |
| VAL-GR-18 | Refresh after first wrong, retry available | Same Step retry state; attemptsUsed=1 |
| VAL-GR-19 | Refresh after hint | HintUsed persists; no duplicate marking |
| VAL-GR-20 | Step hints used but Final answer correct | Final XP policy unchanged; no Step penalty |
| VAL-GR-21 | Same requestId + same payload | Idempotent same result, no extra attempt |
| VAL-GR-22 | Same requestId + different payload | 409 conflict |
| VAL-GR-23 | Simultaneous different requests | One serializable state order, limits respected |
| VAL-GR-24 | Step TYPE_ANSWER mixed case, outer whitespace | Normalize per MatchingMode; internal whitespace not auto-collapsed |
| VAL-GR-25 | Student attempts other's Session | 403 |
| VAL-GR-26 | Teacher outside allowed student/class | 403 |
| VAL-GR-27 | Teacher attempts active answer-key access | No premature key |
| VAL-GR-28 | Final wrong first, still retry | No Final answer key/Step keys reveal |
| VAL-GR-29 | Final resolved | Unlock eligible detail review, correct answers/explanations |
| VAL-GR-30 | Abandon with partial Steps | Preserve attempts, never grant unresolved key |
| VAL-GR-31 | Classic older Session without Guided | Works, no NULL failures, no score changes |
| VAL-GR-32 | Question/Guided edited after Session start | Snapshot unchanged, safe resume/review |

## 11. Acceptance criteria (Gherkin)

### AC-GR-01 — Teacher authoring
Given Teacher owns a Question in Bank
When Teacher creates Guided with three supported Step types and saves Draft
Then one definition is linked to Question and existing Question Definition is untouched.

### AC-GR-02 — Hint and Retry configured separately
Given Step A has hint=true retry=false, Step B has hint=false retry=true
When Teacher previews and marks Ready
Then both policies are validated, persisted, and Student controls vary per Step.

### AC-GR-03 — Guided-first
Given new Guided session
When GET Session is called before Step completion
Then client receives intro + current Step but **no Final Question prompt, options, answer key, hint, explanation**.
When all Steps are resolved
Then server returns sanitized Final Question prompt and options.

### AC-GR-04 — Immediate feedback, no leak
Given Student submits wrong Step answer
When server evaluates
Then response includes correct=false and retryAvailable based on policy
And excludes expected answer/option key/explanation.

### AC-GR-05 — Retry Step
Given retryEnabled=true and first attempt wrong
When Student retries and answers correctly
Then Step has two attempts, finalCorrect=true, firstCorrect=false
And no Step XP is granted.

### AC-GR-06 — Hint Step
Given hintEnabled=true on active Step
When Student requests Hint twice
Then server returns the same configured Hint and stores only one hintUsed event
And Final Question hintUsed/XP fields remain unchanged.

### AC-GR-07 — Final & XP
Given Student answered Guided Step incorrectly but Final correctly
When Final resolves
Then Question correct/XP is calculated from Final only, independent of Step outcome.

### AC-GR-08 — Final retry
Given Final first answer wrong in LEARNING
When server returns retry
Then correctAnswer remains hidden
And second valid attempt resolves final with existing policy.

### AC-GR-09 — Resume
Given Student used Step Hint and made first wrong attempt with retry available
When page refreshes and GET Session is requested
Then current Step, hintUsed, attemptsUsed=1, retryAvailable remain correct.

### AC-GR-10 — Teacher review
Given Teacher can view Student via authorized class relationship
When Teacher opens Guided Session detail
Then each Step's attempts/hint usage and Final outcome appear
And unauthorized Teacher receives forbidden.

### AC-GR-11 — Version immutability
Given Guided Session started
When Teacher modifies Guided Definition/Question
Then running Session remains unchanged; new start only uses Ready matching revision.

### AC-GR-12 — Regression
Given legacy CLASSIC Activity/Session
When published, started, answered, rewarded and reviewed
Then semantics, XP/streak and historical data remain unchanged.

## 12. Implementation architecture & files

### 12.1. Backend suggested modules

```text
question/guided/
  GuidedDefinition, GuidedDefinitionService,
  GuidedStepSpecMapper, GuidedValidationService
activity/
  practiceType extension + readiness/selection filtering
activitysession/guided/
  GuidedSnapshotAssembler
  GuidedStepProgress, GuidedStepAttempt, GuidedStepHintState
  GuidedStepRuntimeService (submit/hint/gate/idempotency)
  GuidedReviewService
activitysession/
  ActivitySessionService existing: integrate stage gate,
  Final response & XP protection, snapshot boundaries
```

Avoid duplicating `QuestionEngine` grading logic or introducing an extensible Flow Engine v1.

### 12.2. Frontend suggested components

```text
teacher/content/
  QuestionEditor (Main Question / Guided Reasoning tabs)
  GuidedDraftEditor
  PreviewExamDialog (intro → steps → final)
teacher/activities/
  practiceType + Guided-ready pool
student/activities/
  GuidedStepRunner
  GuidedStepFeedback
  GuidedStepHint
  GuidedFinalStage
  GuidedStepReview
teacher/student/
  GuidedSessionReview
```

Student-only visual style remains distinct from Teacher. Use existing primitives/route/service conventions.

### 12.3. Release milestones

| Milestone | Deliverables | Exit gate |
|---|---|---|
| M0 | Characterization tests + contracts + POL-01..10 review | Classic unaffected, agreement on API/security |
| M1 | Definition + Teacher Guided editor, per-Step Hint/Retry | Ready validation, preview guided-first |
| M2 | Activity practiceType + Guided pool readiness/selection | 100% Guided bank allocation |
| M3 | Snapshot + gated public DTO + Step submit/hint/retry + Final | No early Final/answers, atomic resume |
| M4 | Student & Teacher review endpoints/UI | Correct persisted Step/final history, RBAC |
| M5 | E2E, concurrency, security, classic regression | All AC passing |

## 13. Traceability

| SRS | FRS | Acceptance |
|---|---|---|
| SRS-GR-001..003 | FRS-GR-001..006 | AC-GR-01/02 |
| SRS-GR-004..005 | FRS-GR-010..013 | VAL-GR-12..15 |
| SRS-GR-006..008 | FRS-GR-015..024, 027 | AC-GR-03..06/09 |
| SRS-GR-009..010 | FRS-GR-025..027, 030 | AC-GR-07/08/09 |
| SRS-GR-011 | FRS-GR-030..032 | AC-GR-10 |
| SRS-GR-012..013 | FRS-GR-004, 032 | AC-GR-11/12 |

## 14. Evidence and change-control

Checked `main` @ `268bcf0b03cb87e0c72cf14a9d28998698b8421b`:

- `server/src/main/java/e_learning/server/question/engine/core/QuestionEngine.java`
- `server/src/main/java/e_learning/server/activitysession/service/ActivitySessionService.java`
- `server/src/main/java/e_learning/server/activitysession/selection/ActivityQuestionSelectionService.java`
- `server/src/main/java/e_learning/server/activitysession/snapshot/ActivityQuestionSnapshotAssembler.java`
- `server/src/main/java/e_learning/server/student/service/teacher/TeacherStudentLearningService.java`
- `server/src/main/java/e_learning/server/common/config/SecurityConfig.java`
- `client-e-learning/src/components/features/student/activities/practice-runner.tsx`
- `client-e-learning/src/components/features/student/activities/practice-result.tsx`

**Changes from FRS v1.0:** old DEC-04 (Final prompt shown first) replaced by DEC-04 revised; old “Step submit once / no Step Hint or Retry” abolished; per-Step hint/retry attempts, state machine, APIs, persistence, validation and QA added. **Only documents committed; no application code implementation included.**
