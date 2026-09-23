INSERT INTO content_units (grade_id, code, name, description, display_order, status)
SELECT g.id, 'U1', 'My School', 'School life, places and everyday routines.', 1, 'DRAFT'
FROM grades g WHERE g.code = 'GRADE_6'
  AND NOT EXISTS (SELECT 1 FROM content_units u WHERE u.grade_id = g.id AND u.code = 'U1');

INSERT INTO content_units (grade_id, code, name, description, display_order, status)
SELECT g.id, 'U2', 'Travel & Holiday', 'Explore places, activities and experiences around the world.', 2, 'DRAFT'
FROM grades g WHERE g.code = 'GRADE_6'
  AND NOT EXISTS (SELECT 1 FROM content_units u WHERE u.grade_id = g.id AND u.code = 'U2');

INSERT INTO content_sections (unit_id, name, description, display_order, status)
SELECT u.id, source.name, source.description, source.display_order, 'DRAFT'
FROM content_units u
CROSS JOIN (VALUES
    ('Grammar', 'Key grammar structures and practice.', 1),
    ('Vocabulary', 'Words and expressions for the unit.', 2),
    ('Reading', 'Reading comprehension activities.', 3)
) AS source(name, description, display_order)
WHERE u.code = 'U2'
  AND NOT EXISTS (SELECT 1 FROM content_sections s WHERE s.unit_id = u.id AND s.name = source.name);

INSERT INTO content_topics (section_id, name, description, display_order, status)
SELECT s.id, source.name, source.description, source.display_order, 'DRAFT'
FROM content_sections s
CROSS JOIN (VALUES
    ('Past Simple', 'Completed actions in the past.', 1),
    ('Comparatives', 'Comparing people, places and things.', 2)
) AS source(name, description, display_order)
WHERE s.name = 'Grammar'
  AND NOT EXISTS (SELECT 1 FROM content_topics t WHERE t.section_id = s.id AND t.name = source.name);
