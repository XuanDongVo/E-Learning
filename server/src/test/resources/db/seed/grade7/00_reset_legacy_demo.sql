-- DESTRUCTIVE RESET FOR A DISPOSABLE DEV/TEST DATABASE ONLY.
-- Flyway history and four grade records are preserved; ALL historic demo
-- content/assignments are discarded. Run ONCE after Flyway finishes through V52
-- and BEFORE 00_foundation.sql. Do not run on a DB with real student submissions.
-- Foreign-key RESTRICT will intentionally block unsafe removal if attempts or
-- activity sessions exist; do not bypass constraints to make this pass.
BEGIN;
DO $preflight$
BEGIN
 IF EXISTS(SELECT 1 FROM assessment_attempts)
    OR EXISTS(SELECT 1 FROM activity_sessions) THEN
   RAISE EXCEPTION 'Reset refused: existing attempts/sessions. Use a fresh disposable DB.';
 END IF;
END $preflight$;
DELETE FROM assignment_question_idempotency;
DELETE FROM assignment_items;
DELETE FROM assignment_sections;
DELETE FROM assignment_questions;
DELETE FROM assignments;
DELETE FROM activity_banks;
DELETE FROM activity_selection_strategies;
DELETE FROM activities;
DELETE FROM content_questions;
DELETE FROM content_question_banks;
DELETE FROM content_topics;
DELETE FROM content_sections;
DELETE FROM content_units;
DELETE FROM questions;
-- Drop temporary legacy classes created only to make V40 migration succeed.
DELETE FROM class_members WHERE class_id IN (
 SELECT id FROM classes WHERE name LIKE 'G7-BOOTSTRAP-LEGACY-%'
);
DELETE FROM classes WHERE name LIKE 'G7-BOOTSTRAP-LEGACY-%';
-- Historical migration inserted starter users. Remove only its documented
-- non-teacher demo students to avoid polluting the all-student leaderboard.
DELETE FROM student_guardians WHERE student_profile_id IN (
 SELECT id FROM student_profiles
 WHERE user_id IN (SELECT id FROM users WHERE email IN ('student1@example.com','student2@example.com'))
);
DELETE FROM student_profiles WHERE user_id IN (
 SELECT id FROM users WHERE email IN ('student1@example.com','student2@example.com')
);
DELETE FROM users WHERE email IN ('student1@example.com','student2@example.com');
COMMIT;
