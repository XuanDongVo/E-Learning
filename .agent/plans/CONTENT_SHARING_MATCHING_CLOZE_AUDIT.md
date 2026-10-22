# Audit và kế hoạch sửa: Content Sharing, MATCHING, CLOZE

**Ngày audit:** 2026-10-21  
**Nhánh:** `refactor/teacher-content-ui-routing`  
**Phạm vi:** đọc tĩnh code backend/frontend và tài liệu liên quan; chưa thực thi build, migration hoặc browser E2E.

## 1. Kết luận điều hành

**Chưa nên coi Content Sharing + MATCHING/CLOZE là vertical slice hoàn chỉnh.** Code đã có Composition tree, Content Block payload, QuestionSpec compound, handler chấm điểm và frontend serializer cho definition; nhưng mô hình group và semantic references chưa được biểu diễn đầy đủ, Matching còn dùng text làm khóa, Cloze chưa bảo đảm cấu trúc segment/blank nhất quán, và các tài liệu kiến trúc đang mâu thuẫn với code hiện tại.

Không khuyến nghị sửa schema trước khi thống nhất hợp đồng dưới đây. Sau khi hợp đồng được chấp nhận, triển khai theo thứ tự: contract → migration/backend → adapter/persistence → UI → preview/runtime/snapshot → tests.

## 2. Phạm vi đã kiểm tra

- `server/src/main/java/e_learning/server/assignment/entity/AssignmentItem.java`
- `server/src/main/java/e_learning/server/assignment/service/AssignmentCompositionService.java`
- `server/src/main/java/e_learning/server/assignment/dto/CompositionItemRequest.java`
- `server/src/main/java/e_learning/server/assignment/dto/CompositionItemResponse.java`
- `server/src/main/resources/db/migration/V33__create_assignment_composition.sql`
- `server/src/main/java/e_learning/server/question/dto/QuestionWriteRequest.java`
- `server/src/main/java/e_learning/server/question/dto/QuestionDefinitionRequest.java`
- `server/src/main/java/e_learning/server/question/service/QuestionSpecRequestFactory.java`
- `server/src/main/java/e_learning/server/question/engine/types/compound/MatchingSpec.java`
- `server/src/main/java/e_learning/server/question/engine/types/compound/MatchingHandler.java`
- `server/src/main/java/e_learning/server/question/engine/types/compound/ClozeSpec.java`
- `server/src/main/java/e_learning/server/question/engine/types/compound/ClozeHandler.java`
- `server/src/test/java/e_learning/server/question/engine/types/compound/CompoundQuestionHandlerTest.java`
- `client-e-learning/src/types/assignment-builder.ts`
- `client-e-learning/src/services/assignment/assignment-composition.service.ts`
- `client-e-learning/src/services/assignment/assignment-question-persistence.service.ts`
- `.agent/decisions/0024-assignment-composition.md`
- `.agent/architecture/assignment-composition-v1.md`
- `.agent/architecture/question-engine-v1.md`
- `.agent/domain/question-model.md`
- `.agent/plans/P0_ASSIGNMENT_QUESTION_COMPOSER_FIX.md`

## 3. Phát hiện theo mức độ ưu tiên

### P0 — Cần chốt trước khi mở rộng tính năng

#### P0.1 — Chưa có Content Sharing container thực sự

**Hiện trạng**
- V33 constraint chỉ cho `QUESTION`, `INSTRUCTIONS`, `PASSAGE`, `MEDIA`, `POOL`.
- Composition service chỉ cho PASSAGE/POOL có Question con.
- DTO chỉ biểu diễn cây `children`, không có liên kết Question–Block riêng.

**Vấn đề**
Một Question chỉ có một `parent_item_id`, nên không thể vừa thuộc group UI vừa tham chiếu cả Passage lẫn Pool theo nghĩa dữ liệu. Membership và semantic reference không đồng nghĩa.

**Đề xuất**
- Thêm container `CONTENT_SHARING`.
- Container có ordered members gồm Question items và Content Blocks; không cho group lồng group.
- Thêm quan hệ rõ ràng `QuestionItem → ContentBlock` với `role` (ví dụ `PASSAGE`, `ANSWER_POOL`, `INSTRUCTIONS`, `MEDIA`).
- V1 giới hạn mọi entity liên quan trong cùng Assignment và Section.
- Giữ unique `(assignment_id, question_id)`: một Question chỉ có một placement trong Assignment.
- API trả về membership tree và references; frontend không tự suy diễn semantic link từ parent/groupId.

**Cần cập nhật**
- Migration mới, không sửa V33/V34.
- Entity/repository/DTO/service validation.
- Frontend builder types, mapper, serializer, group operations và preview.
- Snapshot/runtime resolver để đóng băng block payload và references.

#### P0.2 — Matching dùng text làm identity, không dùng entry ID

**Hiện trạng**
- `MatchingSpec.answerPool` là `List<String>`.
- `expectedPairs` là `Map<String,String>` với value là text answer.
- Frontend có ID cho pool entries nhưng persistence lại gửi text; tìm correctAnswerId bằng so sánh text.
- `poolId` và `correctEntryId` trong frontend không tạo thành API contract thật.
- `shuffleAnswers` gửi lên nhưng không có trường tương ứng trong `QuestionDefinitionRequest.Matching` và `MatchingSpec`.

**Tác động**
- Hai entry cùng text không phân biệt được.
- Sửa text có thể phá mapping đáp án đúng.
- Không thể bảo đảm liên kết tới shared POOL block.
- Shuffle setting mất sau round-trip.

**Đề xuất**
- Mỗi pool entry có `stable key/id` và text.
- Mỗi matching row có stable key.
- Correct pair lưu `rowKey → entryKey`, tuyệt đối không dùng text làm khóa.
- Shared pool được tham chiếu qua Composition reference có role `ANSWER_POOL`; kiểm tra mọi expected entry key tồn tại trong pool đã gắn.
- Quyết định rõ có cho một entry dùng nhiều lần hay không. Nếu không, validator từ chối mapping trùng; nếu có, test và UI phải nói rõ.
- Đưa `shuffleAnswers` vào canonical spec/request/response nếu vẫn là cài đặt sản phẩm; nếu không, loại bỏ khỏi UI type.

#### P0.3 — Cloze không bảo đảm cấu trúc segment/blank

**Hiện trạng**
- `ClozeSpec` có hai list độc lập `segments` và `blanks`.
- Handler chỉ yêu cầu cả hai không rỗng, key blank duy nhất và ít nhất một accepted answer.
- Test hiện tại tạo hai blanks với một segment.
- Frontend tái dựng prompt bằng cách nối segment và placeholder theo index.

**Tác động**
Số blank thực tế hiển thị có thể khác số blank được chấm; reorder/edit có thể gán sai answer vào vị trí.

**Đề xuất**
- Invariant bắt buộc: `segments.size() == blanks.size() + 1`; mỗi blank key duy nhất, ổn định, acceptedAnswers có ít nhất một giá trị không rỗng.
- Dùng canonical ordered sequence hoặc cặp segments/blanks có contract chính thức; không dùng prompt string làm nguồn sự thật thứ hai.
- Validator client và server dùng cùng quy tắc.
- Nếu Cloze dùng Passage trong Content Sharing, link tới Passage phải là Composition reference rõ ràng. Không nhúng ID Assignment-specific block vào Question Bank QuestionSpec.
- Thêm tests cho mismatch count, blank key duplicate, empty alternatives, blank unanswered, normalization, case-sensitive và round-trip.

### P1 — Cần xử lý trong cùng vertical slice

#### P1.1 — Tài liệu cũ mâu thuẫn code

Tài liệu Composition nói DTO/factory chưa hỗ trợ Matching/Cloze, nhưng code hiện có `QuestionWriteRequest.definition`, `QuestionDefinitionRequest` và factory cho hai type. Cập nhật tài liệu không được đồng nghĩa với kết luận tính năng đã hoàn chỉnh.

#### P1.2 — Validate POOL payload chưa đủ

Backend chỉ kiểm tra entries là list không rỗng và mỗi entry có text; chưa bắt buộc ID/key duy nhất. Bổ sung ID ổn định, uniqueness, trim/empty validation, và bảo đảm các reference tới entry hợp lệ.

#### P1.3 — Save có thể thành công một phần

Frontend persist các Question trước rồi mới PUT Composition. Hai thao tác không nằm trong một transaction chung. Nếu Composition PUT lỗi, Question có thể đã thay đổi trong khi group/reference chưa được cập nhật. Cần error UX, retry/idempotency và kiểm thử phục hồi; về lâu dài cân nhắc API command phía server hoặc draft-save strategy nếu cần tính nguyên tử.

#### P1.4 — Validation Composition chưa diễn đạt group semantics

Cần kiểm tra cùng Assignment/Section, loại con hợp lệ, group không lồng group, block role tương thích, không có reference mồ côi, không lặp membership, không lặp position, và khi unlink/delete thì hành vi dữ liệu được định nghĩa.

#### P1.5 — Scoring hiện mới có equal-split

Handler Matching/Cloze chia điểm đều theo part và trả scoreFraction; điều này phù hợp default cơ bản. Tuy nhiên hợp đồng ADR 0026 cho phép teacher override điểm part trong Composition. Chưa thấy allocation theo part được biểu diễn trong các DTO Composition đang audit. Cần thêm `partKey → possiblePoints`, validate tổng bằng điểm Question, snapshot và analytics. Không triển khai override bằng cách thay đổi QuestionSpec canonical.

## 4. Mô hình mục tiêu đề xuất

```text
Section
├── Question Q0                         (độc lập)
└── Content Sharing Group G1
    ├── PASSAGE block P1
    ├── POOL block A1
    ├── Question Q1
    └── Question Q2

References:
Q1 --PASSAGE----> P1
Q1 --ANSWER_POOL-> A1
Q2 --PASSAGE----> P1
```

- Membership quyết định vị trí UI và thứ tự.
- Reference quyết định Question sử dụng Block nào.
- Block thuộc Assignment, không dùng chung xuyên Assignment trong v1.
- Question canonical vẫn tái sử dụng được; Assignment-specific references chỉ nằm trong Composition.
- Snapshot resolve toàn bộ membership, block payload và references thành cấu trúc bất biến cho attempt.

## 5. Contract cần hoàn thành

### Content Sharing
- `CONTENT_SHARING` container có ID ổn định, title/label tùy chọn, position và ordered members.
- Members được giới hạn theo role; group không được lồng group.
- Question membership không tự sinh references.
- Reference record tối thiểu: `questionItemId`, `blockItemId`, `role`; uniqueness phù hợp để tránh duplicate reference.
- GET/PUT Composition round-trip giữ nguyên ID, order, membership, references, payload.
- Xóa block đang được tham chiếu bị chặn cho đến khi references được sửa hoặc gỡ tường minh.

### Matching
- `item.key` ổn định.
- `answerPoolEntry.key` ổn định và duy nhất.
- `expectedPairs` lưu entry key, không lưu text.
- Nếu dùng shared POOL, entry keys phải tương thích với pool đã liên kết.
- `shuffleAnswers` có contract end-to-end hoặc bị loại bỏ.
- Quy tắc entry reuse được quyết định và kiểm tra.

### Cloze
- `segments = blanks + 1`.
- Blank keys duy nhất và ổn định.
- Mỗi blank có ít nhất một accepted answer không rỗng.
- Blank ordering không bị suy ra từ text; save/reload không đổi association.
- Normalization/case policy được snapshot.
- Reference tới shared Passage nằm trong Composition, không nằm trong QuestionSpec bằng ID DB.

## 6. Lộ trình thực hiện

1. **Contract freeze:** xác nhận schema DTO cho Content Sharing group, reference roles, Matching stable keys và Cloze invariants.
2. **Migration + backend:** migration mới sau khi xác minh migration cao nhất; cập nhật constraints, entities, repositories, Composition DTO/service, validators, POOL IDs và tests.
3. **Question write/read adapter:** Matching/Cloze create/update/read giữ nguyên canonical definition; không làm mất shuffle/key/accepted alternatives.
4. **Frontend Builder:** group create/edit/delete, thêm block và Question, add/remove references, reorder, move in/out group, validate và hiển thị rõ independent vs shared.
5. **Preview/runtime/snapshot:** hiển thị block đúng một lần theo group, resolve đúng Question references, không lộ đáp án trong student payload, freeze cấu trúc ở attempt start.
6. **Scoring/analytics:** part keys ổn định; điểm part mặc định chia đều và override có tổng đúng; lưu kết quả từng part.
7. **Verification:** frontend typecheck/lint/build; backend tests; Flyway fresh DB và DB có dữ liệu; API integration tests; browser E2E create/edit/reorder/move/unlink/delete/reload/failed-save recovery; Matching/Cloze grade/snapshot/reveal tests.

## 7. Acceptance criteria bắt buộc

- Question độc lập hoạt động như trước, không bị ép vào group.
- Group hiển thị block và Questions theo đúng thứ tự sau reload.
- Một Question có thể nằm trong group và tham chiếu cả Passage lẫn Pool.
- Membership không tự động tạo hoặc xóa semantic references.
- Nhiều Questions dùng chung một Block trong cùng Assignment.
- Không thể tham chiếu block của Assignment khác hoặc lưu reference mồ côi.
- Matching giữ stable entry IDs khi sửa text, reorder pool và reload; duplicate text không làm sai đáp án.
- Cloze luôn có số segment bằng số blank cộng một; blank IDs không đổi khi chỉnh sửa nội dung.
- Tất cả QuestionSpec/Block/reference/points được snapshot và không thay đổi trong lịch sử attempt.
- Không tuyên bố xong nếu chỉ có unit tests; cần API integration và browser E2E.

## 8. File liên quan cần cập nhật trong implementation

- `.agent/decisions/0024-assignment-composition.md`
- `.agent/architecture/assignment-composition-v1.md`
- `.agent/architecture/question-engine-v1.md`
- `.agent/domain/question-model.md`
- `AssignmentItem`, Composition request/response/service/repository và migration mới
- `QuestionDefinitionRequest`, MatchingSpec/Handler, ClozeSpec/Handler, factory/mapper và tests
- `client-e-learning/src/types/assignment-builder.ts`
- `client-e-learning/src/services/assignment/assignment-composition.service.ts`
- `client-e-learning/src/services/assignment/assignment-question-persistence.service.ts`
- Builder group editor, Matching/Cloze editor, Student Preview/runtime renderer và snapshot assembler.

**Chưa thực hiện trong commit tài liệu này:** thay đổi schema hoặc application code. Đây là cố ý: phải khóa contract trước khi viết migration/API để tránh thêm một mô hình trung gian không tương thích.
