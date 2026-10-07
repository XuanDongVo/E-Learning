# Intent 0001 — Core platform

Version: 1.1 — **ACCEPTED by the owner on 2026-10-07** (non-blocking questions remain in [`open-questions.md`](./open-questions.md))
Date: 2026-10-07
Owner: project owner (product owner)
Sources: the repo docs (ADR 0001–0003, phase specs), and the owner's 20 product answers of 2026-10 (see §6).

> Intent says **what and why**. It does not say how. Rules, entities and endpoints live in `domain/`, `plans/` and `architecture/`.
> If this file and an accepted ADR disagree, the ADR wins.

## 1. Problem and goal

**Priority #1 (owner, 2026-10-07): give out work and see who has completed it.** Practice, games and weak-area insight support that goal; they do not replace it.

An English teacher (Grades 6–8) needs one place to:

1. keep reusable learning content (Unit → Section → Topic → QuestionBank → Question),
2. give students **repeatable practice and games** that improve weak areas,
3. **assign formal work** with a target, a schedule and an official score,
4. see how every student and class performs.

Students get a clear, motivating place to practise at any time and to do the work they were assigned.

## 2. Users

| Role | Description | Main jobs |
|---|---|---|
| Teacher | Owns classes, content, activities, assignments. Role `TEACHER`. | Author content, configure activities, assign work, read results, manage students and classes |
| Student | Grades 6–8, belongs to one or more classes. Role `STUDENT`. | Practise Activities (Learning / Try Hard / game), do Assignments, see own progress, XP, ranking |

**One teacher, many classes** (owner, 2026-10-07; [ADR 0005](../decisions/0005-one-teacher-many-classes.md)). Classes keep `teacher_id` as the owner; there are no multi-teacher features.

## 3. Capabilities (what the product must do)

| # | Capability | Intent in one line | Detail lives in |
|---|---|---|---|
| C1 | Accounts and roles | Login, two roles, teacher creates student accounts | Phase 1, Phase 6 plan |
| C2 | Classes and members | Teacher manages classes and class membership | Phase 2, Phase 6 plan |
| C3 | Content hierarchy | Grade → Unit → Section → Topic → QuestionBank → Question; teacher can edit the structure | `domain/question-model.md` |
| C4 | Activities | Repeatable learning/practice/game experience built from several QuestionBanks; Learning and Try Hard modes | Phase 4 spec, ADR 0001 |
| C5 | Assignments | Formal task: own questions, target (class or grade), schedule, one attempt, official score, Late label | Phase 5 spec, ADR 0001, ADR 0003 |
| C6 | Attempts and answers | A student really does an Activity or Assignment; exact question set is fixed per attempt | `domain/question-model.md`, PHASES (Attempts) |
| C7 | Analytics | Weak-topic and performance insight derived from answers | PHASES (Analytics) |
| C8 | XP and ranking | XP per attempt, ranking by grade, weekly/monthly | PHASES (XP) |
| C9 | Teacher dashboard and reports | Aggregation of real data only | PHASES (Dashboard, Reports) |

## 3a. Two kinds of work (owner, 2026-10-07)

| | Practice (an **Activity**) | Assigned test (an **Assignment**) |
|---|---|---|
| Purpose | Extra practice that needs no assigning; students start it themselves | Work the teacher gives to a class or grade |
| Questions | Drawn from large QuestionBanks, mixed across topics, reshuffled each run | A fixed question set owned by the Assignment |
| Repeat | As often as the student wants, never expires | **One attempt**, timed, official score |
| Tracking | Results saved, feed XP and weak-topic analytics | Per-student status and score for the teacher (priority #1) |

This is exactly the model of [ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md); the owner confirmed it again on 2026-10-07.

## 3b. Tracking an Assignment (priority #1)

For each Assignment the teacher must see:

1. **Status per student:** Not started, In progress, Submitted, Submitted late. A timed-out attempt is auto-submitted and flagged *Timed out* ([ADR 0009](../decisions/0009-assignment-timeout-auto-submit.md)). *Overdue* (past due, not submitted) is derived.
2. **Score per student and the class average.**
3. **The questions most students got wrong.**
4. **Export to Excel/CSV.**

A student has **completed** the Assignment when it is submitted; there is no score threshold ([ADR 0006](../decisions/0006-assignment-completion-is-submission.md)). Late work counts as completed and is labelled Late, with no penalty ([ADR 0003](../decisions/0003-phase-5-assignment-contract.md)).

## 4. Product principles (confirmed by the owner's answers and compatible with the repo)

| Principle | Where it is already encoded |
|---|---|
| Students may move freely between Units and Topics; there is no forced order and no lock per Unit or per section | Not implemented as a lock anywhere; keep it that way |
| Question banks are large; one run uses a subset (for example about 30 questions) and each run can differ | `Activity.total_questions`, `SelectionStrategy.RANDOM` |
| Weak areas come back more often as the bank is reused | `SelectionStrategy.WEAKNESS_PRIORITY` (needs Answer history, C6) |
| Practice has no deadline and stays open forever | Activity has no deadline (ADR 0001) |
| Learning mode has no time limit; Try Hard has a time limit **per question** and no hints ([ADR 0015](../decisions/0015-try-hard-time-limit-per-question.md)) | Phase 4 spec §6.1–6.2 |
| Try Hard has 3 lives by default: each wrong answer costs one life, zero lives = Game Over | Phase 4 spec §6.2, `Activity.lives` |
| The teacher can restrict an Activity to one mode; default `BOTH` lets the student choose | `domain-model.md`, `ActivityMode` |
| Late work is still accepted and labelled **Late**, with no score penalty, even if the student started before and finished after the deadline | ADR 0003, Phase 5 spec §6.3 |
| A student sees and practises published content of their own grade only ([ADR 0007](../decisions/0007-student-visibility-own-grade.md)) | To build with the student read APIs |
| The Assignment clock is the server's: it keeps running if the student leaves; at expiry the answers so far are auto-submitted and flagged **Timed out**, which counts as submitted ([ADR 0009](../decisions/0009-assignment-timeout-auto-submit.md)) | To build with Attempts |
| An Activity belongs to a Unit and may mix Topics of that Unit ([ADR 0008](../decisions/0008-activity-belongs-to-unit.md)) | `activities.unit_id` |
| After submitting an Assignment the student sees the score and the correct answers with explanations immediately; there is no "Release answers" step ([ADR 0011](../decisions/0011-student-sees-answers-after-submit.md)) | To build with Attempts |
| An unfinished Activity run is not saved or resumed; opening it again starts a new random run ([ADR 0012](../decisions/0012-activity-run-not-resumable.md)) | To build with Attempts |
| Learning mode (Activity runs): on a wrong answer the student may answer up to 3 times in total (2 retries); an optional per-question hint costs part of the XP; a Topic formula/reference sheet is deferred; after the retries the answer and explanation are shown ([ADR 0014](../decisions/0014-learning-mode-hint-and-retry.md)) | To build with Attempts and N3b |
| Future game presentation changes presentation only; GameTemplate is deferred and is not a current dependency | `domain-model.md` Game architecture; `GameTemplate` not built yet |

## 5. Decisions already taken (do not reopen without a new ADR)

- **Activity and Assignment are independent** ([ADR 0001](../decisions/0001-activity-and-assignment-are-independent.md)). Activity = repeatable, no deadline, no official grade. Assignment = targeted, scheduled, **one attempt**, official score.
- Assignment owns its questions and never reads QuestionBank; Excel import is deferred ([ADR 0003](../decisions/0003-phase-5-assignment-contract.md)).
- Student account (`User`) and class membership are separate; no separate Student or Teacher entity (Phase 6 plan).

## 6. Owner requests that conflict with accepted decisions (parked, not adopted)

The owner confirmed on 2026-10-07 that **the repo's current decisions stay**. These earlier answers are recorded for
traceability. To adopt any of them, write a new ADR that supersedes ADR 0001.

| ID | Earlier request | Status | Handling |
|---|---|---|---|
| CR-01 | Assignments can be retried without limit; the highest score counts; teacher sees full history | **Closed, rejected** (2026-10-07) | Owner confirmed two kinds of work. One attempt for Assignments; unlimited retry for Activity runs |
| CR-02 | No split between Practice and Assignment | **Closed, rejected** (2026-10-07) | Practice is an Activity run; Assignment stays separate |
| CR-03 | A game is an Assignment | **Closed, rejected** (2026-10-07) | Future game presentation belongs inside Activities; GameTemplate is deferred |
| CR-04 | Completion = at least one attempt at 80% or more | **Closed, rejected** (2026-10-07) | Completion = submitted, score shown separately ([ADR 0006](../decisions/0006-assignment-completion-is-submission.md)) |
| CR-05 | Student requests access to another class's content, teacher approves (like Google Drive) | **Closed, rejected for v1** (2026-10-07) | Students see only their own grade ([ADR 0007](../decisions/0007-student-visibility-own-grade.md)); reopen with a new ADR |
| CR-06 | Teacher alone chooses the mode | Already supported | Teacher may restrict an Activity to `LEARNING` or `TRY_HARD` |
| CR-07 | In Learning mode: optional Question hint now; formula/reference sheet deferred | **Adopted** | [ADR 0014](../decisions/0014-learning-mode-hint-and-retry.md) |

## 6a. Non-functional expectations

- Students use **phones and computers equally**: every student screen, including the Attempt runner, must work well on both (responsive, touch-friendly, no hover-only actions).
- The server is authoritative for scoring, time and access (see `AGENTS.md`).

## 7. Non-goals (confirmed by repo docs)

Ranking or StudentWeakness as entities; class-level ranking; shuffling questions/answers in Assignments; regrading after an
attempt; gradebook; email/push notifications; separate Teacher/Student/School entities.
Further non-goals (payments, native mobile app, multi-school) are **not yet confirmed** (OQ-8).

## 8. Product-level acceptance (draft)

- A1. A teacher builds content, configures an Activity from real QuestionBanks, previews, publishes it, reloads and finds the same configuration. *(Phase 4 gate)*
- A2. A teacher creates an Assignment with questions, a valid target and a schedule, publishes it only when READY, and a `STUDENT` gets 403 from teacher APIs. *(Phase 5 gate)*
- A3. A student opens a published Activity, picks a mode if offered, finishes, sees the result; the question set stays fixed on refresh. *(Attempts gate, not started)*
- A4. A student does an Assignment once; submissions after the due date are labelled Late with the same score. The teacher sees status per student, score per student, class average, most-missed questions, and can export Excel/CSV. *(Attempts and tracking gates, not started)*
- A5. The teacher sees weak topics only when enough data exists; no dashboard number is invented. *(Analytics / Dashboard gate)*

## 9. Change log

| Date | Version | Change |
|---|---|---|
| 2026-10-07 | 0.9 | First intent, written from repo docs and the owner's answers |
| 2026-10-07 | 0.95 | Priority #1 set; two kinds of work confirmed (CR-01..03 closed); one teacher (ADR 0005) |
| 2026-10-07 | 1.0 | Completion = submitted (ADR 0006); students see own grade only (ADR 0007); tracking needs listed (§3b) |
| 2026-10-07 | 1.1 | Activity belongs to a Unit (ADR 0008); time-out auto-submits (ADR 0009); phone and computer equally important |
| 2026-10-07 | 1.1 | Targets are class or grade (ADR 0010); phase numbering fixed (ADR 0004). |
| 2026-10-07 | 1.1 | **Accepted by the owner.** Plan stage closed; Design stage starts |
| 2026-10-07 | 1.2 | Two product rules added from the owner's answers: answers visible after submit (ADR 0011), Activity run not resumable (ADR 0012). Remaining intent unchanged |
| 2026-10-07 | 1.3 | Learning mode v1 defined from market references (ADR 0013); abandoned Activity runs ignored (ADR 0012 amended) |
| 2026-10-07 | 1.4 | Learning mode direction changed to Khan Academy style: hint + retry (supersedes the hint-free v1 of ADR 0013) |
| 2026-10-07 | 1.5 | Learning mode details fixed (ADR 0014) |
| 2026-10-07 | 1.6 | Learning: 3 answers in total per question (ADR 0014); Try Hard time limit is per question (ADR 0015) |
| 2026-10-07 | 1.7 | Attempts-spec assumptions confirmed: Try Hard timeout costs no life, an Activity that is not ready cannot be started |
