# 0025 — Assignment lock after first attempt; Activity updates apply to future sessions

**Status: Accepted; grading section superseded by ADR 0026**  
**Date:** 2026-10-12  
**Decided by:** project owner

## Scope

This ADR remains authoritative for two lifecycle rules. Its former requirement for teacher grading/manual review is superseded by ADR 0026; Assignment scoring is automatic and no manual grading workflow is part of v1.

## 1. Assignment lock after the first attempt starts
- Once any student's AssessmentAttempt is created/started for an Assignment, freeze the Assignment against authoring changes.
- Reject changes to the metadata that defines assigned work, targets/schedule/eligibility, Composition sections/items/order, question membership/content, points, required flags, media and score/answer-display settings.
- If a teacher wants to change a test after the first attempt starts, they must duplicate/clone it. The clone has an independent Composition and independent Assignment-owned Questions; edits to the clone cannot mutate the original or its attempts.
- Operational archive/close-to-new-starts may remain available if it does not mutate historical snapshots/results.
- Enforce the lock in backend services/transactions, not just disabled UI. Add concurrency tests for start-vs-edit and clone-vs-source mutation.

## 2. Activity updates apply to future sessions
- A teacher may update Activity configuration/content while students have active or completed sessions.
- Each ActivitySession captures a durable immutable snapshot at session start, including Activity/content revision/provenance and every selected QuestionSpec.
- Updating an Activity or a source Question never mutates existing session snapshots. Existing sessions continue with the version they started with, including display, hint, media, feedback, grading and reveal.
- Sessions started after the update use the latest saved Activity configuration and latest eligible Question content.
- Maintain an Activity revision/version counter or equivalent provenance for diagnostics/analytics. Do not force teachers to clone Activities for ordinary updates.
- Before full snapshot support is enforced, abandon legacy IN_PROGRESS sessions per ADR 0012. Never reconstruct a supposedly historical snapshot from mutable current content.

## 3. Related scoring contract
ADR 0026 governs Assignment automatic scoring, score visibility, per-question points and compound-part allocation. Do not reintroduce the former manual-review design from the earlier revision of this ADR.
