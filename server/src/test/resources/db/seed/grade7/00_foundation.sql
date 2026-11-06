-- Grade 7 only. Apply AFTER Flyway V52, on a disposable DEVELOPMENT database.
-- Do not put this file in db/migration. Safe to rerun; owns only G7-SEED-* records.
BEGIN;

INSERT INTO grades(code, name, display_order, status)
VALUES ('GRADE_9', 'Grade 9', 9, 'ACTIVE')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, display_order = 9, status = 'ACTIVE';

INSERT INTO users(email,password_hash,full_name,role,status)
VALUES ('g7.seed.teacher@example.test',
        '$2a$10$q8WSCetUfBDPwQp2uyGrT.7AYCPc.H9Ed9N.fPKIZ6Hl4jzGDBq1e',
        'Grade 7 Seed Teacher','TEACHER','ACTIVE')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'ACTIVE';

INSERT INTO classes(name,grade_id,academic_year,teacher_id,status)
SELECT x.name, g.id, '2026-2027', t.id, 'ACTIVE'
FROM (VALUES ('G7-SEED-7A1'),('G7-SEED-7A2'),('G7-SEED-7A3')) x(name)
CROSS JOIN grades g
CROSS JOIN users t
WHERE g.code='GRADE_7' AND t.email='g7.seed.teacher@example.test'
ON CONFLICT (name,academic_year) DO UPDATE
SET grade_id=EXCLUDED.grade_id, teacher_id=EXCLUDED.teacher_id,status='ACTIVE';

WITH seed_students AS (
  SELECT n,
         'g7.seed.student' || lpad(n::text,2,'0') || '@example.test' AS email,
         'Grade 7 Test Student ' || lpad(n::text,2,'0') AS full_name
  FROM generate_series(1,55) n
)
INSERT INTO users(email,password_hash,full_name,role,status)
SELECT email, '$2a$10$q8WSCetUfBDPwQp2uyGrT.7AYCPc.H9Ed9N.fPKIZ6Hl4jzGDBq1e',full_name,'STUDENT','ACTIVE'
FROM seed_students
ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name, status='ACTIVE';

INSERT INTO student_profiles(user_id)
SELECT u.id FROM users u
WHERE u.email LIKE 'g7.seed.student%@example.test'
ON CONFLICT(user_id) DO NOTHING;

INSERT INTO class_members(class_id,user_id,status)
SELECT c.id,u.id,'ACTIVE'
FROM users u
JOIN classes c ON c.name = CASE
  WHEN substring(u.email from 'student([0-9]+)')::int <=20 THEN 'G7-SEED-7A1'
  WHEN substring(u.email from 'student([0-9]+)')::int <=40 THEN 'G7-SEED-7A2'
  ELSE 'G7-SEED-7A3'
END AND c.academic_year='2026-2027'
WHERE u.email ~ '^g7\\.seed\\.student[0-9]{2}@example\\.test$'
ON CONFLICT(class_id,user_id) DO UPDATE SET status='ACTIVE';

-- Three additional edge-case users: inactive, without class, and an inactive membership.
INSERT INTO users(email,password_hash,full_name,role,status)
VALUES
('g7.seed.inactive@example.test','$2a$10$q8WSCetUfBDPwQp2uyGrT.7AYCPc.H9Ed9N.fPKIZ6Hl4jzGDBq1e','Grade 7 Inactive Fixture','STUDENT','INACTIVE'),
('g7.seed.noclass@example.test','$2a$10$q8WSCetUfBDPwQp2uyGrT.7AYCPc.H9Ed9N.fPKIZ6Hl4jzGDBq1e','Grade 7 No Class Fixture','STUDENT','ACTIVE'),
('g7.seed.transferred@example.test','$2a$10$q8WSCetUfBDPwQp2uyGrT.7AYCPc.H9Ed9N.fPKIZ6Hl4jzGDBq1e','Grade 7 Membership History Fixture','STUDENT','ACTIVE')
ON CONFLICT(email) DO UPDATE SET status=EXCLUDED.status,full_name=EXCLUDED.full_name;

INSERT INTO class_members(class_id,user_id,status)
SELECT c.id, u.id, CASE WHEN c.name='G7-SEED-7A1' THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM users u JOIN classes c ON c.name IN('G7-SEED-7A1','G7-SEED-7A2') AND c.academic_year='2026-2027'
WHERE u.email='g7.seed.transferred@example.test'
ON CONFLICT(class_id,user_id) DO UPDATE SET status=EXCLUDED.status;

INSERT INTO content_units(grade_id,code,name,description,display_order,status,published_at)
SELECT g.id,v.code,v.name,v.description,v.ord,'PUBLISHED',CURRENT_TIMESTAMP
FROM grades g
CROSS JOIN (VALUES
 ('G7-SEED-U01','Hobbies','Hobbies, free-time activities and present simple.',1),
 ('G7-SEED-U02','Healthy Living','Healthy habits, food choices and advice.',2),
 ('G7-SEED-U03','Community Service','Volunteering, people and community activities.',3),
 ('G7-SEED-U04','Music and Arts','Music, art, performances and culture.',4),
 ('G7-SEED-U05','Food and Drink','Ingredients, cooking, ordering food and quantities.',5),
 ('G7-SEED-U06','Traffic and Transport','Road safety, transport and directions.',6)
) AS v(code,name,description,ord)
WHERE g.code='GRADE_7'
ON CONFLICT (grade_id,code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,
 display_order=EXCLUDED.display_order,status='PUBLISHED',published_at=COALESCE(content_units.published_at,CURRENT_TIMESTAMP);

INSERT INTO content_sections(unit_id,name,description,display_order,status)
SELECT u.id,s.name,'Grade 7 seed ' || s.name || ' content.',s.ord,'PUBLISHED'
FROM content_units u
CROSS JOIN (VALUES ('Vocabulary',1),('Grammar and Usage',2),('Reading and Review',3)) s(name,ord)
WHERE u.code LIKE 'G7-SEED-U%'
ON CONFLICT(unit_id,name) DO UPDATE SET description=EXCLUDED.description,display_order=EXCLUDED.display_order,status='PUBLISHED';

INSERT INTO content_topics(section_id,name,description,display_order,status)
SELECT s.id,'G7-SEED Core Practice','Grade 7 core language questions.',1,'PUBLISHED'
FROM content_sections s JOIN content_units u ON u.id=s.unit_id
WHERE u.code LIKE 'G7-SEED-U%' AND s.name='Vocabulary'
ON CONFLICT(section_id,name) DO UPDATE SET status='PUBLISHED';

INSERT INTO content_question_banks(topic_id,name,description,display_order,status)
SELECT t.id,'G7-SEED Bank ' || b.code,
       'Five supported Activity question types. Never includes MATCHING or CLOZE.',
       b.ord,'PUBLISHED'
FROM content_topics t
JOIN content_sections s ON s.id=t.section_id
JOIN content_units u ON u.id=s.unit_id
CROSS JOIN (VALUES ('A',1),('B',2)) b(code,ord)
WHERE u.code LIKE 'G7-SEED-U%' AND t.name='G7-SEED Core Practice'
ON CONFLICT(topic_id,name) DO UPDATE SET status='PUBLISHED',display_order=EXCLUDED.display_order;

COMMIT;
