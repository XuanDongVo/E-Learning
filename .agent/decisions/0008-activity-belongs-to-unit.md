# 0008 — An Activity belongs to a Unit
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Phase 4 spec §3.1 and `domain/domain-model.md` placed an Activity under a Topic (`activities.topic_id`). Migration V15 and the code moved it to
`activities.unit_id` without an ADR (drift D-01). Practice mixes several Topics inside a Unit, so a single Topic is too narrow.

## Decision

An Activity belongs to exactly one **Unit** (`activities.unit_id`). Its question sources (`ActivityBank` → `QuestionBank`) must belong to that
same Unit (`ACTIVITY_QUESTION_BANK_OUTSIDE_UNIT`). Topic statistics still come from `Answer → Question → QuestionBank → Topic`.

## Consequences

- Phase 4 spec §3.1 and `domain-model.md` are corrected (superseded notes added).
- Student navigation: Unit → Activities (the Activity list is per Unit); Topics stay a content and analytics concept.
