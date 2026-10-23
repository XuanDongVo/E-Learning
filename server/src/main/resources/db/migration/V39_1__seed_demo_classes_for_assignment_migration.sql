-- Seed the demo classes required to migrate the legacy grade-target demo assignments
-- to the current class-recipient model in V40. This is demo data only.
INSERT INTO classes (name, grade_id, academic_year, teacher_id, status)
SELECT seed.class_name, g.id, seed.academic_year, teacher.id, 'ACTIVE'
FROM (
    VALUES
        ('Demo Grade 6 Class', 6, '2026 - 2027'),
        ('Demo Grade 7 Class', 7, '2026 - 2027'),
        ('Demo Grade 8 Class', 8, '2026 - 2027'),
        ('Demo Grade 6 Normalized-Year Class', 6, '2026-2027')
) AS seed(class_name, grade_display_order, academic_year)
JOIN grades g ON g.display_order = seed.grade_display_order
JOIN users teacher ON teacher.email = 'teacher@example.com'
WHERE NOT EXISTS (
    SELECT 1
    FROM classes existing
    WHERE existing.name = seed.class_name
      AND existing.academic_year = seed.academic_year
)
ON CONFLICT (name, academic_year) DO NOTHING;
