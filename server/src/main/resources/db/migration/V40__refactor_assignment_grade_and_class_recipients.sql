ALTER TABLE assignments
    ADD COLUMN grade_id BIGINT,
    ADD COLUMN class_ids JSONB;

UPDATE assignments a
SET grade_id = g.id
FROM grades g
WHERE g.display_order = a.grade_level;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM assignments WHERE grade_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot map every assignment grade_level to grades.display_order';
    END IF;
END $$;

UPDATE assignments a
SET class_ids = recipients.class_ids
FROM (
    SELECT a2.id,
           COALESCE(
               jsonb_agg(DISTINCT at.class_id ORDER BY at.class_id)
                   FILTER (WHERE at.target_type = 'CLASS'),
               (
                   SELECT jsonb_agg(c.id ORDER BY c.id)
                   FROM classes c
                   WHERE c.grade_id = a2.grade_id
                     AND btrim(c.academic_year) = btrim(a2.academic_year)
                     AND c.status = 'ACTIVE'
               )
           ) AS class_ids
    FROM assignments a2
    LEFT JOIN assignment_targets at ON at.assignment_id = a2.id
    GROUP BY a2.id
) recipients
WHERE a.id = recipients.id;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM assignments
        WHERE class_ids IS NULL
           OR jsonb_typeof(class_ids) <> 'array'
           OR jsonb_array_length(class_ids) = 0
    ) THEN
        RAISE EXCEPTION 'Cannot determine a non-empty class recipient snapshot for every assignment';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM assignments a
        CROSS JOIN LATERAL jsonb_array_elements_text(a.class_ids) recipient(class_id)
        LEFT JOIN classes c ON c.id = recipient.class_id::BIGINT
        WHERE c.id IS NULL
           OR c.grade_id <> a.grade_id
           OR btrim(c.academic_year) <> btrim(a.academic_year)
    ) THEN
        RAISE EXCEPTION 'Assignment class recipient snapshot contains an invalid class';
    END IF;
END $$;

ALTER TABLE assignments
    ALTER COLUMN grade_id SET NOT NULL,
    ALTER COLUMN class_ids SET NOT NULL,
    DROP CONSTRAINT uq_assignment_grade_year_name,
    ADD CONSTRAINT uq_assignment_grade_year_name UNIQUE (grade_id, academic_year, name),
    ADD CONSTRAINT fk_assignments_grade FOREIGN KEY (grade_id) REFERENCES grades(id),
    ADD CONSTRAINT ck_assignment_class_ids_array CHECK (
        jsonb_typeof(class_ids) = 'array' AND jsonb_array_length(class_ids) > 0
    );

DROP TABLE assignment_targets;
ALTER TABLE assignments DROP COLUMN grade_level;
