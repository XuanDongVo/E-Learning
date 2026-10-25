# 08 — Student Assignment Attempt: Nghiệp vụ, Schema và Teacher Analytics

**Trạng thái:** ACTIVE SPECIFICATION — schema/runtime contract đã được chốt để triển khai  
**Nhánh:** `feature/student-assignment-attempt`  
**Nhánh gốc:** `refactor/teacher-content-ui-routing`  
**Phạm vi:** Phase 7B — Student làm Assignment chính thức

> V43 chưa được chạy trên server/database ở thời điểm chốt spec, vì vậy migration V43 được phép chỉnh trực tiếp thay vì tạo V44. Code runtime chưa được coi là hoàn thiện chỉ vì schema đã tồn tại.

## 1. Mục tiêu

`AssessmentAttempt` là runtime chính thức cho Student làm Assignment. Một Attempt phải có đủ dữ liệu để Student tiếp tục làm bài, submit/timeout và chấm bài độc lập với Assignment authoring hiện tại.

Attempt đồng thời phải lưu đủ dữ liệu lịch sử để Teacher có thể phân tích kết quả theo Student và Class.

Nguyên tắc:
- Một Student chỉ thuộc **một ACTIVE class** tại một thời điểm.
- Một `(assignment_id, student_id)` chỉ có một Attempt chính thức.
- Whole-attempt timer; không lưu thời gian từng câu.
- Snapshot bất biến cho composition/settings/question.
- Autosave chống stale overwrite bằng `revision`.
- Một active screen/session có quyền ghi tại một thời điểm.
- Lightweight event log: `TAB_HIDDEN`, `FULLSCREEN_EXIT`, `SESSION_TAKEOVER`.
- Event không phải bằng chứng gian lận.
- XP, badge, ranking, manual grading và advanced analytics ngoài MVP.

## 2. Business rules

### BR-01 — Student chỉ có một ACTIVE class

Hệ thống quy định một Student có tối đa một ACTIVE class membership tại một thời điểm. Khi Student bắt đầu Assignment, backend xác định ACTIVE class và snapshot vào Attempt.

Attempt lưu:
- `class_id_at_start`
- `class_name_at_start`

`class_id_at_start` dùng cho query/report; `class_name_at_start` là historical snapshot. Không cho client tự quyết định class attribution và không cần Attempt ↔ nhiều Class.

### BR-02 — Một Attempt chính thức

Unique constraint `(assignment_id, student_id)` bảo đảm một Student không có nhiều Attempt chính thức.

- Chưa có Attempt → tạo.
- `IN_PROGRESS` → resume.
- `SUBMITTED`/`TIMED_OUT` → không tạo mới.
- Nếu quá deadline → timeout trước khi trả runtime.

### BR-03 — Lifecycle

`IN_PROGRESS → SUBMITTED` hoặc `IN_PROGRESS → TIMED_OUT`.

`is_late` là metadata của due policy, không phải lifecycle state.

### BR-04 — Single writer session

`active_session_id` kiểm soát tab/device được phép ghi.

- Tab đầu tiên được cấp quyền.
- Tab khác không autosave/submit khi session cũ vẫn active.
- Session stale có thể bị takeover.
- Sau takeover, session cũ mất quyền ghi.
- Không tạo `AttemptSession` table trong MVP.

Heartbeat chỉ phục vụ session ownership, không quyết định timer hay điểm.

### BR-05 — Whole-attempt timer

- `time_limit_seconds` áp dụng cho toàn Attempt.
- `started_at`/`deadline_at` do server quyết định.
- Refresh/đóng tab/mất mạng không dừng timer.
- Backend là nguồn sự thật cuối cùng.
- Không lưu time spent theo Question.
- `deadline_at` là runtime timer deadline, khác `assignments.due_at` là Assignment due policy.

### BR-06 — Autosave và revision

Mỗi AttemptQuestion có tối đa một Answer hiện hành. `revision` là revision logic của answer payload. Backend phải kiểm tra revision/concurrency và không cho request stale overwrite answer mới hơn.

Revision không thay thế transaction/locking hoặc active-session check.

### BR-07 — Snapshot bất biến

Khi Attempt bắt đầu, snapshot đủ để dựng lại runtime Assignment, gồm:
- Composition, Sections và thứ tự.
- Instructions, Passage, Answer Pool, Media.
- Question references và thứ tự.
- Question payload cần render/chấm.
- Points, required/example flags.
- Score/answer visibility settings.
- Time limit runtime.
- Snapshot schema/version.
- Normalizer/grading contract version cần cho grading.

`document_snapshot` là snapshot của toàn composition/document. `question_snapshot` là canonical snapshot của từng Question. Hai lớp snapshot có mục đích khác nhau.

### BR-08 — Score/answer visibility

`show_score_after_submit` và `show_answers_after_submit` là hai policy độc lập. Backend không trả restricted answer key/accepted answers/explanation trước thời điểm được phép reveal.

### BR-09 — Auto grading

- Grading qua Question Engine.
- Grading từ snapshot, không lấy Question authoring live.
- Tổng điểm lưu trên Attempt; chi tiết part trên AttemptPartResult.
- Part status: `CORRECT`, `PARTIALLY_CORRECT`, `INCORRECT`, `UNANSWERED`.
- Example items không làm tăng denominator chính thức.
- `normalizer_version` và `grading_version` ghi contract dùng để tính kết quả.
- Không manual grading trong MVP.

### BR-10 — Attempt events

Event log được giữ nhẹ để Teacher biết Student đã rời màn hình hoặc session có takeover.

Event types V1:
- `TAB_HIDDEN` — browser báo tab/window không còn visible.
- `FULLSCREEN_EXIT` — Student rời fullscreen nếu runtime đang yêu cầu fullscreen.
- `SESSION_TAKEOVER` — server ghi nhận session mới takeover session cũ.

Event không phải anti-cheat proof. `TAB_HIDDEN`/`FULLSCREEN_EXIT` là browser/client signals và không tự chứng minh nguyên nhân hay hành vi gian lận.

Không lưu mouse movement, click history, IP/device fingerprint hoặc audit session chuyên sâu.

Teacher có thể hiển thị:

```text
Student A
- Rời màn hình: 2 lần
- Thoát fullscreen: 1 lần
- Session takeover: 0 lần
```

MVP không cần counter denormalized trong `assessment_attempts`; có thể count event theo Attempt. Chỉ thêm counter/aggregation khi scale thực tế yêu cầu.

## 3. Schema

### 3.1 `assessment_attempts`

Core:
- `id`, `assignment_id`, `student_id`
- `class_id_at_start`, `class_name_at_start`
- `status`
- `started_at`, `submitted_at`, `timed_out_at`
- `time_limit_seconds`, `deadline_at`
- `total_possible_points`, `total_earned_points`, `percentage_score`
- `is_late`
- `active_session_id`, `last_activity_at`
- `document_snapshot JSONB`, `settings_snapshot JSONB`
- `snapshot_version`, timestamps

Indexes:
- `(student_id, status)`
- `(assignment_id, status)`
- `(class_id_at_start, status)`
- partial `(deadline_at) WHERE status = 'IN_PROGRESS'`

Constraint: unique `(assignment_id, student_id)`.

### 3.2 `assessment_attempt_questions`

- `attempt_id`, `assignment_item_id`, `question_id`
- `section_key`, `section_title`
- `position`
- `question_snapshot JSONB`
- `possible_points`, `is_required`, `is_example`
- `snapshot_version`, timestamps

Indexes: `(attempt_id, position)` and `(question_id)`.

`position` chỉ là runtime snapshot order, không thay đổi authoring Composition. `section_key`/`section_title` giữ context lịch sử cho Teacher analytics.

### 3.3 `assessment_attempt_answers`

- `attempt_question_id`
- `answer_payload JSONB`
- `normalized_value JSONB`
- `revision`
- `saved_at`, timestamps

Unique `(attempt_question_id)`.

### 3.4 `assessment_attempt_part_results`

- `attempt_question_id`, `part_key`
- `status`, `earned_points`, `possible_points`
- `snapshot_version`
- `normalizer_version`, `grading_version`
- timestamps

Unique `(attempt_question_id, part_key)`.

### 3.5 `assessment_attempt_events`

- `id`, `attempt_id`, `event_type`
- `occurred_at`, `active_session_id`
- `metadata JSONB`

Allowed types: `TAB_HIDDEN`, `FULLSCREEN_EXIT`, `SESSION_TAKEOVER`.

Indexes:
- `(attempt_id, occurred_at)`
- `(event_type, occurred_at)`

## 4. Teacher Analytics requirements

Schema phải hỗ trợ Teacher phân tích ngay cả khi Analytics UI chưa triển khai.

### 4.1 Assignment-level

Có thể tính: số Student được giao, started, completed, in-progress, timeout, late; average/min/max score; score distribution; completion rate.

### 4.2 Class-level

Nhờ `class_id_at_start`, Teacher có thể group Attempt theo Class. Class attribution là snapshot tại thời điểm Attempt bắt đầu; Student chuyển lớp sau đó không làm thay đổi lịch sử Attempt.

### 4.3 Student-level

Teacher có thể xem status, score, started/submitted/timed-out time, late flag và số event `TAB_HIDDEN`, `FULLSCREEN_EXIT`, `SESSION_TAKEOVER`.

### 4.4 Question-level

Dữ liệu AttemptQuestion/PartResult hỗ trợ accuracy theo Question/part, earned/possible points, partial correctness và phân tích answer payload/normalized value khi phù hợp.

Không triển khai advanced question-quality warnings ở bước này.

## 5. Ngoài scope

- XP/badge/ranking.
- Per-question timing.
- Manual grading.
- AttemptSession table.
- Device/session audit chuyên sâu.
- Redis chỉ để lock session.
- Advanced teacher analytics.
- Question-quality warnings.
- Teacher report UI từ dữ liệu thật trong bước schema/runtime này.

Schema vẫn phải bảo toàn khả năng triển khai basic Teacher Analytics sau khi runtime ổn định.

## 6. Use cases

### UC-01 — Start
1. Student mở Assignment.
2. Backend xác thực quyền/target.
3. Backend xác định ACTIVE class duy nhất.
4. Nếu chưa có Attempt, tạo Attempt và snapshot class/composition/settings/questions.
5. Cấp `active_session_id`.
6. Trả runtime DTO không chứa restricted answer data.

### UC-02 — Resume
1. Student mở lại Assignment.
2. Backend tìm `(assignment_id, student_id)`.
3. `IN_PROGRESS` và chưa timeout → resume.
4. Session cũ active → warning/read-only.
5. Session stale → takeover an toàn.

### UC-03 — Autosave
1. Student gửi answer + revision + active session.
2. Backend kiểm tra state/deadline/session/revision.
3. Hợp lệ → lưu.
4. Stale → không overwrite.
5. UI chỉ báo Saved sau server confirmation.

### UC-04 — Submit/timeout
1. Kiểm tra state/session/deadline.
2. Chốt answer đã server-confirmed.
3. Grade từ snapshot.
4. Lưu AttemptPartResult.
5. Tính tổng điểm.
6. Đổi status `SUBMITTED` hoặc `TIMED_OUT`.
7. Retry không tạo Attempt mới và không tạo duplicate grading result.

### UC-05 — Runtime events
Client có thể gửi `TAB_HIDDEN`/`FULLSCREEN_EXIT`. Server ghi event gắn với Attempt/session.

Server tự ghi `SESSION_TAKEOVER` khi takeover xảy ra.

Event không thay đổi score và không tự động đánh dấu gian lận.

## 7. Implementation order

1. Finalize V43 schema.
2. Align JPA entities/repositories.
3. Implement start/resume + class attribution.
4. Implement immutable composition/question snapshot.
5. Implement active session + heartbeat/takeover.
6. Implement autosave + revision/concurrency.
7. Implement submit/timeout + grading.
8. Implement runtime event recording.
9. Implement Student result visibility.
10. Sau runtime ổn định mới xây Teacher Analytics UI.

## 8. Definition of Done — schema foundation

- V43 có class attribution snapshot.
- V43 có full document/settings snapshot.
- AttemptQuestion có section context.
- AttemptQuestion có question lookup index.
- Answer có revision.
- PartResult có normalizer + grading version.
- Attempt có deadline partial index.
- Event table có 3 event types nhẹ.
- JPA entities khớp migration.
- Teacher analytics có thể group theo assignment/class/student từ runtime data.
- Không yêu cầu nhiều class cho một Student.
- Không có per-question timing.
- Không có XP/badge/ranking.

## 9. Trạng thái triển khai

Schema/entity skeleton là **design foundation**, chưa phải runtime hoàn chỉnh. `AssessmentAttemptService` vẫn cần triển khai business rules, concurrency, snapshot building, grading, timeout và DTO security theo specification này.
