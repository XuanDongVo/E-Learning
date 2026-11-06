-- Bootstrap classes required by V40 legacy assignment recipient conversion.
-- This is a transitional compatibility migration for FRESH DATABASE RECREATION ONLY:
-- introducing an intermediate Flyway version after V52 has been applied is not suitable
-- for upgrading an existing DB without a dedicated rollout/migration plan.
-- The separate Grade 7 test reset removes these temporary legacy demo classes.
INSERT INTO classes(name,grade_id,academic_year,teacher_id,status)
SELECT v.name,g.id,v.academic_year,u.id,'ACTIVE'
FROM (VALUES
 ('G7-BOOTSTRAP-LEGACY-G6','GRADE_6','2026 - 2027'),
 ('G7-BOOTSTRAP-LEGACY-G7','GRADE_7','2026 - 2027'),
 ('G7-BOOTSTRAP-LEGACY-G8','GRADE_8','2026 - 2027'),
 ('G7-BOOTSTRAP-LEGACY-G6-V39','GRADE_6','2026-2027')
) v(name,grade_code,academic_year)
JOIN grades g ON g.code=v.grade_code
JOIN users u ON u.email='teacher@example.com'
WHERE NOT EXISTS (SELECT 1 FROM classes c
                  WHERE c.name=v.name AND c.academic_year=v.academic_year);
