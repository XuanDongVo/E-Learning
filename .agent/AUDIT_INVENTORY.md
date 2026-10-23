# .agent Audit Inventory and Cleanup Decisions

**Audit date:** 2026-10-23  
**Branch:** `refactor/teacher-content-ui-routing`  
**Purpose:** inventory each documentation file, identify the canonical source, and prevent old plans from being interpreted as current instructions.

Status labels:
- **CANONICAL** — active source of truth for its stated purpose.
- **ACTIVE / PARTIAL** — current work plan; execution or verification remains.
- **HISTORICAL** — retain as traceability, not an instruction to execute.
- **MERGE / DELETE** — duplicated, superseded, or completed one-off content whose durable facts are represented elsewhere.

## Root

| File | Status | Decision |
|---|---|---|
| `00-INDEX.md` | CANONICAL | Required reading order and naming/lifecycle policy |
| `AUDIT_INVENTORY.md` | CANONICAL AUDIT REGISTER | File-by-file status, cleanup decisions and remaining audit work |
| `README.md` | CANONICAL ENTRY | Short entry point; links to index and states authority rules |
| `CURRENT_STATE.md` | CANONICAL | Current implementation facts and gaps; refresh after code audits |
| `PROGRESS.md` | CANONICAL LOG | Current work and verification only; not a product specification |

## Intent

| File | Status | Decision |
|---|---|---|
| `intent/0001-core-platform.md` | CANONICAL | Product intent; keep high-level and defer detailed rules to ADR/domain |
| `intent/open-questions.md` | CANONICAL | Unresolved owner decisions; remove questions only when an explicit decision exists |

## Decisions

| File | Status | Decision |
|---|---|---|
| `decisions/README.md` | CANONICAL INDEX | Keep the numbered ADR register and supersession relationships current |
| `decisions/0001-activity-and-assignment-are-independent.md` | HISTORICAL ADR | Preserve |
| `decisions/0002-adopt-ui-guidelines-and-tokens.md` | HISTORICAL ADR | Preserve |
| `decisions/0003-phase-5-assignment-contract.md` | HISTORICAL ADR | Preserve |
| `decisions/0004-phase-numbering.md` | HISTORICAL ADR | Preserve; do not renumber phases based on file names |
| `decisions/0005-one-teacher-many-classes.md` | HISTORICAL ADR | Preserve |
| `decisions/0006-assignment-completion-is-submission.md` | HISTORICAL ADR | Preserve |
| `decisions/0007-student-visibility-own-grade.md` | HISTORICAL ADR | Preserve |
| `decisions/0008-activity-belongs-to-unit.md` | HISTORICAL ADR | Preserve |
| `decisions/0009-assignment-timeout-auto-submit.md` | HISTORICAL ADR | Preserve |
| `decisions/0010-assignment-targets-class-or-grade.md` | HISTORICAL ADR | Preserve but ensure newer Grade + explicit class snapshot decision is reflected in active docs |
| `decisions/0011-student-sees-answers-after-submit.md` | HISTORICAL ADR | Preserve; later score/answer visibility ADRs refine behavior |
| `decisions/0012-activity-run-not-resumable.md` | HISTORICAL ADR | Preserve |
| `decisions/0013-learning-mode-v1-feedback.md` | HISTORICAL ADR | Preserve |
| `decisions/0014-learning-mode-hint-and-retry.md` | HISTORICAL ADR | Preserve |
| `decisions/0015-try-hard-time-limit-per-question.md` | HISTORICAL ADR | Preserve |
| `decisions/0016-topic-formula-sheet-deferred.md` | HISTORICAL ADR | Preserve |
| `decisions/0017-activity-selection-strategy-at-start.md` | HISTORICAL ADR | Preserve |
| `decisions/0018-assignment-question-order.md` | HISTORICAL ADR | Preserve; ADR 0024 supersedes product-order behavior, not historical record |
| `decisions/0019-assignment-answer-visibility.md` | HISTORICAL ADR | Preserve; reconcile with ADR 0026 |
| `decisions/0020-activity-lifecycle.md` | HISTORICAL ADR | Preserve |
| `decisions/0021-activity-session-vs-assessment-attempt.md` | HISTORICAL ADR | Preserve |
| `decisions/0022-activity-practice-one-retry.md` | HISTORICAL ADR | Preserve |
| `decisions/0023-question-engine-architecture.md` | ACCEPTED ADR | Preserve; accepted architecture does not mean full integration is complete |
| `decisions/0024-assignment-composition.md` | ACCEPTED ADR | Preserve; authoritative Composition decision |
| `decisions/0025-assignment-grading-locking-and-activity-updates.md` | ACCEPTED ADR | Preserve; reflect in active contracts |
| `decisions/0026-assignment-automatic-scoring-and-score-visibility.md` | ACCEPTED ADR | Preserve; reflect in active contracts |
| `decisions/README.md` | CANONICAL INDEX | Check supersession and current-state notes; no ADR renumbering |

## Domain

| File | Status | Decision |
|---|---|---|
| `domain/business-rules.md` | CANONICAL, REVIEW REQUIRED | Compare every rule with latest ADRs and implementation; remove superseded executable requirements |
| `domain/domain-model.md` | CANONICAL, REVIEW REQUIRED | Align entities and relationships with current schema/code |
| `domain/glossary.md` | CANONICAL | Keep terms consistent: ActivitySession vs AssessmentAttempt; Practice vs backend LEARNING |
| `domain/question-model.md` | CANONICAL, REVIEW REQUIRED | Current-vs-target split is useful; recheck migration and snapshot details against V42/current code |

## Architecture

| File | Status | Decision |
|---|---|---|
| `architecture/overview.md` | CANONICAL | Platform purpose and stack |
| `architecture/engineering-rules.md` | CANONICAL, REVIEW REQUIRED | Update stale Question Engine status statements; retain cross-cutting engineering rules |
| `architecture/backend.md` | CANONICAL, REVIEW REQUIRED | Verify package paths, migrations, API/security details against current server |
| `architecture/frontend.md` | CANONICAL, REVIEW REQUIRED | Verify framework, route and data-fetching patterns against current client |
| `architecture/api-contract.md` | CANONICAL, REVIEW REQUIRED | Verify endpoints and error contract against current controllers and frontend callers |
| `architecture/question-engine-v1.md` | CANONICAL TARGET + STATUS | Refreshed migration/branch baseline; still requires full source-level re-audit |
| `architecture/question-engine-folder-structure.md` | CANONICAL TARGET, REVIEW REQUIRED | Compare each listed path with actual filesystem; do not imply target folders all exist |
| `architecture/assignment-composition-v1.md` | CANONICAL PRODUCT CONTRACT + STATUS | Refreshed implementation distinction; continue to mark AssessmentAttempt as missing |

## Plans

| File | Status | Decision |
|---|---|---|
| `plans/PHASES.md` | CANONICAL ROADMAP | Keep phase sequence and statuses aligned with CURRENT_STATE |
| `plans/E-LEARNING_PHASE_4_ACTIVITIES_SPEC.md` | CANONICAL SPEC | Keep active behavior/API contract aligned with code |
| `plans/E-LEARNING_PHASE_5_ASSIGNMENTS_SPEC_EN.md` | CANONICAL SPEC, REVIEW REQUIRED | Distinguish desired scoring/attempt behavior from implemented runtime |
| `plans/E-LEARNING_PHASE_6_STUDENT_MANAGEMENT.md` | HISTORICAL / COMPLETED | Mark explicitly complete; do not use as an active implementation plan |
| `plans/E-LEARNING_PHASE_7_ATTEMPTS_SPEC.md` | ACTIVE SPEC | Rebased 2026-10-23; Scope A verification gaps and missing Scope B runtime stated explicitly |
| `plans/PHASE_7B_IMPLEMENTATION_MIGRATION_PLAN.md` | ACTIVE PLAN | Required gate before formal AssessmentAttempt implementation |
| `plans/QUESTION_BANK_UI_PHASE_PLAN.md` | ACTIVE / PARTIAL | Current UI plan; do not call phases complete until checks are recorded |
| `plans/REFACTOR_INCREMENTAL_SAVE_PLAN.md` | ACTIVE ONLY IF WORK REMAINS | Confirm actual completion state and avoid concurrent/duplicated editor refactor plans |
| `plans/P0_ASSIGNMENT_QUESTION_COMPOSER_FIX.md` | FOLLOW-UP / HISTORICAL TASK PLAN | Contains outstanding browser E2E follow-up; keep only until follow-up is transferred to a tracked active plan |
| `plans/CONTENT_SHARING_MATCHING_CLOZE_AUDIT.md` | HISTORICAL AUDIT | Dated evidence from 2026-10-21; not a current implementation specification |
| `plans/QUESTION_ENGINE_REFACTOR_STATUS.md` | MERGE / DELETE | Duplicates CURRENT_STATE and contains old branch-specific status; durable gaps are already in CURRENT_STATE/PROGRESS |
| `plans/assignment-grade-and-recipients-refactor.md` | COMPLETED / DELETE | V40 refactor is already represented in CURRENT_STATE; retain no separate plan for completed work |
| `plans/HYBRID_QUESTION_LIST_BLUEPRINT.md` | DUPLICATE / DELETE | Overlaps current Question Bank blueprint and contains conflicting single-delete guidance; merge no further requirements unless current code proves them unique |

## UI

| File | Status | Decision |
|---|---|---|
| `ui/UI_ARCHITECTURE_GUIDELINES.md` | CANONICAL GUIDELINES | Keep shared tokens/accessibility rules; avoid duplicating per-screen specs |
| `ui/QUESTION_BANK_QUESTION_MANAGEMENT_BLUEPRINT.md` | CANONICAL BLUEPRINT | Main Question Bank/Question Manager contract |
| `ui/ROUTE_BREADCRUMB_CONSISTENCY_BLUEPRINT.md` | HISTORICAL / PARTIAL | Implementation status and unchecked checklist disagree; reverify, then either close or convert remaining work to active plan |
| `ui/HYBRID_QUESTION_LIST_BLUEPRINT.md` | DUPLICATE / DELETE | Replaced by the main Question Bank blueprint and current phase plan |
| `ui/screens.md` | REVIEW REQUIRED | Keep only if it adds a unique screen inventory not covered by the blueprint; otherwise merge into canonical UI blueprint |

## Audits, design register and checklist

| File | Status | Decision |
|---|---|---|
| `audits/2026-10-23-p0-ci-p1-routing-audit.md` | HISTORICAL AUDIT | Preserve date/scope and validation evidence |
| `audits/2026-10-23-p3-p4-error-migration.md` | HISTORICAL AUDIT | Preserve date/scope and migration evidence |
| `audits/2026-10-23-server-error-contract-inventory.md` | HISTORICAL INVENTORY | Reconcile with current ErrorCode and i18n; do not assume complete without rerun |
| `design/spec-status.md` | CANONICAL DRIFT REGISTER | Keep statuses and migration references current; not a replacement for CURRENT_STATE |
| `checklists/definition-of-done.md` | CANONICAL CHECKLIST | Reusable validation gate; no project-specific claim of passed checks |

## Cleanup actions applied / pending

- [x] Added `00-INDEX.md` with ordered reading sequence and naming policy.
- [x] Rewrote README as the entry point and corrected stale Question Engine implementation claims.
- [x] Updated Question Engine and Assignment Composition architecture status/baseline wording.
- [x] Rebased Phase 7 spec on the current implementation distinction.
- [ ] Remove completed/duplicated plans listed above after confirming no remaining unique active tasks depend on them.
- [ ] Review every remaining domain/API/frontend/UI file against current code and update internal links.
- [ ] Renumber file names only where a stable sequence has real meaning. Keep ADR IDs and dated audit names stable; never invent dates or renumber history.
- [ ] Recheck this inventory against the final tree and remove completed checklist items only after the corresponding work is done.
