-- Student runtime treats every question as skippable; this flag is metadata only, not a submission gate.
ALTER TABLE assessment_attempt_questions
    ALTER COLUMN is_required SET DEFAULT FALSE;
