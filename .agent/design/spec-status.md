# Spec status: docs vs implementation

Audit date: 2026-10-07
This update changes documentation only; code/test status is not claimed as fixed.

| ID | Contract | Current state | Status |
|---|---|---|---|
| D-01 | Activity Unit-scoped | Code uses unit_id | Fixed |
| D-02 | No current GameTemplate dependency | Activity code has no GameTemplate | Fixed |
| D-03 | Draft may be incomplete | Draft create/update accepts zero sources; readiness remains the publish gate | Fixed |
| D-04 | Activity preview | `POST /v1/activities/{id}/preview` returns readiness and deterministic ready-question samples without creating an Attempt | Fixed |
| D-05 | Try Hard per-question timer | UI/code needs verification | Open |
| D-06 | Multi-strategy student choice + Attempt storage | Phase 7 not implemented | Future |
| D-07 | AssignmentQuestion no position; deterministic order | Entity has no position; reads use `ORDER BY question_id ASC` | Fixed |
| D-08 | show_answers_after_submit | V26 migrates schema/entity and assignment authoring contract; student review enforcement remains Phase 7 work | Open (partial) |
| D-09 | Activity lifecycle | Service enforces the accepted transition matrix | Fixed |
| D-10 | Formula/reference sheet deferred | No current requirement | Fixed |
| D-11 | Optional Question hint | Question hint is persisted and exposed in teacher authoring contracts/UI; student request/runtime behavior remains Phase 7-gated | Open (partial) |
| D-12 | Fake metrics | Dashboard no longer presents fabricated counts; real analytics remains future work | Fixed |

## Required tests
Activity distribution/readiness/lifecycle; Assignment deterministic order; answer visibility; Question hint optionality; Phase 7 timer and strategy persistence.
