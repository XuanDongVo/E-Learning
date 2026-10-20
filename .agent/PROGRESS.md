# Project Progress

Audit baseline: 2026-10-12
Implementation update: 2026-10-14
Branch: feature/phase-7-assigment
Audited application baseline before documentation changes: c2a98fd9101d7b6613e5c2af6090eff8d189715e

## Current stage
- Phase 6 Student Management: DONE.
- Phase 7 Scope A ActivitySession: present in code; configured validation run still required.
- Phase 7 Scope B Assignment Composition: V33–V34 schema and initial read/write API are implemented; Builder is wired to backend APIs and legacy authoring routes redirect to the Builder. End-to-end, migration, test and build verification remain outstanding. AssessmentAttempt implementation is not claimed complete.
- Question Engine Slice 1: canonical QuestionSpec, RawAnswer/ValidatedAnswer, GradeResult/PartStatus, seven handlers and registry exist. Added characterization tests for existing five types, exact-set Multiple Choice, invalid option/type inputs, text normalization and definition readiness. Added factory tests to ensure invalid TRUE_FALSE input does not silently become FALSE. Test execution has not been verified in a configured build environment.
- Question Engine Slice 2: V31 already adds `questions.content_revision` and deterministic `question_options.display_order`; update paths increment content revision and option persistence/query paths use display order. API option responses now include `displayOrder`. Hint is mapped through shared QuestionWriteRequest/QuestionPersistenceService/QuestionResponseMapper; older frontend paths still need a full round-trip audit. TRUE_FALSE request mapping and persistence were corrected to preserve invalid draft input instead of silently converting it to FALSE.
- Question Engine Slice 3: V32 adds ActivitySession question snapshot metadata/payload columns and abandons legacy IN_PROGRESS sessions. ActivitySession start assembles snapshots and runtime reads the snapshot payload. Migration/application integration tests and fresh database validation remain to be run.
- Question Engine Slice 4: MATCHING and CLOZE immutable specs, validated answers, handlers, normalized per-part grading, registry support and focused tests exist. Existing flat authoring/persistence mapping explicitly rejects these types until type-specific fields exist.
- Assignment Composition: V33–V34 add ordered section/item persistence, JSONB block payloads, points/required/example flags, score visibility settings and deterministic legacy backfill. GET/PUT /v1/assignments/{id}/composition and server validation are added. Legacy question creation adds default Composition items. Builder API wiring is implemented, but unverified until tests/build/end-to-end pass.

## Accepted contracts
- Activity and Assignment have separate aggregates; no polymorphic Attempt table.
- Activity uses ActivitySession and does not persist detailed answer/part history.
- Full immutable Activity question snapshots are required. Before enforcing snapshots, abandon legacy IN_PROGRESS sessions; never reconstruct historical snapshots from mutable live content.
- Question Engine D1–D8 accepted: preserve existing scoring; CLOZE separate from FILL_IN_BLANK; one QuestionSpec union; durable Activity snapshots; separate Activity/Assignment analytics; image-first media; persist Assignment part results and normalized submitted values; weighted Assignment points.
- Assignment Composition is ordered sections/items/blocks/groups. Composition owns ordering; AssignmentQuestion remains position-free.
- Assignment-specific points, required and isExample do not mutate shared Question Bank content. Assignment submissions are automatically graded; there is no manual grading or AUTO/MANUAL selector. Each scored question defaults to 1 point, customizable per Assignment item.
- Assignment analytics support correct/partial/incorrect/unanswered and normalized wrong-answer distributions.
- Readiness blocks publishing if total possible scored points is zero. `show_score_after_submit` defaults true and independently controls immediate score display from `show_answers_after_submit` answer/explanation visibility.
- Existing Assignments backfill to one section in question_id ascending order with defaults 1 point/required/not-example unless explicit values exist. After backfill, Composition positions—not question_id—define product order.

## Implementation gaps
- Question Engine Slice 1 still needs broader parity, invalid-structure, answer-leakage, and persistence round-trip tests; tests have been committed but not run here.
- `QuestionSpecRequestFactory` does not yet provide type-specific MATCHING/CLOZE authoring/persistence mapping; do not expose these as production-ready merely because handlers exist.
- V32 snapshot migration adds nullable snapshot fields; verify every new session stores complete snapshots and add integration tests proving display/grading/reveal use only snapshots.
- Audit every Question Bank and Assignment authoring path for hint round-trip and canonical semantic type mapping; the Assignment Builder still has demo-only aliases (`TEXT_INPUT`, `MULTI_TEXT_INPUT`) and represents TRUE_FALSE as SINGLE_CHOICE.
- AssignmentService status transition does not currently enforce readiness; AssignmentQuestionService edit guard does not lock by AssessmentAttempt.
- AssessmentAttempt is not implemented; dedicated Question Engine/Attempt tests were not found.
- Builder no longer uses localStorage/seed for persistence. A seed object remains only as the store's pre-load placeholder; load errors are displayed instead of falling back to seed data.
- Assignment incremental-save refactor is in progress on `fix/assignment-p0-question-composer-main`: inline editors and Question-before-Composition coordination are wired, but backend/migration validation and E2E are not yet verified.

## Migration rules
- Never edit applied Flyway migrations; in this branch V1–V32 are already present and must not be modified.
- Re-audit actual latest migration before choosing the next version; do not assume V31–V33 remain available.
- Documentation acceptance does not mean code, tests, lint, TypeScript or builds pass.

## Next gates
1. Run server tests and migration validation in a configured environment; record exact outcomes. Scope A gate is not marked passed until verified.
2. Complete Slice 1 characterization/parity tests and address any failures.
3. Complete Slice 2 frontend semantic adapters and hint round-trip audit; V31/V32 already exist, so do not duplicate them or edit V1–V32.
4. Verify Activity snapshot completeness, legacy-session handling, and snapshot-only runtime behavior before moving to later slices.
5. Implement Composition persistence/API and deterministic legacy backfill. Assignment hard-locks after first attempt; clone to change.
6. Implement AssessmentAttempt snapshots, saved answers, timeout, automatic weighted scoring and score/answer display settings.
7. Implement per-part analytics/export and tests for readiness, locking, scoring, leakage and ordering.

This file tracks implementation state and does not claim the above work is done.


## Changes committed during 2026-10-14 continuation
- Corrected TRUE_FALSE request mapping: only TRUE/FALSE tokens establish an expected boolean; other values remain incomplete.
- Corrected TRUE_FALSE persistence normalization so invalid draft input is preserved rather than stored as FALSE; answer normalization now uses Locale.ROOT.
- Added `displayOrder` to QuestionOptionResponse and maps the persisted order into the API response; the frontend response type accepts this field.
- Added backend characterization tests for SINGLE_CHOICE, MULTIPLE_CHOICE exact-set scoring, TRUE_FALSE parsing, FILL_IN_BLANK marker/accepted alternatives, TYPE_ANSWER trim/case normalization, validation status and mismatched answer types; added QuestionSpecRequestFactory tests for TRUE_FALSE.
- No new Flyway migration was needed: the current branch already contains V31 and V32 for the schema changes touched here.
- Tests/builds were not run from this GitHub-only editing session; do not treat commits as a passing CI/build signal.


## Assignment Composition implementation update (2026-10-14)
- Added Flyway V33 after verifying V32 was the highest migration on this branch, then V34 for the independent show_points_per_question setting. Do not edit V1-V34; future schema changes must use the next unused migration number.
- V33 creates assignment_sections and assignment_items, adds composition schema version/provenance and show_score_after_submit, and backfills existing Assignments into one LEGACY_GENERATED section with questions ordered by question_id ASC and 1-point defaults.
- Added JPA entities/repositories, nested Composition DTOs, GET/PUT /v1/assignments/{assignmentId}/composition, server-side validation and compatibility behavior so legacy question creation adds an ordered Composition item.
- Reordering uses a temporary high-position range before persisting requested order to avoid transient unique-position conflicts.
- Connected `/teacher/assignments/demo` to backend Assignment, AssignmentQuestion and Composition APIs. Builder loads the saved Assignment ID from `?id=`, persists question edits/creation/deletion and ordered Composition, and reloads the server result after save. Removed the localStorage repository. Assignment list rows and the create flow now open the Builder; legacy `/teacher/assignments/[id]` and `/teacher/assignments/[id]/questions/create` routes redirect to the Builder.
- Settings now fetch real class targets. The Builder explicitly hides MATCHING and MULTI_BLANKS creation until Question Engine write/response contracts can safely persist those types. Existing unsupported question types fail load with an explicit error rather than being silently converted.
- IMPORTANT remaining work: add client adapter and backend integration tests, verify API DTO field names against actual runtime JSON, run frontend lint/typecheck/build, run backend tests and Flyway validation, and test create/edit/reorder/group/delete/reload end-to-end. Question and Composition saves currently span multiple HTTP requests rather than one atomic server transaction; recoverability and partial failure need tests. This feature is not DONE until those gates pass.
- No build or test command has been executed/verified during this GitHub-only session.


## Assignment Builder API integration update (2026-10-14)
- `AssignmentBuilder` is now the canonical editor route. Create Assignment from `/teacher/assignments` opens `/teacher/assignments/demo?id={serverId}`. Selecting an Assignment in the list opens the same Builder. The former detail and question-create routes redirect there for compatibility.
- `composition-api.ts` maps server sections/items/blocks to the existing Canvas model and serializes order/grouping back through the Composition API. Existing question content is read from AssignmentQuestion API and written through its current CRUD endpoints. The Builder no longer uses `localStorage` as its persistence layer.
- The current backend Question Engine does not safely accept MATCHING/CLOZE authoring payloads. These tools are hidden from new-item menus; if an existing Assignment contains a type the adapter cannot safely represent, loading stops with a visible error instead of silently rewriting it.
- Media blocks now upload an image through the existing media API and persist `assetId`, alt text, caption and preview URL; asset IDs are required by server validation.
- No build, lint, test, migration validation or browser end-to-end run has been executed/verified in this session.


## P0 Assignment Question Composer fix (2026-10-15)
- Created branch `fix/assignment-p0-question-composer-main` from `main` at `2678e570a75a86a7664ee60c88097c6df7887f2e`.
- Removed the legacy side effect from `AssignmentQuestionService.create()`: creating question ownership no longer creates a default Section or AssignmentItem. Composition placement is owned by the Composition API.
- Added `.agent/plans/P0_ASSIGNMENT_QUESTION_COMPOSER_FIX.md` with the architecture contract, remaining implementation tasks and acceptance criteria.
- **P0 remains IN PROGRESS.** Toolbox/QuestionComposer integration, PropertyPanel boundary, composition-only save, deletion semantics and tests are still outstanding.
- No build, lint, test or end-to-end checks were run in this GitHub-only update. Do not treat this commit as a passing verification signal.


### P0 follow-up — QuestionComposer integration (2026-10-15)
- [x] Added `AssignmentQuestionComposerDialog.tsx`: uses the existing QuestionComposer, uploads question-draft media, validates the supported question types, saves through `assignmentQuestionService.create()`, validates returned IDs and inserts server-backed question items into the selected Builder target.
- [x] Builder store routes question tools to the Composer instead of creating local unsaved question drafts.
- [x] Mounted the Composer dialog in `AssignmentBuilder.tsx`.
- [x] Composition Save no longer updates question content; it writes Assignment metadata and Composition structure only.
- [ ] Existing-question content editing is not yet integrated with an edit-capable Composer flow. The legacy PropertyPanel question editor still needs refactoring before this can be considered complete.
- [ ] No build, lint, unit, integration or browser tests were run through the GitHub connector. Verify locally/CI before merge.


### P0 completion follow-up — unlink safety, edit mode and CI (2026-10-15)
- [x] PropertyPanel delegates persisted question content edits to QuestionComposer; points/required/example/grading remain Composition properties.
- [x] Existing supported question types load as Composer drafts and save via Assignment Question update API. Matching/Cloze edits are blocked with an explicit message until their full data contract can be round-tripped.
- [x] Composition serialization preserves server AssignmentItem IDs for questions and blocks. Save no longer rewrites question content and no longer resets persisted item IDs.
- [x] Composition loading no longer appends orphan AssignmentQuestion rows into the visible Composition, preventing removed questions from reappearing.
- [x] Composition replacement now deletes only stale AssignmentItem rows and the corresponding detached AssignmentQuestion association rows; it does not delete underlying Question records.
- [x] Passage blank authoring now seeds QuestionComposer drafts instead of creating local-only questions that cannot be persisted.
- [x] Disabled unsafe duplicate actions for persisted questions/populated groups until duplicate-as-new-question is implemented.
- [x] Added frontend unit tests for Composition ordering and unlink behavior; added GitHub Actions workflow for frontend lint/tests/build and backend tests with PostgreSQL.
- [ ] Latest CI run must pass after the final commit. Browser E2E and a manual live-assignment verification are still outstanding.
- Note: the legacy explicit AssignmentQuestion bulk-delete endpoint still deletes Question records. Builder unlink does not call it; keep that endpoint out of the unlink flow.


### CI result — P0 code commit `146ba0b2ae5e9945ac9cc07b001a0f1cc68971dc` (2026-10-15)
- [x] Frontend `npm run lint`: passed with 0 errors (one pre-existing navigation warning remains).
- [x] Frontend `npm test`: passed, 1 test file / 2 tests.
- [x] Frontend `npm run build`: passed; Next.js production build and TypeScript checks completed.
- [x] Backend `./mvnw -B test`: passed with PostgreSQL service enabled.
- [ ] Browser E2E and manual live-assignment checks are still outstanding; do not equate unit/build CI with complete runtime acceptance.

## Teacher Content UI blueprint update (2026-10-20, branch `refactor/teacher-content-ui-routing`)

- Added `.agent/ui/QUESTION_BANK_QUESTION_MANAGEMENT_BLUEPRINT.md`: screen-by-screen UI contract for Content Explorer, Topic/Question Bank Manager, Question Manager and read-only Question preview.
- Added `.agent/plans/QUESTION_BANK_UI_PHASE_PLAN.md`: sequenced implementation into UI-1 Explorer, UI-2 Bank Manager, UI-3 Question filters/pagination, UI-4 navigation/consistency audit, and a separate future UI-5 editor planning gate.
- This is a documentation/planning update only. No frontend runtime code, API, schema or migration was changed in this documentation commit.
- Question Editor redesign/refactor is explicitly out of scope. Current backend limitations are recorded: no confirmed global bank search, Question reorder API, single-question delete API or server import API.
- Validation: documentation paths and content were written through GitHub API; frontend lint/typecheck/build and browser verification have not been run in this session.

### UI-1 implementation slice (2026-10-20)

- Added explicit retry controls for Grade, Unit, Section and expanded-Topic loading failures in `content-overview.tsx`. Error states now provide a direct retry action instead of asking the teacher to refresh the entire page.
- This is a narrow first implementation slice for Phase UI-1; it does not claim the whole Explorer phase is complete.
- Validation not run: no frontend lint, typecheck, build or browser test was executed in this GitHub-only session.

## Question Bank UI continuation (2026-10-20)

- UI-2 partial implementation on `refactor/teacher-content-ui-routing`:
  - `questionBankService.list(topicId, includeArchived = false)` now forwards the server-supported `includeArchived=true` query parameter when selected.
  - Topic detail exposes an explicit Include archived toggle, separates bank-list load errors from empty results, and offers Retry for bank/topic load errors.
  - The archived filter participates in the React Query key, so active and include-archived lists do not share cached results.
- Commits: `56f4b0fb` (service contract), `62ac32e8` (Topic detail UI).
- UI-2 remains in progress: editing bank metadata/status/archive from the Topic list itself and a full regression pass have not been completed in this slice. Existing bank detail actions remain unchanged.
- Validation: not run; this GitHub-only session did not execute frontend lint, tests, typecheck, build or browser tests.

## Question Bank endpoint investigation (2026-10-20)

- Reported runtime error: `NoResourceFoundException: No static resource v1/content/question-banks for request '/v1/content/question-banks'`.
- Compared frontend service and backend controller on `refactor/teacher-content-ui-routing`:
  - Frontend `questionBankService.list(topicId, includeArchived)` calls `GET /v1/content/question-banks?topicId=<id>`, with `includeArchived=true` only when enabled.
  - Backend `QuestionBankController` has class mapping `/v1/content/question-banks` and `@GetMapping` requiring `topicId`; `includeArchived` defaults to false. The URL path and parameter names match.
  - Backend controller also defines POST at the collection path, GET by ID, PUT by ID, PATCH archive/status and PUT order.
- Therefore the exception is not explained by a path mismatch in the checked branch. Spring is treating the collection path as a static resource, which commonly means the running process/deployment did not register this controller (e.g. stale/wrong server build, wrong running application/profile/context, or controller scan/startup issue). This cannot be conclusively distinguished from repository inspection alone.
- Frontend now surfaces the actual API error text for bank-list failures and create-bank failures (commit `86fa5c13`) to avoid hiding the server response behind generic messages.
- Runtime endpoint verification, backend tests and frontend lint/typecheck/build have not been executed from this session. Do not mark endpoint as runtime-verified until the user runs the server or CI proves it.

## UI-1 / UI-2 continuation and API route diagnosis (2026-10-20)

- Latest user runtime log confirms bearer JWT authentication and `ROLE_TEACHER`, then `NoResourceFoundException` for `/v1/content/question-banks`. This is consistent with no MVC handler being registered for that path; it is not evidence of a JWT/role denial.
- Re-inspected `QuestionBankController`: `@RestController`, class mapping `/v1/content/question-banks`, and collection `@GetMapping` with `topicId` + optional `includeArchived` match the frontend URL. `ServerApplication` is rooted at package `e_learning.server`, which should component-scan the controller package. Source-level path mismatch has not been found.
- Added temporary TRACE logging for `RequestMappingHandlerMapping` to `server/src/main/resources/application.properties` (commit `5be8b523`) so the next backend startup can show registered controller mappings. This changes logging only; runtime still needs restart and confirmation.
- UI-1: changing Grade and Unit now clears expanded Section IDs to avoid carrying stale expansion state across hierarchy contexts (commits `afd8d709`, `573e7f15`).
- UI-2: Question Bank update/status/archive mutations now invalidate the bank detail and topic's bank-list query prefix and show success/error toasts (commit `bb48c993`).
- No backend URL/security workaround or explicit component-scan workaround was added because repository code does not justify one. Runtime root cause remains unverified.
- Validation: no Maven test, frontend lint/typecheck/build or browser test was run in this GitHub-only session.
