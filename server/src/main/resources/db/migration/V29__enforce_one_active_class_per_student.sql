-- Normalize legacy data before enforcing the single-current-class rule.
-- The newest active membership is kept; older active rows become history.
WITH ranked_active_memberships AS (
    SELECT member.id,
           ROW_NUMBER() OVER (
               PARTITION BY member.user_id
               ORDER BY class_entity.academic_year DESC,
                        class_entity.id DESC,
                        member.id DESC
           ) AS membership_rank
    FROM class_members member
    JOIN classes class_entity ON class_entity.id = member.class_id
    WHERE member.status = 'ACTIVE'
)
UPDATE class_members member
SET status = 'INACTIVE'
FROM ranked_active_memberships ranked
WHERE member.id = ranked.id
  AND ranked.membership_rank > 1;

CREATE UNIQUE INDEX uq_class_members_one_active_per_student
    ON class_members (user_id)
    WHERE status = 'ACTIVE';
