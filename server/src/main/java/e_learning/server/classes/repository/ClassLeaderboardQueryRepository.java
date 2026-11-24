package e_learning.server.classes.repository;

import e_learning.server.classes.entity.ClassMember;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ClassLeaderboardQueryRepository extends Repository<ClassMember, Long> {

    interface StudentRow {
        Long getStudentId();
        String getFullName();
        String getAvatarKey();
        Long getXp();
        Long getCompletedSessions();
        Integer getCurrentStreak();
    }

    @Query(value = """
            select
                u.id as student_id,
                u.full_name as full_name,
                sp.avatar_key as avatar_key,
                coalesce(xp_agg.total_xp, 0) as xp,
                coalesce(sess_agg.completed_count, 0) as completed_sessions,
                case
                    when gp.last_qualified_date >= :yesterday
                    then coalesce(gp.current_streak, 0)
                    else 0
                end as current_streak
            from class_members cm
            join users u on u.id = cm.user_id and u.role = 'STUDENT' and u.status = 'ACTIVE'
            left join student_profiles sp on sp.user_id = u.id
            left join student_gamification_profiles gp on gp.student_id = u.id
            left join (
                select x.student_id, coalesce(sum(x.amount), 0) as total_xp
                from xp_transactions x
                where (:filterXpByPeriod = false or (x.earned_at >= :startAt and x.earned_at < :endAt))
                group by x.student_id
            ) xp_agg on xp_agg.student_id = u.id
            left join (
                select s.student_id, count(s.id) as completed_count
                from activity_sessions s
                where s.status = 'COMPLETED'
                  and (:filterSessionsByPeriod = false or (s.completed_at >= :startAt and s.completed_at < :endAt))
                group by s.student_id
            ) sess_agg on sess_agg.student_id = u.id
            where cm.class_id = :classId and cm.status = 'ACTIVE'
            """, nativeQuery = true)
    List<StudentRow> findClassStudentMetrics(
            @Param("classId") Long classId,
            @Param("yesterday") LocalDate yesterday,
            @Param("filterXpByPeriod") boolean filterXpByPeriod,
            @Param("filterSessionsByPeriod") boolean filterSessionsByPeriod,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );
}
