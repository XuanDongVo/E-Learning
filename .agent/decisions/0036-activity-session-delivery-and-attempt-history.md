# 0036 — Activity session delivery and attempt history
Status: Accepted
Date: 2026-11-15
Decided by: project owner

## Context

Activity.practiceType is teacher configuration, but runtime behavior must not
change when that Activity is edited after a Session starts. Guided runtime needs
durable Step/Hint progress and deterministic network retry behavior. M4 review
requires submitted Final attempts, not only aggregate correctness fields.

ADR 0022 originally left detailed Activity answer history in frontend memory.
That is insufficient for refresh-safe idempotency and Guided review.

## Decision

1. Activity.practiceType remains teacher configuration.
2. Every ActivitySessionQuestion freezes deliveryType as CLASSIC or
   GUIDED_REASONING when its Session starts. Runtime uses this frozen value.
3. Guided-only state is stored in a one-to-one GuidedProgress record plus
   immutable Step attempts and per-Step Hint usage.
4. Final submissions for new Classic and Guided Activity Sessions are persisted
   as immutable attempts with a request id and exact replay outcome.
5. The same request id and payload returns the stored outcome without consuming
   another business attempt; a different payload is a conflict.
6. The server advances a resolved Guided Step immediately. Student “Continue”
   only dismisses feedback and is not persisted.
7. V62 expands and backfills existing rows where prior data is sufficient.
   Historical raw Final answers cannot be reconstructed.
8. In Learning mode, Activity question navigation is independent from Guided
   Step progress. A Student may select any unresolved Session Question; the
   server enforces Step order and the Final gate within that selected Question,
   not a global first-unresolved Guided Question.

## Amendment

This supersedes ADR 0022 item 14 only. Other Practice behavior remains accepted.
ActivitySession stays separate from AssessmentAttempt under ADR 0021; persisted
Activity attempts remain practice data and do not create an official grade.

## Consequences

- M4 can build authorized review projections from persisted runtime records.
- Classic has no GuidedProgress row and does not require Guided state.
- Final-answer clients retain one UUID across transport retries.
- Session responses project the safe current Guided stage for every Guided
  Question so the navigator can switch Questions without exposing Final content
  or Step answer keys.
- V60/V61 remain immutable. Legacy Guided-column cleanup requires a later
  migration after V62 rollout is verified.
