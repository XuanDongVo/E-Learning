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

## Documentation update (2026-10-21) — Question Pooling proposal

- Added `.agent/plans/QUESTION_POOLING_SPEC.md` and `.agent/plans/QUESTION_POOLING_IMPLEMENTATION_PLAN.md` as a proposed extension to Assignment Composition.
- Added links and the proposal's non-normative status to `.agent/README.md`.
- The proposal keeps `QUESTION_POOL` (random draw of candidate questions for an AssessmentAttempt) distinct from the existing `POOL` answer-entry block used by MATCHING. It proposes server-side draw without replacement, immutable attempt snapshots, equal total points across candidates, selected-only scoring/analytics, and no re-draw on refresh/autosave/submit/timeout.
- **Owner approval and a new ADR are still required.** These documents do not change the accepted Phase 7B contract or authorize implementation.
- The supplied ChatGPT share link could not be retrieved through the available path in this session, so the proposal is based on the repository's current ADRs/specs and needs reconciliation against the shared conversation. No application code or migration was changed, and no test/build was run for this documentation-only update.
