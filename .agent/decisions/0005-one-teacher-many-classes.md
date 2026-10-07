# 0005 — One teacher, many classes
Status: Accepted
Date: 2026-10-07
Decided by: project owner

## Context

Phase 5 spec v2 says "the system has one teacher" and removed `teacher_id` from Assignment, while `classes.teacher_id` exists and
Phase 6 scopes student management by teacher-owned classes. See drift D-03 in `design/spec-status.md`.

## Decision

The product serves **one teacher who teaches several classes**. `classes.teacher_id` stays as the owner of a class.
No multi-teacher features (shared ownership, per-teacher content libraries, teacher invitations) are built.

## Consequences

- Phase 5 wording "no `teacher_id`" is consistent: Assignment is owned by the single teacher, targets are classes or a grade.
- Ownership checks already written for classes and students stay; no new multi-tenant work.
- Reopening this (several teachers) needs a new ADR.
