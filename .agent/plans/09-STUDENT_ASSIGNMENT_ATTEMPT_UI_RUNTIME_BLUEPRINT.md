# 09 — Student Assignment Attempt UI & Runtime Blueprint

**Trạng thái:** APPROVED PLAN — sẵn sàng triển khai theo Sprint
**Nhánh:** `feature/student-assignment-attempt`
**Nhánh gốc:** `refactor/teacher-content-ui-routing`
**Phase:** 7B — Student làm Assignment chính thức
**Reference UI:** `XuanDongVo/assignment-studio`

## 1. Mục tiêu

Xây Student Assignment Attempt runtime bằng cách lấy **UI/interaction patterns** từ `assignment-studio`, nhưng triển khai lại theo kiến trúc E-Learning hiện tại.

Không copy nguyên `ExamPlayer.tsx` hoặc `player.ts`. `assignment-studio` là reference cho UX, state flow và failure handling; E-Learning giữ backend-authoritative runtime với `AssessmentAttempt`.

### Canonical runtime

```text
Assignment
  -> AssessmentAttempt
      -> document/settings snapshot
      -> AttemptQuestion snapshot
      -> Answer + revision
      -> PartResult
      -> AttemptEvent

Student UI
  -> AssignmentAttemptPage
      -> Intro / Resume
      -> Active Player
          -> Header
          -> Timer
          -> Save Status
          -> StudentPaper / QuestionRenderer
          -> Submit
      -> Result
```

### Quyết định bắt buộc

- Một Student chỉ có một ACTIVE class; backend snapshot `class_id_at_start`/`class_name_at_start`.
- Một `(assignment_id, student_id)` chỉ có một official Attempt.
- Whole-attempt timer; không lưu per-question timing.
- Server quyết định `deadline_at`; client chỉ hiển thị countdown.
- Autosave theo Question, revision-protected, server-confirmed.
- `active_session_id` là single-writer control.
- `TAB_HIDDEN`, `FULLSCREEN_EXIT`, `SESSION_TAKEOVER` chỉ là lightweight visibility/session events, không phải bằng chứng gian lận.
- `show_score_after_submit` và `show_answers_after_submit` độc lập và backend-enforced.
- Auto-grade từ snapshot; không manual grading MVP.
- XP/badge/ranking và advanced analytics không nằm trong runtime này.
- i18n phải được đưa vào ngay Sprint 1; không hard-code UI/error text tiếng Việt.

---

## 2. `assignment-studio` → E-Learning mapping

| `assignment-studio` | Vai trò/reference | E-Learning target | API/entity | Sprint |
|---|---|---|---|---|
| `src/attempts/components/ExamPlayer.tsx` | Main orchestration: intro, active, timer, save, submit, result | `AssignmentAttemptPage.tsx` + `AssignmentAttemptPlayer.tsx` | `AssessmentAttempt` | S1–S4 |
| `src/attempts/player.ts` | Client runtime/state machine, autosave, heartbeat, retry | `useAssignmentAttempt.ts` + `useAttemptAutosave.ts` + `useAttemptSession.ts` | Attempt runtime DTO, Answer revision, session | S1–S4 |
| `src/attempts/components/StudentPaper` | Student paper/question rendering | `StudentPaper` / existing Question Engine rendering layer | `question_snapshot`, composition snapshot | S1 |
| `src/attempts/components/ResultView.tsx` | Post-submit result presentation | `AssignmentAttemptResult.tsx` | result DTO + visibility policy | S4 |
| `src/attempts/components/TestTools.tsx` | Prototype/test utilities | **Do not port to production runtime** | — | — |
| `src/attempts/api.ts` | Local/mock API boundary | `assessmentAttemptApi.ts` / real HTTP client | Spring Boot endpoints | S1–S4 |
| `src/attempts/rules.ts` | Runtime business-rule reference | Backend `AssessmentAttemptService` + domain rules | `AssessmentAttempt` | S1–S4 |
| `src/attempts/types.ts` | Client DTO/state types | `assessmentAttempt.types.ts` | API contract | S1 |
| `useRemaining()` pattern | Server-clock countdown | `useAttemptTimer.ts` | `serverNow`, `deadlineAt` | S3 |
| `useLeaveGuard()` pattern | Visibility/fullscreen UX | `useAttemptVisibility.ts` | AttemptEvent | S5 |
| `SyncBadge` | Saved/saving/pending/failed UX | `AssignmentAttemptSaveStatus.tsx` | Answer revision response | S2 |
| `Elsewhere` | Single-writer conflict screen | `AssignmentAttemptSessionConflict.tsx` | `active_session_id` / session claim | S3 |
| Submit dialog/unsynced flow | Flush then submit | `AssignmentAttemptSubmitDialog.tsx` | save + submit endpoints | S4 |

### Những phần KHÔNG copy

1. Local/mock DB/API trong `api.ts`.
2. Hard anti-cheat behavior trong reference UI.
3. Client-only timer authority.
4. Client-only session ownership.
5. `localStorage/sessionStorage/BroadcastChannel` như nguồn sự thật nghiệp vụ.
6. Hard-coded Vietnamese strings.

Browser APIs chỉ được dùng để cải thiện UX; server vẫn là authority.

---

## 3. Screen inventory

### A. Intro / Start

**Route:** `/student/assignment-attempts/:attemptId` hoặc route runtime canonical đã có trong frontend routing; không tạo route authoring mới.

**Component:**

```text
AssignmentAttemptPage
└── AssignmentAttemptIntro
    ├── AssignmentSummary
    ├── AttemptPolicySummary
    ├── DueDate
    ├── TimeLimit
    ├── ResumeNotice
    └── Start/ResumeButton
```

**State:**
- assignment title/grade
- question count
- time limit
- due date
- attempt status
- remaining time/deadline
- canStart/reason
- session state

**API:**
- open/read runtime entry
- start/create-or-resume
- claim active session

**Rules:**
- `IN_PROGRESS` → Resume.
- `SUBMITTED`/`TIMED_OUT` → Result.
- quá due → vẫn theo backend due policy; `is_late` được server tính.
- client không tự chọn class.

---

### B. Active Attempt Player

**Component:**

```text
AssignmentAttemptPlayer
├── AssignmentAttemptHeader
│   ├── Title
│   ├── Progress
│   ├── SaveStatus
│   ├── Timer
│   └── SubmitButton
├── RuntimeAlert
└── StudentPaper
    └── QuestionRenderer
```

**State:**
- immutable runtime snapshot
- current answer values
- answer local revision
- server answer version
- save state
- session ownership
- server clock offset
- deadline
- submit/finalizing state

**API:**
- save answer
- heartbeat
- refresh runtime
- session claim/takeover

**Rules:**
- `Saved` chỉ hiện sau server confirmation.
- stale revision không được overwrite server answer.
- session conflict → read-only/conflict UI.
- deadline → stop editing và để server finalize.

---

### C. Session Conflict / Elsewhere

**Component:** `AssignmentAttemptSessionConflict`

**Trigger:** `SESSION_CONFLICT` / active writer khác.

**Actions:**
- Return to Student list.
- Retry/claim khi session cũ stale.

**Không:**
- tự ghi đè session khác.
- tự xóa attempt.

---

### D. Submit Confirmation

**Component:** `AssignmentAttemptSubmitDialog`

**Flow:**

```text
Submit click
  -> flush pending answers
  -> if unsynced > 0: warn
  -> confirm
  -> server submit
  -> grading
  -> Result
```

**UI state:**
- unanswered count
- pending/failed save count
- submitting
- finalizing
- server error

**Backend authority:** submit request phải idempotent; retry không tạo duplicate result.

---

### E. Time Up

Không tạo route riêng.

```text
deadline reached
  -> client locks editing
  -> server timeout/finalize
  -> result state
```

Client không tự chấm hoặc tự quyết định status.

---

### F. Result

**Component:** `AssignmentAttemptResult`

**Data:**
- status
- submitted/timed-out timestamp
- score/percentage nếu được phép
- late state nếu cần
- question/part result nếu policy cho phép
- answer visibility theo `show_answers_after_submit`

**API:** result/read attempt.

**Security:** backend tuyệt đối không trả answer key/accepted answers/explanation trước khi policy cho phép.

---

## 4. Frontend component architecture

```text
client-e-learning/src/
└── features/
    └── student/
        └── assignment-attempt/
            ├── AssignmentAttemptPage.tsx
            ├── AssignmentAttemptIntro.tsx
            ├── AssignmentAttemptPlayer.tsx
            ├── AssignmentAttemptHeader.tsx
            ├── AssignmentAttemptTimer.tsx
            ├── AssignmentAttemptSaveStatus.tsx
            ├── AssignmentAttemptRuntimeAlert.tsx
            ├── AssignmentAttemptSessionConflict.tsx
            ├── AssignmentAttemptSubmitDialog.tsx
            ├── AssignmentAttemptResult.tsx
            ├── hooks/
            │   ├── useAssignmentAttempt.ts
            │   ├── useAttemptAutosave.ts
            │   ├── useAttemptTimer.ts
            │   ├── useAttemptSession.ts
            │   └── useAttemptVisibility.ts
            ├── api/
            │   └── assessmentAttemptApi.ts
            ├── types/
            │   └── assessmentAttempt.types.ts
            └── components/
                └── StudentPaper/
                    └── QuestionRenderer...
```

Nếu Question Engine hiện tại đã có renderer canonical ở vị trí khác, **reuse vị trí hiện tại** thay vì tạo engine thứ hai. Folder trên là ownership target cho attempt orchestration, không phải yêu cầu di chuyển Question Engine.

---

## 5. Backend contract cần chốt trước FE implementation

### Runtime open/start

```text
GET/POST assignment attempt runtime
```

Target semantics:
- authenticate Student
- verify assignment target/access
- find/create official Attempt
- determine ACTIVE class
- create/load immutable snapshots
- claim session
- return server clock
- omit restricted answer data

### Answer save

```text
saveAnswer(
  attemptId,
  attemptQuestionId,
  answerPayload,
  revision/baseVersion,
  activeSessionId,
  requestId
)
```

Response tối thiểu:
- saved revision/version
- serverNow
- normalized value nếu policy cho phép client nhận
- conflict/error code

### Heartbeat/session

```text
heartbeat(attemptId, activeSessionId)
claim/reclaim(attemptId, activeSessionId)
```

### Submit

```text
submit(attemptId, activeSessionId, requestId)
```

Server:
- validate state/session/deadline
- finalize pending server-confirmed answers
- grade snapshot
- write part results
- aggregate score
- set `SUBMITTED` hoặc `TIMED_OUT`
- idempotent retry

### Result

```text
GET /assessment-attempts/:attemptId/result
```

Projection phải enforce score/answer visibility.

### Event

```text
POST /assessment-attempts/:attemptId/events
```

Allowed client events:
- `TAB_HIDDEN`
- `FULLSCREEN_EXIT`

Server-generated:
- `SESSION_TAKEOVER`

---

## 6. Error code contract + i18n

Backend trả **stable code**, không trả UI sentence làm source of truth.

| Code | i18n key |
|---|---|
| `SESSION_CONFLICT` | `assignmentAttempt.errors.sessionConflict` |
| `SESSION_LOST` | `assignmentAttempt.errors.sessionLost` |
| `TIME_UP` | `assignmentAttempt.errors.timeUp` |
| `ATTEMPT_ALREADY_SUBMITTED` | `assignmentAttempt.errors.alreadySubmitted` |
| `ATTEMPT_ALREADY_TIMED_OUT` | `assignmentAttempt.errors.alreadyTimedOut` |
| `FINALIZING` | `assignmentAttempt.errors.finalizing` |
| `VERSION_CONFLICT` | `assignmentAttempt.errors.versionConflict` |
| `INVALID_ANSWER` | `assignmentAttempt.errors.invalidAnswer` |
| `ATTEMPT_ACCESS_DENIED` | `assignmentAttempt.errors.accessDenied` |
| `ATTEMPT_NOT_FOUND` | `assignmentAttempt.errors.notFound` |
| `SAVE_FAILED` | `assignmentAttempt.errors.saveFailed` |
| `NETWORK_ERROR` | `assignmentAttempt.errors.network` |

### Namespace

```text
assignmentAttempt
├── intro
│   ├── title
│   ├── grade
│   ├── questions
│   ├── timeLimit
│   ├── noTimeLimit
│   ├── dueAt
│   ├── overdue
│   ├── resume
│   ├── start
│   └── savedAnswersRestored
├── header
│   ├── progress
│   └── submit
├── timer
│   ├── remaining
│   ├── noLimit
│   └── timeUp
├── save
│   ├── saved
│   ├── saving
│   ├── pending
│   ├── failed
│   ├── retry
│   └── unsyncedCount
├── session
│   ├── conflictTitle
│   ├── conflictDescription
│   ├── retry
│   ├── reclaim
│   └── stale
├── visibility
│   ├── tabHidden
│   ├── fullscreenExit
│   └── continue
├── submit
│   ├── title
│   ├── confirm
│   ├── unanswered
│   ├── pendingSaves
│   ├── failedSaves
│   ├── waitForSave
│   └── cancel
├── result
│   ├── title
│   ├── submitted
│   ├── timedOut
│   ├── score
│   ├── scoreHidden
│   ├── answersShown
│   ├── answersHidden
│   └── late
└── errors
    ├── sessionConflict
    ├── sessionLost
    ├── timeUp
    ├── alreadySubmitted
    ├── alreadyTimedOut
    ├── finalizing
    ├── versionConflict
    ├── invalidAnswer
    ├── accessDenied
    ├── notFound
    ├── saveFailed
    └── network
```

All translations must exist for every supported locale before a screen is considered done. Date/time and number/score formatting must use locale-aware formatters.

---

## 7. Sprint plan

### Sprint 0 — Contract Freeze / Foundation

**Goal:** FE và BE có cùng contract trước khi UI/runtime chạy song song.

**Backend**
- [ ] Verify V43 migration/entities against `08-STUDENT_ASSIGNMENT_ATTEMPT_SPEC.md`.
- [ ] Define runtime DTOs.
- [ ] Define stable error codes.
- [ ] Define answer payload + revision contract.
- [ ] Define submit/result projection security.
- [ ] Define snapshot schema/version.

**Frontend**
- [ ] Define TypeScript runtime DTOs.
- [ ] Define API client boundary.
- [ ] Create `assignmentAttempt` i18n namespace in all supported locales.
- [ ] Define player state machine.
- [ ] Confirm canonical Question Engine/StudentPaper renderer location.

**Exit:** contract review passed; FE can mock runtime against the same DTOs.

---

### Sprint 1 — Start / Resume + Student Paper

**Backend**
- [ ] Implement open/start/resume.
- [ ] Determine ACTIVE class server-side.
- [ ] Build immutable composition/settings/question snapshots.
- [ ] Return runtime projection without restricted answers.
- [ ] Implement initial session claim.

**Frontend**
- [ ] `AssignmentAttemptPage`.
- [ ] `AssignmentAttemptIntro`.
- [ ] `AssignmentAttemptPlayer` shell.
- [ ] Integrate existing StudentPaper/QuestionRenderer.
- [ ] Render Passage/Pool/Media/Instructions from snapshot.
- [ ] Implement question input state locally.
- [ ] Implement i18n from first commit.

**Parallel:** yes. FE can use contract fixtures while BE is being implemented.

**Exit:** Student can open, start/resume and render the exact snapshot composition.

---

### Sprint 2 — Incremental Autosave

**Backend**
- [ ] Save answer endpoint.
- [ ] Active-session validation.
- [ ] Revision/version conflict protection.
- [ ] Idempotent request handling.
- [ ] Persist normalized answer when applicable.
- [ ] Return server confirmation/version.

**Frontend**
- [ ] `useAttemptAutosave`.
- [ ] Per-question debounce.
- [ ] `Saved/Saving/Pending/Failed` status.
- [ ] Retry failed saves.
- [ ] Flush pending saves before submit.
- [ ] Never show `Saved` before server confirmation.

**Exit:** refresh/network retry does not silently lose or overwrite newer server answers.

---

### Sprint 3 — Timer + Session Ownership

**Backend**
- [ ] Server deadline enforcement.
- [ ] Heartbeat.
- [ ] Session stale detection.
- [ ] Safe takeover.
- [ ] `SESSION_TAKEOVER` event.

**Frontend**
- [ ] `useAttemptTimer` using server clock offset.
- [ ] Timer badge/warning states.
- [ ] `useAttemptSession`.
- [ ] `AssignmentAttemptSessionConflict`.
- [ ] Read-only behavior after session loss.
- [ ] Optional browser BroadcastChannel only as UX optimization.

**Exit:** timer survives refresh/offline period; only current session can write.

---

### Sprint 4 — Submit / Timeout / Result

**Backend**
- [ ] Submit transaction.
- [ ] Timeout finalization.
- [ ] Question Engine grading from snapshot.
- [ ] PartResult persistence.
- [ ] Aggregate score.
- [ ] Idempotent submit.
- [ ] Result projection with score/answer visibility.

**Frontend**
- [ ] Submit dialog.
- [ ] Unanswered/pending/failed save warnings.
- [ ] Time-up state.
- [ ] Result screen.
- [ ] Restricted answer rendering.

**Exit:** full happy path + retry + timeout path works end-to-end.

---

### Sprint 5 — Runtime Events / Visibility UX

**Backend**
- [ ] Event endpoint.
- [ ] Persist `TAB_HIDDEN`, `FULLSCREEN_EXIT`.
- [ ] Persist server `SESSION_TAKEOVER`.
- [ ] Ensure events do not modify score/status.

**Frontend**
- [ ] `useAttemptVisibility`.
- [ ] Send event once per transition, not continuously.
- [ ] Warning UX should explain visibility/session state, not accuse cheating.
- [ ] Fullscreen behavior remains product-policy driven; do not copy hard lock behavior from prototype.

**Exit:** teacher-visible lightweight event history exists without turning runtime into an anti-cheat system.

---

### Sprint 6 — Hardening / i18n / Accessibility / Tests

**Backend**
- [ ] Concurrency tests.
- [ ] stale revision tests.
- [ ] duplicate submit tests.
- [ ] timeout boundary tests.
- [ ] session takeover tests.
- [ ] DTO leakage/security tests.

**Frontend**
- [ ] All strings translated.
- [ ] Locale-aware date/time/score.
- [ ] Keyboard navigation.
- [ ] aria labels/live regions for timer/save errors.
- [ ] refresh/reconnect tests.
- [ ] multiple-tab tests.
- [ ] submit with unsynced answers tests.

**Exit:** runtime accepted for Phase 7B MVP.

---

## 8. Backend / Frontend dependency graph

```text
Sprint 0 Contract
       |
       +--------------------+
       |                    |
       v                    v
Backend S1              Frontend S1
Start/Snapshot          Intro/Paper
       |                    |
       +---------+----------+
                 v
          Backend/FE S2
          Autosave/Revision
                 |
                 v
          Backend/FE S3
          Timer/Session
                 |
                 v
          Backend/FE S4
          Submit/Result
                 |
                 v
          Backend/FE S5
             Events
                 |
                 v
             Sprint 6
```

### Parallelization rule

- Sprint 0 must be shared and stable first.
- Sprint 1 FE/BE may run fully in parallel using fixtures.
- Sprint 2 FE/BE may run in parallel once save contract is frozen.
- Sprint 3 depends on session/timer contract, but UI and backend can still develop in parallel.
- Sprint 4 should be integrated end-to-end before Sprint 5.
- Sprint 5 events are intentionally after core runtime; they must not block start/answer/submit.

---

## 9. Acceptance criteria by user flow

### Start
- Student sees assignment metadata and policy in selected locale.
- Start creates/resumes exactly one official Attempt.
- Class attribution is server-side.
- Runtime snapshot is stable.

### Answer
- Every supported Question type renders through canonical Question Engine.
- Passage/Pool/Media references resolve from snapshot.
- Answer edits remain local until autosave confirmation.
- No stale request overwrites newer answer.

### Resume
- Refresh restores server-confirmed answers.
- Timer continues from server deadline.
- Previous session conflict is handled safely.

### Submit
- Pending saves are flushed before submit where possible.
- Failed saves are explicitly shown.
- Submit is idempotent.
- Grading uses snapshot.

### Result
- Score is visible only when policy allows.
- Answers are visible only when policy allows.
- Timeout is distinguishable from normal submit.
- Late status is represented consistently.

### i18n
- No hard-coded user-facing strings in runtime components.
- Backend error codes map to stable translation keys.
- Date/time/score use locale-aware formatting.
- Error, empty, loading, saving, timeout and conflict states are translated.

---

## 10. Definition of Done

Student Assignment Attempt MVP is complete only when:

1. `AssessmentAttempt` is the sole official Assignment runtime aggregate.
2. Start/resume/snapshot works.
3. StudentPaper/QuestionRenderer renders the snapshot composition.
4. Incremental autosave is revision-safe and server-confirmed.
5. Timer is server-authoritative.
6. Single-writer session is enforced.
7. Submit/timeout/grading/result are idempotent and secure.
8. Score/answer visibility policies are backend-enforced.
9. Lightweight runtime events are stored.
10. All runtime UI is multilingual.
11. No second Question Engine is introduced.
12. No per-question timing, XP/badge/ranking, manual grading or advanced analytics are introduced.

## 11. Reference source notes

The reference `assignment-studio` shows the main student orchestration in `src/attempts/components/ExamPlayer.tsx`; its `player.ts` contains client-side phase, autosave, heartbeat, retry and submit coordination. These are reference patterns only. The production implementation must adapt them to E-Learning's `AssessmentAttempt` V43 contract and keep server authority for state, timer, session, grading and visibility.
