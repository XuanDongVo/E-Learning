-- Demo assignments for the teacher UI. Safe to re-run.

INSERT INTO assignments
    (grade_level, academic_year, name, description, status, start_at, due_at, time_limit_seconds)
SELECT 6, '2026 - 2027', 'Unit 1 Grammar Review',
       'A short review of the grammar structures from Unit 1.',
       'DRAFT', '2026-10-05 08:00:00', '2026-10-20 23:59:00', 1800
WHERE NOT EXISTS (
    SELECT 1 FROM assignments
    WHERE grade_level = 6
      AND academic_year = '2026 - 2027'
      AND name = 'Unit 1 Grammar Review'
);

INSERT INTO assignments
    (grade_level, academic_year, name, description, status, start_at, due_at, time_limit_seconds)
SELECT 7, '2026 - 2027', 'Mid-term Vocabulary Check',
       'Vocabulary check for the first learning units.',
       'PUBLISHED', '2026-09-28 08:00:00', '2026-10-18 23:59:00', 2700
WHERE NOT EXISTS (
    SELECT 1 FROM assignments
    WHERE grade_level = 7
      AND academic_year = '2026 - 2027'
      AND name = 'Mid-term Vocabulary Check'
);

INSERT INTO assignments
    (grade_level, academic_year, name, description, status, start_at, due_at, time_limit_seconds)
SELECT 8, '2026 - 2027', 'Reading Comprehension Practice',
       'Practice assignment for reading strategies and comprehension.',
       'ARCHIVED', '2026-08-20 08:00:00', '2026-09-05 23:59:00', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM assignments
    WHERE grade_level = 8
      AND academic_year = '2026 - 2027'
      AND name = 'Reading Comprehension Practice'
);

INSERT INTO assignment_targets (assignment_id, target_type, class_id)
SELECT a.id, 'GRADE', NULL
FROM assignments a
WHERE a.academic_year = '2026 - 2027'
  AND a.name IN (
      'Unit 1 Grammar Review',
      'Mid-term Vocabulary Check',
      'Reading Comprehension Practice'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM assignment_targets t
      WHERE t.assignment_id = a.id
        AND t.target_type = 'GRADE'
        AND t.class_id IS NULL
  );
