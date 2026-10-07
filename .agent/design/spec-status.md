# Spec status: docs vs implementation

Audit date: 2026-10-07
This update changes documentation only; code/test status is not claimed as fixed.

| ID | Contract | Current state | Status |
|---|---|---|---|
| D-01 | Activity Unit-scoped | Code uses unit_id | Fixed |
| D-02 | No current GameTemplate dependency | Activity code has no GameTemplate | Fixed |
| D-03 | Draft may be incomplete | Validator/DTO empty-source behavior needs verification | Open |
| D-04 | Activity preview | DTO exists; endpoint/service needs verification | Open |
| D-05 | Try Hard per-question timer | UI/code needs verification | Open |
| D-06 | Multi-strategy student choice + Attempt storage | Phase 7 not implemented | Future |
| D-07 | AssignmentQuestion no position; deterministic order | Entity has no position; repository order needs verification | Open |
| D-08 | show_answers_after_submit | Legacy code may still contain answersReleasedAt | Open |
| D-09 | Activity lifecycle | Explicit transition validation needs implementation | Open |
| D-10 | Formula/reference sheet deferred | No current requirement | Fixed |
| D-11 | Optional Question hint | Implementation alignment still required | Open |
| D-12 | Fake metrics | Dashboard mock remains | Open |

## Required tests
Activity distribution/readiness/lifecycle; Assignment deterministic order; answer visibility; Question hint optionality; Phase 7 timer and strategy persistence.
