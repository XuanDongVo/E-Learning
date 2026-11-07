-- Profile is the canonical source of the student's selected avatar key.
-- Preserve keys already stored by the older gamification profile feature.
ALTER TABLE student_profiles
    ADD COLUMN avatar_key VARCHAR(255);

UPDATE student_profiles sp
SET avatar_key = gp.active_avatar_key
FROM student_gamification_profiles gp
WHERE gp.student_id = sp.user_id
  AND gp.active_avatar_key IS NOT NULL;
