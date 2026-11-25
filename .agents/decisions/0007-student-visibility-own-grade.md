# 0007 — Students see only their own grade
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Every content, activity and assignment endpoint is `TEACHER` only today, so no student read API exists. The owner's earlier idea of seeing
other grades with an access request (like Google Drive) was replaced on 2026-10-07 by a simpler rule.

## Decision

A student sees and practises **published** Units and Activities of **their own grade** only. Content of other grades is not visible.
No access-request flow in v1.

## Consequences

- Student read APIs filter by the student's grade (through class membership) and by `PUBLISHED`.
- The earlier request CR-05 is closed. Reopening needs a new ADR.
