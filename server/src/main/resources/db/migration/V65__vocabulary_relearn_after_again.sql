-- A forgotten scheduled word returns to the Learn queue while its review history remains intact.
ALTER TABLE student_vocabulary_progress
    ADD COLUMN needs_relearning BOOLEAN NOT NULL DEFAULT FALSE;
