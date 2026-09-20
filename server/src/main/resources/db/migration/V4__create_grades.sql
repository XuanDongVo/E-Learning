    CREATE TABLE grades (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT ck_grades_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

INSERT INTO grades (code, name, display_order)
VALUES
    ('GRADE_6', 'Grade 6', 6),
    ('GRADE_7', 'Grade 7', 7),
    ('GRADE_8', 'Grade 8', 8);

ALTER TABLE classes ADD COLUMN grade_id BIGINT;

UPDATE classes
SET grade_id = grades.id
FROM grades
WHERE grades.code = 'GRADE_' || classes.grade;

ALTER TABLE classes
    ALTER COLUMN grade_id SET NOT NULL,
    ADD CONSTRAINT fk_classes_grade FOREIGN KEY (grade_id) REFERENCES grades(id);

ALTER TABLE classes
    DROP CONSTRAINT ck_class_grade,
    DROP COLUMN grade;