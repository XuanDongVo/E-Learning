# 09 — Student Assignment Attempt UI & Runtime Blueprint

**Trạng thái:** APPROVED PLAN — sẵn sàng triển khai theo Sprint
**Nhánh:** `feature/student-assignment-attempt`
**Phase:** 7B — Student làm Assignment chính thức
**Reference UI:** `XuanDongVo/assignment-studio`
**Session policy:** ADR 0027 — Single Active Tab with Resumable AssessmentAttempt

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
- **Một active browser tab có quyền thao tác tại một thời điểm.**
- Tab khác nhận `SESSION_CONFLICT` ngay; không queue, không chờ và không tự takeover.
- Web Locks API là same-browser coordination mechanism; dùng exclusive lock với `ifAvailable` để tránh hàng đợi.
- Stable logical session credential được lưu bền vững để refresh/đóng trình duyệt rồi mở lại có thể resume Attempt cũ.
- Backend xác minh credential trên mọi mutation; browser lock không phải security boundary.
- **Heartbeat, stale-session detection và automatic takeover không thuộc MVP.**
- `TAB_HIDDEN` và `FULLSCREEN_EXIT` chỉ là lightweight visibility events, không phải bằng chứng gian lận.
- `show_score_after_submit` và `show_answers_after_submit` độc lập và backend-enforced.
- Auto-grade từ snapshot; không manual grading MVP.
- XP/badge/ranking và advanced analytics không nằm trong runtime này.
- i18n phải được đưa vào ngay Sprint 1; không hard-code UI/error text tiếng Việt.

---

## 2. `assignment-studio` → E-Learning mapping

| `assignment-studio` | Vai trò/reference | E-Learning target | API/entity | Sprint |
|---|---|---|---|---|
| `src/attempts/components/ExamPlayer.tsx` | Main orchestration: intro, active, timer, save, submit, result | `AssignmentAttemptPage.tsx` + `AssignmentAttemptPlayer.tsx` | `AssessmentAttempt` | S1–S4 |
| `src/attempts/player.ts` | Client runtime/state machine, autosave, retry | `useAssignmentAttempt.ts` + `useAttemptAutosave.ts` + `useAttemptSession.ts` | Attempt runtime DTO, Answer revision, session | S1–S4 |
| `src/attempts/components/StudentPaper` | Student paper/question rendering | `StudentPaper` / existing Question Engine rendering layer | `question_snapshot`, composition snapshot | S1 |
| `src/attempts/components/ResultView.tsx` | Post-submit result presentation | `AssignmentAttemptResult.tsx` | result DTO + visibility policy | S4 |
| `src/attempts/components/TestTools.tsx` | Prototype/test utilities | **Do not port to production runtime** | — | — |
| `src/attempts/api.ts` | Local/mock API boundary | `assessmentAttemptApi.ts` / real HTTP client | Spring Boot endpoints | S1–S4 |
| `src/attempts/rules.ts` | Runtime business-rule reference | Backend `AssessmentAttemptService` + domain rules | `AssessmentAttempt` | S1–S4 |
| `src/attempts/types.ts` | Client DTO/state types | `assessmentAttempt.types.ts` | API contract | S1 |
| `useRemaining()` pattern | Server-clock countdown | `useAttemptTimer.ts` | `serverNow`, `deadlineAt` | S3 |
| `useLeaveGuard()` pattern | Visibility/fullscreen UX | `useAttemptVisibility.ts` | AttemptEvent | S5 |
| `SyncBadge` | Saved/saving/pending/failed UX | `AssignmentAttemptSaveStatus.tsx` | Answer revision response | S2 |
| `Elsewhere` | Single-writer conflict screen | `AssignmentAttemptSessionConflict.tsx` | session credential / Web Lock state | S1/S3 |
| Submit dialog/unsynced flow | Flush then submit | `AssignmentAttemptSubmitDialog.tsx` | save + submit endpoints | S4 |

### Những phần KHÔNG copy

1. Local/mock DB/API trong `api.ts`.
2. Hard anti-cheat behavior trong reference UI.
3. Client-only timer authority.
4. Client-only session ownership.
5. `localStorage/sessionStorage/BroadcastChannel` như nguồn sự thật nghiệp vụ.
6. Heartbeat/stale takeover pattern của reference (explicitly not adopted).
7. Hard-coded Vietnamese strings.

Browser APIs chỉ được dùng để cải thiện UX/coordination; server vẫn là authority.

---

## 3. Screen inventory

### A. Intro / Start

**Route hiện tại:** `/student/assignments/:assignmentId` (`client-e-learning/src/app/[locale]/student/assignments/[assignmentId]/page.tsx`). Đây là official Assignment entry route, không phải route dùng `attemptId` vì Attempt chỉ có sau lần Start đầu tiên.

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
- `GET /v1/assignments/:assignmentId/assessment-attempt/intro` → safe `AttemptIntroResponse` (title, grade, question count, Assignment dueAt, time limit, existing Attempt status)
- `POST /v1/assignments/:assignmentId/assessment-attempt` → start/resume with the stable credential already persisted in IndexedDB

**Rules:**
- `IN_PROGRESS` → Resume.
- `SUBMITTED`/`TIMED_OUT` → Result.
- quá due → vẫn theo backend due policy; `is_late` được server tính.
- client không tự chọn class.
- trước khi start/resume, frontend thử Web Lock với `ifAvailable`; nếu không lấy được lock thì hiển thị conflict ngay và không gửi mutation.

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
- Web Lock ownership
- server clock offset
- deadline
- submit/finalizing state
- durable unsynced draft queue when offline

**API:**
- save answer
- refresh/resume runtime
- submit
- visibility event

**Rules:**
- `Saved` chỉ hiện sau server confirmation.
- stale revision không được overwrite server answer.
- session conflict → read-only/conflict UI.
- mất mạng không tạo session mới; giữ credential và retry synchronization.
- deadline → stop editing và để server finalize.

---

### C. Session Conflict / Elsewhere

**Component:** `AssignmentAttemptSessionConflict`

**Trigger:** `SESSION_CONFLICT` hoặc Web Lock unavailable.

**UI message intent:** bài đang được thao tác trên một màn hình khác; Student quay lại màn hình đang làm bài.

**Actions:**
- Return to Student list.
- Retry opening later after returning to the original tab.

**Không:**
- tự ghi đè session khác.
- tự xóa Attempt.
- chờ trong lock queue.
- tự claim/takeover session.

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

### Runtime intro + start/resume

```text
GET  /v1/assignments/:assignmentId/assessment-attempt/intro
POST /v1/assignments/:assignmentId/assessment-attempt

getIntro(assignmentId, studentId)
startOrResume(assignmentId, studentId, StartOrResumeAttemptRequest)
```

Target semantics:
- authenticate Student
- verify assignment target/access
- find/create official Attempt
- determine ACTIVE class
- create/load immutable snapshots
- register session credential only for a newly created Attempt
- verify existing credential on resume
- return server clock
- omit restricted answer data

**Không trả `active_session_id` trong bất kỳ generic runtime response nào.** Credential do client tạo, lưu bền vững trước request đầu tiên và gửi trong start/resume hoặc mutation request; server chỉ lưu và đối chiếu credential.

### Student Paper / snapshot projection contract

The server may persist the full canonical grading snapshot internally, but `AttemptRuntimeResponse` must carry a separate **student-safe projection**. Do not serialize a raw `QuestionSpec` directly into the public DTO.

Canonical UI composition tree for Sprint 1:

```json
{
  "version": 1,
  "sections": [
    {
      "id": 12,
      "position": 1,
      "title": "Section title",
      "instructions": "Optional instructions",
      "titleVi": "Tiêu đề phần",
      "instructionsVi": "Hướng dẫn",
      "items": [
        {
          "id": 31,
          "position": 1,
          "itemType": "PASSAGE",
          "blockPayload": { "title": "Reading", "text": "..." },
          "children": []
        },
        {
          "id": 32,
          "position": 2,
          "itemType": "QUESTION",
          "questionId": 9,
          "children": []
        }
      ]
    }
  ]
}
```

- Preserve persisted Composition order, parent/child relationships, bilingual section labels and block payloads. The student paper renders from `document.sections[].items[].children`; it resolves Question cards by `assignmentItemId` against `AttemptRuntimeResponse.questions`.
- Each public `questionSnapshot` needs a stable `type`, renderable prompt/content, student-visible choice keys/text, media URLs/alt text when needed, and only the structural fields needed for Matching/Cloze. Omit `correctKey`, `correctKeys`, `expected`, `acceptedAnswers`, `correctEntryId`, hidden explanations and grading/normalizer metadata from the active runtime DTO.
- For Matching, expose only the safe pool reference/choice data needed to select a pool entry. Resolve and validate pool-entry membership on the server when saving/grading; the UI must not be treated as validation.
- `answerPayload` is the student's current saved answer only. It must not be confused with the internal grading snapshot.

### Answer payload → Question Engine adapter contract (owner implementation)

The frontend stores a UI-shaped JSON object. Question Engine handlers expect canonical `RawAnswer.value` types; the runtime service must normalize the public payload at the domain boundary before calling the handler. Based on the current handler signatures:

| Question type | Frontend answer payload | Canonical `RawAnswer.value` expected by current handler |
|---|---|---|
| `SINGLE_CHOICE` | `{ "selectedKey": "A" }` | String choice key |
| `TRUE_FALSE` | `{ "selectedKey": "TRUE" }` or `"FALSE"` | String `TRUE` / `FALSE` |
| `MULTIPLE_CHOICE` | `{ "selectedKeys": ["A", "C"] }` | List of string choice keys |
| `FILL_IN_BLANK`, `TYPE_ANSWER` | `{ "value": "answer" }` | String |
| `MATCHING` (current `MatchingSpec(poolId, correctEntryId)`) | `{ "selectedKey": "entry-id" }` | String pool-entry ID |
| `CLOZE` | `{ "values": { "blank-key": "answer" } }` | Map of blank key to string |

This mapping is a contract, not implemented server logic. Validate exact payload shape, key membership and missing/extra keys server-side. The present Question Engine `MatchingHandler` models one selected pool entry per spec; if a snapshot instead exposes multiple prompts and a `pairs` object, do not silently grade it as that single-entry spec—either reject unsupported structure or agree and implement a canonical compound Matching contract before enabling it.

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

### Session

Không có heartbeat hoặc stale takeover endpoint trong MVP.

Client coordination:

```text
navigator.locks.request(
  `assessment-attempt:<studentId>:<assignmentId>`,
  { ifAvailable: true },
  ...activeAttemptLifetime...
)
```

Server coordination:
- verify stable session credential on every mutation;
- never replace credential because a second tab/device asks for access;
- no automatic takeover based on inactivity.

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

No server-generated `SESSION_TAKEOVER` in MVP.

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
│   └── lost
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

**Backend — controller/contract scaffolding created; business logic intentionally left to owner**
- [x] Define safe `AttemptIntroResponse` and `StartOrResumeAttemptRequest` DTOs.
- [x] Add controller method shells for intro and start/resume.
- [x] Add service method shells `getIntro` and `startOrResume`; they intentionally throw `UnsupportedOperationException` until owner implementation.
- [ ] Owner implements Student/Assignment authorization, scheduling/target rules, ACTIVE-class attribution, one-attempt concurrency, stable credential verification, immutable snapshot assembly and answer-safe projection.

**Frontend — scaffold implemented, runtime not verified**
- [x] Dynamic route `/student/assignments/:assignmentId` and Intro/Player shell.
- [x] Intro metadata API contract; Intro remains usable with fallback ID when the backend stub is not implemented.
- [x] Web Lock with `ifAvailable: true`; conflict/unsupported-browser states.
- [x] IndexedDB stable UUID credential persisted before the start/resume request.
- [x] Student Paper renderers for common choices, text answers, Matching/Cloze, plus composition block renderers for Instructions/Passage/Pool/Media.
- [x] English/Vietnamese strings and warning when the Sprint 1 local draft is not saved.
- [ ] Connect against owner-implemented server methods, run frontend lint/test/typecheck/build and browser checks; verify the real snapshot shape against Student Paper.

**Scope boundary:** no answer autosave in Sprint 1; answer edits are page-local and the UI explicitly warns that refresh/close loses them. Autosave/outbox is Sprint 2. Server business logic is deliberately not implemented by the assistant at this stage.

**Exit:** not achieved until the owner-implemented server contract is integrated and Start/Resume/snapshot + second-tab behavior is tested end-to-end.

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
- [ ] Durable unsynced draft queue for network interruption.
- [ ] Flush pending saves before submit.
- [ ] Never show `Saved` before server confirmation.

**Exit:** refresh/network retry does not silently lose or overwrite newer server answers.

---

### Sprint 3 — Timer + Single Active Tab Recovery

**Backend**
- [ ] Server deadline enforcement.
- [ ] Stable session credential validation.
- [ ] Reject second tab/device without replacing active credential.
- [ ] Session-lost/recovery-required response when credential is unavailable.
- [ ] No heartbeat, stale threshold or automatic takeover in MVP.

**Frontend**
- [ ] `useAttemptTimer` using server clock offset.
- [ ] Timer badge/warning states.
- [ ] `useAttemptSession` around Web Lock + IndexedDB credential.
- [ ] `AssignmentAttemptSessionConflict`.
- [ ] Read-only behavior after session conflict/loss.
- [ ] Reconnect and browser-reopen recovery.

**Exit:** only the active browser tab can write; refresh/network/browser restart can resume when the logical session credential remains available; another tab never silently takes over.

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
- [ ] Do not emit `SESSION_TAKEOVER` under the MVP policy.
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
- [ ] same-browser multi-tab conflict tests.
- [ ] browser restart/recovery tests.
- [ ] missing/cleared session credential tests.
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
          Timer/Single Tab
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
- Only one browser tab obtains the active Attempt lock.

### Answer
- Every supported Question type renders through canonical Question Engine.
- Passage/Pool/Media references resolve from snapshot.
- Answer edits remain local until autosave confirmation.
- No stale request overwrites newer answer.
- Mutation requires the valid stable session credential.

### Resume
- Refresh restores server-confirmed answers.
- Timer continues from server deadline.
- Browser restart can resume when the credential remains available.
- A second tab does not take over the Attempt.

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
6. Single-active-tab policy is enforced by browser coordination plus server credential validation.
7. Refresh/network/browser restart recovery works when the logical credential remains available.
8. Submit/timeout/grading/result are idempotent and secure.
9. Score/answer visibility policies are backend-enforced.
10. Lightweight runtime events are stored.
11. All runtime UI is multilingual.
12. No second Question Engine is introduced.
13. No per-question timing, XP/badge/ranking, manual grading or advanced analytics are introduced.
14. No heartbeat/stale-session takeover is required for MVP.

## 11. Reference source notes

The reference `assignment-studio` shows the main student orchestration in `src/attempts/components/ExamPlayer.tsx`; its `player.ts` contains client-side phase, autosave, retry and submit coordination. Its heartbeat/session behavior is **not** adopted for E-Learning MVP. The production implementation must adapt the useful UX/state patterns to E-Learning's `AssessmentAttempt` V43 contract and keep server authority for state, timer, session, grading and visibility.
