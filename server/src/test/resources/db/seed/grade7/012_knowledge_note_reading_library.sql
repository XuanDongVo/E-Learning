JOIN users teacher ON teacher.email = 'teacher@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_notes existing WHERE existing.description = d.description
);

-- 3. Primary ONLY for the new contrast Topic; preserve a teacher's Primary if present.
INSERT INTO knowledge_note_topic_links
(knowledge_note_id, topic_id, is_primary, display_order, created_at)
SELECT n.id, t.id, TRUE, 0, CURRENT_TIMESTAMP
FROM knowledge_notes n
         JOIN content_topics t ON t.name = 'Present Simple vs Present Continuous'
         JOIN content_sections s ON s.id = t.section_id AND s.name = 'Grammar and Usage'
         JOIN content_units u ON u.id = s.unit_id AND u.code = 'G7-SEED-U01'
         JOIN grades g ON g.id = u.grade_id AND g.code = 'GRADE_7'
WHERE n.description = '[G7-KN-EXTRA:g7-extra-tenses-contrast] Cross-topic mixed Primary and Supplementary reading fixture.'
  AND n.status = 'PUBLISHED'
  AND NOT EXISTS (
    SELECT 1 FROM knowledge_note_topic_links existing
    WHERE existing.topic_id = t.id AND existing.is_primary = TRUE
)
ON CONFLICT (knowledge_note_id, topic_id) DO NOTHING;

-- 4. Supplementary links to already seeded, PUBLISHED Grade 7 Topics.
-- One Note can be reused across Topics; never replace an existing Primary
-- or change an existing Note/Topic relationship created by a Teacher.
WITH link_map(note_key, unit_code, topic_name, display_order) AS (
    VALUES
        ('g7-extra-tenses-contrast', 'G7-SEED-U01', 'Hobbies and Present Simple', 10),
        ('g7-extra-tenses-contrast', 'G7-CURR-U10', 'Energy and Present Continuous', 10),
        ('g7-extra-hobbies-examples', 'G7-SEED-U01', 'Hobbies and Present Simple', 20),
        ('g7-extra-hobbies-examples', 'G7-SEED-U03', 'Community Service and Past Simple', 20),
        ('g7-extra-quantity-table', 'G7-SEED-U05', 'Food, Drink and Quantities', 10),
        ('g7-extra-road-safety', 'G7-CURR-U07', 'Traffic, Distance and Advice', 10),
        ('g7-extra-road-safety', 'G7-CURR-U09', 'Festivals and Word Stress', 20),
        ('g7-extra-error-review', 'G7-SEED-U03', 'Community Service and Past Simple', 10),
        ('g7-extra-error-review', 'G7-CURR-U10', 'Energy and Present Continuous', 20),
        ('g7-extra-articles-table', 'G7-SEED-U05', 'Food, Drink and Quantities', 20),
        ('g7-extra-articles-table', 'G7-CURR-U12', 'Countries, Articles and Intonation', 10)
)
INSERT INTO knowledge_note_topic_links
(knowledge_note_id, topic_id, is_primary, display_order, created_at)
SELECT n.id, t.id, FALSE, m.display_order, CURRENT_TIMESTAMP
FROM link_map m
         JOIN knowledge_notes n
              ON n.description LIKE ('[G7-KN-EXTRA:' || m.note_key || ']%')
         JOIN content_units u ON u.code = m.unit_code
         JOIN grades g ON g.id = u.grade_id AND g.code = 'GRADE_7'
         JOIN content_sections s ON s.unit_id = u.id AND s.name = 'Grammar and Usage'
         JOIN content_topics t ON t.section_id = s.id AND t.name = m.topic_name
WHERE n.status = 'PUBLISHED'
ON CONFLICT (knowledge_note_id, topic_id) DO NOTHING;

-- 5. Strong verification: fail the transaction for missing fixtures or
-- duplicate primary/invalid cross-grade links. Plain SQL makes these checks
-- compatible with clients that execute one semicolon-delimited statement at a time.
SELECT 1 / (
    SELECT (COUNT(*) = 8)::int
    FROM knowledge_notes
    WHERE description LIKE '[G7-KN-EXTRA:%'
);

SELECT 1 / (
    SELECT (
               (SELECT COUNT(*)
                FROM knowledge_note_topic_links l
                         JOIN knowledge_notes n ON n.id = l.knowledge_note_id
                WHERE n.description LIKE '[G7-KN-EXTRA:%') >= 11
               )::int
);

SELECT 1 / (
    SELECT (
               NOT EXISTS (
                   SELECT 1 FROM knowledge_note_topic_links l
                                     JOIN knowledge_notes n ON n.id = l.knowledge_note_id
                                     JOIN content_topics t ON t.id = l.topic_id
                                     JOIN content_sections s ON s.id = t.section_id
                                     JOIN content_units u ON u.id = s.unit_id
                   WHERE n.description LIKE '[G7-KN-EXTRA:%'
                     AND (n.grade_id <> u.grade_id OR n.status <> 'PUBLISHED')
               )
               )::int
);

SELECT 1 / (
    SELECT (
               NOT EXISTS (
                   SELECT topic_id
                   FROM knowledge_note_topic_links
                   WHERE is_primary
                   GROUP BY topic_id
                   HAVING COUNT(*) > 1
               )
               )::int
);

SELECT 1 / (
    SELECT (
               NOT EXISTS (
                   SELECT 1 FROM knowledge_note_topic_links l
                                     JOIN knowledge_notes n ON n.id = l.knowledge_note_id
                   WHERE n.description LIKE '[G7-KN-EXTRA:g7-extra-free-reading]%'
                      OR n.description LIKE '[G7-KN-EXTRA:g7-extra-hidden-draft]%'
               )
               )::int
);

COMMIT;

-- 6. Read-only QA summary (no hardcoded DB IDs).
SELECT n.title, n.status,
       COUNT(l.id) AS linked_topics,
       COUNT(l.id) FILTER (WHERE l.is_primary) AS primary_links,
       COUNT(l.id) FILTER (WHERE NOT l.is_primary) AS supplementary_links
FROM knowledge_notes n
         LEFT JOIN knowledge_note_topic_links l ON l.knowledge_note_id = n.id
WHERE n.description LIKE '[G7-KN-EXTRA:%'
GROUP BY n.id, n.title, n.status
ORDER BY n.title;
