# 08 — Student Assignment Attempt: Nghiệp vụ, Schema và Teacher Analytics

**Trạng thái:** ACTIVE SPECIFICATION — runtime implementation đang triển khai từng lát cắt  
**Nhánh:** feature/student-assignment-attempt  
**Phạm vi:** Phase 7B — Student làm Assignment chính thức  
**Session policy:** ADR 0027 — Single Active Tab with Resumable AssessmentAttempt

## 1. Mục tiêu
AssessmentAttempt là runtime chính thức cho Student làm Assignment. Một Attempt phải có đủ dữ liệu để resume, submit/timeout và chấm bài độc lập với Assignment authoring hiện tại.

Nguyên tắc:
- Một Student chỉ thuộc một ACTIVE class tại một thời điểm.
- Một (assignment_id, student_id) chỉ có một Attempt chính thức.
- Whole-attempt timer lưu bằng phút trong time_limit_minutes; không lưu thời gian từng câu.
- Snapshot bất biến cho composition/settings/question.
- Autosave chống stale overwrite bằng revision.
- Một active browser tab có quyền thao tác tại một thời điểm.
- Tab khác bị từ chối ngay; không queue, không chờ và không tự takeover.
- Stable credential được lưu bền vững; backend không được âm thầm thay credential.
- Không dùng heartbeat/stale timeout/takeover trong MVP.
- Event log chỉ ghi TAB_HIDDEN/FULLSCREEN_EXIT; event không phải bằng chứng gian lận.
- XP, badge, ranking, manual grading và advanced analytics ngoài MVP.

## 2. Business rules

### BR-01 — Student chỉ có một ACTIVE class
Backend xác định ACTIVE class và snapshot class_id_at_start/class_name_at_start; client không tự chọn class attribution.

### BR-02 — Một Attempt chính thức
Unique constraint (assignment_id, student_id) bảo đảm một Attempt.
- Chưa có Attempt → tạo.
- IN_PROGRESS + cùng credential + chưa hết deadline → resume.
- Credential khác → SESSION_CONFLICT.
- Credential mất → SESSION_LOST; không silent takeover.
- SUBMITTED/TIMED_OUT → không tạo Attempt mới.
- Nếu quá deadline, runtime hiện tại trả TIME_UP; auto-submit/finalization là lát cắt chưa hoàn tất.

### BR-03 — Lifecycle
IN_PROGRESS → SUBMITTED hoặc TIMED_OUT. is_late là metadata, không phải lifecycle state.

### BR-04 — Single active tab/session
active_session_id là stable logical credential, không phải lease có thời hạn.
- Frontend dùng Web Locks API với ifAvailable=true.
- Backend xác minh Student + target + credential + state + deadline.
- Không có heartbeat, stale takeover hoặc AttemptSession table trong MVP.
- Nếu credential/site data bị xóa, không cấp credential mới một cách âm thầm.

### BR-05 — Whole-attempt timer
- time_limit_minutes áp dụng cho toàn Attempt, theo đơn vị phút.
- started_at/deadline_at do server quyết định; deadline_at = started_at + time_limit_minutes phút.
- Refresh/đóng tab/mất mạng không dừng timer; resume không reset deadline.
- assignments.due_at là due policy riêng, không phải timer runtime.
- Late submission được chấp nhận và không bị trừ điểm.

### BR-06 — Autosave và revision
Mỗi AttemptQuestion có tối đa một Answer hiện hành. Backend phải kiểm tra revision/concurrency và không cho request stale overwrite answer mới hơn. Chưa triển khai trong lát cắt này.

### BR-07 — Snapshot bất biến
Snapshot gồm Composition/Sections/thứ tự, blocks, Question payload, points/example flags, settings, timer và schema version. question_snapshot lưu student projection và grading snapshot riêng; API đang trả riêng student projection.

### BR-08 — Score/answer visibility
show_score_after_submit và show_answers_after_submit là policy độc lập. Runtime active không được trả answer keys, accepted answers, grading internals hoặc hidden explanation.

### BR-09 — Auto grading
Grading dự kiến qua Question Engine từ snapshot; tổng điểm lưu trên Attempt, chi tiết trên AttemptPartResult. Submit/timeout grading chưa triển khai.

### BR-10 — Attempt events
V1 chỉ dùng TAB_HIDDEN và FULLSCREEN_EXIT. SESSION_TAKEOVER không được phát sinh trong MVP.

## 3. Schema

### 3.1 assessment_attempts
Core: id, assignment_id, student_id, class_id_at_start, class_name_at_start, status, started_at, submitted_at, timed_out_at, time_limit_minutes, deadline_at, total_possible_points, total_earned_points, percentage_score, is_late, active_session_id, last_activity_at, document_snapshot, settings_snapshot, snapshot_version and timestamps.

Indexes: student/status, assignment/status, class/status and partial deadline for IN_PROGRESS. Unique (assignment_id, student_id).

### 3.2 assessment_attempt_questions
attempt_id, assignment_item_id, question_id, section_key, section_title, position, question_snapshot, possible_points, is_required, is_example, snapshot_version and timestamps. position is runtime order, not authoring order.

### 3.3 assessment_attempt_answers
attempt_question_id, answer_payload, normalized_value, revision, saved_at and timestamps. Unique attempt_question_id.

### 3.4 assessment_attempt_part_results
attempt_question_id, part_key, status, earned_points, possible_points, snapshot_version, normalizer_version, grading_version and timestamps.

### 3.5 assessment_attempt_events
attempt_id, event_type, occurred_at, active_session_id, metadata. Runtime emits TAB_HIDDEN/FULLSCREEN_EXIT only.

## 4. Teacher analytics requirements
Schema should eventually support Assignment-, Class-, Student- and Question-level basic metrics from persisted attempts/results. Teacher report UI and advanced question-quality warnings are deferred.

## 5. Ngoài scope
- XP/badge/ranking, per-question timing, manual grading, AttemptSession table, device audit, heartbeat/stale takeover, advanced analytics and question-quality warnings.

## 6. Use cases
- Start: validate published Assignment, active Student/class, class target and start_at; create one Attempt with server-generated deadline and immutable snapshot.
- Resume: validate same session credential; never replace it; keep deadline unchanged.
- Autosave: validate session/state/deadline/revision and acknowledge only after persistence.
- Submit/timeout: finalize and grade from immutable snapshots, idempotently. Not yet implemented.
- Events: record lightweight visibility events only.

## 7. Implementation order
1. V43 remains immutable; V45 migrates Attempt timer column to minutes.
2. Align JPA entity/repositories.
3. Implement start/resume + active-class authorization.
4. Build immutable Composition/settings/question snapshots and student-safe projection.
5. Implement answer autosave/revision/idempotency.
6. Implement submit/timeout finalization and grading.
7. Implement events and result visibility.
8. Add Assignment authoring hard-lock.
9. After runtime stabilizes, build Teacher Analytics UI.

## 8. Current status
The initial start/resume/snapshot slice is present but unverified. Autosave, submit, timeout auto-submit, grading, authoring hard-lock and full question-type/POOL integration remain incomplete. No current-HEAD build/test/Flyway/E2E verification is claimed.
