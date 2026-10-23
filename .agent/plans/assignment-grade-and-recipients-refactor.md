# Assignment Grade and Recipient Snapshot Refactor

## Status

Implemented in V40 and the current Assignment API/frontend.

## Contract

An Assignment has one `grade_id`, a normalized `academic_year`, and a non-empty `class_ids` JSONB array. The class IDs are a snapshot: later class creation does not change an existing Assignment.

Create and update requests use `gradeId` and `classIds`. Responses use a Grade summary (`id`, `code`, `name`, `displayOrder`) and `classIds`. `AssignmentTarget` and `AssignmentTargetType` are not part of the runtime contract.

The backend resolves the Grade and validates all class IDs atomically. Every class must exist, belong to the selected Grade and academic year, and belong to the authenticated teacher's class scope. Duplicate or invalid IDs reject the complete request.

## Migration

`V40__refactor_assignment_grade_and_class_recipients.sql` adds nullable `grade_id` and `class_ids`, maps legacy `grade_level` through `grades.display_order`, and converts legacy class targets to explicit IDs. Legacy `GRADE` targets expand to all active classes matching the Assignment Grade and academic year. The migration raises an error if the Grade or recipient set cannot be determined, validates every recipient, adds constraints, drops `assignment_targets`, and removes `grade_level`.

## Frontend behavior

Grades are loaded from the Grade API and selected by Grade ID. Choosing a Grade or changing academic year initially selects all matching classes. The recipient step lets the teacher remove individual classes; at least one class is required before continuing.

## Test plan

- Backend: valid single/multiple recipients; empty, duplicate, null, missing, cross-Grade, cross-year, and out-of-scope class rejection; update replacement; duplicate Assignment checks.
- Migration: Grade backfill, CLASS/GRADE recipient conversion, invalid-data failure, non-empty JSONB constraint, and recipient consistency.
- Frontend: API-loaded Grade options, Grade/year auto-selection, class deselection, wizard validation, and `gradeId`/`classIds` payloads.
