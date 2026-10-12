# Phase 7 — ActivitySession, Question Engine and AssessmentAttempt

**Status (2026-10-12):** Scope A exists in code and needs configured validation. Question Engine and Assignment Composition contracts are accepted. Scope B implementation is not started. This is the active plan; do not restore the old polymorphic Attempt model/routes.

**Authority:** ADR 0012, 0015, 0021, 0022, 0023, 0024 and 0025; .agent/architecture/api-contract.md; .agent/architecture/question-engine-v1.md; .agent/architecture/assignment-composition-v1.md; .agent/plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md.

## Scope A — ActivitySession
- ActivitySession remains separate from AssessmentAttempt. Status: IN_PROGRESS, COMPLETED, GAME_OVER, ABANDONED.
- Store student/activity, concrete mode/strategy, timestamps and aggregate counts/score/lives.
- Do not persist detailed Activity answer/part history.
- Before full snapshots are enforced, abandon legacy IN_PROGRESS sessions; never reconstruct historical content from mutable Questions.
- Activity edits are allowed while sessions exist. A current ActivitySession uses the immutable snapshot captured at start; a session started after the Activity/content update uses the latest saved revision/configuration.
- Start validates published state, readiness and own-grade access; resolve mode/strategy and persist them.
- Select full question set/order in one transaction and persist a full immutable QuestionSnapshot for every selected question. Use snapshots for display, grading, hint and reveal.
- Student payloads must not contain correct/accepted/normalized answers or explanations before permitted reveal.
- Practice: no timer, immediate feedback, two submissions total (one retry), optional hint, final reveal after retry exhaustion.
- Try Hard: per-question timer, no hint/retry; wrong costs a life; timeout counts wrong but costs no life; zero lives after a wrong answer means GAME_OVER.
- Starting a new run abandons the previous open session as required by ADR 0012.

### Scope A gate
Run server/client tests in a configured environment; verify leakage, retry/hint/timer/lives/abandonment and snapshot behavior. Scope B cannot begin until this gate is recorded as passed.

## Scope B — Assignment Composition and AssessmentAttempt

### B1. Product Composition
The Assignment Builder demo is the product prototype, not disposable. Production preserves ordered sections/items, drag/drop, instruction/passage/image/pool blocks, grouped questions, per-item points/required/grading/example flags, validation and Student Preview. localStorage/seed is prototype-only.
- Assignment -> ordered Composition sections -> ordered items and grouped member items.
- Item kinds: Question or ContentBlock; v1 blocks: INSTRUCTIONS, PASSAGE, image MEDIA and POOL. Audio/nested blocks deferred.
- AssignmentQuestion remains the ownership association without position. Composition owns ordering; ADR 0024 supersedes the no-reorder/order-by-ID product rule in ADR 0018.
- One canonical QuestionSpec union is shared across backend, Question Bank, Assignment and runtime. Composition remains separate; align demo types, no third semantic union.
- Map demo TEXT_INPUT -> TYPE_ANSWER; MULTI_TEXT_INPUT/passage blanks -> CLOZE; pool/matching rows -> MATCHING; TRUE_FALSE has its own discriminant.
- possiblePoints (default 1)/required/isExample are Assignment-specific and do not mutate reusable Question Bank content. Assignment v1 automatically grades all submissions with Question Engine; there is no manual grading workflow or AUTO/MANUAL selector (ADR 0026).
- Legacy backfill: one section, items question_id ASC, defaults 1 point/required/not-example unless explicit values exist.

### B2. Readiness and publishing
Publishing is a server-side invariant: valid metadata, target/schedule, supported complete Questions, valid timer, valid Composition/block/group references and scoring. Total possible scored points must be > 0 after examples are excluded. Automatic scoring is mandatory for all Assignment submissions in v1; do not model AUTO/MANUAL grading modes. Drafts may remain incomplete. Return stable validation errors identifying section/item/question. Test invalid publish rejection.

### B3. Locking and revisions
Once the first AssessmentAttempt starts, reject every authoring change to the Assignment (composition/order, questions/content, points, required flags, targets/schedule/settings/review policy). The teacher must clone the Assignment to make changes; the clone has independent Composition and Assignment-owned Question copies. Historical snapshots remain immutable. Operationally closing/archive to prevent new starts may remain available but cannot mutate existing attempts. Enforce transaction-safe server guards. Test concurrent start/edit and clone/source mutation.

### B4. AssessmentAttempt lifecycle
- Separate aggregate; no polymorphic Attempt table; one official attempt per student per Assignment.
- On submit/timeout, run deterministic Question Engine grading from the immutable attempt snapshot and persist score/part results. There is no PENDING_REVIEW stage.
- Server-authoritative whole-attempt timer; reload/leave does not stop clock; timeout auto-submits saved answers and records timed-out flag while retaining submitted/completion semantics.
- Persist answers and support autosave/idempotent retries without allowing a second official attempt.
- State target: IN_PROGRESS, SUBMITTED, TIMED_OUT; manual review is a separate status, not another Attempt.
- Enforce target/access/current-class membership, published/open/due policy on server.
- Submit freezes submitted answers and automatically grades them against the immutable snapshot. Late submissions remain accepted/labeled Late without score penalty.

### B5. Answer and per-part grade persistence (D7)
Persist raw answer as needed for permitted review and optional normalized submitted value captured by the type-aware normalizer at answer intake. `PartStatus` is exactly CORRECT, PARTIALLY_CORRECT, INCORRECT or UNANSWERED. The Question Engine grades automatically; persist per-part status and earned/possible points, stable part key, snapshot/normalizer version and timestamps. Normalized values are internal and never exposed in in-progress student DTOs. `show_score_after_submit` controls score display; `show_answers_after_submit` independently controls answer/explanation reveal.

### B6. Weighted scoring (D8)
Points live on Composition items/parts, not shared Question Bank fields. earnedPoints = possiblePoints × scoreFraction. totalPossiblePoints sums scored non-example parts. totalEarnedPoints sums finalized graded parts. percentageScore = totalEarnedPoints / totalPossiblePoints × 100. Preserve raw points and percentage; round only for display. Examples are zero-point/excluded. MANUAL parts remain pending until teacher review; official score pending until all finalized. Existing types retain semantics; Matching/CLOZE partial-credit rules are tested. Readiness rejects zero possible scored points.

### B7. Assignment analytics
Intent 0001 §3b and A4 require per-student status/score, class average, most-missed questions and Excel/CSV export. Implement teacher-reviewed correct/partial/incorrect/unanswered counts by question/part; accuracy with explicit denominator; normalized submitted-answer distributions captured at intake; report pending-review and unanswered separately; exclude examples and unreviewed parts from finalized outcome rates; enforce teacher ownership/target scope/privacy; derive analytics from persisted attempts, not live Questions or mock data. Weak-topic cross-Assignment analytics remains a later Analytics phase.

### B8. Review and media
TRUE show_answers_after_submit: after submit, return permitted score, correct answers and explanations. FALSE: suppress correct/accepted/normalized values and explanations. Image + meaningful alt text in v1; audio deferred. Student renderer and teacher preview preserve same order/grouping. MANUAL workflow is in Scope B if offered in production; otherwise hide/disable MANUAL until implemented.

### B9. Required tests
Backend: readiness/publish rejection; ordered composition/backfill; access/target/due/current-class; one attempt; autosave/idempotent submit; timeout; snapshot immutability; edit-lock concurrency; automatic decimal scoring/examples/zero denominator; normalized-answer analytics/denominators; reveal leakage; media/alt text; CLOZE/MATCHING; no polymorphic Attempt.
Frontend: builder save/reload order; drag/drop/sections/items/blocks/groups; canonical QuestionSpec editors/validation/preview; Student Preview matches attempt; points/required/example; score visibility and answer reveal settings; responsive/touch/keyboard/UI states; no localStorage/seed in production.

### B10. Implementation sequence
1. Validate Scope A gate.
2. Re-audit actual Flyway max/schema; never edit V1–V30.
3. Add characterization tests for five current Question types.
4. Implement QuestionSpec/handlers/registry/persistence mapping with parity tests.
5. Add option order/revision and Activity snapshots; abandon legacy IN_PROGRESS sessions before enforcement.
6. Implement Composition schema/API/backfill and frontend adapter.
7. Implement AssessmentAttempt snapshots/answers/lifecycle/timeout.
8. Implement automatic weighted score calculation using Question Engine handlers; no manual grading UI.
9. Implement analytics/export and security tests.
10. Run server tests, frontend lint/typecheck/tests/build and record exact outcomes.

## Existing gaps
- AssignmentService status transition must enforce readiness, not trust UI.
- AssignmentQuestionService edit guard only checks ARCHIVED; Scope B must lock structure/scoring after an attempt.
- AssessmentAttempt and Question Engine handlers are not implemented.
- ActivitySessionQuestion still references mutable Question content.
- Older Question authoring paths omit hint in mapping; add round-trip tests/fix.
- Demo uses localStorage/seed; production must use APIs and canonical models.

## Migration rules
Never edit V1–V30. Re-read migration directory immediately before implementation and choose actual next version; do not assume V31–V33 remain available. Use incremental migrations for option order/revision, Activity snapshots, Composition, AssessmentAttempt snapshots/answers/part grades, with deterministic backfills. No migration is created in this documentation update.

## Definition of done
Scope A gate passed; immutable Activity snapshots active; Builder persists/reloads ordered Composition via APIs; AssessmentAttempt enforces one attempt, immutable snapshot, autosave, timeout, automatically calculated weighted score, and review policy; readiness/locking server-enforced; analytics/export uses real persisted results; QuestionSpec is canonical; scoring/order/timeout/backfill/leakage/responsive tests pass. PROGRESS records exact results, never unrun checks.
