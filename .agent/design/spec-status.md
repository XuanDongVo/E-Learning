# Spec status: docs vs implementation

Audit date: 2026-10-12
This update changes documentation only; code/test status is not claimed as fixed.

| ID | Contract | Current state | Status |
|---|---|---|---|
| D-01 | Activity Unit-scoped | Code uses unit_id | Fixed |
| D-02 | No current GameTemplate dependency | Activity code has no GameTemplate | Fixed |
| D-03 | Draft may be incomplete | Draft create/update accepts zero sources; readiness remains the publish gate | Fixed |
| D-04 | Activity preview | `POST /v1/activities/{id}/preview` returns readiness and deterministic ready-question samples without creating an Attempt | Fixed |
| D-05 | Try Hard per-question timer | ActivitySession stores and enforces per-question deadlines with network grace | Implemented in Scope A
| D-06 | Multi-strategy student choice + ActivitySession storage | ActivitySession start validates and stores concrete mode/strategy | Implemented in Scope A
| D-07 | AssignmentQuestion no position; Composition ordering | Entity has no position; Composition section/item/member positions define product order; question_id ASC is legacy backfill only | Contract accepted; implementation pending |
| D-08 | show_answers_after_submit | V26 schema/entity contract exists; Phase 7 must enforce answer/explanation reveal independently from score display | Implementation pending |
| D-09 | Activity lifecycle | Service enforces the accepted transition matrix | Fixed |
| D-10 | Formula/reference sheet deferred | No current requirement | Fixed |
| D-11 | Optional Question hint | Persisted and ActivitySession Practice hint endpoint records usage | Implemented in Scope A
| D-12 | Fake metrics | Dashboard no longer presents fabricated counts; real analytics remains future work | Fixed |

## Required tests
Activity distribution/readiness/lifecycle; Assignment deterministic order; answer visibility; Question hint optionality; Phase 7 timer and strategy persistence.


## Question Engine / Question data audit (documentation update 2026-10-12)

| ID | Contract / finding | Current state | Status |
|---|---|---|---|
| Q-01 | Five current Question types | Enum and schema support SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER | Implemented baseline |
| Q-02 | Type semantics centralized in Question Engine | Validator, persistence and Activity runtime contain distributed type-specific branches | Architecture accepted by ADR 0023; implementation pending |
| Q-03 | Student vs teacher projection separation | Teacher mapping includes correctness/accepted-answer data; student payload must remain restricted | Security boundary; audit each endpoint |
| Q-04 | Explicit option order | No question_options.display_order in audited schema | Gap; migration not approved |
| Q-05 | Full immutable Activity question snapshot | ActivitySessionQuestion references mutable Question data and freezes selected IDs/order only | Gap; ADR 0023 D4 pending |
| Q-06 | FILL_IN_BLANK per-part model | No blank key/index in question_answers | Not a multi-blank Cloze implementation |
| Q-07 | Hint end-to-end round trip | Older Question edit/mapping path showed hint omissions | Verify/fix per endpoint; not claimed fixed here |
| Q-08 | Question Engine tests | No dedicated handler/contract tests found | Required before refactor |

This commit only synchronizes documentation. No application code or Flyway migration has changed, and no tests/builds were run.


## Assignment Composition / Phase 7B audit (2026-10-12)

| ID | Contract | Current state | Status |
|---|---|---|---|
| A-01 | Demo is product prototype | Builder has sections/items/blocks/groups/points/preview; persistence is localStorage/seed | Product contract accepted; production integration pending |
| A-02 | Ordered Assignment Composition | Composition section/item/member positions define canonical order; question_id ASC is legacy backfill only | Contract accepted by ADR 0024; implementation pending |
| A-03 | Weighted scoring | Demo has per-item points; backend scoring contract not implemented | Gap; ADR 0023 D8 accepted |
| A-04 | Assignment scoring | ADR 0026 requires automatic scoring; remove AUTO/MANUAL and manual review. Default 1 point per scored question, teacher-customizable | Accepted contract; implementation pending |
| A-05 | Assignment part analytics | Intent requires most-missed questions; normalized distribution not implemented | Gap; ADR 0023 D7 accepted |
| A-06 | Readiness invariant | Assignment status transition does not enforce readiness as required | Scope B gate |
| A-07 | Edit locking | AssessmentAttempt absent; current edit guard only checks ARCHIVED | Scope B gate |
| A-08 | AssessmentAttempt | Not implemented | Scope B pending |
| A-09 | Question Engine | Distributed type branches; no canonical handlers/registry | Accepted target; implementation pending |
| A-10 | Immutable Activity snapshot | Session rows reference mutable Question | Gap; accepted D4 |

No application code or Flyway migration changed in this documentation update. No tests/builds were run.


## Assignment score-display decision (ADR 0026)

| ID | Contract | Current state | Status |
|---|---|---|---|
| A-11 | show_score_after_submit | New Assignment-level boolean, default TRUE; server always calculates score but may hide it from immediate student response | Accepted; migration/API/UI implementation pending |
| A-12 | Compound part points | Equal split by default for CLOZE/MATCHING; teacher may adjust while part sum equals question total | Accepted; implementation pending |
| A-13 | Auto grading | Server grades Assignment on submit/timeout from immutable snapshot; no manual grading workflow | Accepted; implementation pending |

This audit file distinguishes accepted contracts from implemented code. No application code or Flyway migration changed in this documentation update.
